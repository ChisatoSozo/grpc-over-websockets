/* eslint-disable no-loop-func */
import { useEffect, useState } from "react";
import { GreeterClientStreaming } from "./client-protos/compiled.def";

// const connect = <T extends rpc.Service>(service: T, url: string) => {

function App() {
  const [replies, setReplies] = useState<string[]>([]);
  const [repliesClientStream, setRepliesClientStream] = useState<string[]>([]);
  const [repliesServerStream, setRepliesServerStream] = useState<string[]>([]);
  const [repliesBidiStream, setRepliesBidiStream] = useState<string[]>([]);
  const [client, setClient] = useState<GreeterClientStreaming>();
  const [name, setName] = useState("");

  useEffect(() => {
    const client = new GreeterClientStreaming("ws://localhost:8000", true);
    setClient(client);
    return () => {
      client.destroy();
    };
  }, []);

  const sendMessage = () => {
    if (!client) {
      return;
    }

    client.SayHello({ name }).then((reply) => {
      const message = reply.message;
      if (!message) {
        return;
      }
      setReplies((replies) => [...replies, message]);
    });
  };

  const sendMessageClientStream = () => {
    if (!client) {
      return;
    }

    const clientIterable = (async function* () {
      for (let i = 0; i < 10; i++) {
        yield { name, lastName: "lastName" };
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    })();

    client.SayHelloClientStream(clientIterable).then((reply) => {
      const message = reply.message;
      if (!message) {
        return;
      }
      setRepliesClientStream((replies) => [...replies, message]);
    });
  };

  const sendMessageServerStream = () => {
    if (!client) {
      return;
    }

    const serverIterable = client.SayHelloServerStream({ name });

    (async () => {
      for await (const reply of serverIterable) {
        const message = reply.message;
        console.log(message);
        if (!message) {
          return;
        }
        setRepliesServerStream((replies) => [...replies, message]);
      }
      console.log("server stream done");
    })();
  };

  const sendMessageBidiStream = () => {
    if (!client) {
      return;
    }

    const clientIterable = (async function* () {
      for (let i = 0; i < 10; i++) {
        yield { name, lastName: "lastName" };
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    })();

    const serverIterable = client.SayHelloBidiStream(clientIterable);

    const main = async () => {
      for await (const reply of serverIterable) {
        const { message } = reply;
        if (!message) {
          continue;
        }
        setRepliesBidiStream((replies) => [...replies, message]);
      }
    };

    main();
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={sendMessage}>Send Message</button>
        <button onClick={() => setReplies([])}>Clear</button>
        <ul>
          {replies.map((reply, i) => (
            <li key={i}>{reply}</li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <button onClick={sendMessageClientStream}>
          Send Message Client Stream
        </button>
        <button onClick={() => setRepliesClientStream([])}>Clear</button>
        <ul>
          {repliesClientStream.map((reply, i) => (
            <li key={i}>{reply}</li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <button onClick={sendMessageServerStream}>
          Send Message Server Stream
        </button>
        <button onClick={() => setRepliesServerStream([])}>Clear</button>
        <ul>
          {repliesServerStream.map((reply, i) => (
            <li key={i}>{reply}</li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <button onClick={sendMessageBidiStream}>
          Send Message Bidi Stream
        </button>
        <button onClick={() => setRepliesBidiStream([])}>Clear</button>
        <ul>
          {repliesBidiStream.map((reply, i) => (
            <li key={i}>{reply}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
