import 'reflect-metadata';
export declare class RepositoryMetadata {
    type: any;
    setType(type: any): void;
    static getType(target: any): any;
    static for(target: any): RepositoryMetadata;
}
