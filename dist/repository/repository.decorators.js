"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const index_1 = require("./index");
exports.Repository = (type) => (target) => {
    index_1.RepositoryMetadata.for(target).setType(type || target);
    return typedi_1.Service({
        id: index_1.RepositoryToken,
        multiple: true,
    })(target);
};
exports.RepositoryFactory = (factory, type) => (target) => {
    index_1.RepositoryMetadata.for(target).setType(type || target);
    if (type) {
        typedi_1.Service({ factory, id: type })(target);
    }
    return typedi_1.Service({
        id: index_1.RepositoryToken,
        multiple: true,
        factory,
    })(target);
};
//# sourceMappingURL=repository.decorators.js.map