# Offline Features - Developer Guide

## Quick Start

### Detecting Online/Offline Status

```tsx
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";

function MyComponent() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {isOnline ? "Connected" : "Offline"}
    </div>
  );
}
```

### Caching User Profile

```tsx
import { useProfileCache } from "@/src/hooks/useProfileCache";

function ProfileComponent() {
  const userId = "user-123";
  const { profile, isLoading, error, isOnline } = useProfileCache(userId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;
  
  return (
    <div>
      <h1>{profile?.name}</h1>
      {!isOnline && <span>Viewing cached data</span>}
    </div>
  );
}
```

### Managing Drafts Offline

```tsx
import { useDraftQueue } from "@/src/hooks/useDraftQueue";

function WriteComponent() {
  const userId = "user-123";
  const {
    drafts,
    saveDraft,
    updateDraft,
    deleteDraft,
    syncAllDrafts,
    unsyncedCount,
    isOnline,
  } = useDraftQueue(userId);
  
  const handleSave = async () => {
    await saveDraft({
      title: "My Story",
      content: "Story content...",
      synced: false,
    });
  };
  
  return (
    <div>
      {unsyncedCount > 0 && (
        <button onClick={syncAllDrafts}>
          Sync {unsyncedCount} drafts
        </button>
      )}
      <button onClick={handleSave}>Save Draft</button>
    </div>
  );
}
```

### Working with IndexedDB

```tsx
import { getDB, STORES } from "@/lib/offline/db";

async function cacheUserData(userId: string, data: any) {
  const db = await getDB();
  
  await db.put(STORES.USER_DATA, {
    id: userId,
    userId,
    data,
    cachedAt: Date.now(),
    expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
  });
}

async function getUserData(userId: string) {
  const db = await getDB();
  return await db.get(STORES.USER_DATA, userId);
}
```

### Native Sharing

```tsx
import { shareStory, shareChapter } from "@/lib/share";

function StoryComponent({ story }) {
  const handleShare = async () => {
    const success = await shareStory(
      story.id,
      story.title,
      story.description
    );
    
    if (success) {
      console.log("Shared successfully!");
    }
  };
  
  return (
    <button onClick={handleShare}>
      Share Story
    </button>
  );
}
```

### Background Sync

```tsx
import { syncDrafts, requestPersistentStorage } from "@/lib/backgroundSync";

async function setupOfflineSupport() {
  // Request persistent storage
  const isPersistent = await requestPersistentStorage();
  console.log("Persistent storage:", isPersistent);
  
  // Register background sync
  await syncDrafts();
}
```

## Available Stores

The following IndexedDB stores are available:

- `STORES.STORIES` - Offline story data
- `STORES.CHAPTERS` - Chapter content
- `STORES.EPISODES` - Episode content  
- `STORES.METADATA` - General metadata
- `STORES.USER_DATA` - Cached user data
- `STORES.PROFILE` - Cached profile data
- `STORES.READING_PROGRESS` - Offline reading progress
- `STORES.DRAFTS` - Draft stories/chapters
- `STORES.SETTINGS` - User settings cache
- `STORES.NOTIFICATIONS` - Cached notifications
- `STORES.PENDING_ACTIONS` - Queued actions for sync

## Caching Strategies

### Service Worker Caching

- **Fonts**: CacheFirst (1 year)
- **Images**: StaleWhileRevalidate (30 days)
- **JS/CSS**: StaleWhileRevalidate (24 hours)
- **API**: NetworkFirst with 10s timeout (5 min cache)
- **Pages**: NetworkFirst with 10s timeout (24 hours cache)

### IndexedDB Caching

- **Profile Data**: 30-minute expiration
- **User Data**: Custom expiration
- **Drafts**: No expiration (manual sync)
- **Reading Progress**: Sync on change

## Best Practices

### 1. Always Check Online Status

```tsx
const isOnline = useOnlineStatus();

if (!isOnline) {
  // Show offline message
  // Save to queue instead of immediate sync
}
```

### 2. Provide Feedback

```tsx
import { showToast } from "@/lib/showNotification";

if (!isOnline) {
  showToast("Changes saved locally. Will sync when online.", "info");
}
```

### 3. Handle Expired Cache

```tsx
const cached = await db.get(STORES.PROFILE, userId);

if (cached && cached.expiresAt < Date.now()) {
  // Cache expired, try to refresh if online
  if (isOnline) {
    await fetchFreshData();
  } else {
    // Use expired data with warning
    showToast("Using cached data", "warning");
  }
}
```

### 4. Queue Actions When Offline

```tsx
if (!isOnline) {
  // Save to pending actions
  await db.put(STORES.PENDING_ACTIONS, {
    id: crypto.randomUUID(),
    type: "profile_update",
    payload: updateData,
    createdAt: Date.now(),
    retryCount: 0,
  });
}
```

### 5. Sync When Online

```tsx
const { scrollY } = useScroll();
const isOnline = useOnlineStatus();

useEffect(() => {
  if (isOnline) {
    syncPendingActions();
  }
}, [isOnline]);
```

## Common Patterns

### Offline-First Data Fetching

```tsx
async function fetchWithOfflineSupport(userId: string) {
  const db = await getDB();
  
  // Try cache first
  const cached = await db.get(STORES.USER_DATA, userId);
  
  if (cached && Date.now() - cached.cachedAt < 30 * 60 * 1000) {
    return cached.data;
  }
  
  // Try network
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    
    // Update cache
    await db.put(STORES.USER_DATA, {
      id: userId,
      userId,
      data,
      cachedAt: Date.now(),
    });
    
    return data;
  } catch (error) {
    // Network failed, return cached data if available
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}
```

### Draft Auto-Save with Queue

```tsx
function useAutoSaveDraft() {
  const { saveDraft } = useDraftQueue(userId);
  const isOnline = useOnlineStatus();
  
  const autoSave = useCallback(
    debounce(async (content) => {
      await saveDraft({
        title: content.title,
        content: content.body,
        synced: false, // Will sync when online
      });
      
      if (isOnline) {
        // Trigger immediate sync if online
        await syncDrafts();
      }
    }, 2000),
    [saveDraft, isOnline]
  );
  
  return { autoSave };
}
```

## Troubleshooting

### Service Worker Not Registering

1. Check that you're using HTTPS (or localhost)
2. Verify `/sw.js` is accessible
3. Check browser console for errors
4. Ensure Serwist is configured in `next.config.js`

### IndexedDB Errors

1. Check browser support
2. Verify database version
3. Clear old data if schema changed
4. Handle quota exceeded errors

### Background Sync Not Working

1. Verify browser support
2. Check service worker registration
3. Ensure sync tag is registered correctly
4. Test in production (doesn't work in all dev environments)

## Testing

### Test Offline Mode

1. Open DevTools
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Test app functionality

### Test Service Worker

1. Open DevTools
2. Go to Application tab
3. Check Service Workers section
4. Verify registration and status

### Test IndexedDB

1. Open DevTools  
2. Go to Application tab
3. Check IndexedDB section
4. Verify data is being stored

## Migration from Old Code

If you have existing IndexedDB code, migrate to the new `idb` library:

### Before (Raw IndexedDB)

```tsx
const request = indexedDB.open("myDB", 1);
request.onsuccess = () => {
  const db = request.result;
  // ... more code
};
```

### After (idb Library)

```tsx
import { getDB, STORES } from "@/lib/offline/db";

const db = await getDB();
const data = await db.get(STORES.STORIES, id);
```

Much cleaner and uses Promises!
