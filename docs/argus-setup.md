# Argus error tracking

Storytime uses [Argus](https://docs.arguserror.xyz/introduction) for error tracking across the API and both web apps.

## What it does

- Captures uncaught exceptions and unhandled promise rejections
- Groups duplicates into issues in the [Argus dashboard](https://app.argus.dev)
- React apps also catch render crashes via `ArgusErrorBoundary`
- Backend reports HTTP 5xx / unexpected failures from the Nest exception filter

## Setup (one-time)

1. Sign up at [app.argus.dev](https://app.argus.dev)
2. Create **three projects** (recommended), one per app:
   - **Node.js** → Storytime API
   - **React** → Storytime web app (`latest-storytime-app`)
   - **React** → Admin dashboard
3. Copy each project DSN (`https://PUBLIC_KEY@host/PROJECT_ID`)

## Environment variables

| App                     | Variable                               | Platform |
| ----------------------- | -------------------------------------- | -------- |
| `storytime-backend-1.0` | `ARGUS_DSN`                            | Node.js  |
| `storytime-backend-1.0` | `ARGUS_RELEASE` (optional)             | —        |
| `latest-storytime-app`  | `NEXT_PUBLIC_ARGUS_DSN`                | React    |
| `latest-storytime-app`  | `NEXT_PUBLIC_ARGUS_RELEASE` (optional) | —        |
| `admin-dashboard`       | `NEXT_PUBLIC_ARGUS_DSN`                | React    |
| `admin-dashboard`       | `NEXT_PUBLIC_ARGUS_RELEASE` (optional) | —        |

If the DSN is unset, Argus stays disabled (safe for local work).

## Verify

1. Set the DSN for the target app and restart it
2. Trigger a test error (throw in a page, or hit a 500 on the API)
3. Open **Issues** in the Argus dashboard — the event should appear within a few seconds

## Manual capture

```ts
import { captureException } from "@argusdev/sdk-react"; // or @argusdev/sdk-node

try {
  await riskyWork();
} catch (err) {
  await captureException(err);
  // handle locally
}
```

## Docs

- [Introduction](https://docs.arguserror.xyz/introduction)
- [Quickstart](https://docs.arguserror.xyz/quickstart)
- [React SDK](https://docs.arguserror.xyz/sdks/react)
- [Node SDK](https://docs.arguserror.xyz/sdks/node)
