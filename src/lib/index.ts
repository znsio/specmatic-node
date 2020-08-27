import fetch from 'node-fetch';
import path from 'path';

export const loadDynamicStub = (stubPath: string) => {
    const stubResponse = require(path.resolve(stubPath))
    fetch('http://localhost:8000/_qontract/expectations', 
        {
             method: 'POST', 
             body: JSON.stringify(stubResponse)
        })
        .then(res => res.json())
        .then(json => console.log(json));
};