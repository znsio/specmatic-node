import fetch from 'node-fetch';
import path from 'path';
import * as specmatic from '../..';
import mockStub from '../../../test-resources/sample-mock-stub.json';

jest.mock('node-fetch');
const fetchMock = fetch as unknown as jest.Mock;

const STUB_PATH = 'test-resources/sample-mock-stub.json';

beforeEach(() => {
    fetchMock.mockReset();
});

test('setExpectations with default baseUrl', async () => {
    fetchMock.mockReturnValue(Promise.resolve({ status: 200 }));
    await expect(specmatic.setExpectations(path.resolve(STUB_PATH))).toResolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});

test('setExpectations with a different baseUrl for the stub server', async () => {
    fetchMock.mockReturnValue(Promise.resolve({ status: 200 }));
    const stubServerBaseUrl = 'http://localhost:8000';

    await expect(specmatic.setExpectations(path.resolve(STUB_PATH), stubServerBaseUrl)).toResolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${stubServerBaseUrl}/_specmatic/expectations`);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});

test('setExpectations notifies when it fails', async () => {
    fetchMock.mockReturnValue(Promise.reject());

    await expect(specmatic.setExpectations(path.resolve(STUB_PATH))).toReject();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:9000/_specmatic/expectations');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});

test('setExpectations notifies as failure when status code is not 200', async () => {
    fetchMock.mockReturnValue(Promise.resolve({ status: 400 }));
    const stubServerBaseUrl = 'http://localhost:8000';

    await expect(specmatic.setExpectations(path.resolve(STUB_PATH), stubServerBaseUrl)).toReject();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${stubServerBaseUrl}/_specmatic/expectations`);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify(mockStub),
    });
});
