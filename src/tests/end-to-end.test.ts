import {
  GreeterClientStreaming,
  GreeterServerStreaming,
} from "./protos/compiled.def";

const PORT = 8000;

const sleep0 = () => new Promise((resolve) => setTimeout(resolve));

describe("End to end test", () => {
  let server: GreeterServerStreaming;
  let client: GreeterClientStreaming;

  test("Server initializes", () => {
    server = new GreeterServerStreaming({
      SayHello: (message) => {
        const response = "Hello, " + message.name + " " + message.lastName;
        return {
          message: response,
        };
      },
      SayHelloServerStream: async function* (message) {
        const response = "Hello, " + message.name + " " + message.lastName;

        let keepGoing = true;
        const startTime = new Date().valueOf();

        while (keepGoing) {
          const elapsed = new Date().valueOf() - startTime;
          if (elapsed > 100) {
            keepGoing = false;
          }

          yield {
            message: response,
          };

          await sleep0();
        }
      },
      SayHelloClientStream: (messageIterable) => {
        let cycles = 0;

        const clientStreamMain = async () => {
          for await (const _ of messageIterable) {
            cycles++;
          }

          console.log("cycles per second client stream: " + cycles);
        };
        clientStreamMain();
        return {
          message: "ok",
        };
      },
      SayHelloBidiStream: async function* (messageIterable) {
        let cycles = 0;

        const clientStreamMain = async () => {
          for await (const _ of messageIterable) {
            cycles++;
          }

          console.log("cycles per second bidi stream server side: " + cycles);
        };
        clientStreamMain();

        const response = "hello";

        let keepGoing = true;
        const startTime = new Date().valueOf();

        while (keepGoing) {
          const elapsed = new Date().valueOf() - startTime;
          if (elapsed > 100) {
            keepGoing = false;
          }

          yield {
            message: response,
          };

          await sleep0();
        }
      },
    });

    server.listen(PORT);
  });

  test("client can be constructed", () => {
    client = new GreeterClientStreaming("ws://localhost:8000");
  });

  test("client can send and receive unary messages in 100ms", async () => {
    let keepGoing = true;
    let numCycles = 0;
    setTimeout(() => {
      keepGoing = false;
    }, 100);

    const main = async () => {
      while (keepGoing) {
        const reply = await client.SayHello({ name: "steve" });
        const message = reply.message;
        if (!message) {
          throw new Error("message not received");
        }
        if (message !== "Hello, steve ") {
          throw new Error(
            "message wrong content, expected 'Hello, steve ', got" + message
          );
        }
        numCycles++;
      }
    };

    await main();
    expect(keepGoing).toBe(false);
    console.log("unary cycles per second", numCycles);
  });

  test("client can receive a server stream in 100ms", async () => {
    let numCycles = 0;

    const iterator = client.SayHelloServerStream({ name: "steve" });
    for await (let reply of iterator) {
      const message = reply.message;
      if (!message) {
        throw new Error("message not received");
      }
      if (message !== "Hello, steve ") {
        throw new Error(
          "message wrong content, expected 'Hello, steve ', got" + message
        );
      }
      numCycles++;
    }

    console.log("server stream cycles per second", numCycles);
  });

  test("server can receive client stream in 100ms", async () => {
    let clientIterableResolve: () => void;

    let promise = new Promise<void>(
      (resolve) => (clientIterableResolve = resolve)
    );

    async function* clientIterable() {
      let keepGoing = true;
      const startTime = new Date().valueOf();

      while (keepGoing) {
        const elapsed = new Date().valueOf() - startTime;
        if (elapsed > 100) {
          keepGoing = false;
        }

        yield {};

        await sleep0();
      }

      clientIterableResolve();
    }

    const reply = await client.SayHelloClientStream(clientIterable());
    await promise;
    expect(reply.message).toBe("ok");
  });

  test("bidirectional streams work", async () => {
    async function* clientIterable() {
      let keepGoing = true;
      const startTime = new Date().valueOf();

      while (keepGoing) {
        const elapsed = new Date().valueOf() - startTime;
        if (elapsed > 100) {
          keepGoing = false;
        }

        yield {};

        await sleep0();
      }
    }

    const serverIterable = await client.SayHelloBidiStream(clientIterable());

    let numCycles = 0;

    for await (let reply of serverIterable) {
      const message = reply.message;
      if (!message) {
        throw new Error("message not received");
      }
      numCycles++;
    }

    console.log("bidi stream cycles per second, client side: ", numCycles);
    await sleep0();
  });

  afterAll(() => {
    if (client) client.destroy();
    if (server) server.destroy();
  });
});
