import { AbstractRepository, RepositoryContext, RepositoryContextBase, RepositoryLocator } from './repository';
import { PullValue } from './resolver.decorators';

interface RepositoryGraphQLContext {
  repositoryLocator: RepositoryLocator;
}

export const InjectRepo = PullValue((paramType: typeof AbstractRepository) => {
  return (source: any, args: any, context: RepositoryGraphQLContext & RepositoryContextBase): AbstractRepository => {
    const provider = context.repositoryLocator;
    return provider.getWithContext(paramType.prototype, RepositoryContext.fromGQLContext(context));
  };
});
