import { AbstractRepository, RepositoryContext, RepositoryLocator } from './repository';
import { PullValue } from './resolver.decorators';

interface RepositoryGraphQLContext {
  repositoryLocator: RepositoryLocator;
}

export const InjectRepo = PullValue((paramType: typeof AbstractRepository) => {
  return (source: any, args: any, context: RepositoryGraphQLContext): AbstractRepository => {
    const provider = context.repositoryLocator;
    return provider.getWithContext(paramType.prototype, RepositoryContext.fromGQLContext<any>(context));
  };
});
