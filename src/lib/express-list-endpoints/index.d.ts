export = expressListEndpoints;
/**
 * Returns an array of strings with all the detected endpoints
 * @param {import('express').Express | import('express').Router | any} app The express/router instance to get the endpoints from
 * @returns {Endpoint[]}
 */
declare function expressListEndpoints(app: import('express').Express | import('express').Router | any): Endpoint[];
declare namespace expressListEndpoints {
    export { Route, Endpoint };
}
type Endpoint = {
    /**
     * Path name
     */
    path: string;
    /**
     * Methods handled
     */
    methods: string[];
    /**
     * Mounted middlewares
     */
    middlewares: string[];
};
type Route = {
    methods: any;
    path: string | string[];
    stack: any[];
};
