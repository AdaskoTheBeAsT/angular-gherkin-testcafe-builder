xcopy .\LICENSE .\dist\libs\angular-gherkin-testcafe-builder\ /Y
xcopy .\README.md .\dist\libs\angular-gherkin-testcafe-builder\ /Y
cd dist/libs/angular-gherkin-testcafe-builder
npm publish --tag=latest --access public
