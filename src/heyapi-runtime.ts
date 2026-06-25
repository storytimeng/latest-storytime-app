import type { CreateClientConfig } from "./client/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl:
    process.env.NEXT_PUBLIC_PROXY === "true"
      ? "/api/proxy"
      : process.env.NEXT_PUBLIC_API_URL || "http://end.digitalcoresystem.com/api",
});
