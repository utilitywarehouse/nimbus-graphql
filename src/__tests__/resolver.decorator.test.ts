import { After, Arg, Before, Context, Mutation, Parent, Query, Resolve, Resolver } from '../resolver.decorators';
import { ResolverRegistry } from '../resolver.registry';
import { makeExecutableSchema } from 'graphql-tools';
import { graphql, GraphQLSchema } from 'graphql';
import * as assert from 'assert';
import { NullError } from '../errors';

@Resolver('Decorator')
class ResolverClass {

  id(parent: any): string {
    return parent.id + '-1';
  }

  @Before(() => {
    throw new NullError('tried to access protected field');
  })
  @Query()
  itsAlwaysNull(): string {
    return 'you\'ll never see this message';
  }

  @Before(() => {
    throw new Error('You hit before hook');
  })
  @Query()
  beforeHook(): string {
    return 'You\'ll never hit this';
  }

  @After(() => {
    throw new Error('You hit after hook');
  })
  @Query()
  afterHook(): string {
    return 'you\'ll never see this message';
  }

  @Resolve('OtherType.id')
  field2(parent: any): string {
    return parent.id + '-1';
  }

  @Query()
  decorator(): any {
    return { id: 'id-field' };
  }

  @Query('otherQuery')
  other(): any {
    return { id: 'id-other' };
  }

  @Mutation()
  mutation(): string {
    return 'mutated';
  }

  @Mutation('otherMutation')
  mutation2(): string {
    return 'otherMutation';
  }

  methodWithMappedParams(
      @Parent parent: any,
      @Context('ctx') context: any,
      @Arg('arg') arg: any,
  ): string {

    assert(parent, 'Parent not present');
    assert(context, 'Context not present');
    assert(arg, 'Argument not present');

    return 'cool';
  }
}

describe.only('GraphQL Decorators', () => {

  let schema: GraphQLSchema;
  beforeEach(() => {
    const schemaSDL = `
      type Decorator {
         id: String
         methodWithMappedParams(arg: String!): String
      }

      type OtherType {
         id: String
      }

      type Query {
        decorator: Decorator
        otherQuery: OtherType
        itsAlwaysNull: String
        beforeHook: String
        afterHook: String
      }

      type Mutation {
        mutation: String
        otherMutation: String
      }

      schema {
        query: Query
        mutation: Mutation
      }
    `;

    const registry = new ResolverRegistry();

    schema = makeExecutableSchema({
      typeDefs: schemaSDL,
      resolvers: registry.register(new ResolverClass()).resolverMap(),
    });
  });

  it('resolve a query successfully @Query()', async () => {

    const query = `
      query get {
        decorator {
          id
        }
      }
    `;
    const result = await graphql(schema, query);

    expect(result.data.decorator.id).toBe('id-field-1');
  });

  it('resolve a query with a custom name successfully @Query(otherQuery)', async () => {

    const query = `
      query get {
        otherQuery {
          id
        }
      }
    `;
    const result = await graphql(schema, query);

    expect(result.data.otherQuery.id).toBe('id-other-1');
  });

  it('resolve a mutation successfully @Mutation()', async () => {

    const query = `
      mutation doMutation {
        mutation
      }
    `;
    const result = await graphql(schema, query);

    expect(result.data.mutation).toBe('mutated');
  });

  it('resolve a custom mutation successfully @Mutation(otherMutation)', async () => {

    const query = `
      mutation doMutation {
        otherMutation
      }
    `;
    const result = await graphql(schema, query);

    expect(result.data.otherMutation).toBe('otherMutation');
  });

  it('resolve a nested query with parameters', async () => {

    const query = `
      query get {
        decorator {
          methodWithMappedParams(arg: "fab")
        }
      }
    `;
    const result = await graphql(schema, query, null, {
      ctx: true,
    });

    expect(result.data.decorator.methodWithMappedParams).toBe('cool');
  });

  it('will always return null for a specifc resolve when throwing NullError', async () => {

    const query = `
      query get {
        itsAlwaysNull
      }
    `;
    const result = await graphql(schema, query);

    expect(result.data.itsAlwaysNull).toBeNull();
  });

  it('will throw an error within the BeforeHook', async () => {

    const query = `
      query get {
        beforeHook
      }
    `;
    const result = await graphql(schema, query);

    expect(result.errors[0].message).toBe('You hit before hook');
  });

  it('will throw an error within the AfterHook', async () => {

    const query = `
      query get {
        afterHook
      }
    `;
    const result = await graphql(schema, query);

    expect(result.errors[0].message).toBe('You hit after hook');
  });
});
