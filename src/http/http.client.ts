import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as prom from 'prom-client';
import { URL } from './http.url';
import { TransportError } from '../errors';
import getErrorFromStatusCode from './http.errors';

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

export interface HttpClient {
  get: <T = { [k: string]: any }>(url: string | URL, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  delete: <T = { [k: string]: any }>(url: string | URL, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  post: <T = { [k: string]: any }>(url: string | URL, data: Record<string, any>, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  put: <T = { [k: string]: any }>(url: string | URL, data: Record<string, any>, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  patch: <T = { [k: string]: any }>(url: string | URL, data: Record<string, any>, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
}


class Client implements HttpClient {
  constructor(private readonly transport: AxiosInstance) {
  }

  private static endpoint(url: URL | string): string {
    if (url instanceof URL) {
      return url.toString();
    } else {
      return url;
    }
  }

  private async execute<T>(method: Method, url: URL | string, data?: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    if (!options) {
      options = {};
    }

    const labels = {
      url: url instanceof URL ? url.urlTemplate() : url,
      status: 0,
      method: method.toString(),
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

    if (response.status >= 400) {
      throw new (getErrorFromStatusCode(response.status));
    }

    return response;
  }

  get = <T = { [k: string]: any }>(url: URL | string, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    this.execute(Method.GET, url, undefined, options);

  delete = <T = { [k: string]: any }>(url: URL | string, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    this.execute(Method.DELETE, url, undefined, options);

  post = <T = { [k: string]: any }>(url: URL | string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    this.execute(Method.POST, url, data, options);

  put = <T = { [k: string]: any }>(url: URL | string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    this.execute(Method.PUT, url, data, options);

  patch = <T = { [k: string]: any }>(url: URL | string, data: any, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    this.execute(Method.PATCH, url, data, options);
}

export const createClient = (options: AxiosRequestConfig = {}): HttpClient => {
  options = {
    ...options,
    timeout: options.timeout || 3000,
  };

  return new Client(axios.create(options));
};
