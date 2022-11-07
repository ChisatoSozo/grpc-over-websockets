import { WebSocket, WebSocketServer } from "ws";
import { example as Example } from "./compiled.pbjs";
export interface IGreeterServiceImpl {
  SayHello: (message: Example.IHelloRequest) => Example.IHelloReply;
  SayHelloServerStream: (
    message: Example.IHelloRequest
  ) => AsyncIterable<Example.IHelloReply>;
  SayHelloClientStream: (
    message: AsyncIterable<Example.IHelloRequest>
  ) => Example.IHelloReply;
  SayHelloBidiStream: (
    message: AsyncIterable<Example.IHelloRequest>
  ) => AsyncIterable<Example.IHelloReply>;
}
export class GreeterServerStreaming {
  server: WebSocketServer;
  impl: IGreeterServiceImpl;
  debug: boolean;

  constructor(impl: IGreeterServiceImpl, debug: boolean = false) {
    this.impl = impl;
    this.debug = debug;
  }

  handleMessage(ws: WebSocket, method: keyof typeof messageMetadata) {
    ws.on("message", async (data) => {
      if (this.debug) {
        console.log(`Received message from client`);
      }
      const binary = new Uint8Array(data as ArrayBuffer);
      const message = messageMetadata[method].MessageClass.decode(binary);

      if (this.debug) {
        console.log(`Decoded message from client`, message);
      }

      const replyObject = (this.impl[method] as (message: any) => any)(message);

      const reply =
        messageMetadata[method].ReplyClass.encode(replyObject).finish();

      if (this.debug) {
        console.log(`Replying with`, replyObject);
      }

      ws.send(reply);
    });
    ws.on("close", () => {
      console.log("the client has d/c");
    });
    // handling client connection error
    ws.onerror = function () {
      console.log("Some Error occurred");
    };
  }

  handleServerStreaming(ws: WebSocket, method: keyof typeof messageMetadata) {
    ws.on("message", async (data) => {
      const binary = new Uint8Array(data as ArrayBuffer);
      const message = messageMetadata[method].MessageClass.decode(binary);

      const replyObject = (
        this.impl[method] as (message: any) => AsyncIterable<any>
      )(message) as AsyncIterable<any>;

      for await (const reply of replyObject) {
        const replyBinary =
          messageMetadata[method].ReplyClass.encode(reply).finish();
        ws.send(replyBinary);
      }
    });
    ws.on("close", () => {
      console.log("the client has d/c");
    });
    // handling client connection error
    ws.onerror = function () {
      console.log("Some Error occurred");
    };
  }

  handleClientStreaming(ws: WebSocket, method: keyof typeof messageMetadata) {
    let iterableResolve: (value: any) => void;
    let iterableReject: (reason?: any) => void;
    let iterablePromise = new Promise<any>((resolve, reject) => {
      iterableResolve = resolve;
      iterableReject = reject;
    });

    ws.on("message", async (data) => {
      const binary = new Uint8Array(data as ArrayBuffer);
      const message = messageMetadata[method].MessageClass.decode(binary);
      iterableResolve(message);
      iterablePromise = new Promise<any>((resolve, reject) => {
        iterableResolve = resolve;
        iterableReject = reject;
      });
    });

    ws.on("close", () => {
      console.log("the client has d/c");
      iterableResolve(null);
    });

    // handling client connection error
    ws.onerror = function () {
      console.log("Some Error occurred");
      iterableReject();
    };

    async function* asyncIterable() {
      while (true) {
        const result = await iterablePromise;
        if (result === null) {
          return;
        }
      }
    }

    const replyObject = this.impl[method](asyncIterable()) as any;
    const reply =
      messageMetadata[method].ReplyClass.encode(replyObject).finish();
    ws.send(reply);
  }

  handleBidirectionalStreaming(
    ws: WebSocket,
    method: keyof typeof messageMetadata
  ) {
    let iterableResolve: (value: any) => void;
    let iterableReject: (reason?: any) => void;
    let iterablePromise = new Promise<any>((resolve, reject) => {
      iterableResolve = resolve;
      iterableReject = reject;
    });

    ws.on("message", async (data) => {
      const binary = new Uint8Array(data as ArrayBuffer);
      const message = messageMetadata[method].MessageClass.decode(binary);
      iterableResolve(message);
      iterablePromise = new Promise<any>((resolve, reject) => {
        iterableResolve = resolve;
        iterableReject = reject;
      });
    });

    ws.on("close", () => {
      console.log("the client has d/c");
      iterableResolve(null);
    });

    // handling client connection error
    ws.onerror = function () {
      console.log("Some Error occurred");
      iterableReject();
    };

    async function* asyncIterable() {
      while (true) {
        const result = await iterablePromise;
        if (result === null) {
          return;
        }
        yield result;
      }
    }

    const replyObject = this.impl[method](
      asyncIterable()
    ) as AsyncIterable<any>;

    const replyMain = async () => {
      for await (const reply of replyObject) {
        const replyBinary =
          messageMetadata[method].ReplyClass.encode(reply).finish();
        ws.send(replyBinary);
      }
    };
    replyMain();
  }

  listen(port: number) {
    this.server = new WebSocketServer({
      port,
    });
    this.server.on("connection", (ws, req) => {
      const method = ws.protocol as keyof typeof messageMetadata;
      if (this.debug) {
        console.log(`Client connected to ${method}`);
      }

      if (
        !messageMetadata[method].requestStream &&
        !messageMetadata[method].responseStream
      ) {
        this.handleMessage(ws, method);
      } else if (
        messageMetadata[method].requestStream &&
        !messageMetadata[method].responseStream
      ) {
        this.handleClientStreaming(ws, method);
      } else if (
        !messageMetadata[method].requestStream &&
        messageMetadata[method].responseStream
      ) {
        this.handleServerStreaming(ws, method);
      } else if (
        messageMetadata[method].requestStream &&
        messageMetadata[method].responseStream
      ) {
        this.handleBidirectionalStreaming(ws, method);
      }
    });
  }
}
const messageMetadata = {
  SayHello: {
    requestStream: false,
    responseStream: false,
    MessageClass: Example.HelloRequest,
    ReplyClass: Example.HelloReply,
  },

  SayHelloServerStream: {
    requestStream: false,
    responseStream: true,
    MessageClass: Example.HelloRequest,
    ReplyClass: Example.HelloReply,
  },

  SayHelloClientStream: {
    requestStream: true,
    responseStream: false,
    MessageClass: Example.HelloRequest,
    ReplyClass: Example.HelloReply,
  },

  SayHelloBidiStream: {
    requestStream: true,
    responseStream: true,
    MessageClass: Example.HelloRequest,
    ReplyClass: Example.HelloReply,
  },
};
