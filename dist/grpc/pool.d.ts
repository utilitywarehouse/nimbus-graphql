import * as grpc from 'grpc';
import { InterceptorFactorySelector } from './interceptors';
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
export declare enum PoolStatus {
    AllDisconnected = 0,
    AllConnected = 1,
    SomeConnected = 2
}
export declare class Pool<Client extends grpc.Client> {
    clients: Client[];
    provider: IterableIterator<Client>;
    status: PoolStatus;
    constructor(clientProto: {
        new (...args: any[]): Client;
    }, options: PoolOptions);
    private watchConnections;
    private make;
    private startProvider;
    get(): Client;
}
export {};
