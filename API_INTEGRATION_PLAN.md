# Complete API Integration Plan

## ✅ Fixed Issues

- [x] Infinite scroll page reload - Added `keepPreviousData` to all category hooks
- [x] Home view re-render on scroll - Memoized story sections + React.memo on StoryGroup + array reference optimization ✅
- [x] Token refresh not saving - Fixed useAuthStore to properly persist both tokens
- [x] Notifications not showing - Fixed data unwrapping in useNotifications hook

## Views & API Integration Status

### 🏠 Home & Discovery

- [x] **homeView.tsx** - Trending, Popular, Recent stories with infinite scroll ✅
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

- [x] **Story Reading Page** (`/story/[id]/read`) ✅
  - [x] Create new reading view component (`ReadStoryView`)
  - [x] Fetch story chapters using `storiesControllerGetStoryChapters`
  - [x] Fetch story episodes using `storiesControllerGetStoryEpisodes`
  - [x] Display story content with chapter/episode navigation
  - [ ] Track reading progress using `usersControllerUpdateReadingProgress`
  - [ ] Get reading progress using `usersControllerGetReadingProgress`
  - [x] Add comment section:
    - [x] Display comments using `storiesControllerGetStoryComments`
    - [x] Create comment using `storiesControllerCreateComment`
    - [ ] Update own comment using `storiesControllerUpdateComment`
    - [ ] Delete own comment using `storiesControllerDeleteComment`
  - [x] Add like functionality at bottom

### 📚 Library

- [x] **libraryView.tsx** / **newLibraryView.tsx** ✅
  - [x] Fetch user's library using `storiesControllerGetMyLibrary`
  - [x] Display library stories in grid layout
  - [x] Add loading states
  - [x] Add empty state for no stories
  - [x] Tabs for "My Library" and "My Downloads"
  - [ ] Implement downloads functionality
  - [ ] Fetch reading history using `usersControllerGetReadingHistory`
  - [ ] Fetch reading progress using `usersControllerGetAllReadingProgress`
  - [ ] Display progress bars for stories being read

### ✍️ Pen (Writing)

- [x] **penView.tsx** - User's created stories ✅

  - [x] Fetch user profile using `useUserProfile`
  - [x] Fetch user's stories using `useStories` with author filter
  - [x] Display stories in tabs (Recent, Ongoing, Published, Drafts)
  - [x] Filter stories by status
  - [x] Navigate to edit story page
  - [x] Delete story using `storiesControllerRemove` ✅
  - [x] Create delete hook with optimistic update ✅
  - [x] Add loading states for delete operation ✅
  - [ ] Show success/error notifications (toast/notification system pending)

- [x] **edit-story/[id]** - Edit existing story ✅

  - [x] Fetch story using `storiesControllerFindOne` via `useFetchStory` hook
  - [x] Update story using `storiesControllerUpdate` via `useUpdateStory` hook
  - [x] Transform form data to API format
  - [x] Handle navigation after successful update
  - [ ] Manage chapters using:
    - [ ] `storiesControllerCreateChapter`
    - [ ] `storiesControllerUpdateChapter`
    - [ ] `storiesControllerDeleteChapter`
  - [ ] Manage episodes using:
    - [ ] `storiesControllerCreateEpisode`
    - [ ] `storiesControllerUpdateEpisode`
    - [ ] `storiesControllerDeleteEpisode`

- [x] **new-story** - Create new story ✅
  - [x] Create story using `storiesControllerCreate` via `useCreateStory` hook
  - [x] Transform form data to API format
  - [x] Handle user authentication check
  - [x] Navigate based on story status (draft vs published)
  - [ ] Handle file uploads for cover image (form already has UI)
  - [ ] Genre selection (already implemented in form)
  - [ ] Story metadata (already implemented in form)

### 📚 Library
