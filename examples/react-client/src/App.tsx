/* eslint-disable no-loop-func */
import { useEffect, useState } from "react";
import { example as ExampleProtos } from "./client-protos/compiled.pbjs";

class GreeterClientStreaming {
  url: string;
  SayHelloWS: WebSocket | undefined;
  SayHelloServerStreamWS: WebSocket | undefined;
  SayHelloClientStreamWS: WebSocket | undefined;
  SayHelloBidiStreamWS: WebSocket | undefined;
  debug: boolean;

  constructor(url: string, debug: boolean = false) {
    this.url = url;
    this.debug = debug;
  }

  destroy() {
    if (this.SayHelloWS) {
      this.SayHelloWS.close();
    }
    if (this.SayHelloServerStreamWS) {
      this.SayHelloServerStreamWS.close();
    }
    if (this.SayHelloClientStreamWS) {
      this.SayHelloClientStreamWS.close();
    }
    if (this.SayHelloBidiStreamWS) {
      this.SayHelloBidiStreamWS.close();
    }
  }

  SayHello(
    request: ExampleProtos.IHelloRequest
  ): Promise<ExampleProtos.HelloReply> {
    const binary = ExampleProtos.HelloRequest.encode(request).finish();

    if (!this.SayHelloWS) {
      this.SayHelloWS = new WebSocket(this.url, "SayHello");
      this.SayHelloWS.binaryType = "arraybuffer";
    }
    if (this.SayHelloWS.readyState === WebSocket.OPEN) {
      this.SayHelloWS.send(binary);
    } else {
      this.SayHelloWS.onopen = () => {
        if (!this.SayHelloWS) {
          console.error("SayHelloWS is undefined in onopen");
          return;
        }
        this.SayHelloWS.send(binary);
      };
    }

    let SayHelloResolve: (value: ExampleProtos.HelloReply) => void;
    let SayHelloReject: (reason?: any) => void;

    let SayHelloPromiseResolveCount = 0;

    let SayHelloPromise = new Promise<ExampleProtos.HelloReply>(
      (resolve, reject) => {
        SayHelloResolve = resolve;
        SayHelloReject = reject;
      }
    );

    this.SayHelloWS.onmessage = (data) => {
      const binary = new Uint8Array(data.data as ArrayBuffer);
      const message = ExampleProtos.HelloReply.decode(binary);

      if (this.debug) {
        console.log("Received a message from server", message);
      }

      if (SayHelloPromiseResolveCount === 0) {
        SayHelloResolve(message);
        SayHelloPromiseResolveCount++;
      } else {
        console.error("SayHelloPromiseResolveCount > 0");
      }
    };

    this.SayHelloWS.onclose = () => {
      SayHelloReject();
    };

    this.SayHelloWS.onerror = () => {
      SayHelloReject();
    };

    return SayHelloPromise;
  }

  SayHelloServerStream(
    request: ExampleProtos.IHelloRequest
  ): AsyncIterable<ExampleProtos.HelloReply> {
    if (!this.SayHelloServerStreamWS) {
      this.SayHelloServerStreamWS = new WebSocket(
        this.url,
        "SayHelloServerStream"
      );
      this.SayHelloServerStreamWS.binaryType = "arraybuffer";
    }
    if (this.SayHelloServerStreamWS.readyState === WebSocket.OPEN) {
      const binary = ExampleProtos.HelloRequest.encode(request).finish();
      this.SayHelloServerStreamWS.send(binary);
    } else {
      this.SayHelloServerStreamWS.onopen = () => {
        if (!this.SayHelloServerStreamWS) {
          console.error("SayHelloServerStreamWS is undefined in onopen");
          return;
        }
        const binary = ExampleProtos.HelloRequest.encode(request).finish();
        this.SayHelloServerStreamWS.send(binary);
      };
    }

    let SayHelloServerStreamResolve: (value: ExampleProtos.HelloReply) => void;
    let SayHelloServerStreamReject: (reason?: any) => void;

    let SayHelloServerStreamPromise = new Promise<ExampleProtos.HelloReply>(
      (resolve, reject) => {
        SayHelloServerStreamResolve = resolve;
        SayHelloServerStreamReject = reject;
      }
    );

    this.SayHelloServerStreamWS.onmessage = (data) => {
      const binary = new Uint8Array(data.data as ArrayBuffer);
      const message = ExampleProtos.HelloReply.decode(binary);
      SayHelloServerStreamResolve(message);
    };

    this.SayHelloServerStreamWS.onclose = () => {
      SayHelloServerStreamReject();
    };

    this.SayHelloServerStreamWS.onerror = () => {
      SayHelloServerStreamReject();
    };

    async function* asyncIterable() {
      while (true) {
        const result = await SayHelloServerStreamPromise;
        yield result;
        SayHelloServerStreamPromise = new Promise<ExampleProtos.HelloReply>(
          (resolve, reject) => {
            SayHelloServerStreamResolve = resolve;
            SayHelloServerStreamReject = reject;
          }
        );
      }
    }

    return asyncIterable();
  }

  SayHelloClientStream(
    clientIterable: AsyncIterable<ExampleProtos.HelloRequest>
  ): Promise<ExampleProtos.HelloReply> {
    const main = async () => {
      for await (const request of clientIterable) {
        const binary = ExampleProtos.HelloRequest.encode(request).finish();
        if (!this.SayHelloClientStreamWS) {
          console.error("SayHelloClientStreamWS is undefined");
          return;
        }
        this.SayHelloClientStreamWS.send(binary);
      }
    };

    if (!this.SayHelloClientStreamWS) {
      this.SayHelloClientStreamWS = new WebSocket(
        this.url,
        "SayHelloClientStream"
      );
      this.SayHelloClientStreamWS.binaryType = "arraybuffer";
    }

    if (this.SayHelloClientStreamWS.readyState === WebSocket.OPEN) {
      main();
    } else {
      this.SayHelloClientStreamWS.onopen = () => {
        main();
      };
    }

    let SayHelloClientStreamResolve: (value: ExampleProtos.HelloReply) => void;
    let SayHelloClientStreamReject: (reason?: any) => void;

    let SayHelloClientStreamPromiseResolveCount = 0;

    let SayHelloClientStreamPromise = new Promise<ExampleProtos.HelloReply>(
      (resolve, reject) => {
        SayHelloClientStreamResolve = resolve;
        SayHelloClientStreamReject = reject;
      }
    );

    this.SayHelloClientStreamWS.onmessage = (data) => {
      const binary = new Uint8Array(data.data as ArrayBuffer);
      const message = ExampleProtos.HelloReply.decode(binary);
      if (SayHelloClientStreamPromiseResolveCount === 0) {
        SayHelloClientStreamResolve(message);
        SayHelloClientStreamPromiseResolveCount++;
      } else {
        console.error("SayHelloClientStreamPromiseResolveCount > 0");
      }
    };

    this.SayHelloClientStreamWS.onclose = () => {
      SayHelloClientStreamReject();
    };

    this.SayHelloClientStreamWS.onerror = () => {
      SayHelloClientStreamReject();
    };

    return SayHelloClientStreamPromise;
  }

  SayHelloBidiStream(
    clientIterable: AsyncIterable<ExampleProtos.IHelloRequest>
  ): AsyncIterable<ExampleProtos.IHelloReply> {
    const main = async () => {
      for await (const request of clientIterable) {
        const binary = ExampleProtos.HelloRequest.encode(request).finish();
        if (!this.SayHelloBidiStreamWS) {
          console.error("SayHelloBidiStreamWS is undefined");
          return;
        }
        this.SayHelloBidiStreamWS.send(binary);
      }
    };

    if (!this.SayHelloBidiStreamWS) {
      this.SayHelloBidiStreamWS = new WebSocket(this.url, "SayHelloBidiStream");
      this.SayHelloBidiStreamWS.binaryType = "arraybuffer";
    }

    if (this.SayHelloBidiStreamWS.readyState === WebSocket.OPEN) {
      main();
    } else {
      this.SayHelloBidiStreamWS.onopen = () => {
        main();
      };
    }

    let SayHelloBidiStreamResolve: (value: ExampleProtos.HelloReply) => void;
    let SayHelloBidiStreamReject: (reason?: any) => void;

    let SayHelloBidiStreamPromise = new Promise<ExampleProtos.HelloReply>(
      (resolve, reject) => {
        SayHelloBidiStreamResolve = resolve;
        SayHelloBidiStreamReject = reject;
      }
    );

    this.SayHelloBidiStreamWS.onmessage = (data) => {
      const binary = new Uint8Array(data.data as ArrayBuffer);
      const message = ExampleProtos.HelloReply.decode(binary);
      SayHelloBidiStreamResolve(message);
    };

    this.SayHelloBidiStreamWS.onclose = () => {
      SayHelloBidiStreamReject();
    };

    this.SayHelloBidiStreamWS.onerror = () => {
      SayHelloBidiStreamReject();
    };

    async function* asyncIterable() {
      while (true) {
        const result = await SayHelloBidiStreamPromise;
        yield result;
        SayHelloBidiStreamPromise = new Promise<ExampleProtos.HelloReply>(
          (resolve, reject) => {
            SayHelloBidiStreamResolve = resolve;
            SayHelloBidiStreamReject = reject;
          }
        );
      }
    }

    return asyncIterable();
  }
}

// const connect = <T extends rpc.Service>(service: T, url: string) => {

function App() {
  const [replies, setReplies] = useState<string[]>([]);
  const [client, setClient] = useState<GreeterClientStreaming>();
  const [name, setName] = useState("");

  useEffect(() => {
    const client = new GreeterClientStreaming("ws://localhost:8000", true);
    setClient(client);
    return () => {
      client.destroy();
    };
  }, []);

  const getReply = () => {
    if (!client) {
      return;
    }

    const clientIterable = (async function* () {
      for (let i = 0; i < 10; i++) {
        yield { name, lastName: "lastName" };
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    })();

    const serverIterable = client.SayHelloBidiStream(clientIterable);

    const main = async () => {
      for await (const reply of serverIterable) {
        const { message } = reply;
        if (!message) {
          continue;
        }
        setReplies((replies) => [...replies, message]);
      }
    };

    main();
  };

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={getReply}>Send Message</button>
      <button onClick={() => setReplies([])}>Clear</button>
      <ul>
        {replies.map((reply, i) => (
          <li key={i}>{reply}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
