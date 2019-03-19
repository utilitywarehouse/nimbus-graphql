import 'reflect-metadata';
import { Before } from '../../../graphql';

export const MustAuth = (...scopes: string[]): any => {
  return Before<any, any, any>((source, args, context, _) => {
    if (!context.config.get('auth.bypass')) {
      context.authValidator.mustPass(context.authToken, scopes);
    }
  });
};
