import * as grpc from 'grpc';
import {
  interceptorChain,
  InterceptorFactorySelector,
  InterceptorType,
  prometheusInterceptor,
  retryInterceptorFactory,
} from './interceptors';
import { ObjectType } from 'typedi';

interface ClientOptions {
    interceptor_providers?: InterceptorFactorySelector[];
    [x: string]: any;
}

interface PoolOptions {
    address: string;
    credentials: grpc.ChannelCredentials;
    size: number;
    options?: ClientOptions;
}

const defaultInterceptors = interceptorChain([
  { type: InterceptorType.Unary, interceptorFn: prometheusInterceptor },
  { type: InterceptorType.Unary, interceptorFn: retryInterceptorFactory() },
]);

export enum PoolStatus {
    AllDisconnected,
    AllConnected,
    SomeConnected,
}

export class Pool<Client extends grpc.Client> {
    clients: Client[] = [];
    provider: IterableIterator<Client>;
    status: PoolStatus = PoolStatus.AllDisconnected;

    constructor(clientProto: { new (...args: any[]): Client }, options: PoolOptions) {
      for (let i = 1; i <= options.size; i++) {
        this.clients.push(this.make(i, clientProto, options));
      }
      this.provider = this.startProvider();
      this.watchConnections();
    }

    private watchConnections(): void {

      const result: boolean[] = [];

      this.clients.forEach((client, index) => {
        const channel = grpc.getClientChannel(client);

        setInterval(() => {
          const connectivityState = channel.getConnectivityState(true);
          switch (connectivityState) {
          case grpc.connectivityState.READY:
            result[index] = true;
            break;
          default:
            result[index] = false;
          }
        }, 2000);
      });

      setInterval( () => {
        if (result.every(s => s === true)) {
          this.status = PoolStatus.AllConnected;
        } else if (result.every(s => s === false)) {
          this.status = PoolStatus.AllDisconnected;
        } else {
          this.status = PoolStatus.SomeConnected;
        }
      }, 2000);
    }

    private make(index: number, clientProto: ObjectType<Client>, options: PoolOptions): Client {
      const grpcOptions: ClientOptions = Object.assign(
        // eslint-disable-next-line
        { interceptor_providers: defaultInterceptors },
        options.options,
        { 'connection.index': index },
      );
      return new clientProto(options.address, options.credentials, grpcOptions);
    }

    private *startProvider(): IterableIterator<Client> {
      let index = 0;
      while (true) {
        yield this.clients[index];
        index = (index + 1) % this.clients.length;
      }
    }

    get(): Client {
      return this.provider.next().value;
    }
}
