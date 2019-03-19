export interface AuthToken {
    isValid(): boolean;
    asScopes(scopes: string[]): boolean;
    asString(): string;
}
export declare class RepositoryContext {
    authToken?: AuthToken;
    correlationId?: string;
    static fromGQLContext<T>(context: T & {
        authToken?: AuthToken;
        req: {
            header: (name: string) => string;
        };
    }): RepositoryContext;
}
