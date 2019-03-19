import { ConfigProvider } from './config.provider';
import { ConfigContainer } from './config.container';
export declare class Getter implements ConfigProvider {
    private readonly name;
    private readonly section;
    private readonly defaults;
    constructor(name: string, section?: ConfigContainer, defaults?: ConfigContainer);
    get(key: string): any;
}
