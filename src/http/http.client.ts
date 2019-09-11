import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as prom from 'prom-client';
import { URL } from './http.url';
import { TransportError } from '../errors';


const httpHistogram = new prom.Histogram({
  name: 'http_client_requests_seconds',
  help: 'measures http client request duration',
  labelNames: ['host', 'path', 'status', 'method', 'client'],
  buckets: [0.2, 0.5, 1, 1.5, 3, 5, 10],
});

enum Method {
  GET = 'get',
  DELETE = 'delete',
  POST = 'post',
  PATCH = 'patch',
  PUT = 'put',
}

export interface HttpClient {
  execute: <T>(method: Method, url: URL | string, data?: any, options?: AxiosRequestConfig) => Promise<AxiosResponse <T>>;
  get: <T = { [k: string]: any }>(url: string | URL, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  delete: <T = { [k: string]: any }>(url: string | URL, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  post: <T = { [k: string]: any }>(url: string | URL, data: any, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  put: <T = { [k: string]: any }>(url: string | URL, data: any, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  patch: <T = { [k: string]: any }>(url: string | URL, data: any, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
}

export type ClientOptions = AxiosRequestConfig & {clientName?: string}

class Client implements HttpClient {
  constructor(private readonly transport: AxiosInstance, private readonly clientName?: string) {
  }

  private static endpoint(url: URL | string): string {
    if (url instanceof URL) {
      return url.toString();
    } else {
      return url;
    }
  }

  execute = async <T>(method: Method, url: URL | string, data?: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    if (!options) {
      options = {};
    }

    const host = this.transport.defaults ? this.transport.defaults.baseURL : '';
    const labels = {
      host: host || '',
      path: url instanceof URL ? url.urlTemplate() : url,
      status: 0,
      method: method.toString(),
      client: this.clientName || '',
    };

    options.method = method;
    options.url = Client.endpoint(url);
    options.data = data;
    options.validateStatus = null;

    const timeRequest = httpHistogram.startTimer(labels);

    let response: AxiosResponse<T>;

    try {
      response = await this.transport.request<T>(options);
    } catch (error) {
      timeRequest();
      throw new TransportError(error.message);
    }

    labels.status = response.status;
    timeRequest();

    return response;
  }

  get = <T = { [k: string]: any }>(url: URL | string, options?: AxiosRequestConfig) =>
    this.execute<T>(Method.GET, url, undefined, options);

  delete = <T = { [k: string]: any }>(url: URL | string, options?: AxiosRequestConfig) =>
    this.execute<T>(Method.DELETE, url, undefined, options);

  post = <T = { [k: string]: any }>(url: URL | string, data: any, options?: AxiosRequestConfig) =>
    this.execute<T>(Method.POST, url, data, options);

  put = <T = { [k: string]: any }>(url: URL | string, data: any, options?: AxiosRequestConfig) =>
    this.execute<T>(Method.PUT, url, data, options);

  patch = <T = { [k: string]: any }>(url: URL | string, data: any, options?: AxiosRequestConfig) =>
    this.execute<T>(Method.PATCH, url, data, options);
}

export const createClient = (options: ClientOptions = {}) => {
  options = {
    ...options,
    timeout: options.timeout || 3000,
  };

  return new Client(axios.create(options), options.clientName);
};
