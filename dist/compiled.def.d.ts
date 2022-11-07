import { WebSocket as WebSocketService, WebSocketServer } from "ws";
import { example as Example } from "./compiled.pbjs";
declare class InternalClientStreaming {
    url: string;
    WS: {
        [key in string]?: WebSocket;
    };
    debug: boolean;
    constructor(url: string, debug?: boolean);
    destroy(): void;
    sendWhenSocketReady(method: keyof typeof messageMetadata, request: {}): void;
    startAsyncIterableLoopWhenSocketReady(method: keyof typeof messageMetadata, clientIterable: AsyncIterable<{}>): void;
    handleMessage(method: keyof typeof messageMetadata, request: {}): Promise<{}>;
    handleServerStreaming(method: keyof typeof messageMetadata, request: {}): AsyncIterable<{}>;
    handleClientStreaming(method: keyof typeof messageMetadata, clientIterable: AsyncIterable<{}>): Promise<{}>;
    handleBidirectionalStreaming(method: keyof typeof messageMetadata, clientIterable: AsyncIterable<{}>): AsyncGenerator<{}, void, unknown>;
}
export interface IGreeterServiceImpl {
    SayHello: (message: Example.IHelloRequest) => Example.IHelloReply;
    SayHelloServerStream: (message: Example.IHelloRequest) => AsyncIterable<Example.IHelloReply>;
    SayHelloClientStream: (message: AsyncIterable<Example.IHelloRequest>) => Example.IHelloReply;
    SayHelloBidiStream: (message: AsyncIterable<Example.IHelloRequest>) => AsyncIterable<Example.IHelloReply>;
}
export declare class GreeterServerStreaming {
    server?: WebSocketServer;
    impl: IGreeterServiceImpl;
    debug: boolean;
    constructor(impl: IGreeterServiceImpl, debug?: boolean);
    handleMessage(ws: WebSocketService, method: keyof typeof messageMetadata): void;
    handleServerStreaming(ws: WebSocketService, method: keyof typeof messageMetadata): void;
    handleClientStreaming(ws: WebSocketService, method: keyof typeof messageMetadata): void;
    handleBidirectionalStreaming(ws: WebSocketService, method: keyof typeof messageMetadata): void;
    listen(port: number): void;
}
export declare class GreeterClientStreaming {
    url: string;
    debug: boolean;
    internalClient: InternalClientStreaming;
    constructor(url: string, debug?: boolean);
    destroy(): void;
    SayHello(request: Example.IHelloRequest): Promise<Example.IHelloReply>;
    SayHelloServerStream(request: Example.IHelloRequest): AsyncIterable<Example.IHelloReply>;
    SayHelloClientStream(clientIterable: AsyncIterable<Example.IHelloRequest>): Promise<Example.IHelloReply>;
    SayHelloBidiStream(clientIterable: AsyncIterable<Example.IHelloRequest>): AsyncIterable<Example.IHelloReply>;
}
declare const messageMetadata: {
    SayHello: {
        requestStream: boolean;
        responseStream: boolean;
        MessageClass: typeof Example.HelloRequest;
        ReplyClass: typeof Example.HelloReply;
    };
    SayHelloServerStream: {
        requestStream: boolean;
        responseStream: boolean;
        MessageClass: typeof Example.HelloRequest;
        ReplyClass: typeof Example.HelloReply;
    };
    SayHelloClientStream: {
        requestStream: boolean;
        responseStream: boolean;
        MessageClass: typeof Example.HelloRequest;
        ReplyClass: typeof Example.HelloReply;
    };
    SayHelloBidiStream: {
        requestStream: boolean;
        responseStream: boolean;
        MessageClass: typeof Example.HelloRequest;
        ReplyClass: typeof Example.HelloReply;
    };
};
export {};
