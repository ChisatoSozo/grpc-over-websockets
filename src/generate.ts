import prettier from "prettier";
import { pbjs, pbts } from "protobufjs-cli";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { serviceTemplate } from "./serverTemplates";

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const pbjsPromise = (args: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    pbjs.main(args, (err: Error, output: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
};
const pbtsPromise = (args: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    pbts.main(args, (err: Error, output: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
};

const compile = async (outFile: string, protoFiles: string[]) => {
  const fileRoot = outFile.replace(/\.js$/, "");

  for (const protoFile of protoFiles) {
    console.log(`Processing ${protoFile}`);
    await pbjsPromise([
      "-t",
      "static-module",
      "-w",
      "commonjs",
      "-o",
      `${fileRoot}.pbjs.js`,
      protoFile,
    ]);
    await pbtsPromise(["-o", `${fileRoot}.pbjs.d.ts`, `${fileRoot}.pbjs.js`]);
    const result = JSON.parse(await pbjsPromise(["-t", "json", protoFile]));
    console.log(result);
    const modules = result.nested;

    let outTS = "";
    let messageMetadata = "const messageMetadata = {\n";

    outTS += `import { WebSocket, WebSocketServer } from "ws";`;
    for (const module in modules) {
      const capitalizedModule = capitalize(module);
      outTS += `import { ${module} as ${capitalizedModule} } from "./compiled.pbjs";`;
    }
    for (const module in modules) {
      const compiledObjects = modules[module].nested;
      const capitalizedModule = capitalize(module);

      for (let compiledObjectName in compiledObjects) {
        const compiledObject = compiledObjects[compiledObjectName];
        if (compiledObject.methods) {
          let ImplBody = ``;
          for (let methodName in compiledObject.methods) {
            const method = compiledObject.methods[methodName];

            let methodMetadataBody = "";
            methodMetadataBody += `requestStream: ${!!method.requestStream},\n`;
            methodMetadataBody += `responseStream: ${!!method.responseStream},\n`;
            methodMetadataBody += `MessageClass: ${capitalizedModule}.${method.requestType},\n`;
            methodMetadataBody += `ReplyClass: ${capitalizedModule}.${method.responseType},\n`;

            messageMetadata += `
            ${methodName}: {
              ${methodMetadataBody}
            },
            `;

            if (!method.requestStream && !method.responseStream) {
              ImplBody += `${methodName}: (message: ${capitalizedModule}.I${method.requestType}) => ${capitalizedModule}.I${method.responseType};\n`;
            } else if (method.requestStream && !method.responseStream) {
              ImplBody += `${methodName}: (message: AsyncIterable<${capitalizedModule}.I${method.requestType}>) => ${capitalizedModule}.I${method.responseType};\n`;
            } else if (!method.requestStream && method.responseStream) {
              ImplBody += `${methodName}: (message: ${capitalizedModule}.I${method.requestType}) => AsyncIterable<${capitalizedModule}.I${method.responseType}>;\n`;
            } else if (method.requestStream && method.responseStream) {
              ImplBody += `${methodName}: (message: AsyncIterable<${capitalizedModule}.I${method.requestType}>) => AsyncIterable<${capitalizedModule}.I${method.responseType}>;\n`;
            }
          }
          outTS += `export interface I${compiledObjectName}ServiceImpl {${ImplBody}}\n`;
          outTS += serviceTemplate(compiledObjectName);
        }
      }
    }

    messageMetadata += "};\n";
    outTS += `${messageMetadata};\n`;

    //write file
    const fs = require("fs");
    const formetted = prettier.format(outTS, {
      parser: "typescript",
    });
    fs.writeFileSync(`${fileRoot}.def.ts`, formetted);
  }
};

const main = async () => {
  const argv = yargs(hideBin(process.argv))
    .command(
      "generate -o <outfile> <proto files...>",
      "Generate code for grpc-over-websocket"
    )
    .demandCommand(1)
    .demandOption("o")
    .parse();

  //@ts-ignore
  const outFile = argv.o as string | string[];
  //@ts-ignore
  const protoFiles = argv._ as string[];

  if (Array.isArray(outFile)) {
    for (const file of outFile) {
      await compile(file, protoFiles);
    }
  } else {
    await compile(outFile, protoFiles);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
