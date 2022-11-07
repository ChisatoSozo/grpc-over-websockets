import { GreeterServerStreaming } from "./server-protos/compiled.def";

const PORT = 8000;

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
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    },
    SayHelloClientStream: (messageIterable) => {
      const clientStreamMain = async () => {
        for await (const message of messageIterable) {
          console.log("client says: " + message.name);
        }
      };
      clientStreamMain();
      return {
        message: "ok",
      };
    },
    SayHelloBidiStream: async function* (messageIterable) {
      const clientStreamMain = async () => {
        for await (const message of messageIterable) {
          console.log("client says: " + message.name);
        }
      };
      clientStreamMain();
      for (let i = 0; i < 10; i++) {
        yield {
          message: "hello",
        };
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    },
  },
  true
);
server.listen(PORT);
