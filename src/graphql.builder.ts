import { GraphQLError, ResponsePath, GraphQLType } from 'graphql';
import * as fs from 'fs';
import { merge, last } from 'lodash';
import { Container } from 'typedi';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
import { SubscriptionServerOptions } from 'apollo-server-core';
import * as GraphQLJSON from 'graphql-type-json';
import { GraphQLUUID } from 'graphql-custom-types';
import { ApolloServer, Config, CorsOptions } from 'apollo-server-express';
import { TracingFormat } from 'apollo-tracing';

import { ResolverRegistry } from './resolver.registry';
import { ResolverInterface } from './resolver.interface';
import { ResolverToken } from './resolver.token';
import { Application } from './framework';
import { GQLError } from './errors';

export interface GraphQLOperations {
  onResponse(response: any): void;

  onError(error: GQLError): void;
}

export interface GraphQLContextBuilder {
  build(args: any): object;
}


// Not exported types from apollo-tracing
// Can be found on `apollo-tracing/src/index.ts`
type HighResolutionTime = [number, number];

interface ResolverCall {
  path: ResponsePath;
  fieldName: string;
  parentType: GraphQLType;
  returnType: GraphQLType;
  startOffset: HighResolutionTime;
  endOffset?: HighResolutionTime;
}

const ExtensionInjectCorrelationIdToError = {
  willSendResponse(o: any): GraphQLError | any {

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
  private readonly schemaPath?: string;
  private gqlMetrics?: GraphQLOperations;
  private subOpts?: Partial<SubscriptionServerOptions>;
  private gqlContext: GraphQLContextBuilder;
  private app: Application;

  private traceOnlyCustomResolvers: boolean;

  constructor(container: Application, schemaPath?: string) {
    this.schemaPath = schemaPath;
    this.app = container;

    try {
      this.traceOnlyCustomResolvers = this.app.config().get('app.traceOnlyCustomResolvers');
    } catch (e) {
      this.traceOnlyCustomResolvers = false;
    }
  }

  metrics(operations: GraphQLOperations): GraphQLBuilder {
    this.gqlMetrics = operations;
    return this;
  }

  context(graphqlContext: GraphQLContextBuilder): GraphQLBuilder {
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

    const typeDefs = this.schemaPath ?
      JSON.parse(fs.readFileSync(this.schemaPath, 'utf8')) :
      customConfig.typeDefs;

    // all resolvers are registered in the resolver builder, it will return the typical resolver
    // structure which it works out via decorators
    const resolvers = this.app.get(ResolverRegistry).register(
      ...Container.getMany<ResolverInterface>(ResolverToken),
    ).scalars({
      JSON: GraphQLJSON,
      Date: GraphQLDate,
      DateTime: GraphQLDateTime,
      Time: GraphQLTime,
      UUID: GraphQLUUID,
    }).resolverMap();

    return merge({
      typeDefs,
      resolvers,

      extensions: [(): any => ExtensionInjectCorrelationIdToError],
      context: (args: any) => this.gqlContext.build(args),
      formatError: (err: GraphQLError) => {
        const error = GQLError.from(err);
        if (this.gqlMetrics) {
          this.gqlMetrics.onError(error);
        }
        return error.render();
      },
      tracing: true,
      formatResponse: (response: any) => {
        if (this.traceOnlyCustomResolvers) {
          response.extensions.tracing.execution.resolvers = this.filterTracingResolvers(response, resolvers);
        }

        if (this.gqlMetrics) {
          this.gqlMetrics.onResponse(response);
        }
        return response;
      },
      subscriptions: this.subOpts,
    }, customConfig || {});
  }

  server(customConfig?: Config): ApolloServer {
    const config = this.serverConfig(customConfig);
    const apollo = new ApolloServer(config);

    apollo.applyMiddleware({ app: this.app.express, path: '/' });

    if (this.subOpts) {
      apollo.installSubscriptionHandlers(
        this.app.server,
      );
    }

    return apollo;
  }

  // Removes the automatic resolvers to not pollute the tracing information
  private filterTracingResolvers(response: any, resolvers: any) {
    const tracing = response.extensions.tracing;
    const tracingResolvers: ResolverCall[] = tracing.execution.resolvers;

    return tracingResolvers
      .filter((tracingResolver) => this.isMappedResolver(tracingResolver, resolvers));
  }

  // Checks if the given tracing resolver came from a implemented resolver or the automatic resolver
  private isMappedResolver(tracingResolver: ResolverCall, resolvers: any) {
    const parentType = tracingResolver.parentType.toString();
    const key = last(tracingResolver.path as any) as any;

    const parent = resolvers[parentType];

    return parent && parent[key];
  }
}
