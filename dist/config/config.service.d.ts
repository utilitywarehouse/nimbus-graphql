import { ConfigProvider } from './config.provider';
import { ConfigContainer } from './config.container';
export declare const Section: unique symbol;
export declare class Config implements ConfigProvider {
    private readonly defaults;
    private readonly sections;
    constructor(defaults: ConfigContainer, sections: {
        [key: string]: ConfigContainer;
    });
    section(key: string): ConfigProvider;
    get(key: string): any;
    static load(base: any, globPattern: any): Config;
}
