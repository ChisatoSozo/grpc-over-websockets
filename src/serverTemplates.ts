import { ServiceDefinition } from "./generate";

export const serviceTemplate = (
  service: string
) => `export class ${service}ServerStreaming {
  server?: WebSocketServer;
  impl: I${service}ServiceImpl;
  debug: boolean;

  constructor(impl: I${service}ServiceImpl, debug: boolean = false) {
    this.impl = impl;
    this.debug = debug;
  }

  destroy() {
    if(this.server){
      this.server.close();
    }
  }

  handleMessage(ws: WebSocketService, method: keyof typeof messageMetadata) {
    ws.on("message", async (data) => {
      if (this.debug) {
        console.log(\`Received message from client\`);
      }
      const binary = new Uint8Array(data as ArrayBuffer);
      const message = messageMetadata[method].MessageClass.decode(binary);

      if (this.debug) {
        console.log(\`Decoded message from client\`, message);
      }

      //@ts-ignore
      const replyObject = (this.impl[method] as (message: any) => any)(message);

      const reply =
        messageMetadata[method].ReplyClass.encode(replyObject).finish();

      if (this.debug) {
        console.log(\`Replying with\`, replyObject);
      }

      ws.send(reply);
    });
    ws.on("close", () => {

    });
    // handling client connection error
    ws.onerror = function () {
    };
  }

  handleServerStreaming(ws: WebSocketService, method: keyof typeof messageMetadata) {
    ws.on("message", async (data) => {
      const binary = new Uint8Array(data as ArrayBuffer);
      const message = messageMetadata[method].MessageClass.decode(binary);

      const replyObject = (
        //@ts-ignore
        this.impl[method] as (message: any) => AsyncIterable<any>
      )(message) as AsyncIterable<any>;

      for await (const reply of replyObject) {
        const replyBinary =
          messageMetadata[method].ReplyClass.encode(reply).finish();
        ws.send(replyBinary);
      }

      ws.close();
    });
    ws.on("close", () => {

    });
    // handling client connection error
    ws.onerror = function () {

    };
  }

  handleClientStreaming(ws: WebSocketService, method: keyof typeof messageMetadata) {
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
      iterableResolve(null);
    });

    // handling client connection error
    ws.onerror = function () {
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

    //@ts-ignore
    const replyObject = this.impl[method](asyncIterable()) as any;
    const reply =
      messageMetadata[method].ReplyClass.encode(replyObject).finish();
    ws.send(reply);
  }

  handleBidiStreaming(
    ws: WebSocketService,
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
      iterableResolve(null);
    });

    // handling client connection error
    ws.onerror = function () {
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

    //@ts-ignore
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
        console.log(\`Client connected to \${method}\`);
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
        this.handleBidiStreaming(ws, method);
      }
    });
  }
}`;

export const internalClientTemplate = `class InternalClientStreaming {
  url: string;
  WS: {
    [key in string]?: WebSocket;
  } = {};
  debug: boolean;

  constructor(url: string, debug: boolean = false) {
    this.url = url;
    this.debug = debug;
  }

  destroy() {
    for (const key in this.WS) {
      this.WS[key]?.close();
    }
  }

  sendWhenSocketReady(method: keyof typeof messageMetadata, request: {}) {
    const binary =
      messageMetadata[method].MessageClass.encode(request).finish();

    if (!this.WS[method]) {
      this.WS[method] = new WebSocket(this.url, method);
      this.WS[method]!.binaryType = "arraybuffer";
    }
    if (this.WS[method]!.readyState === WebSocket.OPEN) {
      this.WS[method]!.send(binary);
    } else {
      this.WS[method]!.onopen = () => {
        if (!this.WS[method]) {
          console.error(method + "WS is undefined in onopen");
          return;
        }
        this.WS[method]!.send(binary);
      };
    }
  }

  startAsyncIterableLoopWhenSocketReady(method: keyof typeof messageMetadata) {
    const messageQueue: Uint8Array[] = [];
    const stream = {
      send: (request: {}) => {
        const binary =
          messageMetadata[method].MessageClass.encode(request).finish();
        if (!this.WS[method]) {
          console.error("WS." + method + " is undefined");
          return;
        }

        if (this.WS[method]!.readyState === WebSocket.OPEN) {
          this.WS[method]!.send(binary);
        } else {
          messageQueue.push(binary);
          this.WS[method]!.onopen = () => {
            messageQueue.forEach((binary) => {
              this.WS[method]!.send(binary);
            });
          };
        }
      },
      close: () => {
        this.WS[method]!.close();
      },
    };

    if (!this.WS[method]) {
      this.WS[method] = new WebSocket(this.url, method);
      this.WS[method]!.binaryType = "arraybuffer";
    }

    return stream;
  }

  handleMessage(
    method: keyof typeof messageMetadata,
    request: {}
  ): Promise<{}> {
    this.sendWhenSocketReady(method, request);

    let messageResolve: (value: {}) => void;
    let messageReject: (reason?: any) => void;

    let messagePromiseResolveCount = 0;

    let messagePromise = new Promise<{}>((resolve, reject) => {
      messageResolve = resolve;
      messageReject = reject;
    });

    this.WS[method]!.onmessage = (data) => {
      const binary = new Uint8Array(data.data as ArrayBuffer);
      const message = messageMetadata[method].ReplyClass.decode(binary);

      if (this.debug) {
        console.log("Received a message from server", message);
      }

      if (messagePromiseResolveCount === 0) {
        messageResolve(message as {});
        messagePromiseResolveCount++;
      } else {
        console.error("messagePromiseResolveCount > 0");
      }
    };

    this.WS[method]!.onclose = () => {
      messageReject();
    };

    this.WS[method]!.onerror = () => {
      messageReject();
    };

    return messagePromise;
  }

  handleServerStreaming(
    method: keyof typeof messageMetadata,
    request: {}
  ): AsyncIterable<{}> {
    this.sendWhenSocketReady(method, request);

    let serverStreamResolve: (value: {} | undefined) => void;
    let serverStreamReject: (reason?: any) => void;

    let serverStreamPromise = new Promise<{} | undefined>((resolve, reject) => {
      serverStreamResolve = resolve;
      serverStreamReject = reject;
    });

    this.WS[method]!.onmessage = (data) => {
      const binary = new Uint8Array(data.data as ArrayBuffer);
      const message = messageMetadata[method].ReplyClass.decode(binary);
      serverStreamResolve(message);
    };

    this.WS[method]!.onclose = () => {
      serverStreamResolve(undefined);
    };

    this.WS[method]!.onerror = () => {
      serverStreamReject();
    };

    async function* asyncIterable() {
      while (true) {
        const result = await serverStreamPromise;
        if (!result) {
          return;
        }
        yield result;
        serverStreamPromise = new Promise<{} | undefined>((resolve, reject) => {
          serverStreamResolve = resolve;
          serverStreamReject = reject;
        });
      }
    }

    return asyncIterable();
  }

  handleClientStreaming(method: keyof typeof messageMetadata) {
    const stream = this.startAsyncIterableLoopWhenSocketReady(method);

    let serverMessageResolve: (value: {}) => void;
    let serverMessageReject: (reason?: any) => void;

    let serverMessageResolveCount = 0;

    let serverMessage = new Promise<{}>((resolve, reject) => {
      serverMessageResolve = resolve;
      serverMessageReject = reject;
    });

    this.WS[method]!.onmessage = (data) => {
      const binary = new Uint8Array(data.data as ArrayBuffer);
      const message = messageMetadata[method].ReplyClass.decode(binary);
      if (serverMessageResolveCount === 0) {
        serverMessageResolve(message);
        serverMessageResolveCount++;
      } else {
        console.error("serverMessageResolveCount > 0");
      }
    };

    this.WS[method]!.onclose = () => {
      serverMessageReject();
    };

    this.WS[method]!.onerror = () => {
      serverMessageReject();
    };

    return {
      serverMessage,
      sendStream: stream
    };
  }

  handleBidiStreaming(
    method: keyof typeof messageMetadata,
  ) {
    const stream = this.startAsyncIterableLoopWhenSocketReady(method);

    let bidiStreamResolve: (value: {} | undefined) => void;
    let bidiStreamReject: (reason?: any) => void;

    let bidiStreamPromise = new Promise<{} | undefined>((resolve, reject) => {
      bidiStreamResolve = resolve;
      bidiStreamReject = reject;
    });

    this.WS[method]!.onmessage = (data) => {
      const binary = new Uint8Array(data.data as ArrayBuffer);
      const message = messageMetadata[method].ReplyClass.decode(binary);
      bidiStreamResolve(message);
    };

    this.WS[method]!.onclose = () => {
      bidiStreamResolve(undefined);
    };

    this.WS[method]!.onerror = () => {
      bidiStreamReject();
    };

    async function* asyncIterable() {
      while (true) {
        const result = await bidiStreamPromise;
        if (!result) {
          return;
        }
        yield result;
        bidiStreamPromise = new Promise<{} | undefined>((resolve, reject) => {
          bidiStreamResolve = resolve;
          bidiStreamReject = reject;
        });
      }
    }

    return {
      serverIterable: asyncIterable(),
      sendStream: stream
    }
  }
}`;

export const clientTemplate = (
  serviceName: string,
  methodMetadata: Record<string, ServiceDefinition>
) => `
export class ${serviceName}ClientStreaming {
  url: string;
  debug: boolean;
  internalClient: InternalClientStreaming;

  constructor(url: string, debug: boolean = false) {
    this.url = url;
    this.debug = debug;
    this.internalClient = new InternalClientStreaming(url, debug);
  }

  destroy() {
    this.internalClient.destroy();
  }

  ${Object.entries(methodMetadata)
    .map(([methodName, method]) => {
      if (method.requestStream && method.responseStream) {
        return `${methodName}() {
          return this.internalClient.handleBidiStreaming(
            "${methodName}"
          ) as {
            serverIterable: AsyncIterable<${method.ReplyClass}>,
            sendStream: {
              send: (request: ${method.MessageClass}) => void,
              close: () => void
            }
          };
      }`;
      } else if (method.requestStream) {
        return `${methodName}() {
        return this.internalClient.handleClientStreaming(
          "${methodName}"
        ) as {
          serverMessage: Promise<${method.ReplyClass}>,
          sendStream: {
            send: (request: ${method.MessageClass}) => void,
            close: () => void
          }
        };
      }`;
      } else if (method.responseStream) {
        return `${methodName}(
        request: ${method.MessageClass}
      ): AsyncIterable<${method.ReplyClass}> {
        return this.internalClient.handleServerStreaming(
          "${methodName}",
          request
        ) as AsyncIterable<${method.ReplyClass}>;
      }`;
      } else {
        return `${methodName}(
        request: ${method.MessageClass}
      ): Promise<${method.ReplyClass}> {
        return this.internalClient.handleMessage(
          "${methodName}",
          request
        ) as Promise<${method.ReplyClass}>;
      }`;
      }
    })
    .join("\n\n")}
}
`;
