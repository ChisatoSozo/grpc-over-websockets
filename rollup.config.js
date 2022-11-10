import typescript from "@rollup/plugin-typescript";
import shebang from "rollup-plugin-preserve-shebang";

export default {
  input: "src/generate.ts",
  output: {
    dir: "dist",
    format: "cjs",
  },
  plugins: [
    typescript({
      exclude: ["**/tests", "**/*.test.ts"],
    }),
    shebang({ shebang: "#!/usr/bin/env node" }),
  ],
};
