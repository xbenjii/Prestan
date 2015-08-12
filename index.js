'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var parseString = _bluebird2['default'].promisify(_xml2js2['default'].parseString);

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
            var _this = this;

            var options = arguments[2] === undefined ? {} : arguments[2];

            this.debug('Requesting[' + method + '] ' + url + ' with options ' + JSON.stringify(options));
            return _requestPromise2['default'][method](url, options).auth(this.key)['catch'](function (error) {
                _this.debug('Error: [' + error + ']');
                return _this.parse(error.error).then(function (parsedError) {
                    var error = parsedError.prestashop.errors.error;
                    var errorToThrow = Array.isArray(error) ? new Error(error.map(function (e) {
                        return e.message;
                    }).join('\n')) : new Error(error.message);
                    if (error.code) {
                        errorToThrow.code = erorr.code;
                    }
                    throw errorToThrow;
                });
            });
        }
    }, {
        key: 'parse',
        value: function parse(response) {
            if (this.options.raw) {
                return response;
            }
            return parseString(response, {
                explicitArray: false,
                trim: true
            });
        }
    }, {
        key: 'build',
        value: function build(data) {
            var builder = new _xml2js2['default'].Builder();
            return builder.buildObject(data);
        }
    }, {
        key: 'add',
        value: function add(resource) {
            var _this2 = this;

            var data = arguments[1] === undefined ? {} : arguments[1];
            var options = arguments[2] === undefined ? {} : arguments[2];

            var url = this.resource(resource),
                requestData = {};
            if (!data || typeof data !== 'object') {
                throw new Error('No data specified to send, should be an object');
            }
            requestData.postXml = this.build(data);
            this.checkKeys(['id_shop', 'id_group_shop'], options);
            var query = this.stringify(options);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('post', url, { form: requestData }).then(function (response) {
                return _this2.parse(response);
            });
        }
    }, {
        key: 'get',
        value: function get(resource) {
            var _this3 = this;

            var options = arguments[1] === undefined ? {} : arguments[1];

            var url = this.resource(resource);
            if (options.id) {
                url += options.id;
                delete options.id;
            }
            this.checkKeys(['filter', 'display', 'sort', 'limit', 'id_shop', 'id_group_shop', 'schema'], options);
            var query = this.stringify(options);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('get', url).then(function (response) {
                return _this3.parse(response);
            });
        }
    }, {
        key: 'edit',
        value: function edit(resource) {
            var _this4 = this;

            var options = arguments[1] === undefined ? {} : arguments[1];
            var data = arguments[2] === undefined ? {} : arguments[2];

            var url = this.resource(resource),
                requestData = {};
            if (!data || typeof data !== 'object') {
                throw new Error('No data specified to send, should be an object');
            }
            if (!options.id) {
                throw new Error('Id not specified');
            }
            url += options.id;
            delete options.id;
            requestData.putXml = this.build(data);
            this.checkKeys(['id_shop', 'id_group_shop'], options);
            var query = this.stringify(options);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('put', url, { form: requestData }).then(function (response) {
                return _this4.parse(response);
            });
        }
    }, {
        key: 'delete',
        value: function _delete(resource) {
            var _this5 = this;

            var options = arguments[1] === undefined ? {} : arguments[1];

            var url = this.resource(resource);
            if (!options.id) {
                throw new Error('Id not specified');
            }
            if (Array.isArray(options.id)) {
                url += '[' + options.id.split(',') + ']';
            } else {
                url += options.id;
            }
            delete options.id;
            this.checkKeys(['id_shop', 'id_group_shop'], options);
            var query = this.stringify(options);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('delete', url).then(function (response) {
                return _this5.parse(response);
            });
        }
    }, {
        key: 'head',
        value: function head(resource) {
            var _this6 = this;

            var options = arguments[1] === undefined ? {} : arguments[1];

            var url = this.resource(resource);
            if (options.id) {
                url += options.id;
                delete options.id;
            }
            this.checkKeys(['filter', 'display', 'sort', 'limit'], options);
            var query = this.stringify(options);
            if (query.length) {
                url += '?' + query;
            }
            return this.executeRequest('head', url).then(function (response) {
                return _this6.parse(response);
            });
        }
    }, {
        key: 'checkKeys',
        value: function checkKeys(keys, options) {
            Object.keys(options).filter(function (k) {
                return keys.every(function (x) {
                    return ! ~k.indexOf(x);
                });
            }).forEach(function (k) {
                return delete options[k];
            });
        }
    }, {
        key: 'resource',
        value: function resource() {
            var _resource = arguments[0] === undefined ? '' : arguments[0];

            return /^https?/.test(_resource) ? _resource : this.shopUrl + '/api/' + _resource + '/';
        }
    }, {
        key: 'debug',
        value: function debug(message) {
            if (this.options.debug) {
                console.log(message);
            }
        }
    }, {
        key: 'stringify',
        value: function stringify(obj) {
            return _qs2['default'].stringify(obj);
        }
    }]);

    return Preston;
})();

exports['default'] = Preston;
module.exports = exports['default'];
