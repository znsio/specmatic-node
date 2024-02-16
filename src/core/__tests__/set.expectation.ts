import axios from 'axios';
import path from 'path';
import * as specmatic from '../..';
import mockStub from '../../../test-resources/sample-mock-stub.json';
import { mockReset } from 'jest-mock-extended';

jest.mock('axios');

const STUB_PATH = 'test-resources/sample-mock-stub.json';

beforeEach(() => {
    mockReset(axios);
});

test('setExpectations with static object', async () => {
    axios.post.mockResolvedValue({ status: 200 });

    const data = {
        "mock-http-request": {
            "method": "GET",
            "path": "/v1/resource/1"
        },
        "mock-http-response": {
            "status": 200,
            "body": {
                "id": 1,
                "name": "resource name"
            }
        }
    }

    await expect(specmatic.setExpectationJson(data)).toResolve();

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
    expect(axios.post.mock.calls[0][1]).toMatchObject(mockStub);
});

test('setExpectations with default baseUrl', async () => {
    axios.post.mockResolvedValue({ status: 200 });
    await expect(specmatic.setExpectations(path.resolve(STUB_PATH))).toResolve();

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
    expect(axios.post.mock.calls[0][1]).toMatchObject(mockStub);
});

test('setExpectations with a different baseUrl for the stub server', async () => {
    axios.post.mockResolvedValue({ status: 200 });
    const stubServerBaseUrl = 'http://localhost:8000';

    await expect(specmatic.setExpectations(path.resolve(STUB_PATH), stubServerBaseUrl)).toResolve();

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post.mock.calls[0][0]).toBe(`${stubServerBaseUrl}/_specmatic/expectations`);
    expect(axios.post.mock.calls[0][1]).toMatchObject(mockStub);
});

test('setExpectations notifies when it fails', async () => {
    axios.post.mockReturnValue(Promise.reject());

    await expect(specmatic.setExpectations(path.resolve(STUB_PATH))).toReject();

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
    expect(axios.post.mock.calls[0][1]).toMatchObject(mockStub);
});

test('setExpectations notifies as failure when status code is not 200', async () => {
    axios.post.mockReturnValue(Promise.reject('Cannot set expectations'));
    const stubServerBaseUrl = 'http://localhost:8000';

    await expect(specmatic.setExpectations(path.resolve(STUB_PATH), stubServerBaseUrl)).toReject();

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post.mock.calls[0][0]).toBe(`${stubServerBaseUrl}/_specmatic/expectations`);
    expect(axios.post.mock.calls[0][1]).toMatchObject(mockStub);
});
