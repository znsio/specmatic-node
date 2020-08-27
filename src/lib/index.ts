import fetch from 'node-fetch';

export const loadDynamicStub = () => {
    fetch('http://localhost:8000/_qontract/expectations', 
        {
             method: 'POST', 
             body: '{"http-request": {"method": "GET", "path": "/pets/1"}, "http-response": {"status": 200,"body": {"name": "new","type": "new","status": "new","id": "new"}}}' 
        })
        .then(res => res.json())
        .then(json => console.log(json));
};