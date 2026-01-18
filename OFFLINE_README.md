# 📱 Storytime PWA - Offline Implementation

## 🎉 What's New

Your Storytime app is now a **fully offline-capable Progressive Web App (PWA)**! Users can:

- ✅ Access the app without internet
- ✅ View downloaded stories offline
- ✅ Write drafts that sync when online
- ✅ View cached profile and settings
- ✅ Share stories using native share dialog
- ✅ Install the app on their device
- ✅ Get SEO-optimized story pages

## 🚀 Quick Start for Developers

### 1. Build & Test

```bash
# Install dependencies
pnpm install

# Build for production (service worker only works in production)
pnpm build

# Start production server
pnpm start
```

### 2. Verify Installation

Open Chrome DevTools:
- Go to **Application** > **Service Workers**
- Verify `sw.js` is registered and running
- Go to **Application** > **IndexedDB**
- Verify `StorytimeOfflineDB` exists

### 3. Test Offline Mode

- Open DevTools > **Network** tab
- Select **Offline** from throttling dropdown
- Navigate to home page - should show offline indicator
- Go to Library > Downloads - should show cached stories

## 📦 What Was Added

### New Dependencies

```json
{
  "@serwist/next": "^9.5.0",  // PWA service worker
  "serwist": "^9.5.0",         // Service worker runtime
  "idb": "^8.0.3"              // Better IndexedDB API
}
```

### New Files

**Hooks:**
- `src/hooks/useOnlineStatus.ts` - Online/offline detection
- `src/hooks/useProfileCache.ts` - Profile data caching
- `src/hooks/useDraftQueue.ts` - Draft queue management

**Libraries:**
- `lib/offline/db.ts` - Enhanced IndexedDB with idb
- `lib/share.ts` - Native share functionality
- `lib/backgroundSync.ts` - Background sync utilities

**Components:**
- `components/OfflineIndicator.tsx` - Offline UI indicator
- `app/sw.ts` - Service worker configuration
- `app/story/[id]/StoryPageClient.tsx` - Client component for SEO

**Documentation:**
- `OFFLINE_PWA_IMPLEMENTATION_PLAN.md` - Implementation plan
- `OFFLINE_PWA_IMPLEMENTATION_SUMMARY.md` - Detailed summary
- `OFFLINE_FEATURES_GUIDE.md` - Developer guide
- `PWA_MIGRATION_CHECKLIST.md` - Migration checklist
- `OFFLINE_README.md` - This file

### Modified Files

- `next.config.js` - Serwist configuration
- `components/PWAProvider.tsx` - Service worker registration
- `views/app/home/homeView.tsx` - Offline indicator
- `views/app/library/newLibraryView.tsx` - Tab parameter support
- `views/app/story/singleStory.tsx` - Share functionality
- `app/story/[id]/page.tsx` - SEO metadata

## 🎯 Key Features

### 1. Offline Detection

```tsx
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";

function MyComponent() {
  const isOnline = useOnlineStatus();
  
  return isOnline ? "Online" : "Offline";
}
```

### 2. Data Caching

```tsx
import { useProfileCache } from "@/src/hooks/useProfileCache";

function ProfilePage() {
  const { profile, isOnline } = useProfileCache(userId);
  
  return (
    <div>
      <h1>{profile?.name}</h1>
      {!isOnline && <span>Cached</span>}
    </div>
  );
}
```

### 3. Draft Queue

```tsx
import { useDraftQueue } from "@/src/hooks/useDraftQueue";

function WritePage() {
  const { saveDraft, unsyncedCount, syncAllDrafts } = useDraftQueue(userId);
  
  return (
    <div>
      {unsyncedCount > 0 && (
        <button onClick={syncAllDrafts}>
          Sync {unsyncedCount} drafts
        </button>
      )}
    </div>
  );
}
```

### 4. Native Share

```tsx
import { shareStory } from "@/lib/share";

async function handleShare() {
  await shareStory(storyId, title, description);
}
```

## 📊 Caching Strategy

| Resource | Strategy | Duration |
|----------|----------|----------|
| Fonts | CacheFirst | 1 year |
| Images | StaleWhileRevalidate | 30 days |
| JS/CSS | StaleWhileRevalidate | 24 hours |
| API Calls | NetworkFirst | 5 minutes |
| Pages | NetworkFirst | 24 hours |

## 🗄️ IndexedDB Schema

### Stores

1. **stories** - Offline story data
2. **chapters** - Chapter content
3. **episodes** - Episode content
4. **metadata** - General metadata
5. **userData** - Cached user data
6. **profile** - Cached profile data
7. **readingProgress** - Offline reading progress
8. **drafts** - Draft stories/chapters (with sync queue)
9. **settings** - User settings cache
10. **notifications** - Cached notifications
11. **pendingActions** - Queued actions for background sync

## 🔄 Offline Workflow

### User Goes Offline

1. App detects offline status via `useOnlineStatus`
2. Home page shows `OfflineIndicator` component
3. User clicks "View My Downloads"
4. Redirected to Library with Downloads tab active
5. Can read all downloaded stories
6. Can write drafts (saved to IndexedDB)
7. Drafts marked as "unsynced"

### User Comes Back Online

1. App detects online status
2. Automatic sync triggers for pending actions
3. Drafts upload to server
4. Reading progress syncs
5. Cache refreshes with fresh data
6. User sees "You're back online" message

## 🛠️ Development Tips

### Testing Offline Mode

```bash
# 1. Build production bundle
pnpm build

# 2. Start production server
pnpm start

# 3. Open DevTools > Network
# 4. Select "Offline" from throttling

# 5. Navigate the app and verify:
# - Home shows offline indicator
# - Downloads accessible
# - Drafts save locally
# - Cached data loads
```

### Debugging Service Worker

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered:', registrations);
});

// Check caches
caches.keys().then(keys => console.log('Cache keys:', keys));
```

### Clearing Cache

```javascript
// Clear all caches
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Clear IndexedDB
indexedDB.deleteDatabase('StorytimeOfflineDB');
```

## 📱 PWA Installation

### Desktop

1. Click install icon in address bar
2. Or: Menu > Install Storytime
3. App opens in standalone window

### Mobile (Android)

1. Tap menu (⋮)
2. Tap "Install app" or "Add to Home Screen"
3. App appears on home screen

### Mobile (iOS)

1. Tap Share button
2. Tap "Add to Home Screen"
3. Tap "Add"
4. App appears on home screen

## 🔐 Security

- Service worker only works over HTTPS (or localhost)
- IndexedDB data is origin-specific
- No sensitive data cached (passwords, etc.)
- Cache expires based on content type
- Persistent storage requested to prevent eviction

## 🎨 User Experience

### Online
- Normal app behavior
- Fresh data from API
- Immediate updates
- Full functionality

### Offline
- Offline indicator on home
- Access to downloads
- Draft queue for writing
- Cached profile/settings
- Sync pending badge

### Transition (Offline → Online)
- Automatic sync triggers
- Drafts upload
- Cache refreshes
- "Back online" notification

## 📈 Performance

- **Initial Load**: Faster with cached assets
- **Repeat Visits**: Much faster (cache-first)
- **Offline Access**: Instant from cache
- **Bundle Size**: +~100KB for service worker runtime

## 🐛 Troubleshooting

### Service Worker Not Registering

**Problem**: Service worker fails to register

**Solutions**:
1. Ensure using HTTPS or localhost
2. Check `/sw.js` is accessible
3. Verify Serwist config in `next.config.js`
4. Clear old service workers in DevTools

### IndexedDB Errors

**Problem**: Data not saving to IndexedDB

**Solutions**:
1. Check browser support
2. Clear old database version
3. Check for quota exceeded
4. Verify database schema

### Offline Not Working

**Problem**: App doesn't work offline

**Solutions**:
1. Build production bundle (`pnpm build`)
2. Verify service worker registered
3. Check cache contains assets
4. Test in incognito mode

### Cache Not Updating

**Problem**: Seeing old content

**Solutions**:
1. Clear cache in DevTools
2. Unregister service worker
3. Hard refresh (Ctrl+Shift+R)
4. Check cache strategies

## 📚 Documentation

- **Implementation Plan**: `OFFLINE_PWA_IMPLEMENTATION_PLAN.md`
- **Implementation Summary**: `OFFLINE_PWA_IMPLEMENTATION_SUMMARY.md`
- **Developer Guide**: `OFFLINE_FEATURES_GUIDE.md`
- **Migration Checklist**: `PWA_MIGRATION_CHECKLIST.md`

## 🎓 Learn More

- [Serwist Docs](https://serwist.pages.dev/)
- [idb on GitHub](https://github.com/jakearchibald/idb)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## 🤝 Contributing

When adding new features:

1. Check if offline support is needed
2. Use `useOnlineStatus` for detection
3. Cache data in IndexedDB when appropriate
4. Queue actions when offline
5. Sync when online
6. Test offline functionality
7. Update documentation

## 📝 License

Same as the main Storytime project.

---

**Built with** ❤️ **using Serwist, Next.js, and idb**

For questions or issues, refer to the documentation above or create an issue in the repository.
