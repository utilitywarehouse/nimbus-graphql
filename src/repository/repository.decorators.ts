import { Service } from 'typedi';
import { RepositoryMetadata, RepositoryToken } from './index';

export const Repository = (type?: any) => (target: any): any => {
  RepositoryMetadata.for(target).setType(type || target);
  return Service({
    id: RepositoryToken,
    multiple: true,
  })(target);
};

export const RepositoryFactory = (factory: () => any, type?: any) => (target: any): any => {
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
