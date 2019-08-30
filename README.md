# nimbus-graphql
A GraphQL Framework with batteries included

[![CircleCI](https://circleci.com/gh/utilitywarehouse/nimbus-graphql/tree/master.svg?style=svg)](https://circleci.com/gh/utilitywarehouse/nimbus-graphql/tree/master)

# Developing

## VSCode users

Since `tslint` is being deprecated, we are using `eslint`. To make the `eslint` VSCode extension report issues on typescript files we need to add a setting.
To do that, add the following snippet on `settings.json`:
```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```
