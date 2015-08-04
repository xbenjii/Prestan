"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var qs = _interopRequire(require("qs"));

var xml2js = _interopRequire(require("xml2js"));

var Promise = _interopRequire(require("bluebird"));

var request = _interopRequire(require("request-promise"));

var parseString = Promise.promisify(xml2js.parseString);

var Preston = (function () {
    function Preston(shopUrl, key) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        _classCallCheck(this, Preston);

        if (!shopUrl) {
            throw new Error("Shop URL required");
        }
        if (!key) {
            throw new Error("API key required");
        }
        this.shopUrl = shopUrl;
        this.key = key;
        this.options = options;
    }

    _createClass(Preston, {
        executeRequest: {
            value: function executeRequest(method, url) {
                var _this = this;

                var options = arguments[2] === undefined ? {} : arguments[2];

                this.debug("Requesting[" + method + "] " + url + " with options " + JSON.stringify(options));
                return request[method](url, options).auth(this.key)["catch"](function (error) {
                    _this.debug("Error: [" + error + "]");
                    return _this.parse(error.error).then(function (parsedError) {
                        var error = parsedError.prestashop.errors.error;
                        var errorToThrow = Array.isArray(error) ? new Error(error.map(function (e) {
                            return e.message;
                        }).join("\n")) : new Error(error.message);
                        if (error.code) {
                            errorToThrow.code = code;
                        }
                        throw errorToThrow;
                    });
                });
            }
        },
        parse: {
            value: function parse(response) {
                if (this.options.raw) {
                    return response;
                }
                return parseString(response, {
                    explicitArray: false
                });
            }
        },
        build: {
            value: function build(data) {
                var builder = new xml2js.Builder();
                return builder.buildObject(data);
            }
        },
        add: {
            value: function add(resource) {
                var _this = this;

                var data = arguments[1] === undefined ? {} : arguments[1];
                var options = arguments[2] === undefined ? {} : arguments[2];

                var url = this.resource(resource),
                    requestData = {};
                if (!data || typeof data !== "object") {
                    throw new Error("No data specified to send, should be an object");
                }
                requestData.postXml = this.build(data);
                this.checkKeys(["id_shop", "id_group_shop"], options);
                var query = this.stringify(options);
                if (query.length) {
                    url += "?" + query;
                }
                return this.executeRequest("post", url, { form: requestData }).then(function (response) {
                    return _this.parse(response);
                });
            }
        },
        get: {
            value: function get(resource) {
                var _this = this;

                var options = arguments[1] === undefined ? {} : arguments[1];

                var url = this.resource(resource);
                if (options.id) {
                    url += options.id;
                    delete options.id;
                }
                this.checkKeys(["filter", "display", "sort", "limit", "id_shop", "id_group_shop", "schema"], options);
                var query = this.stringify(options);
                if (query.length) {
                    url += "?" + query;
                }
                return this.executeRequest("get", url).then(function (response) {
                    return _this.parse(response);
                });
            }
        },
        edit: {
            value: function edit(resource) {
                var _this = this;

                var options = arguments[1] === undefined ? {} : arguments[1];
                var data = arguments[2] === undefined ? {} : arguments[2];

                var url = this.resource(resource),
                    requestData = {};
                if (!data || typeof data !== "object") {
                    throw new Error("No data specified to send, should be an object");
                }
                if (!options.id) {
                    throw new Error("Id not specified");
                }
                url += options.id;
                delete options.id;
                requestData.putXml = this.build(data);
                this.checkKeys(["id_shop", "id_group_shop"], options);
                var query = this.stringify(options);
                if (query.length) {
                    url += "?" + query;
                }
                return this.executeRequest("put", url, { form: requestData }).then(function (response) {
                    return _this.parse(response);
                });
            }
        },
        "delete": {
            value: function _delete(resource) {
                var _this = this;

                var options = arguments[1] === undefined ? {} : arguments[1];

                var url = this.resource(resource);
                if (!options.id) {
                    throw new Error("Id not specified");
                }
                if (Array.isArray(options.id)) {
                    url += "[" + options.id.split(",") + "]";
                } else {
                    url += options.id;
                }
                delete options.id;
                this.checkKeys(["id_shop", "id_group_shop"], options);
                var query = this.stringify(options);
                if (query.length) {
                    url += "?" + query;
                }
                return this.executeRequest("delete", url).then(function (response) {
                    return _this.parse(response);
                });
            }
        },
        head: {
            value: function head(resource) {
                var _this = this;

                var options = arguments[1] === undefined ? {} : arguments[1];

                var url = this.resource(resource);
                if (options.id) {
                    url += options.id;
                    delete options.id;
                }
                this.checkKeys(["filter", "display", "sort", "limit"], options);
                var query = this.stringify(options);
                if (query.length) {
                    url += "?" + query;
                }
                return this.executeRequest("head", url).then(function (response) {
                    return _this.parse(response);
                });
            }
        },
        checkKeys: {
            value: function checkKeys(keys, options) {
                Object.keys(options).filter(function (k) {
                    return keys.every(function (x) {
                        return ! ~k.indexOf(x);
                    });
                }).forEach(function (k) {
                    return delete options[k];
                });
            }
        },
        resource: {
            value: (function (_resource) {
                var _resourceWrapper = function resource() {
                    return _resource.apply(this, arguments);
                };

                _resourceWrapper.toString = function () {
                    return _resource.toString();
                };

                return _resourceWrapper;
            })(function () {
                var resource = arguments[0] === undefined ? "" : arguments[0];

                return /^https?/.test(resource) ? resource : "" + this.shopUrl + "/api/" + resource + "/";
            })
        },
        debug: {
            value: function debug(message) {
                if (this.options.debug) {
                    console.log(message);
                }
            }
        },
        stringify: {
            value: function stringify(obj) {
                return qs.stringify(obj);
            }
        }
    });

    return Preston;
})();

module.exports = Preston;
