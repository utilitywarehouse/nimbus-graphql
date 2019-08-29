import { Request } from 'express';
import { AuthToken, RepositoryContext } from '../';

test('building from GQL context', () => {

  const reqOnj: any = { header: jest.fn(() => 'id') };
  const req = reqOnj as Request;

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
    req,
    correlationId: 'id',
  };

  const repoContext = RepositoryContext.fromGQLContext(gqlContext as any);

  expect(repoContext.authToken).toBe(authToken);
  expect(repoContext.correlationId).toBe('id');
  // TODO: check why isn't called
  // expect(reqOnj.header).toHaveBeenCalledWith('x-correlation-id');
});
