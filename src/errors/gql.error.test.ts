import { GQLError } from './gql.error';
import { GraphQLError } from 'graphql';

describe('GQL errors', () => {
  it('should handle error details', () => {
    const value = {
      message: 'message',
      type: 'type'
    };

    const gqlError = new GQLError(
      value.message,
      value.type,
      new GraphQLError(value.message)
    );

    const expected = gqlError.render();

    expect(value.message).toBe(expected.message);
    expect(Object.keys(expected).sort()).toEqual(
      [
        'message',
        'correlationId',
        'type',
        'previous',
        'locations',
        'path',
        'extensions'
      ].sort()
    );
  });

  it('should handle gql extensions object', () => {
    const value = {
      message: 'message',
      type: 'type',
      extensions: {
        foo: 'baz'
      }
    };

    const gqlError = new GQLError(
      value.message,
      value.type,
      new GraphQLError(value.message, void 0, void 0, void 0, void 0, void 0, value.extensions)
    );

    const expected = gqlError.render();

    expect(value.extensions.foo).toBe(expected.extensions.foo);
  });

  it('should handle gql extensions empty reference', () => {
    const value = {
      message: 'message',
      type: 'type',
      extensions: null as any
    };

    const gqlError = new GQLError(
      value.message,
      value.type,
      new GraphQLError(value.message, void 0, void 0, void 0, void 0, void 0, value.extensions)
    );

    const expected = gqlError.render();

    expect(expected.extensions).toBe(void 0);
  });
});
