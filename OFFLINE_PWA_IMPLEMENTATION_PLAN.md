# Offline PWA Implementation Plan

## Overview

Transform the Storytime app into a fully offline-capable Progressive Web App (PWA) with comprehensive offline functionality.

## Phase 1: Infrastructure Setup

- [x] Analyze current PWA setup (next-pwa)
- [ ] Migrate from next-pwa to Serwist
- [ ] Install dependencies (serwist, idb)
- [ ] Refactor all IndexedDB usage to use idb library

## Phase 2: Core Offline Functionality

- [ ] Create offline detection hook (useOnlineStatus)
- [ ] Build offline-aware data caching layer
- [ ] Create IndexedDB stores for:
  - User data
  - Profile data
  - Stories metadata
  - Reading progress
  - Pen/draft queue
  - Settings
  - Notifications

## Phase 3: Service Worker Configuration

- [ ] Configure Serwist service worker with:
  - Static asset caching (HTML, CSS, JS)
  - Image caching strategy
  - API response caching
  - Runtime caching rules
  - Offline fallback pages
  - Background sync for pending actions

## Phase 4: Page-Specific Offline Features

### Home Page

- [ ] Create offline home component
- [ ] Show offline indicator
- [ ] Add "Go to Downloads" button
- [ ] Cache home page metadata

### Library/Downloads

- [ ] Ensure downloads tab works offline
- [ ] Enable story reading from IndexedDB
- [ ] Maintain reading progress offline

### Pen/Write

- [ ] Implement draft queue system
- [ ] Save drafts to IndexedDB
- [ ] Show unsynchronized status indicator
- [ ] Add manual sync button
- [ ] Background sync when online

### Profile

- [ ] Cache profile data in IndexedDB
- [ ] Allow viewing profile offline
- [ ] Block password changes offline
- [ ] Block profile edits offline
- [ ] Show appropriate offline messages

### Settings

- [ ] Cache settings in IndexedDB
- [ ] Allow viewing settings offline
- [ ] Queue setting changes for sync

### Notifications

- [ ] Cache notifications in IndexedDB
- [ ] Display cached notifications offline

## Phase 5: Authentication & Cookie Handling

- [ ] Check cookie validity offline
- [ ] Handle expired cookies gracefully
- [ ] Show re-authentication modal when needed
- [ ] Implement retry logic on network restoration

## Phase 6: SEO Implementation

- [ ] Add dynamic meta tags for /story/[id]
- [ ] Add dynamic meta tags for /story/[id]/read
- [ ] Implement Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Support episode-based SEO metadata

## Phase 7: Native Share Functionality

- [ ] Implement Web Share API
- [ ] Add fallback for unsupported browsers
- [ ] Add share buttons to story pages
- [ ] Include story metadata in shares

## Phase 8: Metadata & Route Configuration

- [ ] Update next.config with offline routes
- [ ] Configure metadata for all routes
- [ ] Ensure all routes have offline fallbacks
- [ ] Add offline page route

## Phase 9: Testing & Optimization

- [ ] Test offline functionality on all pages
- [ ] Test background sync
- [ ] Test cache invalidation
- [ ] Verify SEO meta tags
- [ ] Test native share on devices
- [ ] Performance optimization

## Technical Stack Changes

- **Remove**: next-pwa
- **Add**: @serwist/next, serwist
- **Add**: idb (for better IndexedDB handling)
- **Refactor**: All raw IndexedDB to use idb library

## Key Features

1. ✅ Full offline functionality
2. ✅ Smart caching strategy
3. ✅ Background sync for drafts/actions
4. ✅ Offline-first data layer
5. ✅ Native PWA experience
6. ✅ SEO optimization
7. ✅ Native sharing
8. ✅ Cookie-based auth handling

## Success Criteria

- [ ] App loads and functions offline
- [ ] All cached pages accessible offline
- [ ] Drafts/stories save offline and sync when online
- [ ] SEO meta tags working for story pages
- [ ] Share functionality working on native devices
- [ ] Smooth online/offline transitions
- [ ] No data loss during offline usage
