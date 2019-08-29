import { Token } from 'typedi';
import { ResolverInterface } from './resolver.interface';

export const ResolverToken = new Token<ResolverInterface>('resolvers');
