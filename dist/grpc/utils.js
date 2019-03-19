"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
function promisify(grpcClientCall) {
    function handleGRPC(resolve, reject) {
        return (error, response) => {
            if (error) {
                return reject(errors_1.TransportError.wrap(error));
            }
            return resolve(response);
        };
    }
    return new Promise((enhancedResolve, enhancedReject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let call;
            const response = yield new Promise((resolve, reject) => {
                call = grpcClientCall(handleGRPC(resolve, reject));
            });
            enhancedResolve({
                response,
                call,
            });
        }
        catch (e) {
            enhancedReject(e);
        }
    }));
}
exports.promisify = promisify;
//# sourceMappingURL=utils.js.map