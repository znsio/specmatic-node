import * as specmatic from '../..';
import express from 'express';
import request from 'supertest';

test('adds an environment variable indicating api endpoits route is configured', async () => {
    var app = express();
    app.get('/', () => {});

    specmatic.enableApiCoverage(app);

    expect(process.env.endpointsAPI).toBe('_specmatic/endpoints');
});

test('gives list of end points for a single route defined on express app', async () => {
    var app = express();
    app.get('/', () => {});

    specmatic.enableApiCoverage(app);

    const res = await request(app).get('/_specmatic/endpoints').accept('application/json').expect(200);
    const response = generateResponseObject({ '/': ['GET'] });
    expect(res.body).toStrictEqual(response);
});

test('gives list of end points for multiple routes defined on express app', async () => {
    var app = express();
    app.get('/', () => {});
    app.post('/', () => {});
    app.get('/ping', () => {});

    specmatic.enableApiCoverage(app);

    const res = await request(app).get('/_specmatic/endpoints').accept('application/json').expect(200);
    const response = generateResponseObject({ '/': ['GET', 'POST'], '/ping': ['GET'] });
    expect(res.body).toStrictEqual(response);
});

test('gives list of end points for a multiple routes defined on multiple routers', async () => {
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

    specmatic.enableApiCoverage(app);

    const res = await request(app).get('/_specmatic/endpoints').accept('application/json').expect(200);
    const response = generateResponseObject({ '/product': ['GET', 'POST'], '/user': ['DELETE', 'GET', 'POST', 'PUT'] });
    expect(res.body).toStrictEqual(response);
});

function generateResponseObject(endPoints: { [key: string]: string[] }) {
    const structure = {
        contexts: {
            application: {
                mappings: {
                    dispatcherServlets: {
                        dispatcherServlet: [],
                    },
                },
            },
        },
    };
    Object.keys(endPoints).map(key => {
        structure.contexts.application.mappings.dispatcherServlets.dispatcherServlet.push({
            details: {
                requestMappingConditions: {
                    methods: endPoints[key],
                    patterns: [key],
                },
            },
        } as never);
    });
    return structure;
}
