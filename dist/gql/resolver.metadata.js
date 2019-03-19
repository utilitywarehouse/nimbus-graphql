"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const ResolverMetadataKey = Symbol.for('gql:resolver:config');
class ResolverMetadata {
    constructor() {
        this.methodParamNumbers = {};
        this.methodParamOverrides = {};
        this.queries = [];
        this.mutations = [];
        this.mappedResolvers = [];
        this.beforeHooks = [];
        this.afterHooks = [];
    }
    addMutation(name, method) {
        this.mutations.push({ name, method });
        return this;
    }
    addQuery(name, method) {
        this.queries.push({ name, method });
        return this;
    }
    addResolver(name, method) {
        this.mappedResolvers.push({ name, method });
        return this;
    }
    addBeforeHook(method, hook) {
        this.beforeHooks.push({ method, hook });
        return this;
    }
    addAfterHook(method, hook) {
        this.afterHooks.push({ method, hook });
        return this;
    }
    setType(name) {
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
    static for(target) {
        let meta = Reflect.getMetadata(ResolverMetadataKey, target);
        if (meta) {
            return meta;
        }
        meta = new ResolverMetadata();
        Reflect.defineMetadata(ResolverMetadataKey, meta, target);
        return meta;
    }
}
exports.ResolverMetadata = ResolverMetadata;
//# sourceMappingURL=resolver.metadata.js.map