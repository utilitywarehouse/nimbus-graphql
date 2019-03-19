"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("grpc");
const prom = require("prom-client");
var InterceptorType;
(function (InterceptorType) {
    InterceptorType[InterceptorType["Unary"] = 0] = "Unary";
    InterceptorType[InterceptorType["ClientStreaming"] = 1] = "ClientStreaming";
    InterceptorType[InterceptorType["ServerStreaming"] = 2] = "ServerStreaming";
    InterceptorType[InterceptorType["BidiStreaming"] = 3] = "BidiStreaming";
})(InterceptorType = exports.InterceptorType || (exports.InterceptorType = {}));
function interceptorChain(interceptors) {
    return interceptors.map(i => {
        return (methodDefinition) => {
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
exports.interceptorChain = interceptorChain;
const grpcHistogram = new prom.Histogram({
    name: 'grpc_requests_seconds',
    help: 'measures grpc request duration',
    labelNames: ['status', 'service', 'method'],
    buckets: [0.2, 0.5, 1, 1.5, 3, 5, 10],
});
const statusMap = {};
Object.keys(grpc.status).forEach(key => {
    statusMap[grpc.status[key]] = key;
});
function prometheusInterceptor(options, nextCall) {
    return new grpc.InterceptingCall(nextCall(options), {
        start(metadata, listener, next) {
            const [service, method] = options.method_definition.path.split('/').splice(1, 2);
            const labels = {
                status: statusMap[grpc.status.UNKNOWN],
                service,
                method,
            };
            const timeRequest = grpcHistogram.startTimer(labels);
            const newListener = {
                onReceiveStatus(status, nextStatus) {
                    labels.status = statusMap[status.code];
                    timeRequest();
                    nextStatus(status);
                },
            };
            next(metadata, newListener);
        },
    });
}
exports.prometheusInterceptor = prometheusInterceptor;
function retryInterceptorFactory(maxRetries = 1, codeMap = [grpc.status.UNAVAILABLE, grpc.status.UNKNOWN]) {
    return (options, mainChainNext) => {
        let originMetadata;
        let originMessage;
        let lastReceivedMessage;
        let receivedMessageCallback;
        let lastReceivedStatus;
        return new grpc.InterceptingCall(mainChainNext(options), {
            sendMessage(message, next) {
                originMessage = message;
                next(message);
            },
            start(metadata, listener, next) {
                originMetadata = metadata;
                const newListener = {
                    onReceiveMessage(message, onReceiveNext) {
                        lastReceivedMessage = message;
                        receivedMessageCallback = onReceiveNext;
                    },
                    onReceiveStatus(status, statusChainNext) {
                        let currentRetries = 0;
                        function retry() {
                            if (currentRetries >= maxRetries) {
                                receivedMessageCallback(lastReceivedMessage);
                                statusChainNext(lastReceivedStatus);
                                return;
                            }
                            currentRetries++;
                            const retryCall = mainChainNext(options);
                            retryCall.start(originMetadata, {
                                onReceiveMessage(message) {
                                    lastReceivedMessage = message;
                                },
                                onReceiveStatus(retryStatus) {
                                    lastReceivedStatus = retryStatus;
                                    if (codeMap.includes(retryStatus.code)) {
                                        retry();
                                    }
                                    else {
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
                        }
                        else {
                            receivedMessageCallback(lastReceivedMessage);
                            statusChainNext(lastReceivedStatus);
                        }
                    },
                };
                next(metadata, newListener);
            },
        });
    };
}
exports.retryInterceptorFactory = retryInterceptorFactory;
//# sourceMappingURL=interceptors.js.map