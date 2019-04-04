import { GraphQLError } from "graphql";
import * as fs from 'fs';
import * as merge from 'lodash.merge';
import { Container } from 'typedi';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
import {SubscriptionServerOptions} from 'apollo-server-core';
import * as GraphQLJSON from 'graphql-type-json';
import { GraphQLUUID } from 'graphql-custom-types';
import { ApolloServer, Config, CorsOptions } from 'apollo-server-express';
import {createServer as createHttpServer, Server} from 'http';

import { ResolverRegistry } from './resolver.registry';
import { ResolverInterface } from './resolver.interface';
import { ResolverToken } from './resolver.token';
import { Application } from './framework';
import { GQLError } from "./errors/gql.error";

export interface GraphQLOperations {
  onResponse(response: any);

  onError(error: GQLError): void;
}

export interface GraphQLContextBuilder {
  build(args: any): object;
}

const ExtensionInjectCorrelationIdToError = {
  willSendResponse(o) {

    const { context, graphqlResponse } = o;

    if (!graphqlResponse.errors || graphqlResponse.errors.length === 0) {
      return o;
    }

    graphqlResponse.errors = graphqlResponse.errors.map((e: GraphQLError) => {

      const ext = e.extensions || {};

      ext.correlationId = context.req.headers['X-Correlation-ID'];

      return new GraphQLError(
          e.message,
          e.nodes,
          e.source,
          e.positions,
          e.path,
          e.originalError,
          ext,
      );
    });

    return o;
  },
};

export class GraphQLBuilder {
  private readonly schemaPath: string;
  private gqlMetrics?: GraphQLOperations;
  private subOpts?: Partial<SubscriptionServerOptions>;
  private gqlContext: GraphQLContextBuilder;
  private app: Application;

  constructor(container: Application, schemaPath: string) {
    this.schemaPath = schemaPath;
    this.app = container;
  }

  metrics(operations: GraphQLOperations) {
    this.gqlMetrics = operations;
    return this;
  }

  context(graphqlContext: GraphQLContextBuilder) {
    this.gqlContext = graphqlContext;
    return this;
  }

  subscriptions(opt: Partial<SubscriptionServerOptions>): GraphQLBuilder {
    this.subOpts = opt;
    return this;
  }

  serverConfig(customConfig?: Config): Config & {
    cors?: CorsOptions | boolean;
  } {

    const typeDefs = JSON.parse(fs.readFileSync(this.schemaPath, 'utf8'));

    return merge({
      typeDefs,

      extensions: [() => ExtensionInjectCorrelationIdToError],
      context: (args) => this.gqlContext.build(args),
      // all resolvers are registered in the resolver builder, it will return the typical resolver
      // structure which it works out via decorators
      resolvers: this.app.get(ResolverRegistry).register(
          ...Container.getMany<ResolverInterface>(ResolverToken),
      ).scalars({
        JSON: GraphQLJSON,
        Date: GraphQLDateTime,
        DateTime: GraphQLDateTime,
        Time: GraphQLTime,
        UUID: GraphQLUUID,
      }).resolverMap(),
      formatError: (err: GraphQLError) => {
        const error = GQLError.from(err);
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
      subscriptions: this.subOpts,
    }, customConfig || {});
  }

  server(customConfig?: Config) {
    const config = this.serverConfig(customConfig);
    const apollo = new ApolloServer(config);

    apollo.applyMiddleware({ app: this.app.express, path: '/' });

    if (this.subOpts) {
      apollo.installSubscriptionHandlers(
          createHttpServer(this.app.express)
      );
    }

    return apollo;
  }
}
