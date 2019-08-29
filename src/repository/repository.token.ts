import { Token } from 'typedi';
import { AbstractRepository } from './index';

export const RepositoryToken = new Token<AbstractRepository>('repositories');
