"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gql_1 = require("../../../gql");
const repository_1 = require("../../../repository");
exports.InjectRepo = gql_1.PullValue((paramType) => {
    return (source, args, context) => {
        const provider = context.repositoryLocator;
        return provider.getWithContext(paramType.prototype, repository_1.RepositoryContext.fromGQLContext(context));
    };
});
//# sourceMappingURL=repo.decorator.js.map