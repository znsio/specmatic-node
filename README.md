[Specmatic](https://specmatic.in/) is a contract driven development tool that leverages API Specifications, such as [OpenAPI](https://www.openapis.org/), as executable specification. <br />

[![Specmatic - Contract Driven Development](http://img.youtube.com/vi/3HPgpvd8MGg/0.jpg)](http://www.youtube.com/watch?v=3HPgpvd8MGg "Specmatic - Contract Driven Development - Micro-services done right without the pain of integration")

## Thin Wrapper

Specmatic is a **standalone executable** that is **agnostic to programming languages and technology stacks**. This node module is a thin wrapper over the [standalone executable jar](https://specmatic.in/getting_started.html#setup). All core capabilities are in the main [Specmatic project](https://github.com/znsio/specmatic). The purpose of this wrapper module is to act as a convenience to help with below aspects.
* Easy installation and upgrade of the jar file in node projects through npm
* JS helper library which provides to do various setup steps like start, stop the specmatic stub server, installing specs etc. These helpers methods can be used inside a setup file inside a javascript project programmatically instead of using cli scripts.

## Quick Start
`npm install specmatic`  will install the specmatic locally to the node project.

Sample npm scripts to run specmatic, (Check [Documentation](https://specmatic.in/documentation.html) for more information on cli commands and arguments.)

## Contract as Stub / Smart Mock (For API clients / consumers)

In stub mode, Specmatic emulates the Provider / API / Service based on the API Specification so that the consumer / client application can make independent progress. [Learn more](https://specmatic.in/#contract-as-stub).

## Contract as Test (For API Providers / Service)

Tests for Free – Specmatic parses your API Specification files and based on this generates requests which are fired at your application. It then verifies if your application’s response is as per your API Specification. All this with a “No Code” approach.. [Learn More](https://specmatic.in/#contract-as-test)

## API

Check [Documentation](https://specmatic.in/documentation.html) for more information on cli commands and arguments.

## Test helper library

```
import { 
    startStubServer,
    stopStubServer,
    runContractTests, 
    loadDynamicStub, 
    installContracts,
    setSpecmaticEnvironment
} from 'specmatic';
```

Specmatic JS library exposes methods which can be used in your JS project to setup the tests, as well as do advanced things like load stubs dynamically. These can be used to programmatically run specmatic commands from any javascript testing framework, during setup or test phases.

`startStubServer(host?: string, port?: string, stubDir?: string) : Promise<ChildProcess>` <br />
method to start the stub server.

`runContractTests(specmaticDir: string, host: string, port: string) : Promise<boolean>` <br />
Alias: `startTestServer` <br />
method to start test server.

`loadDynamicStub(stubPath: string)` <br />
Alias: `setExpectations` <br />
method to load stub dynamically from inside an automated test.

`installContracts()` <br />
Alias: `installSpecs` <br />
method to install specs in local machine.

`setSpecmaticEnvironment = (environmentName: string, environment: Environment) ` <br />
method to dynamically write new variables or assign values to variables of the environment passed as argument to the function, inside the file 'specmatic.json'.This function expects the file 'specmatic.json' to be in the root directory of your project.

`printSpecmaticJarVersion()` <br />
method to print the version of specmatic.jar
