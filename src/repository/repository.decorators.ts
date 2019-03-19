import {Service} from 'typedi';
import {RepositoryMetadata, RepositoryToken} from './index';

export const Repository = (type?) => (target) => {
    RepositoryMetadata.for(target).setType(type || target);
    return Service({
      id: RepositoryToken,
      multiple: true,
    })(target);
};

export const RepositoryFactory = (factory, type?) => (target) => {
    RepositoryMetadata.for(target).setType(type || target);

    // Register interface to concrete repository
    if (type) {
        Service({ factory, id: type })(target);
    }

    return Service({
      id: RepositoryToken,
      multiple: true,
      // global: true,
      factory,
    })(target);
};
