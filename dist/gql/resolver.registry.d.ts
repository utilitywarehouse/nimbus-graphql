import { ResolverInterface } from './resolver.interface';
import { ResolverMetadata } from './resolver.metadata';
export declare class ResolverRegistry {
    resolvers: ResolverInterface[];
    scalarResolvers: {
        [key: string]: any;
    };
    register(...resolvers: ResolverInterface[]): ResolverRegistry;
    method(meta: ResolverMetadata, r: any, method: any): (...args: any[]) => Promise<any>;
    remapMethodParameters(meta: ResolverMetadata, r: any, method: any): (...args: any[]) => any;
    withHooks(meta: ResolverMetadata, method: string, fn: any): (...args: any[]) => Promise<any>;
    scalars(scalarResolvers: any): ResolverRegistry;
    resolverMap(): {};
}
