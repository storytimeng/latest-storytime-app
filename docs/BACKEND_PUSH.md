# Backend Push Notification Contract

The frontend push system in this app expects the backend to implement two
endpoints and provide a way to **send** pushes. This document specifies the
contract; it does not prescribe a language or framework.

---

## 1. VAPID configuration

The backend **must** be configured with the same VAPID key pair that the
browser knows about via `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

- `VAPID_PRIVATE_KEY` - the secret key. Backend-only.
- `VAPID_SUBJECT` - `mailto:` or `https://` URL identifying your service.
  Used in the VAPID JWT header.

Generate keys with either:

```bash
# No install - Node only:
node -e "const c=require('crypto');const{publicKey,privateKey}=c.generateKeyPairSync('ec',{namedCurve:'P-256'});const pubJwk=publicKey.export({format:'jwk'});const privJwk=privateKey.export({format:'jwk'});const pubRaw=Buffer.concat([Buffer.from(pubJwk.x,'base64url'),Buffer.from(pubJwk.y,'base64url')]);console.log('PUBLIC',pubRaw.toString('base64url'));console.log('PRIVATE',Buffer.from(privJwk.d,'base64url').toString('base64url'));"

# Or, with web-push installed:
npx web-push generate-vapid-keys
```

The browser expects the public key as a **base64url-encoded uncompressed
P-256 point** (65 bytes). This is the format produced by both commands above
and consumed by `lib/push/client.ts → urlBase64ToUint8Array()`.

---

## 2. Endpoints the frontend calls

The frontend calls **relative URLs under `/api`** by default. Adjust the
`apiBase` on `<EnableNotifications />` if your backend lives elsewhere.

### `POST /api/push/subscribe`

Called when the user enables notifications. Body:

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "base64url...",
    "auth": "base64url..."
  },
  "userId": "user-uuid-or-null"
}
```

Persist the subscription keyed by `endpoint`. Associate with `userId` if your
auth is available server-side (don't trust the client-supplied userId without
verification - read it from the auth token instead).

**Responses:**

| Status      | Meaning                                                      |
| ----------- | ------------------------------------------------------------ |
| `200 / 201` | Stored. (Frontend does not check the body.)                  |
| `400`       | Bad payload (e.g. missing keys).                             |
| `401`       | Unauthenticated - frontend will retry once auth is restored. |
| `5xx`       | Server error. Frontend will surface a toast.                 |

### `DELETE /api/push/subscribe`

Called when the user disables notifications. Body:

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

Remove the matching record. Idempotent.

**Responses:**

| Status      | Meaning                                   |
| ----------- | ----------------------------------------- |
| `200 / 204` | Removed (or was not present - both fine). |
| `401`       | Unauthenticated.                          |

---

## 3. Sending a push

When a backend event occurs (new follower, new chapter from a followed
author, etc.), the backend should:

1. Look up subscriptions for the relevant `userId`.
2. For each subscription, call `web-push`'s `sendNotification(subscription, payload)`.
3. Handle the standard response codes:

| `web-push` status | Meaning                                                    | Action                                       |
| ----------------- | ---------------------------------------------------------- | -------------------------------------------- |
| `201`             | Delivered.                                                 | None.                                        |
| `404` / `410`     | Subscription is gone (`endpoint` expired or unsubscribed). | **Delete** the subscription from your store. |
| `429`             | Rate-limited by the push service.                          | Retry with exponential backoff.              |
| Other 4xx         | Permanent failure for this endpoint.                       | Delete subscription.                         |
| 5xx               | Push service hiccup.                                       | Retry with backoff.                          |

### Payload format

The frontend SW ([app/sw.ts](../../app/sw.ts)) expects the payload as JSON:

```json
{
  "title": "New chapter from Ama",
  "body": "Chapter 3 of 'Quiet Tides' is now live.",
  "icon": "/icons/icon-192x192.png",
  "badge": "/icons/icon-96x96.png",
  "url": "/story/abc-123/read",
  "tag": "story-abc-123"
}
```

All fields are optional except `title`. Missing icons fall back to the SW
defaults (`/icons/icon-192x192.png` and `/icons/icon-96x96.png`).
`url` becomes the click destination - typically a deep-link into the app.

### Example (Node.js with `web-push`)

```js
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

async function notify(userId, payload) {
  const subs = await db.subscriptions.find({ userId });
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await db.subscriptions.deleteOne({ _id: sub._id });
        } else {
          console.error("push failed", err.statusCode, err.body);
        }
      }
    }),
  );
}
```

---

## 4. Database schema (suggested)

| Field         | Type             | Notes                                       |
| ------------- | ---------------- | ------------------------------------------- |
| `_id`         | ObjectId / UUID  |                                             |
| `userId`      | string (indexed) | Required for sending.                       |
| `endpoint`    | string (unique)  | The push service URL.                       |
| `keys.p256dh` | string           | base64url.                                  |
| `keys.auth`   | string           | base64url.                                  |
| `createdAt`   | timestamp        |                                             |
| `lastSeenAt`  | timestamp        | Update on each successful send for cleanup. |

---

## 5. iOS / iPadOS notes

- Safari only supports Web Push since iOS 16.4. Users must **install the PWA
  to the home screen** first - push is not available in the browser tab.
- Android Chrome / Edge / Samsung Internet / Firefox: works out of the box.
- macOS Safari: works after installing the PWA.

The `<EnableNotifications />` component will render nothing on unsupported
browsers and an explanatory row when permission is denied.

---

## 6. Testing checklist

1. Generate VAPID keys. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in `.env.local`.
2. Set `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` in your backend env.
3. Build the frontend and load it in Chrome.
4. Open DevTools → Application → Service Workers. Confirm `sw.js` is active.
5. Click "Enable Notifications" in your settings UI. Allow the prompt.
6. DevTools → Application → Push Messaging → "Push" with a test payload:

```json
{ "title": "Test", "body": "Hello from the SW", "url": "/notification" }
```

7. Verify a notification appears and clicking it navigates to `/notification`.
8. From your backend, send a push using `web-push` to the stored subscription.
9. Verify delivery, click navigation, and that 404/410 responses delete the
   subscription from your store.
