### NPM Wrapper for Qontract

WIP

## Qontract in stub mode (For consumers)

`start-qontract-stub`

In stub mode, Qontract provides random responses to requests that match the contract. It’s a way of exploring what the contract looks like.

This is meant to be used by anyone who wants to take a fake version of the API for a spin.

This mode can also stub out real requests and responses, which will be validated against the contract before being accepted.

## Qontract tests (For Providers)

`run-qontract-tests`

In test mode, Qontracts accepts a contract file, and the hostname and port of the service whose API is being tested. It then sends an HTTP request based on the request format described in the contract for every scenario, generating random values where no examples are given. When the service responds, it validates the response based on the format in the contract.

This is meant to be used by API providers.
