import { ContainerInstance } from 'typedi';
import { AbstractRepository } from './abstract.repository';
export declare class RepositoryLocator {
    private readonly container;
    constructor(container: ContainerInstance);
    getWithContext<T>(repoKey: typeof AbstractRepository | AbstractRepository, context: T): AbstractRepository;
}
