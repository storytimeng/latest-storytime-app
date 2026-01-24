import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: `${process.env.NEXT_PUBLIC_API_DOCS_URL}-json`,
  output: "src/client",
  plugins: [
    {
      name: "@hey-api/client-next",
      runtimeConfigPath: "../heyapi-runtime",
    },
  ],
});
