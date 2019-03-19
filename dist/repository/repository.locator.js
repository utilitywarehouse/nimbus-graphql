"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const repository_token_1 = require("./repository.token");
const repository_metadata_1 = require("./repository.metadata");
class RepositoryLocator {
    constructor(container) {
        this.container = container;
    }
    getWithContext(repoKey, context) {
        const repositories = typedi_1.Container.getMany(repository_token_1.RepositoryToken);
        for (const registeredRepo of repositories) {
            const interfaceType = repository_metadata_1.RepositoryMetadata.for(registeredRepo).type;
            const repo = this.container.get(interfaceType.constructor);
            if (interfaceType.constructor === repoKey.constructor || repo.constructor === repoKey.constructor) {
                return repo.withContext(context);
            }
        }
        throw new Error(`${repoKey.constructor.name} not found in the container`);
    }
}
exports.RepositoryLocator = RepositoryLocator;
//# sourceMappingURL=repository.locator.js.map