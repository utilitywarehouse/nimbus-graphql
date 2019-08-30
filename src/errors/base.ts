export class BaseError extends Error {

  static wrap<T>(this: new (message?: string, previous?: Error | BaseError) => T, previous: Error, message?: string): T {
    return new this(message, previous);
  }

  private correlationId: string;

  constructor(message?: string, readonly previous?: Error | BaseError) {
    super(message);
  }

  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  render(): any {
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
