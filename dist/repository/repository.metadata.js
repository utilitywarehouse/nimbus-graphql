"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const RepositoryMetadataKey = Symbol.for('repository:config');
class RepositoryMetadata {
    setType(type) {
        this.type = RepositoryMetadata.getType(type);
    }
    static getType(target) {
        let returnType = target;
        if (typeof target === 'function') {
            returnType = target.prototype;
        }
        else {
            returnType = target;
        }
        return returnType;
    }
    static for(target) {
        let meta = Reflect.getMetadata(RepositoryMetadataKey, RepositoryMetadata.getType(target));
        if (meta) {
            return meta;
        }
        meta = new RepositoryMetadata();
        Reflect.defineMetadata(RepositoryMetadataKey, meta, RepositoryMetadata.getType(target));
        return meta;
    }
}
exports.RepositoryMetadata = RepositoryMetadata;
//# sourceMappingURL=repository.metadata.js.map