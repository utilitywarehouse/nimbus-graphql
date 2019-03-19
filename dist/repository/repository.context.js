"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RepositoryContext {
    static fromGQLContext(context) {
        const ctx = new RepositoryContext();
        ctx.authToken = context.authToken;
        ctx.correlationId = context.req.header('x-correlation-id');
        return ctx;
    }
}
exports.RepositoryContext = RepositoryContext;
//# sourceMappingURL=repository.context.js.map