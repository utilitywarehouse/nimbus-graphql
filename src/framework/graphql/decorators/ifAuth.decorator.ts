import 'reflect-metadata';
import { Before, NullError } from '../../../gql';

export const IfAuth = (...scopes: string[]): any => {
  return Before<any, any, any>((source, args, context, _) => {
    if (!context.config.get('auth.bypass')) {
      if (!context.authValidator.willPass(context.authToken, scopes)) {
        throw new NullError();
      }
    }
  });
};
