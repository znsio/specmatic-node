[Qontract](https://qontract.run/) is a contract driven development tool that allows us to turn our contracts into executable specification.

## Quick Start
`npm install qontract`  will install the qontract locally to the node project.

Sample npm scripts to run qontract, with `*.qontract` as the path of qontract files and `src/mocks` as the path for the stub data directory (Check [Documentation](https://qontract.run/documentation.html) for more information on cli commands and arguments.)

`"qontract-stub": "qontract stub *.qontract --data src/mocks --host=localhost --port=8000"`

`"qontract-test": "qontract test *.qontract --host=localhost --port=8000"`

## Qontract in stub mode (For consumers)

In stub mode, Qontract provides random responses to requests that match the contract. It’s a way of exploring what the contract looks like.
This is meant to be used by anyone who wants to take a fake version of the API for a spin.
This mode can also stub out real requests and responses, which will be validated against the contract before being accepted.

## Qontract tests (For Providers)

In test mode, Qontracts accepts a contract file, and the hostname and port of the service whose API is being tested. It then sends an HTTP request based on the request format described in the contract for every scenario, generating random values where no examples are given. When the service responds, it validates the response based on the format in the contract.
This is meant to be used by API providers.

## API

Check [Documentation](https://qontract.run/documentation.html) for more information on cli commands and arguments.

## Test helper library

`import { startStubServer, startTestServer, loadDynamicStub } from 'qontract';`

Qontract JS library exposes methods which can be used in your JS project to setup the tests, as well as do advanced things like load stubs dynamically.


`startStubServer(qontractDir: string, stubDir: string, host: string, port: string)`

method to start the stub server.

`startTestServer(qontractDir: string, host: string, port: string)`

method to start test server.

`loadDynamicStub(stubPath: string)`

method to load stub dynamically from inside an automated test.

