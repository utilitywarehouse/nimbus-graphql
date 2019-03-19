"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("grpc");
const interceptors_1 = require("./interceptors");
const defaultInterceptors = interceptors_1.interceptorChain([
    { type: interceptors_1.InterceptorType.Unary, interceptorFn: interceptors_1.prometheusInterceptor },
    { type: interceptors_1.InterceptorType.Unary, interceptorFn: interceptors_1.retryInterceptorFactory() },
]);
var PoolStatus;
(function (PoolStatus) {
    PoolStatus[PoolStatus["AllDisconnected"] = 0] = "AllDisconnected";
    PoolStatus[PoolStatus["AllConnected"] = 1] = "AllConnected";
    PoolStatus[PoolStatus["SomeConnected"] = 2] = "SomeConnected";
})(PoolStatus = exports.PoolStatus || (exports.PoolStatus = {}));
class Pool {
    constructor(clientProto, options) {
        this.clients = [];
        this.status = PoolStatus.AllDisconnected;
        for (let i = 1; i <= options.size; i++) {
            this.clients.push(this.make(i, clientProto, options));
        }
        this.provider = this.startProvider();
        this.watchConnections();
    }
    watchConnections() {
        const result = [];
        this.clients.forEach((client, index) => {
            const channel = grpc.getClientChannel(client);
            setInterval(() => {
                const connectivityState = channel.getConnectivityState(true);
                switch (connectivityState) {
                    case grpc.connectivityState.READY:
                        result[index] = true;
                        break;
                    default:
                        result[index] = false;
                }
            }, 2000);
        });
        setInterval(() => {
            if (result.every(s => s === true)) {
                this.status = PoolStatus.AllConnected;
            }
            else if (result.every(s => s === false)) {
                this.status = PoolStatus.AllDisconnected;
            }
            else {
                this.status = PoolStatus.SomeConnected;
            }
        }, 2000);
    }
    make(index, clientProto, options) {
        const grpcOptions = Object.assign({ interceptor_providers: defaultInterceptors }, options.options, { 'connection.index': index });
        return new clientProto(options.address, options.credentials, grpcOptions);
    }
    *startProvider() {
        let index = 0;
        while (true) {
            yield this.clients[index];
            index = (index + 1) % this.clients.length;
        }
    }
    get() {
        return this.provider.next().value;
    }
}
exports.Pool = Pool;
//# sourceMappingURL=pool.js.map