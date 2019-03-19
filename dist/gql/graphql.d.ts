/// <reference types="cors" />
import { ApolloServer, Config, CorsOptions } from 'apollo-server-express';
import { GQLError } from './errors';
import { Application } from '../framework';
export interface GraphQLOperations {
    onResponse(response: any): any;
    onError(error: GQLError): void;
}
export interface GraphQLContextBuilder {
    build(args: any): object;
}
export declare class Graphql {
    private readonly schemaPath;
    private gqlMetrics?;
    private gqlContext;
    private app;
    constructor(container: Application, schemaPath: string);
    metrics(operations: GraphQLOperations): this;
    context(graphqlContext: GraphQLContextBuilder): this;
    serverConfig(customConfig?: Config): Config & {
        cors?: CorsOptions | boolean;
    };
    server(customConfig?: Config): ApolloServer;
}
