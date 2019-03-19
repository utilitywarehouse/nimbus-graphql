"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../../errors/base");
class GQLError extends base_1.BaseError {
    constructor(message, type, gql, previous) {
        super(message);
        this.type = type;
        this.gql = gql;
        this.previous = previous;
    }
    static from(error) {
        let err;
        if (error.originalError instanceof base_1.BaseError) {
            err = new GQLError(error.originalError.message, error.originalError.constructor.name, error, error.originalError.previous);
        }
        else if (error.originalError) {
            err = new GQLError(error.originalError.message, error.originalError.constructor.name, error);
        }
        else {
            err = new GQLError(error.message, error.constructor.name, error);
        }
        if (error.extensions && error.extensions.correlationId) {
            err.setCorrelationId(error.extensions.correlationId);
        }
        return err;
    }
    render() {
        const details = super.render();
        details.type = this.type;
        details.locations = this.gql.locations;
        details.path = this.gql.path;
        details.extensions = this.gql.extensions;
        return details;
    }
}
exports.GQLError = GQLError;
//# sourceMappingURL=gql.error.js.map