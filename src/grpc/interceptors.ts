import * as grpc from '@grpc/grpc-js';
import * as prom from 'prom-client';

export enum InterceptorType {
    Unary,
    ClientStreaming,
    ServerStreaming,
    BidiStreaming,
}

export type InterceptorFactory = (options: any, nextCall: Function) => grpc.InterceptingCall;

export type InterceptorFactorySelector = (methodDefinition: grpc.MethodDefinition<any, any>) => InterceptorFactory;

export interface Interceptor {
    type: InterceptorType;
    interceptorFn: InterceptorFactory;
}

export function interceptorChain(interceptors: Interceptor[]): InterceptorFactorySelector[] {
  return interceptors.map(i => {
    return (methodDefinition: grpc.MethodDefinition<any, any>): InterceptorFactory => {
      switch (i.type) {
      case InterceptorType.Unary:
        if (!methodDefinition.requestStream && !methodDefinition.responseStream) {
          return i.interceptorFn;
        }
        break;
      case InterceptorType.ClientStreaming:
        if (methodDefinition.requestStream && !methodDefinition.responseStream) {
          return i.interceptorFn;
        }
        break;
      case InterceptorType.ServerStreaming:
        if (!methodDefinition.requestStream && methodDefinition.responseStream) {
          return i.interceptorFn;
        }
        break;
      case InterceptorType.BidiStreaming:
        if (methodDefinition.requestStream && methodDefinition.responseStream) {
          return i.interceptorFn;
        }
        break;
      }
      return;
    };
  });
}

const grpcHistogram = new prom.Histogram({
  name: 'grpc_requests_seconds',
  help: 'measures grpc request duration',
  labelNames: ['status', 'service', 'method'],
  buckets: [0.2, 0.5, 1, 1.5, 3, 5, 10],
});

const statusMap: any = {};

Object.keys(grpc.status).forEach((key: keyof typeof grpc.status) => {
  statusMap[grpc.status[key]] = key;
});

export const prometheusInterceptor: InterceptorFactory = (options, nextCall) => {
  return new grpc.InterceptingCall(nextCall(options), {
    start(metadata, listener, next): void {

      const [service, method] = options.method_definition.path.split('/').splice(1, 2);

      const labels = {
        status: statusMap[grpc.status.UNKNOWN],
        service,
        method,
      };

      const timeRequest = grpcHistogram.startTimer(labels);

      const newListener = {
        onReceiveStatus(status: grpc.StatusObject, nextStatus: Function): void {
          labels.status = statusMap[status.code];
          timeRequest();
          nextStatus(status);
        },
      };
      next(metadata, newListener);
    },
  });
};

export function retryInterceptorFactory(
  maxRetries = 1,
  codeMap: grpc.status[] = [grpc.status.UNAVAILABLE, grpc.status.UNKNOWN],
): InterceptorFactory {
  return (options, mainChainNext): grpc.InterceptingCall => {

    let originMetadata: grpc.Metadata;
    let originMessage: any;
    let lastReceivedMessage: any;
    let receivedMessageCallback: Function;
    let lastReceivedStatus: grpc.StatusObject;

    return new grpc.InterceptingCall(mainChainNext(options), {
      sendMessage(message, next) {
        originMessage = message;
        next(message);
      },
      start(metadata, listener, next) {

        originMetadata = metadata;

        const newListener: grpc.Listener = {
          onReceiveMessage(message, onReceiveNext) {
            lastReceivedMessage = message;
            receivedMessageCallback = onReceiveNext;
          },
          onReceiveStatus(status, statusChainNext) {

            let currentRetries = 0;

            function retry(): void {

              if (currentRetries >= maxRetries) {
                receivedMessageCallback(lastReceivedMessage);
                statusChainNext(lastReceivedStatus);
                return; // no more retries allowed
              }

              currentRetries++;

              // trigger the interceptor chain manually for retry

              const retryCall = mainChainNext(options);

              retryCall.start(originMetadata, {
                onReceiveMessage(message: any) {
                  lastReceivedMessage = message;
                },
                onReceiveStatus(retryStatus: grpc.StatusObject) {

                  lastReceivedStatus = retryStatus;
                  if (codeMap.includes(retryStatus.code)) {
                    retry();
                  } else {
                    receivedMessageCallback(lastReceivedMessage);
                    statusChainNext(lastReceivedStatus);
                  }
                },
              });

              retryCall.sendMessage(originMessage);
              retryCall.halfClose();
            }

            lastReceivedStatus = status;

            if (codeMap.includes(status.code)) {
              retry();
            } else {
              // no need to retry, just return what was originally cached
              receivedMessageCallback(lastReceivedMessage);
              statusChainNext(lastReceivedStatus);
            }
          },
        };

        next(metadata, newListener);
      },
    } as grpc.Requester);
  };
}
