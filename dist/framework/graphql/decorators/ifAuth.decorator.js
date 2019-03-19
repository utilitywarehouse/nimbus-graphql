"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const gql_1 = require("../../../gql");
exports.IfAuth = (...scopes) => {
    return gql_1.Before((source, args, context, _) => {
        if (!context.config.get('auth.bypass')) {
            if (!context.authValidator.willPass(context.authToken, scopes)) {
                throw new gql_1.NullError();
            }
        }
    });
};
//# sourceMappingURL=ifAuth.decorator.js.map