import { Service } from 'typedi';
import { IFieldResolver } from 'graphql-tools';
import { ResolverToken } from './resolver.token';
import { ResolverMetadata } from './resolver.metadata';

export const Resolver = (type?: string): ClassDecorator => (target) => {
  if (type) {
    ResolverMetadata.for(target.prototype).setType(type);
  }
  Service({ id: ResolverToken, multiple: true })(target);
};

export const Resolve = (path?: string) => (target, propertyKey: string) => {
  ResolverMetadata.for(target).addResolver(path || propertyKey, propertyKey);
};

export const Query = (query?: string) => (target, propertyKey: string) => {
  ResolverMetadata.for(target).addQuery(query || propertyKey, propertyKey);
  return target;
};

export const Mutation = (mutation?: string) => (target, propertyKey: string) => {
  ResolverMetadata.for(target).addMutation(mutation || propertyKey, propertyKey);
  return target;
};

export const PullValue = <TParamType>(
    pullFn: (paramType: TParamType)
        => IFieldResolver<any, any, any>,
): ParameterDecorator => (target, key, index) => {
  const params = Reflect.getMetadata('design:paramtypes', target, key);

  ResolverMetadata.for(target).addMethodParamOverride(
      key,
      index,
      pullFn(params[index]),
  ).addMethodParamNumber(key, params.length);
};

export const Parent = PullValue(() => {
  return (parent) => {
    return parent;
  };
});

export const Arg = (name: string) => PullValue(() => {
  return (parent, args: object) => {
    return args[name];
  };
});

export const Context = (name: string) => PullValue(() => {
  return (parent, args, context) => {
    return context[name];
  };
});

export const Before = <TSource, TContext, TArgs = {
  [argument: string]: any;
}>(beforeFn: IFieldResolver<TSource, TContext, TArgs>): MethodDecorator => (target, propertyKey: string) => {
  ResolverMetadata.for(target).addBeforeHook(propertyKey, beforeFn);
};

export const After = <T>(afterFn: (result) => T) => (target, propertyKey: string) => {
  ResolverMetadata.for(target).addAfterHook(propertyKey, afterFn);
};
