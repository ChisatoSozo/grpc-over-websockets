import { pbjs, pbts } from "protobufjs-cli";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

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

  let outTS = "";

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

    const modules = result.nested;
    for (const module in modules) {
      const compiledObjects = modules[module].nested;
      for (let compiledObject of compiledObjects) {
        if (compiledObject.methods) {
          //it's a service
          //build impl interface
        }
      }
    }
    console.log(result);
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
