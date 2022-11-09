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

    const replyObject = this.impl[method](asyncIterable()) as any;
    const reply =
      messageMetadata[method].ReplyClass.encode(replyObject).finish();
    ws.send(reply);
  }

  handleBidirectionalStreaming(
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
        this.handleBidirectionalStreaming(ws, method);
      }
    });
  }
}`;

export const internalClientTemplate = `class InternalClientStreaming {
  url: string;
  WS: {
    [key in string]?: WebSocket
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

  startAsyncIterableLoopWhenSocketReady(
    method: keyof typeof messageMetadata,
    clientIterable: AsyncIterable<{}>
  ) {
    const main = async () => {
      for await (const request of clientIterable) {
        const binary =
          messageMetadata[method].MessageClass.encode(request).finish();
        if (!this.WS[method]) {
          console.error("WS." + method + " is undefined");
          return;
        }
        this.WS[method]!.send(binary);
      }
      this.WS[method]!.close();
    };

    if (!this.WS[method]) {
      this.WS[method] = new WebSocket(this.url, method);
      this.WS[method]!.binaryType = "arraybuffer";
    }

    if (this.WS[method]!.readyState === WebSocket.OPEN) {
      main();
    } else {
      this.WS[method]!.onopen = () => {
        main();
      };
    }
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

    let serverStreamResolve: (value: {}) => void;
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
        if(!result){
          return;
        }
        yield result;
        serverStreamPromise = new Promise<{}>((resolve, reject) => {
          serverStreamResolve = resolve;
          serverStreamReject = reject;
        });
      }
    }

    return asyncIterable();
  }

  handleClientStreaming(
    method: keyof typeof messageMetadata,
    clientIterable: AsyncIterable<{}>
  ) {
    this.startAsyncIterableLoopWhenSocketReady(method, clientIterable);

    let clientStreamResolve: (value: {}) => void;
    let clientStreamReject: (reason?: any) => void;

    let clientStreamResolveCount = 0;

    let clientStream = new Promise<{}>((resolve, reject) => {
      clientStreamResolve = resolve;
      clientStreamReject = reject;
    });

    this.WS[method]!.onmessage = (data) => {
      const binary = new Uint8Array(data.data as ArrayBuffer);
      const message = messageMetadata[method].ReplyClass.decode(binary);
      if (clientStreamResolveCount === 0) {
        clientStreamResolve(message);
        clientStreamResolveCount++;
      } else {
        console.error("clientStreamResolveCount > 0");
      }
    };

    this.WS[method]!.onclose = () => {
      clientStreamReject();
    };

    this.WS[method]!.onerror = () => {
      clientStreamReject();
    };

    return clientStream;
  }

  handleBidirectionalStreaming(
    method: keyof typeof messageMetadata,
    clientIterable: AsyncIterable<{}>
  ) {
    this.startAsyncIterableLoopWhenSocketReady(method, clientIterable);

    let bidiStreamResolve: (value: {}) => void;
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
        if(!result){
          return;
        }
        yield result;
        bidiStreamPromise = new Promise<{}>((resolve, reject) => {
          bidiStreamResolve = resolve;
          bidiStreamReject = reject;
        });
      }
    }

    return asyncIterable();
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
        return `${methodName}(
        clientIterable: AsyncIterable<${method.MessageClass}>
      ): AsyncIterable<${method.ReplyClass}> {
        return this.internalClient.handleBidirectionalStreaming(
          "${methodName}",
          clientIterable
        ) as AsyncIterable<${method.ReplyClass}>;
      }`;
      } else if (method.requestStream) {
        return `${methodName}(
        clientIterable: AsyncIterable<${method.MessageClass}>
      ): Promise<${method.ReplyClass}> {
        return this.internalClient.handleClientStreaming(
          "${methodName}",
          clientIterable
        ) as Promise<${method.ReplyClass}>;
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
