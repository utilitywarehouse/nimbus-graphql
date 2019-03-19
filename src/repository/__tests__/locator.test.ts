import { RepositoryLocator } from '../repository.locator';
import { AbstractRepository } from '../abstract.repository';
import { RepositoryContext } from '../repository.context';
import { RepositoryFactory } from '../repository.decorators';
import { Container } from "typedi";

abstract class AbstractRepo extends AbstractRepository {}

@RepositoryFactory(() => {
  return new ConcreteRepo();
}, AbstractRepo)
class ConcreteRepo extends AbstractRepository {
  checkHealth(cr: any) {
    return true;
  }

  withContext(context: RepositoryContext): AbstractRepository {
    return this;
  }
}

describe('Repository Locator', () => {

  it('Will resolve an abstract class to it\'s concrete repository', () => {

    const container = Container.of('test');
    const context = {};
    const locator = new RepositoryLocator(container);

    const concrete = locator.getWithContext(AbstractRepo.prototype, context);

    expect(concrete.constructor).toBe(ConcreteRepo);
  });

  it('Will resolve the concrete repository', () => {

    const container = Container.of('test');
    const context = {};
    const locator = new RepositoryLocator(container);

    const concrete = locator.getWithContext(ConcreteRepo.prototype, context);

    expect(concrete.constructor).toBe(ConcreteRepo);
  });

});
