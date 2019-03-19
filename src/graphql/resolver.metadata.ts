import 'reflect-metadata';
import { IFieldResolver } from 'graphql-tools';

const ResolverMetadataKey = Symbol.for('gql:resolver:config');

export class ResolverMetadata {
  public methodParamNumbers: { [k: string]: number } = {};
  public methodParamOverrides: { [k: string]: any } = {};
  public type: string;
  public queries: Array<{ name: string, method: string }> = [];
  public mutations: Array<{ name: string, method: string }> = [];
  public mappedResolvers: Array<{ name: string, method: string }> = [];

  public beforeHooks: Array<{ method: string, hook: IFieldResolver<any, any, any> }> = [];
  public afterHooks: Array<{ method: string, hook: (result: any) => any }> = [];

  addMutation(name: string, method: string) {
    this.mutations.push({ name, method });
    return this;
  }

  addQuery(name: string, method: string) {
    this.queries.push({ name, method });
    return this;
  }

  addResolver(name: string, method: string) {
    this.mappedResolvers.push({ name, method });
    return this;
  }

  addBeforeHook<TSource, TContext, TArgs = {
    [argument: string]: any;
  }>(method: string, hook: IFieldResolver<TSource, TContext, TArgs>) {
    this.beforeHooks.push({ method, hook });
    return this;
  }

  addAfterHook(method: string, hook: (result: any) => void) {
    this.afterHooks.push({ method, hook });
    return this;
  }

  setType(name: string) {
    this.type = name;
    return this;
  }

  addMethodParamNumber(key, noOfParameters) {
    this.methodParamNumbers[key] = noOfParameters;
  }

  addMethodParamOverride(key, index, fn) {
    this.methodParamOverrides[key] = this.methodParamOverrides[key] || [];
    this.methodParamOverrides[key][index] = fn;
    return this;
  }

  static for(target: any): ResolverMetadata {
    let meta = Reflect.getMetadata(ResolverMetadataKey, target);
    if (meta) {
      return meta;
    }

    meta = new ResolverMetadata();

    Reflect.defineMetadata(ResolverMetadataKey, meta, target);

    return meta;
  }
}
