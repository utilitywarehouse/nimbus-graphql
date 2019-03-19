import {Repository, RepositoryFactory} from '../repository.decorators';
import {RepositoryMetadata} from '../repository.metadata';

const factory = () => 'factored';

@Repository(Repo)
class Repo {

}

@Repository()
class RepoTypeDerived {

}

@RepositoryFactory(factory, RepoWithFactory)
class RepoWithFactory {

}

@RepositoryFactory(factory)
class RepoDerivedWithFactory {

}

test('decorators', () => {
    expect(RepositoryMetadata.for(new Repo()).type).toBe(Repo.prototype);
    expect(RepositoryMetadata.for(new RepoTypeDerived()).type).toBe(RepoTypeDerived.prototype);
    expect(RepositoryMetadata.for(new RepoWithFactory()).type).toBe(RepoWithFactory.prototype);
    expect(RepositoryMetadata.for(new RepoDerivedWithFactory()).type).toBe(RepoDerivedWithFactory.prototype);
});
