import { BaseError } from '../../errors/base';
import { GraphQLError } from 'graphql';
export declare class GQLError extends BaseError {
    readonly type: string;
    readonly gql: GraphQLError;
    readonly previous?: BaseError | Error;
    constructor(message: string, type: string, gql: GraphQLError, previous?: BaseError | Error);
    static from(error: GraphQLError): GQLError;
    render(): any;
}
