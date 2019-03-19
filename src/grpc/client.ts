/// <reference types="grpc" />
import * as grpc from 'grpc';
import {Pool, PoolStatus} from './pool';
import {CheckerReporter} from '../operational';
import {RepositoryContext} from '../repository';

export class GrpcClient<Client extends grpc.Client> {

    protected defaultMetadata: grpc.Metadata = new grpc.Metadata();

    constructor(protected readonly clientProvider: Client | Pool<Client>) {

    }

    withContext(context: RepositoryContext): this {

        const constructor = this.constructor as new (clientProvider: Client | Pool<Client>) => this;

        const scopedInstance = new constructor(this.clientProvider);
        scopedInstance.setDefaultMetadata({
            authorization: context.authToken && context.authToken.asString(),
            correlationId: context.correlationId,
        });

        return scopedInstance;
    }

    checkHealth(cr: CheckerReporter) {
        if (this.clientProvider instanceof Pool) {

            switch (this.clientProvider.status) {
                case PoolStatus.AllConnected:
                    cr.healthy('all clients connected');
                    break;
                case PoolStatus.SomeConnected:
                    cr.degraded('only some clients connected', 'check upstream pods health');
                    break;
                case PoolStatus.AllDisconnected:
                    cr.unhealthy('all clients disconnected', 'check upstream pods health or address config', 'unable to data');
                    break;
            }
        } else {
            throw new Error('connection watching on non pool grpc connections is not imlemented');
        }
    }

    setDefaultMetadata(data: {[key: string]: string}) {

        const md = new grpc.Metadata();

        for (const key in data) {
            if (data.hasOwnProperty(key) && data[key]) {
                md.set(key, data[key]);
            }
        }

        this.defaultMetadata = md;
    }

    get client(): Client {
        if (this.clientProvider instanceof Pool) {
            return this.clientProvider.get();
        } else {
            return this.clientProvider;
        }
    }
}
