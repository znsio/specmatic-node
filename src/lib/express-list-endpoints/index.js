"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regExpToParseExpressPathRegExp = /^\/\^\\?\/?(?:(:?[\w\\.-]*(?:\\\/:?[\w\\.-]*)*)|(\(\?:\\?\/?\([^)]+\)\)))\\\/.*/;
const regExpToReplaceExpressPathRegExpParams = /\(\?:\\?\/?\([^)]+\)\)/;
const regexpExpressParamRegexp = /\(\?:\\?\\?\/?\([^)]+\)\)/g;
const regexpExpressPathParamRegexp = /(:[^)]+)\([^)]+\)/g;
const EXPRESS_ROOT_PATH_REGEXP_VALUE = '/^\\/?(?=\\/|$)/i';
const STACK_ITEM_VALID_NAMES = [
    'router',
    'bound dispatch',
    'mounted_app'
];
const getRouteMethods = function (route) {
    let methods = Object.keys(route.methods);
    methods = methods.filter((method) => method !== '_all');
    methods = methods.map((method) => method.toUpperCase());
    return methods;
};
const getRouteMiddlewares = function (route) {
    return route.stack.map((item) => {
        return item.handle.name || 'anonymous';
    });
};
const hasParams = function (expressPathRegExp) {
    return regexpExpressParamRegexp.test(expressPathRegExp);
};
function combinePaths(base, path) {
    return (base + path).replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}
const parseExpressRoute = function (route, basePath) {
    const paths = [];
    if (Array.isArray(route.path)) {
        paths.push(...route.path);
    }
    else {
        paths.push(route.path);
    }
    const endpoints = paths.map((path) => {
        const completePath = combinePaths(basePath, path);
        const endpoint = {
            path: completePath.replace(regexpExpressPathParamRegexp, '$1'),
            methods: getRouteMethods(route),
            middlewares: getRouteMiddlewares(route)
        };
        return endpoint;
    });
    return endpoints;
};
const parseExpressPath = function (expressPathRegExp, params) {
    let parsedRegExp = expressPathRegExp.toString();
    let expressPathRegExpExec = regExpToParseExpressPathRegExp.exec(parsedRegExp);
    let paramIndex = 0;
    while (hasParams(parsedRegExp)) {
        const paramName = params[paramIndex].name;
        const paramId = `:${paramName}`;
        parsedRegExp = parsedRegExp
            .replace(regExpToReplaceExpressPathRegExpParams, (str) => {
            if (str.startsWith('(?:\\/')) {
                return `\\/${paramId}`;
            }
            return paramId;
        });
        paramIndex++;
    }
    if (parsedRegExp !== expressPathRegExp.toString()) {
        expressPathRegExpExec = regExpToParseExpressPathRegExp.exec(parsedRegExp);
    }
    const parsedPath = expressPathRegExpExec[1].replace(/\\\//g, '/');
    return parsedPath;
};
const parseEndpoints = function (app, basePath, endpoints) {
    const stack = app.stack || (app._router && app._router.stack);
    endpoints = endpoints || [];
    basePath = basePath || '';
    if (!stack) {
        if (endpoints.length) {
            endpoints = addEndpoints(endpoints, [{
                    path: basePath,
                    methods: [],
                    middlewares: []
                }]);
        }
    }
    else {
        endpoints = parseStack(stack, basePath, endpoints);
    }
    return endpoints;
};
const addEndpoints = function (currentEndpoints, endpointsToAdd) {
    endpointsToAdd.forEach((newEndpoint) => {
        const existingEndpoint = currentEndpoints.find((endpoint) => endpoint.path === newEndpoint.path);
        if (existingEndpoint !== undefined) {
            const newMethods = newEndpoint.methods.filter((method) => !existingEndpoint.methods.includes(method));
            existingEndpoint.methods = existingEndpoint.methods.concat(newMethods);
        }
        else {
            currentEndpoints.push(newEndpoint);
        }
    });
    return currentEndpoints;
};
const parseStack = function (stack, basePath, endpoints) {
    stack.forEach((stackItem) => {
        if (stackItem.route) {
            const newEndpoints = parseExpressRoute(stackItem.route, basePath);
            endpoints = addEndpoints(endpoints, newEndpoints);
        }
        else if (STACK_ITEM_VALID_NAMES.includes(stackItem.name)) {
            const isExpressPathRegexp = regExpToParseExpressPathRegExp.test(stackItem.regexp);
            let newBasePath = basePath;
            if (isExpressPathRegexp) {
                const parsedPath = parseExpressPath(stackItem.regexp, stackItem.keys);
                newBasePath += `/${parsedPath}`;
            }
            else if (!stackItem.path && stackItem.regexp && stackItem.regexp.toString() !== EXPRESS_ROOT_PATH_REGEXP_VALUE) {
                const regExpPath = ` RegExp(${stackItem.regexp}) `;
                newBasePath += `/${regExpPath}`;
            }
            endpoints = parseEndpoints(stackItem.handle, newBasePath, endpoints);
        }
    });
    return endpoints;
};
const expressListEndpoints = function (app) {
    const endpoints = parseEndpoints(app);
    return endpoints;
};
module.exports = expressListEndpoints;
