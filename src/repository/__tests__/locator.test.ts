// tslint:disable:max-classes-per-file
import { RepositoryLocator } from '../repository.locator';
import { AbstractRepository } from '../abstract.repository';
import { RepositoryFactory } from '../repository.decorators';
import { Container } from 'typedi';

abstract class AbstractRepo extends AbstractRepository {}

@RepositoryFactory(() => {
  // eslint-disable-next-line
  return new ConcreteRepo();
}, AbstractRepo)
class ConcreteRepo extends AbstractRepository {
  checkHealth(): boolean {
    return true;
  }

  withContext(): AbstractRepository {
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
