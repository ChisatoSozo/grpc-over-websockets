#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { pbjs, pbts } from "protobufjs-cli";
import * as ts from "typescript";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  clientTemplate,
  internalClientTemplate,
  serviceTemplate,
} from "./serverTemplates";

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

export type ServiceDefinition = {
  requestStream: boolean;
  responseStream: boolean;
  MessageClass: string;
  ReplyClass: string;
};

function compileDTS(fileName: string): void {
  const fileNames = [fileName];
  const options = {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true,
  };

  // Create a Program with an in-memory emit
  const createdFiles: Record<string, string> = {};
  const host = ts.createCompilerHost(options);
  host.writeFile = (fileName: string, contents: string) =>
    (createdFiles[fileName] = contents);

  // Prepare and emit the d.ts files
  const program = ts.createProgram(fileNames, options, host);
  program.emit();

  // Loop through all the input files
  fileNames.forEach((file) => {
    const dts = file.replace(".ts", ".d.ts");
    fs.writeFileSync(dts, createdFiles[dts]);
  });
}

function compileJS(fileName: string): void {
  const options = {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  };

  const fileNames = [fileName];

  let program = ts.createProgram(fileNames, options);
  let emitResult = program.emit();

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  if (exitCode) {
    console.log(`Process exiting with code '${exitCode}'.`);
  }
  console.log(`Process successful`);
}

const compile = async (
  outFile: string,
  protoFiles: string[],
  client: boolean,
  server: boolean
) => {
  const fileRoot = outFile.replace(/\.js$/, "");
  const fileName = path.basename(fileRoot);

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
    console.log(`Generated ${fileRoot}.pbjs.js`);
    await pbtsPromise(["-o", `${fileRoot}.pbjs.d.ts`, `${fileRoot}.pbjs.js`]);
    console.log(`Generated ${fileRoot}.pbjs.d.ts`);
    const result = JSON.parse(await pbjsPromise(["-t", "json", protoFile]));
    const modules = result.nested;

    let outTS = "";
    let messageMetadata = "const messageMetadata = {\n";

    if (server) {
      outTS += `import { WebSocket as WebSocketService, WebSocketServer } from "ws";`;
    }

    for (const module in modules) {
      const capitalizedModule = capitalize(module);
      outTS += `import { ${module} as ${capitalizedModule} } from "./${fileName}.pbjs";`;
    }

    if (client) {
      outTS += internalClientTemplate;
    }

    for (const module in modules) {
      const compiledObjects = modules[module].nested;
      const capitalizedModule = capitalize(module);

      for (let compiledObjectName in compiledObjects) {
        const compiledObject = compiledObjects[compiledObjectName];

        if (compiledObject.methods) {
          let ImplBody = ``;
          let methodMetadata: Record<string, ServiceDefinition> = {};

          for (let methodName in compiledObject.methods) {
            const method = compiledObject.methods[methodName];

            let methodMetadataBody = "";
            methodMetadataBody += `requestStream: ${!!method.requestStream},\n`;
            methodMetadataBody += `responseStream: ${!!method.responseStream},\n`;
            methodMetadataBody += `MessageClass: ${capitalizedModule}.${method.requestType},\n`;
            methodMetadataBody += `ReplyClass: ${capitalizedModule}.${method.responseType},\n`;

            methodMetadata[methodName] = {
              requestStream: !!method.requestStream,
              responseStream: !!method.responseStream,
              MessageClass: `${capitalizedModule}.I${method.requestType}`,
              ReplyClass: `${capitalizedModule}.I${method.responseType}`,
            };

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
          if (server) {
            outTS += `export interface I${compiledObjectName}ServiceImpl {${ImplBody}}\n`;
            outTS += serviceTemplate(compiledObjectName);
          }
          if (client) {
            outTS += clientTemplate(compiledObjectName, methodMetadata);
          }
        }
      }
    }

    messageMetadata += "};\n";
    outTS += `${messageMetadata};\n`;

    //write file
    const fs = require("fs");

    fs.writeFileSync(`${fileRoot}.def.ts`, outTS);
    compileJS(`${fileRoot}.def.ts`);
    compileDTS(`${fileRoot}.def.ts`);
    /* eslint-disable */

    //read fileRoot js
    const js = fs.readFileSync(`${fileRoot}.def.js`, "utf8");
    const eslintDisabled = `/* eslint-disable */
${js}`.replace(`"use strict";`, "");
    fs.writeFileSync(`${fileRoot}.def.js`, eslintDisabled);
    //remove ts files
    fs.unlinkSync(`${fileRoot}.def.ts`);
  }
};

const main = async () => {
  const argv = yargs(hideBin(process.argv))
    .command(
      "-c <outclientfile> -s <outserverfile> -o <outcombinedfile> <proto files...>",
      "Generate code for grpc-over-websocket"
    )
    .demandCommand(1)
    .parse();

  //@ts-ignore
  const outClientFile = argv.c as string | string[] | undefined;

  //@ts-ignore
  const outServerFile = argv.s as string | string[] | undefined;

  //@ts-ignore
  const outCombinedFile = argv.o as string | string[] | undefined;

  //@ts-ignore
  const protoFiles = argv._ as string[];

  if (Array.isArray(outClientFile)) {
    for (const file of outClientFile) {
      await compile(file, protoFiles, true, false);
    }
  } else {
    if (outClientFile) {
      await compile(outClientFile, protoFiles, true, false);
    }
  }

  if (Array.isArray(outServerFile)) {
    for (const file of outServerFile) {
      await compile(file, protoFiles, false, true);
    }
  } else {
    if (outServerFile) {
      await compile(outServerFile, protoFiles, false, true);
    }
  }

  if (Array.isArray(outCombinedFile)) {
    for (const file of outCombinedFile) {
      await compile(file, protoFiles, true, true);
    }
  } else {
    if (outCombinedFile) {
      await compile(outCombinedFile, protoFiles, true, true);
    }
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
