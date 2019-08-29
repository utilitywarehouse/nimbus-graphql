import * as grpc from 'grpc';

interface CallOptions {
    timeout?: number;
    [key: string]: any;
}

export function options(opt: CallOptions): Partial<grpc.CallOptions> {
  const opts = {
    ...opt,
  };

  if (opt.timeout) {
    opts.deadline = new Date().setSeconds(new Date().getSeconds() + (opt.timeout / 1000));
  }

  return opts;
}
