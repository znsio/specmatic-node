import * as specmatic from '../..';
import express from 'express';

test('gives list of end points for a single route defined on express app', () => {
    var app = express();
    app.get('/', () => {});

    const endPoints = specmatic.listEndPoints(app);

    expect(endPoints['/']).toEqual(['GET']);
});

test('gives list of end points for a multiple route defined on express app', () => {
    var app = express();
    app.get('/', () => {});
    app.post('/', () => {});
    app.get('/ping', () => {});

    const endPoints = specmatic.listEndPoints(app);

    expect(endPoints['/'].sort()).toEqual(['GET', 'POST']);
    expect(endPoints['/ping']).toEqual(['GET']);
});

test('gives list of end points for a multiple routes defined on multiple routers', () => {
    var app = express();
    const userRouter = express.Router();
    userRouter.get('/', function (req, res) {});
    userRouter.post('/', function (req, res) {});
    userRouter.delete('/', function (req, res) {});
    userRouter.put('/', function (req, res) {});

    const productRouter = express.Router();
    productRouter.get('/', function (req, res) {});
    productRouter.post('/', function (req, res) {});

    app.use('/user', userRouter);
    app.use('/product', productRouter);

    const endPoints = specmatic.listEndPoints(app);
    expect(endPoints['/user'].sort()).toEqual(['DELETE', 'GET', 'POST', 'PUT']);
    expect(endPoints['/product'].sort()).toEqual(['GET', 'POST']);
});
