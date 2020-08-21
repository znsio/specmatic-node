[Qontract](https://qontract.run/) is a contract driven development tool that allows us to turn our contracts into executable specification.

## Installation
`npm install qontract`  will install the qontract locally to the node project.

Sample npm scripts to run qontract:

`"qontract-stub": "./node_modules/.bin/qontract-stub --contract-dir=*.qontract --stub-dir='path-to-stub-dir' --host='localhost' --port='8000'"`

`"qontract-test": "./node_modules/.bin/qontract-test --qontract-dir=*.qontract --host='localhost' --port='8000'"`

## Qontract in stub mode (For consumers)

In stub mode, Qontract provides random responses to requests that match the contract. It’s a way of exploring what the contract looks like.
This is meant to be used by anyone who wants to take a fake version of the API for a spin.
This mode can also stub out real requests and responses, which will be validated against the contract before being accepted.

## Qontract tests (For Providers)

In test mode, Qontracts accepts a contract file, and the hostname and port of the service whose API is being tested. It then sends an HTTP request based on the request format described in the contract for every scenario, generating random values where no examples are given. When the service responds, it validates the response based on the format in the contract.
This is meant to be used by API providers.

## API

### cli commands

`qontract-stub` run the qontract server in stub mode, used by consumers.

`qontract-test` run the qontract server in test mode, used by providers.

### cli arguments

`qontract-dir` path of the contract files. Can be a wild card string.

`stub-dir` path of the mock json files.

`host` hostname

`port` port number

Check [Documentation](https://qontract.run/documentation.html) for more information.

