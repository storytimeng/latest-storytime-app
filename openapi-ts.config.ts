import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://end.digitalcoresystem.com/api-json",
  output: "src/client",
  plugins: [
    {
      name: "@hey-api/client-next",
      runtimeConfigPath: "./src/heyapi-runtime.ts",
    },
  ],
});
