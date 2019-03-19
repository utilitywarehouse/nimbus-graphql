import 'reflect-metadata';
const RepositoryMetadataKey = Symbol.for('repository:config');

export class RepositoryMetadata {

    public type: any;

    setType(type: any) {
        this.type = RepositoryMetadata.getType(type);
    }

    static getType(target: any) {

        let returnType = target;

        if (typeof target === 'function') {
            // probably constructor
            returnType = target.prototype;
        } else {
            // probably an instance
            returnType = target;
        }

        return returnType;
    }

    static for(target: any): RepositoryMetadata {

        let meta = Reflect.getMetadata(RepositoryMetadataKey, RepositoryMetadata.getType(target));

        if (meta) {
            return meta;
        }

        meta = new RepositoryMetadata();

        Reflect.defineMetadata(RepositoryMetadataKey, meta, RepositoryMetadata.getType(target));

        return meta;
    }
}
