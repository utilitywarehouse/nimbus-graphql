export interface RepositoryContextBase {
  authToken?: AuthToken;
  correlationId?: string;
}

export interface AuthToken {
  isValid(): boolean;
  asScopes(scopes: string[]): boolean;
  asString(): string;
  asHeader(): string;
  payload<T>(): T;
}

export class RepositoryContext implements RepositoryContextBase{
  authToken?: AuthToken;
  correlationId?: string;

  static fromGQLContext(context: RepositoryContextBase): RepositoryContext {
    const ctx = new RepositoryContext();
    ctx.authToken = context.authToken;
    ctx.correlationId = context.correlationId;
    return ctx;
  }
}
