import { Container, ContainerInstance } from 'typedi';
import { AbstractRepository } from './abstract.repository';
import { RepositoryToken } from './repository.token';
import { RepositoryMetadata } from './repository.metadata';

export class RepositoryLocator {

  constructor(private readonly container: ContainerInstance) {}

  getWithContext<T>(repoKey: typeof AbstractRepository | AbstractRepository, context: T): AbstractRepository {

    const repositories = Container.getMany<AbstractRepository>(RepositoryToken);
    for (const registeredRepo of repositories) {

      const interfaceType = RepositoryMetadata.for(registeredRepo).type;
      const repo = this.container.get<AbstractRepository>(interfaceType.constructor);

      if (interfaceType.constructor === repoKey.constructor || repo.constructor === repoKey.constructor) {
        return repo.withContext(context);
      }
    }

    throw new Error(`${repoKey.constructor.name} not found in the container`);
  }
}
