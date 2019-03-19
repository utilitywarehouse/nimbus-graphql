import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios';
import { URL } from './http.url';
interface Data {
    [k: string]: any;
}
declare class Client {
    private readonly transport;
    constructor(transport: AxiosInstance);
    private endpoint;
    private execute;
    get<T = {
        [k: string]: any;
    }>(url: URL | string, options?: AxiosRequestConfig): AxiosPromise<T>;
    delete<T = {
        [k: string]: any;
    }>(url: URL | string, options?: AxiosRequestConfig): AxiosPromise<T>;
    post<T = {
        [k: string]: any;
    }>(url: URL | string, data: Data, options?: AxiosRequestConfig): AxiosPromise<T>;
    put<T = {
        [k: string]: any;
    }>(url: URL | string, data: Data, options?: AxiosRequestConfig): AxiosPromise<T>;
    patch<T = {
        [k: string]: any;
    }>(url: URL | string, data: Data, options?: AxiosRequestConfig): AxiosPromise<T>;
}
export declare const createClient: (options?: AxiosRequestConfig) => Client;
export {};
