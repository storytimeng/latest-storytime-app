import type { CreateClientConfig } from "./client/client.gen";
import { getApiBaseUrl } from "./lib/apiBase";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: getApiBaseUrl(),
});
