/**
 * App Config (mobile billing mode) client.
 *
 * Thin wrapper over the generated hey-api SDK functions. The SDK was
 * regenerated from the local backend's swagger so the response and body
 * types come straight from `types.gen.ts`.
 *
 * One important caveat: the backend wraps every controller response in a
 * generic envelope (`{ statusType, statusCode, message, data, ... }`).
 * The generated SDK does NOT unwrap this — it trusts the server to
 * return the DTO directly. So we call the SDK function, and if we get
 * the envelope back, we unwrap the inner `data` field. This is
 * deliberately forgiving: if a future refactor removes the envelope,
 * this still works.
 */
import {
  appConfigControllerGetConfig,
  appConfigControllerUpdateConfig,
} from "./client/sdk.gen";
import type {
  AppConfigResponseDto,
  UpdateAppConfigDto,
} from "./client/types.gen";

export type AppBillingMode = "reader" | "playbilling";
export type AppConfigDto = AppConfigResponseDto;
export type UpdateAppConfigInput = UpdateAppConfigDto;

function unwrap<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    (payload as { data?: unknown }).data !== undefined &&
    (payload as { data?: unknown }).data !== null
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function getAppConfig(): Promise<AppConfigDto> {
  const { data } = await appConfigControllerGetConfig({});
  return unwrap<AppConfigDto>(data);
}

export async function updateAppConfig(
  input: UpdateAppConfigInput,
): Promise<AppConfigDto> {
  const { data } = await appConfigControllerUpdateConfig({
    body: input,
  });
  return unwrap<AppConfigDto>(data);
}
