export interface AuthToken {
  isValid(): boolean;
  asScopes(scopes: string[]): boolean;
  asString(): string;
  asHeader(): string;
  payload<T>(): T;
}

abstract class RepositoryContextBase {
  authToken?: AuthToken;
  correlationId?: string;
}

export class RepositoryContext extends RepositoryContextBase{
  static fromGQLContext(context: Required<RepositoryContextBase>): RepositoryContext {
    const ctx = new RepositoryContext();
    ctx.authToken = context.authToken;
    ctx.correlationId = context.correlationId;
    return ctx;
  }
}
