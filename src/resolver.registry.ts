import { Service } from 'typedi';
import { ResolverInterface } from './resolver.interface';
import { ResolverMetadata } from './resolver.metadata';
import { get, set } from 'lodash';
import { NullError } from './errors';

@Service()
export class ResolverRegistry {

  resolvers: ResolverInterface[] = [];
  scalarResolvers: { [key: string]: any };

  register(...resolvers: ResolverInterface[]): ResolverRegistry {
    this.resolvers.push(...resolvers);
    return this;
  }

  method(meta: ResolverMetadata, r: any, method: string): any {
    return this.withHooks(meta, method, this.remapMethodParameters(meta, r, method));
  }

  remapMethodParameters(meta: ResolverMetadata, r: any, method: string): Function {
    if (meta.methodParamOverrides[method]) {
      const argSpec = meta.methodParamOverrides[method];

      return (...args: any[]): any => {

        const mappedArgs = [];

        for (let i = 0; i < meta.methodParamNumbers[method]; i++) {
          mappedArgs[i] = args[i];

          if (argSpec[i]) {
            mappedArgs[i] = argSpec[i](...args);
          }
        }

        return r[method](...mappedArgs);
      };
    }
    return (...args: any): any => r[method](...args);
  }

  withHooks(meta: ResolverMetadata, method: string, fn: any): Function {
    const beforeHooks = meta.beforeHooks.filter((s) => s.method === method);
    const afterHooks = meta.afterHooks.filter((s) => s.method === method);

    return async (...args: any[]): Promise<any> => {
      const promisedBeforeHooks = beforeHooks.map((hookDef: any) => Promise.resolve(hookDef.hook(...args)));

      try {
        await Promise.all(promisedBeforeHooks);
      } catch (e) {
        if (e instanceof NullError) {
          return null;
        }

        throw e;
      }

      const userResolverResult = await fn(...args);

      const promisedAfterHooks = afterHooks.map((hookDef: any) => Promise.resolve(hookDef.hook(userResolverResult)));

      await Promise.all(promisedAfterHooks);

      return userResolverResult;
    };
  }

  scalars(scalarResolvers: any): ResolverRegistry {
    this.scalarResolvers = scalarResolvers;
    return this;
  }

  resolverMap(): {} {

    const usedProps: any[] = [];

    const resolvers = {};

    this.resolvers.forEach((r: any) => {

      const safeSet = (path: any, fn: any): void => {
        if (get(resolvers, path)) {
          throw new Error(`${path} resolver already set, attempting to set from ${r.constructor.name}`);
        }
        set(resolvers, path, fn);
      };

      const meta = ResolverMetadata.for(r);

      meta.queries.forEach(({ name, method }) => {
        safeSet(`Query.${name}`, this.method(meta, r, method));
        usedProps.push(method);
      });

      meta.mutations.forEach(({ name, method }) => {
        safeSet(`Mutation.${name}`, this.method(meta, r, method));
        usedProps.push(method);
      });

      meta.subscriptions.forEach(({ name, method }) => {
        safeSet(`Subscription.${name}`, { subscribe: this.method(meta, r, method) });
        usedProps.push(method);
      });

      meta.mappedResolvers.forEach(({ name, method }) => {
        safeSet(`${name}`, this.method(meta, r, method));
        usedProps.push(method);
      });

      const typePrefix = meta.type ? `${meta.type}.` : '';

      Object.getOwnPropertyNames(Object.getPrototypeOf(r)).filter(prop => {
        return typeof r[prop] === 'function' && prop !== 'constructor' && !usedProps.includes(prop);
      }).forEach(method => {
        safeSet(`${typePrefix}${method}`, this.method(meta, r, method));
      });
    });

    return { ...this.scalarResolvers, ...resolvers };
  }
}
