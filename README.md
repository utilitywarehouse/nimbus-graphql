# nimbus-graphql
A GraphQL Framework with batteries included

![npm](https://img.shields.io/npm/v/nimbus-graphql)
![CircleCI](https://img.shields.io/circleci/build/github/utilitywarehouse/nimbus-graphql)

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
