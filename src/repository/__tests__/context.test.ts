import { AuthToken, RepositoryContext } from '../';

test('building from GQL context', () => {

  const authToken: AuthToken = {
    asHeader(): string {
      return '';
    },
    payload<T>(): T {
      return undefined;
    },
    asScopes(): boolean {
      return true;
    },
    isValid(): boolean {
      return false;
    },
    asString(): string {
      return '';
    }
  };

  const gqlContext = {
    authToken,
    correlationId: 'id',
  };

  const repoContext = RepositoryContext.fromGQLContext(gqlContext);

  expect(repoContext.authToken).toBe(authToken);
  expect(repoContext.correlationId).toBe('id');
});
