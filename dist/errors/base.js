"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseError extends Error {
    constructor(message, previous) {
        super(message);
        this.previous = previous;
    }
    static wrap(previous, message) {
        return new this(message, previous);
    }
    setCorrelationId(correlationId) {
        this.correlationId = correlationId;
    }
    render() {
        return {
            message: this.message,
            correlationId: this.correlationId,
            type: this.constructor.name,
            previous: this.previous && (this.previous instanceof BaseError && this.previous.render() || {
                type: this.previous.constructor.name,
                message: this.previous.message,
            }) || null,
        };
    }
}
exports.BaseError = BaseError;
//# sourceMappingURL=base.js.map