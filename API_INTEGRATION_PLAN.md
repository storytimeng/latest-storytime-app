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
- [ ] **singleStory.tsx** (`/story/[id]`)
  - [ ] Fetch story using `storiesControllerFindOne`
  - [ ] Display like count using `storiesControllerGetStoryLikeCount`
  - [ ] Display comment count using `storiesControllerGetStoryCommentCount`
  - [ ] Add like button using `storiesControllerLikeStory` / `storiesControllerUnlikeStory`
  - [ ] Check user like status using `storiesControllerCheckUserLike`
  - [ ] Navigate to reading page on "Read More"

- [ ] **Story Reading Page** (`/story/[id]/read`)
  - [ ] Create new reading view component
  - [ ] Fetch story chapters using `storiesControllerGetStoryChapters`
  - [ ] Fetch story episodes using `storiesControllerGetStoryEpisodes`
  - [ ] Display story content
  - [ ] Track reading progress using `usersControllerUpdateReadingProgress`
  - [ ] Get reading progress using `usersControllerGetReadingProgress`
  - [ ] Add comment section:
    - [ ] Display comments using `storiesControllerGetStoryComments`
    - [ ] Create comment using `storiesControllerCreateComment`
    - [ ] Update own comment using `storiesControllerUpdateComment`
    - [ ] Delete own comment using `storiesControllerDeleteComment`
  - [ ] Add like functionality at bottom

### 📚 Library
- [ ] **libraryView.tsx** / **newLibraryView.tsx**
  - [ ] Fetch user's library using `storiesControllerGetMyLibrary`
  - [ ] Display user's created stories
  - [ ] Add filters (ongoing, completed, drafts)
  - [ ] Fetch reading history using `usersControllerGetReadingHistory`
  - [ ] Fetch reading progress using `usersControllerGetAllReadingProgress`
  - [ ] Display progress bars for stories being read

### ✍️ Pen (Writing)
- [ ] **penView.tsx**
  - [ ] Fetch user's stories using `storiesControllerGetMyLibrary`
  - [ ] Display story cards with edit/delete actions
  - [ ] Navigate to edit story

- [ ] **myStoriesView.tsx**
  - [ ] Same as penView - consolidate if duplicate

- [ ] **newStoryView.tsx**
  - [ ] Create story form using `storiesControllerCreate`
  - [ ] Handle chapters/episodes toggle
  - [ ] Upload story image
  - [ ] Set genres, language, status

- [ ] **editStoryView.tsx**
  - [ ] Fetch story by ID using `storiesControllerFindOne`
  - [ ] Update story using `storiesControllerUpdate`
  - [ ] Delete story using `storiesControllerRemove`
  - [ ] Manage chapters using:
    - [ ] `storiesControllerCreateChapter`
    - [ ] `storiesControllerCreateMultipleChapters`
    - [ ] `storiesControllerUpdateChapter`
    - [ ] `storiesControllerDeleteChapter`
  - [ ] Manage episodes using:
    - [ ] `storiesControllerCreateEpisode`
    - [ ] `storiesControllerCreateMultipleEpisodes`
    - [ ] `storiesControllerUpdateEpisode`
    - [ ] `storiesControllerDeleteEpisode`

### 🔔 Notifications
- [ ] **notificationView.tsx**
  - [ ] Fetch notifications using `notificationsControllerGetUserNotifications`
  - [ ] Display unread count using `notificationsControllerGetUnreadCount`
  - [ ] Group by type (achievement, story_like, story_comment, etc.)
  - [ ] Filter by read/unread status
  - [ ] Mark as read using `notificationsControllerMarkAsRead`
  - [ ] Mark all as read using `notificationsControllerMarkAllAsRead`
  - [ ] Delete notification using `notificationsControllerDeleteNotification`
  - [ ] Delete all using `notificationsControllerDeleteAllNotifications`
  - [ ] Navigate to relevant story from notification

### 👤 Profile
- [ ] **profileView.tsx**
  - [ ] Fetch user stats using `usersControllerGetStats`
  - [ ] Display badges, certificates, milestones
  - [ ] Show stories read/written counts
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
