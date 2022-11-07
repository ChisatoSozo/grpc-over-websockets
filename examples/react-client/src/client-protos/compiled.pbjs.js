/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.example = (function() {

    /**
     * Namespace example.
     * @exports example
     * @namespace
     */
    var example = {};

    example.Greeter = (function() {

        /**
         * Constructs a new Greeter service.
         * @memberof example
         * @classdesc Represents a Greeter
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function Greeter(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (Greeter.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Greeter;

        /**
         * Creates new Greeter service using the specified rpc implementation.
         * @function create
         * @memberof example.Greeter
         * @static
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         * @returns {Greeter} RPC service. Useful where requests and/or responses are streamed.
         */
        Greeter.create = function create(rpcImpl, requestDelimited, responseDelimited) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
        };

        /**
         * Callback as used by {@link example.Greeter#sayHello}.
         * @memberof example.Greeter
         * @typedef SayHelloCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {example.HelloReply} [response] HelloReply
         */

        /**
         * Calls SayHello.
         * @function sayHello
         * @memberof example.Greeter
         * @instance
         * @param {example.IHelloRequest} request HelloRequest message or plain object
         * @param {example.Greeter.SayHelloCallback} callback Node-style callback called with the error, if any, and HelloReply
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(Greeter.prototype.sayHello = function sayHello(request, callback) {
            return this.rpcCall(sayHello, $root.example.HelloRequest, $root.example.HelloReply, request, callback);
        }, "name", { value: "SayHello" });

        /**
         * Calls SayHello.
         * @function sayHello
         * @memberof example.Greeter
         * @instance
         * @param {example.IHelloRequest} request HelloRequest message or plain object
         * @returns {Promise<example.HelloReply>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link example.Greeter#sayHelloServerStream}.
         * @memberof example.Greeter
         * @typedef SayHelloServerStreamCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {example.HelloReply} [response] HelloReply
         */

        /**
         * Calls SayHelloServerStream.
         * @function sayHelloServerStream
         * @memberof example.Greeter
         * @instance
         * @param {example.IHelloRequest} request HelloRequest message or plain object
         * @param {example.Greeter.SayHelloServerStreamCallback} callback Node-style callback called with the error, if any, and HelloReply
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(Greeter.prototype.sayHelloServerStream = function sayHelloServerStream(request, callback) {
            return this.rpcCall(sayHelloServerStream, $root.example.HelloRequest, $root.example.HelloReply, request, callback);
        }, "name", { value: "SayHelloServerStream" });

        /**
         * Calls SayHelloServerStream.
         * @function sayHelloServerStream
         * @memberof example.Greeter
         * @instance
         * @param {example.IHelloRequest} request HelloRequest message or plain object
         * @returns {Promise<example.HelloReply>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link example.Greeter#sayHelloClientStream}.
         * @memberof example.Greeter
         * @typedef SayHelloClientStreamCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {example.HelloReply} [response] HelloReply
         */

        /**
         * Calls SayHelloClientStream.
         * @function sayHelloClientStream
         * @memberof example.Greeter
         * @instance
         * @param {example.IHelloRequest} request HelloRequest message or plain object
         * @param {example.Greeter.SayHelloClientStreamCallback} callback Node-style callback called with the error, if any, and HelloReply
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(Greeter.prototype.sayHelloClientStream = function sayHelloClientStream(request, callback) {
            return this.rpcCall(sayHelloClientStream, $root.example.HelloRequest, $root.example.HelloReply, request, callback);
        }, "name", { value: "SayHelloClientStream" });

        /**
         * Calls SayHelloClientStream.
         * @function sayHelloClientStream
         * @memberof example.Greeter
         * @instance
         * @param {example.IHelloRequest} request HelloRequest message or plain object
         * @returns {Promise<example.HelloReply>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link example.Greeter#sayHelloBidiStream}.
         * @memberof example.Greeter
         * @typedef SayHelloBidiStreamCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {example.HelloReply} [response] HelloReply
         */

        /**
         * Calls SayHelloBidiStream.
         * @function sayHelloBidiStream
         * @memberof example.Greeter
         * @instance
         * @param {example.IHelloRequest} request HelloRequest message or plain object
         * @param {example.Greeter.SayHelloBidiStreamCallback} callback Node-style callback called with the error, if any, and HelloReply
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(Greeter.prototype.sayHelloBidiStream = function sayHelloBidiStream(request, callback) {
            return this.rpcCall(sayHelloBidiStream, $root.example.HelloRequest, $root.example.HelloReply, request, callback);
        }, "name", { value: "SayHelloBidiStream" });

        /**
         * Calls SayHelloBidiStream.
         * @function sayHelloBidiStream
         * @memberof example.Greeter
         * @instance
         * @param {example.IHelloRequest} request HelloRequest message or plain object
         * @returns {Promise<example.HelloReply>} Promise
         * @variation 2
         */

        return Greeter;
    })();

    example.HelloRequest = (function() {

        /**
         * Properties of a HelloRequest.
         * @memberof example
         * @interface IHelloRequest
         * @property {string|null} [name] HelloRequest name
         * @property {string|null} [lastName] HelloRequest lastName
         */

        /**
         * Constructs a new HelloRequest.
         * @memberof example
         * @classdesc Represents a HelloRequest.
         * @implements IHelloRequest
         * @constructor
         * @param {example.IHelloRequest=} [properties] Properties to set
         */
        function HelloRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * HelloRequest name.
         * @member {string} name
         * @memberof example.HelloRequest
         * @instance
         */
        HelloRequest.prototype.name = "";

        /**
         * HelloRequest lastName.
         * @member {string} lastName
         * @memberof example.HelloRequest
         * @instance
         */
        HelloRequest.prototype.lastName = "";

        /**
         * Creates a new HelloRequest instance using the specified properties.
         * @function create
         * @memberof example.HelloRequest
         * @static
         * @param {example.IHelloRequest=} [properties] Properties to set
         * @returns {example.HelloRequest} HelloRequest instance
         */
        HelloRequest.create = function create(properties) {
            return new HelloRequest(properties);
        };

        /**
         * Encodes the specified HelloRequest message. Does not implicitly {@link example.HelloRequest.verify|verify} messages.
         * @function encode
         * @memberof example.HelloRequest
         * @static
         * @param {example.IHelloRequest} message HelloRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HelloRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.lastName != null && Object.hasOwnProperty.call(message, "lastName"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.lastName);
            return writer;
        };

        /**
         * Encodes the specified HelloRequest message, length delimited. Does not implicitly {@link example.HelloRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof example.HelloRequest
         * @static
         * @param {example.IHelloRequest} message HelloRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HelloRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a HelloRequest message from the specified reader or buffer.
         * @function decode
         * @memberof example.HelloRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {example.HelloRequest} HelloRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HelloRequest.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.example.HelloRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 2: {
                        message.lastName = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a HelloRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof example.HelloRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {example.HelloRequest} HelloRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HelloRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a HelloRequest message.
         * @function verify
         * @memberof example.HelloRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        HelloRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.lastName != null && message.hasOwnProperty("lastName"))
                if (!$util.isString(message.lastName))
                    return "lastName: string expected";
            return null;
        };

        /**
         * Creates a HelloRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof example.HelloRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {example.HelloRequest} HelloRequest
         */
        HelloRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.example.HelloRequest)
                return object;
            var message = new $root.example.HelloRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.lastName != null)
                message.lastName = String(object.lastName);
            return message;
        };

        /**
         * Creates a plain object from a HelloRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof example.HelloRequest
         * @static
         * @param {example.HelloRequest} message HelloRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        HelloRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.lastName = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.lastName != null && message.hasOwnProperty("lastName"))
                object.lastName = message.lastName;
            return object;
        };

        /**
         * Converts this HelloRequest to JSON.
         * @function toJSON
         * @memberof example.HelloRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        HelloRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for HelloRequest
         * @function getTypeUrl
         * @memberof example.HelloRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        HelloRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/example.HelloRequest";
        };

        return HelloRequest;
    })();

    example.HelloReply = (function() {

        /**
         * Properties of a HelloReply.
         * @memberof example
         * @interface IHelloReply
         * @property {string|null} [message] HelloReply message
         */

        /**
         * Constructs a new HelloReply.
         * @memberof example
         * @classdesc Represents a HelloReply.
         * @implements IHelloReply
         * @constructor
         * @param {example.IHelloReply=} [properties] Properties to set
         */
        function HelloReply(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * HelloReply message.
         * @member {string} message
         * @memberof example.HelloReply
         * @instance
         */
        HelloReply.prototype.message = "";

        /**
         * Creates a new HelloReply instance using the specified properties.
         * @function create
         * @memberof example.HelloReply
         * @static
         * @param {example.IHelloReply=} [properties] Properties to set
         * @returns {example.HelloReply} HelloReply instance
         */
        HelloReply.create = function create(properties) {
            return new HelloReply(properties);
        };

        /**
         * Encodes the specified HelloReply message. Does not implicitly {@link example.HelloReply.verify|verify} messages.
         * @function encode
         * @memberof example.HelloReply
         * @static
         * @param {example.IHelloReply} message HelloReply message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HelloReply.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.message);
            return writer;
        };

        /**
         * Encodes the specified HelloReply message, length delimited. Does not implicitly {@link example.HelloReply.verify|verify} messages.
         * @function encodeDelimited
         * @memberof example.HelloReply
         * @static
         * @param {example.IHelloReply} message HelloReply message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HelloReply.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a HelloReply message from the specified reader or buffer.
         * @function decode
         * @memberof example.HelloReply
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {example.HelloReply} HelloReply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HelloReply.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.example.HelloReply();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.message = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a HelloReply message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof example.HelloReply
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {example.HelloReply} HelloReply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HelloReply.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a HelloReply message.
         * @function verify
         * @memberof example.HelloReply
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        HelloReply.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.message != null && message.hasOwnProperty("message"))
                if (!$util.isString(message.message))
                    return "message: string expected";
            return null;
        };

        /**
         * Creates a HelloReply message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof example.HelloReply
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {example.HelloReply} HelloReply
         */
        HelloReply.fromObject = function fromObject(object) {
            if (object instanceof $root.example.HelloReply)
                return object;
            var message = new $root.example.HelloReply();
            if (object.message != null)
                message.message = String(object.message);
            return message;
        };

        /**
         * Creates a plain object from a HelloReply message. Also converts values to other types if specified.
         * @function toObject
         * @memberof example.HelloReply
         * @static
         * @param {example.HelloReply} message HelloReply
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        HelloReply.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.message = "";
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            return object;
        };

        /**
         * Converts this HelloReply to JSON.
         * @function toJSON
         * @memberof example.HelloReply
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        HelloReply.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for HelloReply
         * @function getTypeUrl
         * @memberof example.HelloReply
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        HelloReply.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/example.HelloReply";
        };

        return HelloReply;
    })();

    return example;
})();

module.exports = $root;
