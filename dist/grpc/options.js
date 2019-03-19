"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function options(opt) {
    const opts = Object.assign({}, opt);
    if (opt.timeout) {
        opts.deadline = new Date().setSeconds(new Date().getSeconds() + (opt.timeout / 1000));
    }
    return opts;
}
exports.options = options;
//# sourceMappingURL=options.js.map