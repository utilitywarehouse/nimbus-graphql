import * as grpc from 'grpc';
export declare enum InterceptorType {
    Unary = 0,
    ClientStreaming = 1,
    ServerStreaming = 2,
    BidiStreaming = 3
}
export declare type InterceptorFactory = (options: any, nextCall: any) => grpc.InterceptingCall;
export declare type InterceptorFactorySelector = (methodDefinition: grpc.MethodDefinition<any, any>) => InterceptorFactory;
export interface Interceptor {
    type: InterceptorType;
    interceptorFn: InterceptorFactory;
}
export declare function interceptorChain(interceptors: Interceptor[]): InterceptorFactorySelector[];
export declare function prometheusInterceptor(options: any, nextCall: any): grpc.InterceptingCall;
export declare function retryInterceptorFactory(maxRetries?: number, codeMap?: grpc.status[]): (options: any, nextCall: any) => grpc.InterceptingCall;
