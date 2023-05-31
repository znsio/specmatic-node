# Specmatic Framework Node Module

![test](https://github.com/znsio/specmatic-node/actions/workflows/test.yml/badge.svg)
[![publish](https://github.com/znsio/specmatic-node/actions/workflows/publish.yml/badge.svg)](https://www.npmjs.com/package/specmatic)
[![release](https://badgen.net/github/release/znsio/specmatic-node/master)](https://github.com/znsio/specmatic-node/releases/latest)

This node module is a thin wrapper over the [standalone executable jar](https://specmatic.in/getting_started.html#setup). All core capabilities are in the main [Specmatic project](https://github.com/znsio/specmatic). The purpose of this wrapper module is to act as a convenience to help with below aspects.

-   Easy installation and upgrade of the jar file in node projects through npm
-   JS helper library which provides to do various setup steps like start, stop the specmatic stub server, installing specs etc. These helpers methods can be used inside a setup file inside a javascript project programmatically instead of using cli scripts.

## Quick Start

`npm install specmatic` will install the specmatic locally to the node project.

Sample npm scripts to run specmatic, (Check [Documentation](https://specmatic.in/documentation.html) for more information on cli commands and arguments.)

## Contract as Stub / Smart Mock (For API clients / consumers)

In stub mode, Specmatic emulates the Provider / API / Service based on the API Specification so that the consumer / client application can make independent progress. [Learn more](https://specmatic.in/#contract-as-stub).

## Contract as Test (For API Providers / Service)

Tests for Free – Specmatic parses your API Specification files and based on this generates requests which are fired at your application. It then verifies if your application’s response is as per your API Specification. All this with a “No Code” approach.. [Learn More](https://specmatic.in/#contract-as-test)

## API

Check [Documentation](https://specmatic.in/documentation.html) for more information on cli commands and arguments.

## Sample Repo

https://github.com/znsio/specmatic-order-bff-nodejs

## Programmatic Access

Specmatic JS library exposes some of the commands as methods that can be run programmatically from any javascript testing framework, during setup or test phases.

```javascript
import {
    startStub,
    stopStub,
    test,
    setExpecations,
    showTestResults,
    printJarVersion
} from 'specmatic';
```

`startStub(host?: string, port?: string, stubDir?: string) : Promise<ChildProcess>` <br />
method to start the stub server.

`stopStub(process: ChildProcess)` <br />
method to stop the stub server.

`test(host?: string, port?: string, specs?: string): Promise<boolean>` <br />
method to run tests.

`setExpectations(stubPath: string, stubServerBaseUrl?: string): Promise<boolean>` <br />
method to dynamically set stub expectiona. Stub should be running before invoking this method.

`showTestResults(testFn: (name: string, cb: () => void) => void)` <br />
method to report test results in any framework so that it shows up in IDE test results interface.

`printJarVersion()` <br />
method to print the version of specmatic.jar

## Logging

By default only warning and error messages are displayed. You can configure the loglevel in package.json as

```json
"specmatic": {
    "logLevel": "debug"
},
```

logLevel accepts all values supported by winston logger (https://github.com/winstonjs/winston#logging-levels)
