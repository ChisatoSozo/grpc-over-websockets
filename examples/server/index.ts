import { WebSocket, WebSocketServer } from "ws";
import { example as ExampleProtos } from "./server-protos/compiled.pbjs";

const PORT = 8000;

interface IGreeterServiceImpl {
  SayHello: (message: ExampleProtos.IHelloRequest) => ExampleProtos.IHelloReply;
  SayHelloServerStream: (
    message: ExampleProtos.IHelloRequest
  ) => AsyncIterable<ExampleProtos.IHelloReply>;
  SayHelloClientStream: (
    message: AsyncIterable<ExampleProtos.IHelloRequest>
  ) => ExampleProtos.IHelloReply;
  SayHelloBidiStream: (
    message: AsyncIterable<ExampleProtos.IHelloRequest>
  ) => AsyncIterable<ExampleProtos.IHelloReply>;
}

const messageMetadata = {
  SayHello: {
    MessageClass: ExampleProtos.HelloRequest,
    ReplyClass: ExampleProtos.HelloReply,
    responseStream: false,
    requestStream: false,
  },
  SayHelloServerStream: {
    MessageClass: ExampleProtos.HelloRequest,
    ReplyClass: ExampleProtos.HelloReply,
    responseStream: true,
    requestStream: false,
  },
  SayHelloClientStream: {
    MessageClass: ExampleProtos.HelloRequest,
    ReplyClass: ExampleProtos.HelloReply,
    requestStream: true,
    responseStream: false,
  },
  SayHelloBidiStream: {
    MessageClass: ExampleProtos.HelloRequest,
    ReplyClass: ExampleProtos.HelloReply,
    requestStream: true,
    responseStream: true,
  },
} as const;

class GreeterServerStreaming {
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

const server = new GreeterServerStreaming(
  {
    SayHello: (message) => {
      const response = "Hello, " + message.name + " " + message.lastName;
      return {
        message: response,
      };
    },
    SayHelloServerStream: async function* (message) {
      const response = "Hello, " + message.name + " " + message.lastName;
      for (let i = 0; i < 10; i++) {
        yield {
          message: response,
        };
      }
    },
    SayHelloClientStream: (messageIterable) => {
      const clientStreamMain = async () => {
        for await (const message of messageIterable) {
          console.log(message.name);
          if (message.name === "error") {
            throw new Error("error");
          } else {
            break;
          }
        }
      };
      clientStreamMain();
      return {
        message: "ok",
      };
    },
    SayHelloBidiStream: async function* (messageIterable) {
      for await (const message of messageIterable) {
        yield {
          message: message.name,
        };
      }
    },
  },
  true
);
server.listen(PORT);
