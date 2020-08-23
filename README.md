# angular-gherkin-testcafe-builder

A custom Angular builder for [Gherkin TestCafe](https://github.com/kiwigrid/gherkin-testcafe). Serves the Angular application, and then runs the Gherkin TestCafe tests.

## Todo

- publishing to npm
- sample project

## Install

### NPM

```bash
$ npm install --save-dev @adaskothebeast/angular-gherkin-testcafe-builder
```

### YARN

```bash
$ yarn add -D @adaskothebeast/angular-gherkin-testcafe-builder
```

## Use in angular.json

```json
{
  "projects": {
    "my-project-e2e": {
      "architect": {
        "e2e": {
          "builder": "@adaskothebeast/angular-gherkin-testcafe-builder:gherkin-testcafe",
          "options": {
            "browsers": ["chrome --no-sandbox", "firefox"],
            "src": ["e2e/**/*.steps.ts", "e2e/**/*.feature"],
            "reporters": [
              {
                "name": "xunit",
                "output": "path/to/my/report.xunit.xml"
              },
              {
                "name": "nunit",
                "output": "path/to/my/report.nunit.xml"
              },
              {
                "name": "html",
                "output": "path/to/my/report.html"
              },
              {
                "name": "spec"
              }
            ]
          }
        }
      }
    }
  }
}
```

> NOTE: check [schema.json](packages/angular-gherkin-testcafe-builder/src/lib/schema.json) for a list of all options

## build

```bash
$ yarn build
```

## pack

```bash
$ yarn pack
```

This project is highly influenced by [angular-testcafe](https://github.com/politie/angular-testcafe) - schema and .d.ts files were compared with current implementation of testcafe and gherkin-testcafe - some names and descriptions were adjusted.
