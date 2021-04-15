[Specmatic](https://specmatic.in/) is a contract driven development tool that allows us to turn our contracts into executable specification.

## Quick Start
`npm install specmatic`  will install the specmatic locally to the node project.

Sample npm scripts to run specmatic, with `*.specmatic` as the path of specmatic files and `src/mocks` as the path for the stub data directory (Check [Documentation](https://specmatic.in/documentation.html) for more information on cli commands and arguments.)

`"specmatic-stub": "specmatic stub *.specmatic --data src/mocks --host=localhost --port=8000"`

`"specmatic-test": "specmatic test *.specmatic --host=localhost --port=8000"`

## Specmatic in stub mode (For consumers)

In stub mode, Specmatic provides random responses to requests that match the contract. It’s a way of exploring what the contract looks like.
This is meant to be used by anyone who wants to take a fake version of the API for a spin.
This mode can also stub out real requests and responses, which will be validated against the contract before being accepted.

## Specmatic tests (For Providers)

In test mode, Specmatics accepts a contract file, and the hostname and port of the service whose API is being tested. It then sends an HTTP request based on the request format described in the contract for every scenario, generating random values where no examples are given. When the service responds, it validates the response based on the format in the contract.
This is meant to be used by API providers.

## API

Check [Documentation](https://specmatic.in/documentation.html) for more information on cli commands and arguments.

## Test helper library

```
import { 
    startStubServer,
    runContractTests, 
    loadDynamicStub, 
    installContracts 
} from 'specmatic';
```

Specmatic JS library exposes methods which can be used in your JS project to setup the tests, as well as do advanced things like load stubs dynamically. These can be used to programmatically run specmatic commands from any javascript testing framework, during setup or test phases.

`startStubServer(specmaticDir: string, stubDir: string, host: string, port: string)` <br />
method to start the stub server.

`runContractTests(specmaticDir: string, host: string, port: string)` <br />
Alias: `startTestServer` <br />
method to start test server.

`loadDynamicStub(stubPath: string)` <br />
Alias: `setExpectations` <br />
method to load stub dynamically from inside an automated test.

`installContracts()` <br />
Alias: `installSpecs` <br />
method to install specs in local machine.
