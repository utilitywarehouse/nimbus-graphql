# nimbus-graphql
A GraphQL Framework with batteries included

# Developing

## VSCode users

Since `tslint` is being deprecated, we are using `eslint` to make this VSCode extension report issues on typescript files we need to add a setting.
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
