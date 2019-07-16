import { Container, ContainerInstance } from 'typedi';
import { AbstractRepository } from './abstract.repository';
import { RepositoryToken } from './repository.token';
import { RepositoryMetadata } from './repository.metadata';

export class RepositoryLocator {

  constructor(private readonly container: ContainerInstance) {}

  private repositories: AbstractRepository[]  = []

  getWithContext<T>(repoKey: typeof AbstractRepository | AbstractRepository, context: T): AbstractRepository {

    const repositories = Container.getMany<AbstractRepository>(RepositoryToken);
    for (const registeredRepo of repositories) {

      const interfaceType = RepositoryMetadata.for(registeredRepo).type;
      const repo = this.container.get<AbstractRepository>(interfaceType.constructor);

      if (interfaceType.constructor === repoKey.constructor || repo.constructor === repoKey.constructor) {
        const cached = this.repositories.find((cachedRepo) => cachedRepo.constructor === repo.constructor)
        if (cached) {
          return cached;
        }

        const newRepoWithContext = repo.withContext(context)
        this.repositories.push(newRepoWithContext)
        return newRepoWithContext
      }
    }

    throw new Error(`${repoKey.constructor.name} not found in the container`);
  }
}
