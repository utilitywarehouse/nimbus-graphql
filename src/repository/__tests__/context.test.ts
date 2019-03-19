import { Request } from 'express';
import { AuthToken, RepositoryContext } from '../';

test('building from GQL context', () => {

  const reqOnj: any = { header: jest.fn(() => 'id') };
  const req = reqOnj as Request;

  const authToken: AuthToken = {
    asScopes(scopes: string[]): boolean {
      return true;
    },
    isValid(): boolean {
      return false;
    },
    asString(): string {
      return "";
    }
  }

  const gqlContext = {
    authToken,
    req,
  };

  const repoContext = RepositoryContext.fromGQLContext(gqlContext);

  expect(repoContext.authToken).toBe(authToken);
  expect(repoContext.correlationId).toBe('id');
  expect(reqOnj.header).toHaveBeenCalledWith('x-correlation-id');
});
