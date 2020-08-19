### NPM Wrapper for Qontract

[Qontract](https://qontract.run/) is a contract driven development tool that allows us to turn our contracts into executable specification.

## Installation
`npm install qontract` 

will install the qontract locally in node_modules.

## Qontract in stub mode (For consumers)

`qontract-stub CONTRACT_PATH`

In stub mode, Qontract provides random responses to requests that match the contract. It’s a way of exploring what the contract looks like.
This is meant to be used by anyone who wants to take a fake version of the API for a spin.
This mode can also stub out real requests and responses, which will be validated against the contract before being accepted.

Sample npm script to start qontract stub server.

`"qontract-stub": "./node_modules/.bin/start-qontract-stub *.qontract"`

## Qontract tests (For Providers)

`qontract-test CONTRACT_PATH`

In test mode, Qontracts accepts a contract file, and the hostname and port of the service whose API is being tested. It then sends an HTTP request based on the request format described in the contract for every scenario, generating random values where no examples are given. When the service responds, it validates the response based on the format in the contract.
This is meant to be used by API providers.

Sample npm script to run qontract tests.

`"qontract-tests": "./node_modules/.bin/run-qontract-tests *.qontract"`


Check [Documentation](https://qontract.run/documentation.html) for more information

