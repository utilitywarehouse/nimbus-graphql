export interface AuthToken {
  isValid(): boolean;
  asScopes(scopes: string[]): boolean;
  asString(): string;
  asHeader(): string;
}

export class RepositoryContext {
  authToken?: AuthToken;
  correlationId?: string;

  static fromGQLContext<T>(context: T & { authToken?: AuthToken, req: { header: (name: string) => string } }): RepositoryContext {
    const ctx = new RepositoryContext();
    ctx.authToken = context.authToken;
    ctx.correlationId = context.req.header('x-correlation-id');
    return ctx;
  }
}
