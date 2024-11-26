export = expressListEndpoints;
declare function expressListEndpoints(app: import('express').Express | import('express').Router | any): Endpoint[];
declare namespace expressListEndpoints {
    export { Route, Endpoint };
}
type Endpoint = {
    path: string;
    methods: string[];
    middlewares: string[];
};
type Route = {
    methods: Object;
    path: string | string[];
    stack: any[];
};
