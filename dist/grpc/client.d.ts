import * as grpc from 'grpc';
import { Pool } from './pool';
import { CheckerReporter } from '../operational';
import { RepositoryContext } from '../repository';
export declare class GrpcClient<Client extends grpc.Client> {
    protected readonly clientProvider: Client | Pool<Client>;
    protected defaultMetadata: grpc.Metadata;
    constructor(clientProvider: Client | Pool<Client>);
    withContext(context: RepositoryContext): this;
    checkHealth(cr: CheckerReporter): void;
    setDefaultMetadata(data: {
        [key: string]: string;
    }): void;
    readonly client: Client;
}
