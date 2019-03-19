import * as grpc from 'grpc';
interface CallOptions {
    timeout?: number;
    [key: string]: any;
}
export declare function options(opt: CallOptions): Partial<grpc.CallOptions>;
export {};
