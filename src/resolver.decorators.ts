import { Service } from 'typedi';
import { IFieldResolver } from 'graphql-tools';
import { ResolverToken } from './resolver.token';
import { ResolverMetadata } from './resolver.metadata';
import { NullError, ForbiddenError } from './errors';

export const Resolver = (type?: string): ClassDecorator => (target): void => {
  if (type) {
    ResolverMetadata.for(target.prototype).setType(type);
  }
  Service({ id: ResolverToken, multiple: true })(target);
};

export const Resolve = (path?: string) => (target: any, propertyKey: string): void => {
  ResolverMetadata.for(target).addResolver(path || propertyKey, propertyKey);
};

export const Query = (query?: string) => (target: any, propertyKey: string): any => {
  ResolverMetadata.for(target).addQuery(query || propertyKey, propertyKey);
  return target;
};

export const Mutation = (mutation?: string) => (target: any, propertyKey: string): any => {
  ResolverMetadata.for(target).addMutation(mutation || propertyKey, propertyKey);
  return target;
};

export const Subscription = (subscription?: string) => (target: any, propertyKey: string): any => {
  ResolverMetadata.for(target).addSubscription(subscription || propertyKey, propertyKey);
  return target;
};

export const Before = <TSource, TContext, TArgs = {
  [argument: string]: any;
}>(beforeFn: IFieldResolver<TSource, TContext, TArgs>): MethodDecorator => (target: any, propertyKey: string): void => {
    ResolverMetadata.for(target).addBeforeHook(propertyKey, beforeFn);
  };


export const PullValue = <TParamType>(
  pullFn: (paramType: TParamType)
    => IFieldResolver<any, any, any>,
): ParameterDecorator => (target, key, index): void => {
    const params = Reflect.getMetadata('design:paramtypes', target, key);

    ResolverMetadata.for(target).addMethodParamOverride(
      key as string,
      index,
      pullFn(params[index]),
    ).addMethodParamNumber(key as string, params.length);
  };

export const Parent = PullValue(() => {
  return (parent: any): any => {
    return parent;
  };
});

export const Arg = (name: string): Function => PullValue(() => {
  return (parent: any, args: any): any => {
    return args[name];
  };
});

export const Context = (name: string): Function => PullValue(() => {
  return (parent: any, args: any, context: any): any => {
    return context[name];
  };
});

export const IfAuth = (...scopes: string[]): any => {
  return Before<any, any, any>((source, args, context) => {
    if (!context.config.get('auth.bypass')) {
      if (!context.authValidator.willPass(context.authToken, scopes)) {
        throw new NullError();
      }
    }
  });
};

export const MustAuth = (...scopes: string[]): any => {
  return Before<any, any, any>((source, args, context) => {
    if (!context.config.get('auth.bypass')) {
      context.authValidator.mustPass(context.authToken, scopes);
    }
  });
};

export const MustAuthWithOneOfScopes = (...scopes: string[]): any => {
  return Before<any, any, any>((source, args, context) => {
    if (!context.config.get('auth.bypass')) {
      context.authValidator.mustPass(context.authToken, []);

      const payload = context.authToken.payload();

      if (!payload) {
        throw new ForbiddenError();
      }

      for (const scope of scopes) {
        if (payload.scopes && payload.scopes.indexOf(scope) !== -1) {
          return true;
        }
      }

      throw new ForbiddenError();
    }
  });
};

export const After = <T>(afterFn: (result: any) => T) => (target: any, propertyKey: string): void => {
  ResolverMetadata.for(target).addAfterHook(propertyKey, afterFn);
};
