import * as $protobuf from "protobufjs";
/** Namespace example. */
export namespace example {

    /** Represents a Greeter */
    class Greeter extends $protobuf.rpc.Service {

        /**
         * Constructs a new Greeter service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new Greeter service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): Greeter;

        /**
         * Calls SayHello.
         * @param request HelloRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and HelloReply
         */
        public sayHello(request: example.IHelloRequest, callback: example.Greeter.SayHelloCallback): void;

        /**
         * Calls SayHello.
         * @param request HelloRequest message or plain object
         * @returns Promise
         */
        public sayHello(request: example.IHelloRequest): Promise<example.HelloReply>;

        /**
         * Calls SayHelloServerStream.
         * @param request HelloRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and HelloReply
         */
        public sayHelloServerStream(request: example.IHelloRequest, callback: example.Greeter.SayHelloServerStreamCallback): void;

        /**
         * Calls SayHelloServerStream.
         * @param request HelloRequest message or plain object
         * @returns Promise
         */
        public sayHelloServerStream(request: example.IHelloRequest): Promise<example.HelloReply>;

        /**
         * Calls SayHelloClientStream.
         * @param request HelloRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and HelloReply
         */
        public sayHelloClientStream(request: example.IHelloRequest, callback: example.Greeter.SayHelloClientStreamCallback): void;

        /**
         * Calls SayHelloClientStream.
         * @param request HelloRequest message or plain object
         * @returns Promise
         */
        public sayHelloClientStream(request: example.IHelloRequest): Promise<example.HelloReply>;

        /**
         * Calls SayHelloBidiStream.
         * @param request HelloRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and HelloReply
         */
        public sayHelloBidiStream(request: example.IHelloRequest, callback: example.Greeter.SayHelloBidiStreamCallback): void;

        /**
         * Calls SayHelloBidiStream.
         * @param request HelloRequest message or plain object
         * @returns Promise
         */
        public sayHelloBidiStream(request: example.IHelloRequest): Promise<example.HelloReply>;
    }

    namespace Greeter {

        /**
         * Callback as used by {@link example.Greeter#sayHello}.
         * @param error Error, if any
         * @param [response] HelloReply
         */
        type SayHelloCallback = (error: (Error|null), response?: example.HelloReply) => void;

        /**
         * Callback as used by {@link example.Greeter#sayHelloServerStream}.
         * @param error Error, if any
         * @param [response] HelloReply
         */
        type SayHelloServerStreamCallback = (error: (Error|null), response?: example.HelloReply) => void;

        /**
         * Callback as used by {@link example.Greeter#sayHelloClientStream}.
         * @param error Error, if any
         * @param [response] HelloReply
         */
        type SayHelloClientStreamCallback = (error: (Error|null), response?: example.HelloReply) => void;

        /**
         * Callback as used by {@link example.Greeter#sayHelloBidiStream}.
         * @param error Error, if any
         * @param [response] HelloReply
         */
        type SayHelloBidiStreamCallback = (error: (Error|null), response?: example.HelloReply) => void;
    }

    /** Properties of a HelloRequest. */
    interface IHelloRequest {

        /** HelloRequest name */
        name?: (string|null);

        /** HelloRequest lastName */
        lastName?: (string|null);
    }

    /** Represents a HelloRequest. */
    class HelloRequest implements IHelloRequest {

        /**
         * Constructs a new HelloRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: example.IHelloRequest);

        /** HelloRequest name. */
        public name: string;

        /** HelloRequest lastName. */
        public lastName: string;

        /**
         * Creates a new HelloRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns HelloRequest instance
         */
        public static create(properties?: example.IHelloRequest): example.HelloRequest;

        /**
         * Encodes the specified HelloRequest message. Does not implicitly {@link example.HelloRequest.verify|verify} messages.
         * @param message HelloRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: example.IHelloRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified HelloRequest message, length delimited. Does not implicitly {@link example.HelloRequest.verify|verify} messages.
         * @param message HelloRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: example.IHelloRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a HelloRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns HelloRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): example.HelloRequest;

        /**
         * Decodes a HelloRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns HelloRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): example.HelloRequest;

        /**
         * Verifies a HelloRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a HelloRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns HelloRequest
         */
        public static fromObject(object: { [k: string]: any }): example.HelloRequest;

        /**
         * Creates a plain object from a HelloRequest message. Also converts values to other types if specified.
         * @param message HelloRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: example.HelloRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this HelloRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for HelloRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a HelloReply. */
    interface IHelloReply {

        /** HelloReply message */
        message?: (string|null);
    }

    /** Represents a HelloReply. */
    class HelloReply implements IHelloReply {

        /**
         * Constructs a new HelloReply.
         * @param [properties] Properties to set
         */
        constructor(properties?: example.IHelloReply);

        /** HelloReply message. */
        public message: string;

        /**
         * Creates a new HelloReply instance using the specified properties.
         * @param [properties] Properties to set
         * @returns HelloReply instance
         */
        public static create(properties?: example.IHelloReply): example.HelloReply;

        /**
         * Encodes the specified HelloReply message. Does not implicitly {@link example.HelloReply.verify|verify} messages.
         * @param message HelloReply message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: example.IHelloReply, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified HelloReply message, length delimited. Does not implicitly {@link example.HelloReply.verify|verify} messages.
         * @param message HelloReply message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: example.IHelloReply, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a HelloReply message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns HelloReply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): example.HelloReply;

        /**
         * Decodes a HelloReply message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns HelloReply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): example.HelloReply;

        /**
         * Verifies a HelloReply message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a HelloReply message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns HelloReply
         */
        public static fromObject(object: { [k: string]: any }): example.HelloReply;

        /**
         * Creates a plain object from a HelloReply message. Also converts values to other types if specified.
         * @param message HelloReply
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: example.HelloReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this HelloReply to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for HelloReply
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
