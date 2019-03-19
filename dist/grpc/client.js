"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("grpc");
const pool_1 = require("./pool");
class GrpcClient {
    constructor(clientProvider) {
        this.clientProvider = clientProvider;
        this.defaultMetadata = new grpc.Metadata();
    }
    withContext(context) {
        const constructor = this.constructor;
        const scopedInstance = new constructor(this.clientProvider);
        scopedInstance.setDefaultMetadata({
            authorization: context.authToken && context.authToken.asString(),
            correlationId: context.correlationId,
        });
        return scopedInstance;
    }
    checkHealth(cr) {
        if (this.clientProvider instanceof pool_1.Pool) {
            switch (this.clientProvider.status) {
                case pool_1.PoolStatus.AllConnected:
                    cr.healthy('all clients connected');
                    break;
                case pool_1.PoolStatus.SomeConnected:
                    cr.degraded('only some clients connected', 'check upstream pods health');
                    break;
                case pool_1.PoolStatus.AllDisconnected:
                    cr.unhealthy('all clients disconnected', 'check upstream pods health or address config', 'unable to data');
                    break;
            }
        }
        else {
            throw new Error('connection watching on non pool grpc connections is not imlemented');
        }
    }
    setDefaultMetadata(data) {
        const md = new grpc.Metadata();
        for (const key in data) {
            if (data.hasOwnProperty(key) && data[key]) {
                md.set(key, data[key]);
            }
        }
        this.defaultMetadata = md;
    }
    get client() {
        if (this.clientProvider instanceof pool_1.Pool) {
            return this.clientProvider.get();
        }
        else {
            return this.clientProvider;
        }
    }
}
exports.GrpcClient = GrpcClient;
//# sourceMappingURL=client.js.map