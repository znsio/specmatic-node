import * as specmatic from '..'
import express from 'express'
import request from 'supertest'

let server
var app

beforeEach(async () => {
    app = express()
    server = await specmatic.startApiCoverageServer(app)
})

afterEach(done => {
    server.close(() => {
        done()
    })
})

test('adds an environment variable indicating api endpoits route is configured', async () => {
    app.get('/', () => {})
    expect(process.env.endpointsAPI).toMatch(/http:\/\/.+?:[0-9]+?/)
})

test('gives list of end points for a single route defined on express app', async () => {
    app.get('/', () => {})
    const res = await request(server).get('/').accept('application/json').expect(200)
    const response = generateResponseObject({ '/': ['GET'] })
    expect(res.body).toStrictEqual(response)
})

test('gives list of end points for multiple routes defined on express app', async () => {
    app.get('/', () => {})
    app.post('/', () => {})
    app.get('/ping', () => {})
    const res = await request(server).get('/').accept('application/json').expect(200)
    const response = generateResponseObject({ '/': ['GET', 'POST'], '/ping': ['GET'] })
    expect(res.body).toStrictEqual(response)
})

test('gives list of end points for a multiple routes defined on multiple routers', async () => {
    const userRouter = express.Router()
    userRouter.get('/', function (req, res) {})
    userRouter.post('/', function (req, res) {})
    userRouter.delete('/', function (req, res) {})
    userRouter.put('/', function (req, res) {})

    const productRouter = express.Router()
    productRouter.get('/', function (req, res) {})
    productRouter.post('/', function (req, res) {})

    app.use('/user', userRouter)
    app.use('/product', productRouter)

    const res = await request(server).get('/').accept('application/json').expect(200)
    const response = generateResponseObject({ '/product': ['GET', 'POST'], '/user': ['DELETE', 'GET', 'POST', 'PUT'] })
    expect(res.body).toStrictEqual(response)
})

test('coverts express route variable syntax to spring request mapping syntax', async () => {
    app.get('/:id', () => {})
    const res = await request(server).get('/').accept('application/json').expect(200)
    const response = generateResponseObject({ '/{id}': ['GET'] })
    expect(res.body).toStrictEqual(response)
})

test('coverts express route multiple variable syntax to spring request mapping syntax', async () => {
    app.get('/:store/:id', () => {})
    const res = await request(server).get('/').accept('application/json').expect(200)
    const response = generateResponseObject({ '/{store}/{id}': ['GET'] })
    expect(res.body).toStrictEqual(response)
})

test('converts express route with regex path parameter to spring request mapping syntax', async () => {
    app.get('/api/orders/:orderId([0-9])/items/:itemId([0-9a-f]{24})', () => { });
    const res = await request(server).get('/').accept('application/json').expect(200)
    const response = generateResponseObject({ '/api/orders/{orderId}/items/{itemId}': ['GET'] })
    expect(res.body).toStrictEqual(response)
})

test('removes escaped dot and backslash in url', async () => {
    app.get('/v1\\.0/:store/:id', () => {})
    const res = await request(server).get('/').accept('application/json').expect(200)
    const response = generateResponseObject({ '/v1.0/{store}/{id}': ['GET'] })
    expect(res.body).toStrictEqual(response)
})

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
    }
    Object.keys(endPoints).map(key => {
        structure.contexts.application.mappings.dispatcherServlets.dispatcherServlet.push({
            details: {
                requestMappingConditions: {
                    methods: endPoints[key],
                    patterns: [key],
                },
            },
        } as never)
    })
    return structure
}
