import { Service } from 'typedi';
import { ResolverInterface } from './resolver.interface';
import { ResolverMetadata } from './resolver.metadata';
import * as set from 'lodash.set';
import * as get from 'lodash.get';
import { NullError } from "./errors/null.error";

@Service()
export class ResolverRegistry {

  resolvers: ResolverInterface[] = [];
  scalarResolvers: { [key: string]: any };

  register(...resolvers: ResolverInterface[]): ResolverRegistry {
    this.resolvers.push(...resolvers);
    return this;
  }

  method(meta: ResolverMetadata, r, method) {
    return this.withHooks(meta, method, this.remapMethodParameters(meta, r, method));
  }

  remapMethodParameters(meta: ResolverMetadata, r, method) {
    if (meta.methodParamOverrides[method]) {
      const argSpec = meta.methodParamOverrides[method];

      return (...args) => {

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
    return (...args) => r[method](...args);
  }

  withHooks(meta: ResolverMetadata, method: string, fn: any) {
    const beforeHooks = meta.beforeHooks.filter((s) => s.method === method);
    const afterHooks = meta.afterHooks.filter((s) => s.method === method);

    return async (...args) => {
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

    const usedProps = [];

    const resolvers = {};

    this.resolvers.forEach(r => {

      const safeSet = (path, fn) => {
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

      meta.subscriptions.forEach(({name, method}) => {
        safeSet(`Subscription.${name}`, {subscribe: this.method(meta, r, method)});
        usedProps.push(method);
      });

      meta.mappedResolvers.forEach(({ name, method }) => {
        safeSet(`${name}`, this.method(meta, r, method));
        usedProps.push(method);
      });

      const typePrefix = meta.type ? `${meta.type}.` : '';

      Object.getOwnPropertyNames(Object.getPrototypeOf(r)).filter(prop => {
        return typeof r[prop] === 'function' && prop !== 'constructor' && usedProps.indexOf(prop) === -1;
      }).forEach(method => {
        safeSet(`${typePrefix}${method}`, this.method(meta, r, method));
      });
    });

    return { ...this.scalarResolvers, ...resolvers };
  }
}
