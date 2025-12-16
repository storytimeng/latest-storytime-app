# Story Cache System

## Overview

The story cache system uses **IndexedDB** to store draft stories, chapters, and episodes locally, preventing data loss due to network issues or accidental navigation away from the page.

## Features

- ✅ **No Duplicates**: Uses unique IDs (`storyId_type`) to prevent duplicate entries
- ✅ **Configurable Expiration**: Set cache expiry via environment variable (0 = never expire)
- ✅ **Automatic Migration**: Migrates existing localStorage data to IndexedDB
- ✅ **Browser Warning**: Shows native warning when closing tab with unsaved changes
- ✅ **Auto-save**: Automatically caches data before navigation/exit
- ✅ **Expired Cache Cleanup**: Removes old cache entries based on expiry settings

## Environment Configuration

Add to `.env.local`:

```bash
# Cache expiration time in days (0 = never expire)
NEXT_PUBLIC_CACHE_EXPIRY_DAYS=30
```

- **Default**: 30 days
- **Never Expire**: Set to `0`
- **Custom Duration**: Any positive number (e.g., `7` for 7 days)

## IndexedDB Structure

### Database

- **Name**: `storytime_cache`
- **Version**: 1

### Object Store

- **Name**: `story_cache`
- **Key Path**: `id` (format: `{storyId}_{type}`)

### Indexes

- `storyId` - For querying all cache entries for a story
- `type` - For querying by cache type (chapters/episodes/draft)
- `timestamp` - For expiration checks

### Cache Entry Format

```typescript
interface CacheEntry {
  id: string; // e.g., "123_chapters"
  storyId: string; // Story ID
  type: "chapters" | "episodes" | "draft";
  data: Chapter[] | Part[] | Partial<StoryFormData>;
  timestamp: number; // Creation timestamp
}
```

## API Usage

### Save Data

```typescript
import { saveChaptersCache, saveEpisodesCache } from "@/lib/storyCache";

// Save chapters (automatically prevents duplicates)
await saveChaptersCache(storyId, chapters);

// Save episodes
await saveEpisodesCache(storyId, episodes);
```

### Retrieve Data

```typescript
import { getChaptersCache, getEpisodesCache } from "@/lib/storyCache";

// Get chapters
const chapters = await getChaptersCache(storyId);

// Get episodes
const episodes = await getEpisodesCache(storyId);
```

### Check Cache

```typescript
import { hasCachedData } from "@/lib/storyCache";

const cached = await hasCachedData(storyId);
// Returns: { hasChapters: boolean, hasEpisodes: boolean }
```

### Clear Cache

```typescript
import { clearStoryCache } from "@/lib/storyCache";

// Clear cache for a specific story
await clearStoryCache(storyId);
```

### Clear Expired

```typescript
import { clearExpiredCaches } from "@/lib/storyCache";

// Clear all expired cache entries
await clearExpiredCaches();
```

## Migration from localStorage

The system automatically migrates existing localStorage data to IndexedDB on first load.

### Manual Migration

```typescript
import {
  migrateLocalStorageToIndexedDB,
  needsMigration,
} from "@/lib/cacheMigration";

if (needsMigration()) {
  const result = await migrateLocalStorageToIndexedDB();
  console.log(`Migrated ${result.migratedCount} items`);
}
```

### Migration Process

1. Checks for old localStorage keys:
   - `story_draft_*`
   - `story_chapters_*`
   - `story_episodes_*`
2. Migrates each entry to IndexedDB
3. Removes old localStorage entries
4. Reports success/errors

## Unsaved Changes Warning

### Browser Warning

When user tries to close tab/refresh with unsaved changes:

- Native browser dialog shown
- Data automatically cached to IndexedDB
- User can confirm or cancel

### Navigation Warning

When user navigates away within the app:

- Confirmation dialog shown
- Data cached before navigation
- Toast notification confirms save

### Usage in Components

```typescript
import { useUnsavedChangesWarning } from "@/src/hooks/useUnsavedChangesWarning";

const { confirmNavigation } = useUnsavedChangesWarning({
  hasUnsavedChanges: true,
  onSave: () => {
    // Cache data before exit
    saveChaptersCache(storyId, chapters);
  },
  message: "You have unsaved changes...",
});
```

## Active Pages

The cache system is automatically integrated into:

- `/new-story` (create mode)
- `/edit-story/[id]` (edit mode)
- Any component using `StoryForm`

## Cache Lifecycle

1. **Create/Edit Story**: User starts creating or editing
2. **Auto-tracking**: Changes tracked automatically
3. **Navigation Attempt**: Browser/app warning shown
4. **Auto-cache**: Data saved to IndexedDB before exit
5. **Return**: User returns, cache modal offers to restore
6. **Publish**: Cache cleared after successful publish
7. **Expiry**: Old caches auto-deleted based on `CACHE_EXPIRY_DAYS`

## Benefits Over localStorage

| Feature              | localStorage     | IndexedDB                  |
| -------------------- | ---------------- | -------------------------- |
| Duplicate Prevention | ❌ Manual        | ✅ Automatic (unique keys) |
| Storage Limit        | ~5-10MB          | ~50MB+ (browser dependent) |
| Large Data           | ❌ Slow          | ✅ Fast                    |
| Async Operations     | ❌ Blocking      | ✅ Non-blocking            |
| Expiration Check     | Manual iteration | Indexed queries            |
| Transaction Support  | ❌ No            | ✅ Yes                     |

## Troubleshooting

### Cache Not Saving

- Check browser DevTools → Application → IndexedDB → `storytime_cache`
- Ensure `storyId` is valid
- Check console for errors

### Cache Not Loading

- Verify cache not expired (check timestamp vs `CACHE_EXPIRY_DAYS`)
- Check browser IndexedDB support
- Review console logs

### Migration Issues

- Check localStorage for old entries
- Run `needsMigration()` in console
- Manually trigger migration if needed

### Clear All Cache

```javascript
// In browser console
indexedDB.deleteDatabase("storytime_cache");
```

## Browser Support

IndexedDB is supported in all modern browsers:

- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ Opera 15+
