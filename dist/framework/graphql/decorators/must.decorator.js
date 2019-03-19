"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const gql_1 = require("../../../gql");
exports.MustAuth = (...scopes) => {
    return gql_1.Before((source, args, context, _) => {
        if (!context.config.get('auth.bypass')) {
            context.authValidator.mustPass(context.authToken, scopes);
        }
    });
};
//# sourceMappingURL=must.decorator.js.map