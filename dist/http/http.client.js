"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const prom = require("prom-client");
const http_url_1 = require("./http.url");
const errors_1 = require("../errors");
const httpHistogram = new prom.Histogram({
    name: 'http_client_requests_seconds',
    help: 'measures http client request duration',
    labelNames: ['url', 'status', 'method'],
    buckets: [0.2, 0.5, 1, 1.5, 3, 5, 10],
});
var Method;
(function (Method) {
    Method["GET"] = "get";
    Method["DELETE"] = "delete";
    Method["POST"] = "post";
    Method["PATCH"] = "patch";
    Method["PUT"] = "put";
})(Method || (Method = {}));
class Client {
    constructor(transport) {
        this.transport = transport;
    }
    endpoint(url) {
        if (url instanceof http_url_1.URL) {
            return url.toString();
        }
        else {
            return url;
        }
    }
    execute(method, url, data, options) {
        if (!options) {
            options = {};
        }
        const labels = {
            url: url instanceof http_url_1.URL ? url.urlTemplate() : url,
            status: 0,
            method: method.toString(),
        };
        options.method = method;
        options.url = this.endpoint(url);
        options.data = data;
        options.validateStatus = null;
        const timeRequest = httpHistogram.startTimer(labels);
        return this.transport.request(options).then((response) => {
            labels.status = response.status;
            timeRequest();
            return response;
        }).catch((error) => {
            timeRequest();
            throw new errors_1.TransportError(error.message);
        });
    }
    get(url, options) {
        return this.execute(Method.GET, url, undefined, options);
    }
    delete(url, options) {
        return this.execute(Method.DELETE, url, undefined, options);
    }
    post(url, data, options) {
        return this.execute(Method.POST, url, data, options);
    }
    put(url, data, options) {
        return this.execute(Method.PUT, url, data, options);
    }
    patch(url, data, options) {
        return this.execute(Method.PATCH, url, data, options);
    }
}
exports.createClient = (options) => {
    if (!options) {
        options = {};
    }
    if (!options.timeout) {
        options.timeout = 3000;
    }
    return new Client(axios_1.default.create(options));
};
//# sourceMappingURL=http.client.js.map