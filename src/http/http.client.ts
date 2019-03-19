import axios, {AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';
import * as prom from 'prom-client';
import {URL} from './http.url';
import {TransportError} from '../errors';

const httpHistogram = new prom.Histogram({
    name: 'http_client_requests_seconds',
    help: 'measures http client request duration',
    labelNames: ['url', 'status', 'method'],
    buckets: [0.2, 0.5, 1, 1.5, 3, 5, 10],
});

enum Method {
    GET = 'get',
    DELETE = 'delete',
    POST = 'post',
    PATCH = 'patch',
    PUT = 'put',
}

interface Data {
    [k: string]: any;
}

class Client {
    constructor(private readonly transport: AxiosInstance) {
    }

    private endpoint(url: URL | string): string {
        if (url instanceof URL) {
            return url.toString();
        } else {
            return url;
        }
    }

    private execute<T>(method: Method, url: URL | string, data?: Data, options?: AxiosRequestConfig): AxiosPromise<T> {
        if (!options) {
            options = {};
        }

        const labels = {
            url: url instanceof URL ? url.urlTemplate() : url,
            status: 0,
            method: method.toString(),
        };

        options.method = method;
        options.url = this.endpoint(url);
        options.data = data;
        options.validateStatus = null;

        const timeRequest = httpHistogram.startTimer(labels);

        // add catch for instrumentation
        return this.transport.request<T>(options).then((response: AxiosResponse<T>) => {
            labels.status = response.status;
            timeRequest();
            return response;
        }).catch((error) => {
            timeRequest();
            throw new TransportError(error.message);
        });
    }

    get<T = {[k: string]: any}>(url: URL | string, options?: AxiosRequestConfig): AxiosPromise<T> {
        return this.execute(Method.GET, url, undefined, options);
    }

    delete<T = {[k: string]: any}>(url: URL | string, options?: AxiosRequestConfig): AxiosPromise<T> {
        return this.execute(Method.DELETE, url, undefined, options);
    }

    post<T = {[k: string]: any}>(url: URL | string, data: Data, options?: AxiosRequestConfig): AxiosPromise<T> {
        return this.execute(Method.POST, url, data, options);
    }

    put<T = {[k: string]: any}>(url: URL | string, data: Data, options?: AxiosRequestConfig): AxiosPromise<T> {
        return this.execute(Method.PUT, url, data, options);
    }

    patch<T = {[k: string]: any}>(url: URL | string, data: Data, options?: AxiosRequestConfig): AxiosPromise<T> {
        return this.execute(Method.PATCH, url, data, options);
    }
}

export const createClient = (options?: AxiosRequestConfig): Client => {
    if (!options) {
        options = {};
    }

    if (!options.timeout) {
        options.timeout = 3000;
    }

    return new Client(axios.create(options));
};
