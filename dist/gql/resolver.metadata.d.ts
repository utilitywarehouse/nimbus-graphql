import 'reflect-metadata';
import { IFieldResolver } from 'graphql-tools';
export declare class ResolverMetadata {
    methodParamNumbers: {
        [k: string]: number;
    };
    methodParamOverrides: {
        [k: string]: any;
    };
    type: string;
    queries: Array<{
        name: string;
        method: string;
    }>;
    mutations: Array<{
        name: string;
        method: string;
    }>;
    mappedResolvers: Array<{
        name: string;
        method: string;
    }>;
    beforeHooks: Array<{
        method: string;
        hook: IFieldResolver<any, any, any>;
    }>;
    afterHooks: Array<{
        method: string;
        hook: (result: any) => any;
    }>;
    addMutation(name: string, method: string): this;
    addQuery(name: string, method: string): this;
    addResolver(name: string, method: string): this;
    addBeforeHook<TSource, TContext, TArgs = {
        [argument: string]: any;
    }>(method: string, hook: IFieldResolver<TSource, TContext, TArgs>): this;
    addAfterHook(method: string, hook: (result: any) => void): this;
    setType(name: string): this;
    addMethodParamNumber(key: any, noOfParameters: any): void;
    addMethodParamOverride(key: any, index: any, fn: any): this;
    static for(target: any): ResolverMetadata;
}
