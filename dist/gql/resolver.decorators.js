"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const resolver_token_1 = require("./resolver.token");
const resolver_metadata_1 = require("./resolver.metadata");
exports.Resolver = (type) => (target) => {
    if (type) {
        resolver_metadata_1.ResolverMetadata.for(target.prototype).setType(type);
    }
    typedi_1.Service({ id: resolver_token_1.ResolverToken, multiple: true })(target);
};
exports.Resolve = (path) => (target, propertyKey) => {
    resolver_metadata_1.ResolverMetadata.for(target).addResolver(path || propertyKey, propertyKey);
};
exports.Query = (query) => (target, propertyKey) => {
    resolver_metadata_1.ResolverMetadata.for(target).addQuery(query || propertyKey, propertyKey);
    return target;
};
exports.Mutation = (mutation) => (target, propertyKey) => {
    resolver_metadata_1.ResolverMetadata.for(target).addMutation(mutation || propertyKey, propertyKey);
    return target;
};
exports.PullValue = (pullFn) => (target, key, index) => {
    const params = Reflect.getMetadata('design:paramtypes', target, key);
    resolver_metadata_1.ResolverMetadata.for(target).addMethodParamOverride(key, index, pullFn(params[index])).addMethodParamNumber(key, params.length);
};
exports.Parent = exports.PullValue(() => {
    return (parent) => {
        return parent;
    };
});
exports.Arg = (name) => exports.PullValue(() => {
    return (parent, args) => {
        return args[name];
    };
});
exports.Context = (name) => exports.PullValue(() => {
    return (parent, args, context) => {
        return context[name];
    };
});
exports.Before = (beforeFn) => (target, propertyKey) => {
    resolver_metadata_1.ResolverMetadata.for(target).addBeforeHook(propertyKey, beforeFn);
};
exports.After = (afterFn) => (target, propertyKey) => {
    resolver_metadata_1.ResolverMetadata.for(target).addAfterHook(propertyKey, afterFn);
};
//# sourceMappingURL=resolver.decorators.js.map