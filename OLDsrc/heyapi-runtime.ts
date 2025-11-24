import type { CreateClientConfig } from "./client/client.gen";
import Cookies from "js-cookie";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: "https://end.digitalcoresystem.com",
  fetch: async (input, init) => {
    const token = Cookies.get("authToken"); // read token from cookie
    const headers = new Headers(init?.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  },
});
