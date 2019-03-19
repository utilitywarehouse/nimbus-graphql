import * as grpc from 'grpc';
import { Call } from 'grpc';
export declare type gRPCHandler<T> = (error: grpc.ServiceError | null, response: T) => void;
export declare type PromisedGRPCResponse<T> = Promise<{
    response: T;
    call: Call;
}>;
export declare function promisify<T>(grpcClientCall: (callback: gRPCHandler<T>) => Call): PromisedGRPCResponse<T>;
