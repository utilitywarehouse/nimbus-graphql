"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const fs = require("fs");
const merge = require("lodash.merge");
const typedi_1 = require("typedi");
const graphql_iso_date_1 = require("graphql-iso-date");
const GraphQLJSON = require("graphql-type-json");
const graphql_custom_types_1 = require("graphql-custom-types");
const apollo_server_express_1 = require("apollo-server-express");
const errors_1 = require("./errors");
const resolver_registry_1 = require("./resolver.registry");
const resolver_token_1 = require("./resolver.token");
const ExtensionInjectCorrelationIdToError = {
    willSendResponse(o) {
        const { context, graphqlResponse } = o;
        if (!graphqlResponse.errors || graphqlResponse.errors.length === 0) {
            return o;
        }
        graphqlResponse.errors = graphqlResponse.errors.map((e) => {
            const ext = e.extensions || {};
            ext.correlationId = context.req.headers['X-Correlation-ID'];
            return new graphql_1.GraphQLError(e.message, e.nodes, e.source, e.positions, e.path, e.originalError, ext);
        });
        return o;
    },
};
class Graphql {
    constructor(container, schemaPath) {
        this.schemaPath = schemaPath;
        this.app = container;
    }
    metrics(operations) {
        this.gqlMetrics = operations;
        return this;
    }
    context(graphqlContext) {
        this.gqlContext = graphqlContext;
        return this;
    }
    serverConfig(customConfig) {
        const typeDefs = JSON.parse(fs.readFileSync(this.schemaPath, 'utf8'));
        return merge({
            typeDefs,
            extensions: [() => ExtensionInjectCorrelationIdToError],
            context: (args) => this.gqlContext.build(args),
            resolvers: this.app.get(resolver_registry_1.ResolverRegistry).register(...typedi_1.Container.getMany(resolver_token_1.ResolverToken)).scalars({
                JSON: GraphQLJSON,
                Date: graphql_iso_date_1.GraphQLDateTime,
                DateTime: graphql_iso_date_1.GraphQLDateTime,
                Time: graphql_iso_date_1.GraphQLTime,
                UUID: graphql_custom_types_1.GraphQLUUID,
            }).resolverMap(),
            formatError: (err) => {
                const error = errors_1.GQLError.from(err);
                if (this.gqlMetrics) {
                    this.gqlMetrics.onError(error);
                }
                return error.render();
            },
            tracing: true,
            formatResponse: (response) => {
                if (this.gqlMetrics) {
                    this.gqlMetrics.onResponse(response);
                }
                return response;
            },
        }, customConfig || {});
    }
    server(customConfig) {
        const config = this.serverConfig(customConfig);
        const apollo = new apollo_server_express_1.ApolloServer(config);
        apollo.applyMiddleware({ app: this.app.express, path: '/' });
        return apollo;
    }
}
exports.Graphql = Graphql;
//# sourceMappingURL=graphql.js.map