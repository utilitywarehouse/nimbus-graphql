export interface AuthToken {
  isValid(): boolean;
  asScopes(scopes: string[]): boolean;
  asString(): string;
  asHeader(): string;
  payload<T>(): T;
}

export class RepositoryContext {
  authToken?: AuthToken;
  correlationId?: string;

  static fromGQLContext<T>(context: T & { authToken?: AuthToken, correlationId }): RepositoryContext {
    const ctx = new RepositoryContext();
    ctx.authToken = context.authToken;
    ctx.correlationId = context.correlationId;
    return ctx;
  }
}
