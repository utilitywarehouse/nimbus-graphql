import * as grpc from '@grpc/grpc-js';

interface CallOptions extends grpc.CallOptions {
    timeout?: number;
}

export function options(opt: CallOptions): grpc.CallOptions {
  const opts = {
    ...opt,
  };

  if (opt.timeout) {
    opts.deadline = new Date().setSeconds(new Date().getSeconds() + (opt.timeout / 1000));
  }

  return opts;
}
