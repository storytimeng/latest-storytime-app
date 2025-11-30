# Complete API Integration Plan

## ✅ Fixed Issues
- [x] Infinite scroll page reload - Added `keepPreviousData` to all category hooks

## Views & API Integration Status

### 🏠 Home & Discovery
- [x] **homeView.tsx** - Trending, Popular, Recent stories with infinite scroll
- [x] **searchView.tsx** - Search stories
- [x] **categoryView.tsx** - Category-specific stories
- [x] **genresView.tsx** - All genres display
- [x] **storyCard.tsx** - Click navigation to `/story/[id]` ✅

### 📖 Story Detail & Reading
- [x] **singleStory.tsx** (`/story/[id]`)
  - [x] Fetch story using `storiesControllerFindOne`
  - [x] Display like count using `storiesControllerGetStoryLikeCount`
  - [x] Display comment count using `storiesControllerGetStoryCommentCount`
  - [x] Add like button using `storiesControllerLikeStory` / `storiesControllerUnlikeStory`
  - [x] Check user like status using `storiesControllerCheckUserLike`
  - [x] Navigate to reading page on "Read More"

- [x] **Story Reading Page** (`/story/[id]/read`)
  - [x] Create new reading view component (`ReadStoryView`)
  - [x] Fetch story chapters using `storiesControllerGetStoryChapters`
  - [x] Fetch story episodes using `storiesControllerGetStoryEpisodes`
  - [x] Display story content
  - [ ] Track reading progress using `usersControllerUpdateReadingProgress`
  - [ ] Get reading progress using `usersControllerGetReadingProgress`
  - [x] Add comment section:
    - [x] Display comments using `storiesControllerGetStoryComments`
    - [x] Create comment using `storiesControllerCreateComment`
    - [ ] Update own comment using `storiesControllerUpdateComment`
    - [ ] Delete own comment using `storiesControllerDeleteComment`
  - [x] Add like functionality at bottom

### 📚 Library
- [ ] **libraryView.tsx** / **newLibraryView.tsx**
  - [ ] Fetch user's library using `storiesControllerGetMyLibrary`
  - [ ] Display user's created stories
  - [ ] Add filters (ongoing, completed, drafts)
  - [ ] Fetch reading history using `usersControllerGetReadingHistory`
  - [ ] Fetch reading progress using `usersControllerGetAllReadingProgress`
  - [ ] Display progress bars for stories being read

### ✍️ Pen (Writing)
  - [ ] Display reading history

- [ ] **settingsView.tsx**
  - [ ] Update user profile
  - [ ] Manage preferences

- [ ] **premiumView.tsx**
  - [ ] Premium subscription management

## Custom Hooks to Create

### Story Hooks
- [ ] `useStory(id)` - Fetch single story
- [ ] `useStoryLikes(id)` - Like count + user like status
- [ ] `useStoryComments(id)` - Comments with pagination
- [ ] `useStoryChapters(id)` - Story chapters
- [ ] `useStoryEpisodes(id)` - Story episodes

### User Hooks
- [ ] `useReadingProgress(storyId)` - Get/update progress for story
- [ ] `useReadingHistory()` - All read stories
- [ ] `useUserLibrary()` - User's created stories
- [ ] `useUserStats()` - User statistics

### Notification Hooks
- [ ] `useNotifications()` - All notifications with filters
- [ ] `useUnreadCount()` - Unread notification count

## Implementation Priority

### Phase 1: Story Detail & Reading (HIGH)
1. Fix StoryCard click navigation
2. Implement singleStory.tsx with API integration
3. Create reading page with chapters/episodes
4. Add like/comment functionality

### Phase 2: Library & Reading Progress (HIGH)
1. Integrate library with user's stories
2. Add reading progress tracking
3. Display reading history

### Phase 3: Pen/Writing (MEDIUM)
1. Integrate story creation
2. Implement story editing
3. Add chapter/episode management

### Phase 4: Notifications (MEDIUM)
1. Fetch and display notifications
2. Add filtering and actions
3. Implement navigation from notifications

### Phase 5: Profile & Stats (LOW)
1. Display user statistics
2. Show badges and achievements
3. Profile management

## Next Steps
1. Start with Phase 1: Story Detail pages
2. Create custom hooks as needed
3. Update task.md as we progress
