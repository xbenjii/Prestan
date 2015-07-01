'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _querystring = require('querystring');

var qs = _interopRequireWildcard(_querystring);

var _xml2js = require('xml2js');

var xml2js = _interopRequireWildcard(_xml2js);

var _bluebird = require('bluebird');

var Promise = _interopRequireWildcard(_bluebird);

var _requestPromise = require('request-promise');

var request = _interopRequireWildcard(_requestPromise);

var parseString = Promise.promisify(xml2js.parseString);

var Preston = (function () {
    function Preston(shopUrl, key) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        _classCallCheck(this, Preston);

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

    _createClass(Preston, [{
        key: 'executeRequest',
        value: function executeRequest(method, url) {
            var options = arguments[2] === undefined ? {} : arguments[2];

            return request[method](url, options).auth(this.key)['catch'](function (error) {
                switch (error.statusCode) {
                    case 400:
                        throw new Error('No content');
                    case 401:
                        throw new Error('Unauthorized');
                    case 404:
                        throw new Error('Not found');
                    case 405:
                        throw new Error('Method not allowed');
                    case 500:
                        throw new Error('Internal server error');
                    default:
                        throw new Error('Unexpected status code: ' + error.statusCode);
                }
            });
        }
    }, {
        key: 'parse',
        value: function parse(response) {
            if (this.options.raw) {
                return response;
            }
            return parseString(response, {
                explicitArray: false
            });
        }
    }, {
        key: 'build',
        value: function build(data) {
            var builder = new xml2js.Builder();
            return builder.buildObject(data);
        }
    }, {
        key: 'add',
        value: function add(resource, data) {
            var _this = this;

            var options = arguments[2] === undefined ? {} : arguments[2];

            var url = this.resource(resource),
                requestOptions = {},
                requestData = {};
            if (!data) {
                throw new Error('No data specified to send, should be an object');
            }
            requestData.postXml = this.build(data);
            ['id_shop', 'id_group_shop'].forEach(function (param) {
                if (options[param]) {
                    requestOptions[param] = options[param];
                }
            });
            var query = qs.stringify(requestOptions);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('post', url, { form: requestData }).then(function (response) {
                return _this.parse(response);
            });
        }
    }, {
        key: 'get',
        value: function get(resource) {
            var _this2 = this;

            var options = arguments[1] === undefined ? {} : arguments[1];

            var url = this.resource(resource),
                requestOptions = {};
            if (options.id) {
                url += options.id;
                delete options.id;
            }
            ['filter', 'display', 'sort', 'limit', 'id_shop', 'id_group_shop'].forEach(function (param) {
                if (options[param]) {
                    requestOptions[param] = options[param];
                }
            });
            var query = qs.stringify(requestOptions);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('get', url).then(function (response) {
                return _this2.parse(response);
            });
        }
    }, {
        key: 'edit',
        value: function edit(resource) {
            var _this3 = this;

            var options = arguments[1] === undefined ? {} : arguments[1];

            var url = this.resource(resource),
                requestOptions = {},
                requestData = {};
            if (!data) {
                throw new Error('No data specified to send, should be an object');
            }
            if (!options.id) {
                throw new Error('Id not specified');
            }
            url += options.id;
            delete options.id;
            requestData.putXml = this.build(data);
            ['id_shop', 'id_group_shop'].forEach(function (param) {
                if (options[param]) {
                    requestOptions[param] = options[param];
                }
            });
            var query = qs.stringify(requestOptions);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('put', url, { form: requestData }).then(function (response) {
                return _this3.parse(response);
            });
        }
    }, {
        key: 'delete',
        value: function _delete(resource) {
            var _this4 = this;

            var options = arguments[1] === undefined ? {} : arguments[1];

            var url = this.resource(resource),
                requestOptions = {};
            if (!options.id) {
                throw new Error('Id not specified');
            }
            if (Array.isArray(options.id)) {
                url += '[' + options.id.split(',') + ']';
            } else {
                url += options.id;
            }
            delete options.id;
            ['id_shop', 'id_group_shop'].forEach(function (param) {
                if (options[param]) {
                    requestOptions[param] = options[param];
                }
            });
            var query = qs.stringify(requestOptions);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('delete', url).then(function (response) {
                return _this4.parse(response);
            });
        }
    }, {
        key: 'head',
        value: function head(resource) {
            var _this5 = this;

            var options = arguments[1] === undefined ? {} : arguments[1];

            var url = this.resource(resource),
                requestOptions = {};
            if (options.id) {
                url += options.id;
                delete options.id;
            }
            ['filter', 'display', 'sort', 'limit'].forEach(function (param) {
                if (options[param]) {
                    requestOptions[param] = options[param];
                }
            });
            var query = qs.stringify(requestOptions);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('head', url).then(function (response) {
                return _this5.parse(response);
            });
        }
    }, {
        key: 'resource',
        value: function resource(_resource) {
            return /^https?/.test(_resource) ? _resource : this.shopUrl + '/api/' + _resource + '/';
        }
    }]);

    return Preston;
})();

exports['default'] = Preston;
module.exports = exports['default'];
