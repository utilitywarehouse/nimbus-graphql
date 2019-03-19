import { IFieldResolver } from 'graphql-tools';
export declare const Resolver: (type?: string) => ClassDecorator;
export declare const Resolve: (path?: string) => (target: any, propertyKey: string) => void;
export declare const Query: (query?: string) => (target: any, propertyKey: string) => any;
export declare const Mutation: (mutation?: string) => (target: any, propertyKey: string) => any;
export declare const PullValue: <TParamType>(pullFn: (paramType: TParamType) => IFieldResolver<any, any, any>) => ParameterDecorator;
export declare const Parent: ParameterDecorator;
export declare const Arg: (name: string) => ParameterDecorator;
export declare const Context: (name: string) => ParameterDecorator;
export declare const Before: <TSource, TContext, TArgs = {
    [argument: string]: any;
}>(beforeFn: IFieldResolver<TSource, TContext, TArgs>) => MethodDecorator;
export declare const After: <T>(afterFn: (result: any) => T) => (target: any, propertyKey: string) => void;
