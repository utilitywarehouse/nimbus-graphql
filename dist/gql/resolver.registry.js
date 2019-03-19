"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const resolver_metadata_1 = require("./resolver.metadata");
const set = require("lodash.set");
const get = require("lodash.get");
const errors_1 = require("./errors");
let ResolverRegistry = class ResolverRegistry {
    constructor() {
        this.resolvers = [];
    }
    register(...resolvers) {
        this.resolvers.push(...resolvers);
        return this;
    }
    method(meta, r, method) {
        return this.withHooks(meta, method, this.remapMethodParameters(meta, r, method));
    }
    remapMethodParameters(meta, r, method) {
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
    withHooks(meta, method, fn) {
        const beforeHooks = meta.beforeHooks.filter((s) => s.method === method);
        const afterHooks = meta.afterHooks.filter((s) => s.method === method);
        return (...args) => __awaiter(this, void 0, void 0, function* () {
            const promisedBeforeHooks = beforeHooks.map((hookDef) => Promise.resolve(hookDef.hook(...args)));
            try {
                yield Promise.all(promisedBeforeHooks);
            }
            catch (e) {
                if (e instanceof errors_1.NullError) {
                    return null;
                }
                throw e;
            }
            const userResolverResult = yield fn(...args);
            const promisedAfterHooks = afterHooks.map((hookDef) => Promise.resolve(hookDef.hook(userResolverResult)));
            yield Promise.all(promisedAfterHooks);
            return userResolverResult;
        });
    }
    scalars(scalarResolvers) {
        this.scalarResolvers = scalarResolvers;
        return this;
    }
    resolverMap() {
        const usedProps = [];
        const resolvers = {};
        this.resolvers.forEach(r => {
            const safeSet = (path, fn) => {
                if (get(resolvers, path)) {
                    throw new Error(`${path} resolver already set, attempting to set from ${r.constructor.name}`);
                }
                set(resolvers, path, fn);
            };
            const meta = resolver_metadata_1.ResolverMetadata.for(r);
            meta.queries.forEach(({ name, method }) => {
                safeSet(`Query.${name}`, this.method(meta, r, method));
                usedProps.push(method);
            });
            meta.mutations.forEach(({ name, method }) => {
                safeSet(`Mutation.${name}`, this.method(meta, r, method));
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
        return Object.assign({}, this.scalarResolvers, resolvers);
    }
};
ResolverRegistry = __decorate([
    typedi_1.Service()
], ResolverRegistry);
exports.ResolverRegistry = ResolverRegistry;
//# sourceMappingURL=resolver.registry.js.map