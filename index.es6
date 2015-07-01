'use strict';

import * as qs from 'querystring';
import * as xml2js from 'xml2js';
import * as Promise from 'bluebird';
import * as request from 'request-promise';

let parseString = Promise.promisify(xml2js.parseString);

class Preston {
    constructor(shopUrl, key, options = {}) {
        if (!shopUrl) {
            throw new Error('Shop URL required');
        }
        if (!key) {
            throw new Error('API key required');
        }
        this.shopUrl = shopUrl;
        this.key = key;
        this.options = options;
    }
    executeRequest(method, url, options = {}) {
        return request[method](url, options).auth(this.key).catch(error => {
            switch(error.statusCode) {
                case 400: throw new Error('No content');
                case 401: throw new Error('Unauthorized');
                case 404: throw new Error('Not found');
                case 405: throw new Error('Method not allowed');
                case 500: throw new Error('Internal server error');
                default: throw new Error(`Unexpected status code: ${error.statusCode}`);
            }
        });
    }
    parse(response) {
        if(this.options.raw) {
            return response;
        }
        return parseString(response, {
            explicitArray: false
        });
    }
    build(data) {
        let builder = new xml2js.Builder();
        return builder.buildObject(data);
    }
    add(resource, data, options = {}) {
        let url = this.resource(resource),
            requestOptions = {},
            requestData = {};
        if(!data) {
            throw new Error('No data specified to send, should be an object');
        }
        requestData.postXml = this.build(data);
        ['id_shop', 'id_group_shop'].forEach(param => {
            for(let key in options) {
                if(key.indexOf(param) !== -1) {
                    requestOptions[key] = options[key];
                }
            }
        });
        let query = qs.stringify(requestOptions);
        if(query.length) {
            url += `?${query}`;
        }
        return this.executeRequest('post', url, {form: requestData}).then(response => this.parse(response));
    }
    get(resource, options = {}) {
        let url = this.resource(resource),
            requestOptions = {};
        if(options.id) {
            url += options.id;
            delete options.id;
        }
        ['filter', 'display', 'sort', 'limit', 'id_shop', 'id_group_shop'].forEach(param => {
            for(let key in options) {
                if(key.indexOf(param) !== -1) {
                    requestOptions[key] = options[key];
                }
            }
        });
        let query = qs.stringify(requestOptions);
        if(query.length) {
            url += `?${query}`;
        }
        return this.executeRequest('get', url).then(response => this.parse(response));
    }
    edit(resource, options = {}) {
        let url = this.resource(resource),
            requestOptions = {},
            requestData = {};
        if(!data) {
            throw new Error('No data specified to send, should be an object');
        }
        if(!options.id) {
            throw new Error('Id not specified');
        }
        url += options.id;
        delete options.id;
        requestData.putXml = this.build(data);
        ['id_shop', 'id_group_shop'].forEach(param => {
            for(let key in options) {
                if(key.indexOf(param) !== -1) {
                    requestOptions[key] = options[key];
                }
            }
        });
        let query = qs.stringify(requestOptions);
        if(query.length) {
            url += `?${query}`;
        }
        return this.executeRequest('put', url, {form: requestData}).then(response => this.parse(response));
    }
    delete(resource, options = {}) {
        let url = this.resource(resource),
            requestOptions = {};
        if(!options.id) {
            throw new Error('Id not specified');
        }
        if(Array.isArray(options.id)) {
            url += `[${options.id.split(',')}]`;
        } else {
            url += options.id;
        }
        delete options.id;
        ['id_shop', 'id_group_shop'].forEach(param => {
            for(let key in options) {
                if(key.indexOf(param) !== -1) {
                    requestOptions[key] = options[key];
                }
            }
        });
        let query = qs.stringify(requestOptions);
        if(query.length) {
            url += `?${query}`;
        }
        return this.executeRequest('delete', url).then(response => this.parse(response));
    }
    head(resource, options = {}) {
        let url = this.resource(resource),
            requestOptions = {};
        if(options.id) {
            url += options.id;
            delete options.id;
        }
        ['filter', 'display', 'sort', 'limit'].forEach(param => {
            for(let key in options) {
                if(key.indexOf(param) !== -1) {
                    requestOptions[key] = options[key];
                }
            }
        });
        let query = qs.stringify(requestOptions);
        if(query.length) {
            url += `?${query}`;
        }
        return this.executeRequest('head', url).then(response => this.parse(response));
    }
    resource(resource) {
        return /^https?/.test(resource) ? resource : `${this.shopUrl}/api/${resource}/`;
    }
}

export default Preston;