# PWA Migration Checklist - From next-pwa to Serwist

## ✅ Completed

- [x] Installed Serwist dependencies (`@serwist/next`, `serwist`, `idb`)
- [x] Removed next-pwa dependency
- [x] Updated `next.config.js` with Serwist configuration
- [x] Created service worker (`app/sw.ts`)
- [x] Created offline detection hook (`useOnlineStatus`)
- [x] Refactored IndexedDB to use idb library
- [x] Created offline-aware hooks (profile cache, draft queue)
- [x] Created offline UI components
- [x] Updated home page with offline indicator
- [x] Added SEO metadata for story pages
- [x] Implemented native share functionality
- [x] Updated PWAProvider for service worker registration
- [x] Created documentation

## 🔄 Pending Tasks

### High Priority

- [ ] **Test Service Worker Registration**
  - Build production bundle: `pnpm build`
  - Start production server: `pnpm start`
  - Verify `/sw.js` is accessible
  - Check DevTools > Application > Service Workers

- [ ] **Implement Pen/Write Offline Queue**
  - Integrate `useDraftQueue` in pen/write pages
  - Show unsynced indicator
  - Add manual sync button
  - Test draft saving offline

- [ ] **Profile & Settings Offline**
  - Block password changes when offline
  - Block profile edits when offline
  - Show appropriate offline messages
  - Use `useProfileCache` in profile pages

- [ ] **Reading Progress Offline**
  - Cache reading progress in IndexedDB
  - Sync progress when online
  - Handle conflicts

- [ ] **Authentication Handling**
  - Check cookie validity offline
  - Handle expired cookies
  - Create re-authentication modal
  - Test auth flow when offline->online

### Medium Priority

- [ ] **SEO for Chapter/Episode Pages**
  - Add metadata generation for `/story/[id]/read`
  - Include episode/chapter info in meta tags
  - Test social media sharing

- [ ] **Background Sync Implementation**
  - Test background sync for drafts
  - Implement sync handlers in service worker
  - Test sync on network restoration

- [ ] **Notifications Offline**
  - Cache notifications in IndexedDB
  - Display cached notifications offline
  - Sync when online

- [ ] **Settings Offline**
  - Cache settings in IndexedDB
  - Queue setting changes
  - Sync when online

### Low Priority

- [ ] **Enhanced Offline UX**
  - Add "You're back online" toast
  - Show sync progress indicator
  - Display storage usage
  - Add cache management UI

- [ ] **Performance Optimization**
  - Analyze bundle size
  - Optimize service worker caching
  - Test cache eviction strategies
  - Monitor IndexedDB size

- [ ] **Testing**
  - Write unit tests for offline hooks
  - Test on multiple browsers
  - Test on mobile devices
  - Test PWA installation

## 📋 Testing Checklist

### Service Worker
- [ ] Service worker registers successfully
- [ ] Static assets are cached
- [ ] API responses are cached
- [ ] Offline fallback works
- [ ] Update notifications appear
- [ ] Cache invalidation works

### Offline Functionality
- [ ] Home page shows offline indicator
- [ ] Downloads are accessible offline
- [ ] Stories can be read offline
- [ ] Drafts save offline
- [ ] Profile data loads from cache
- [ ] Settings load from cache

### Online/Offline Transitions
- [ ] App detects going offline
- [ ] App detects coming back online
- [ ] Queued actions sync when online
- [ ] Cache updates when online
- [ ] No data loss during transitions

### SEO & Sharing
- [ ] Story pages have correct meta tags
- [ ] Open Graph tags working
- [ ] Twitter Cards working
- [ ] Share button works on mobile
- [ ] Share button fallback works on desktop

### Cross-Browser Testing
- [ ] Chrome/Edge (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (Android)
- [ ] Safari (iOS)

### PWA Installation
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Icons display correctly
- [ ] Splash screen shows
- [ ] App runs in standalone mode

## 🐛 Known Issues

None at the moment. Please report any issues found during testing.

## 📚 Resources

- [Serwist Documentation](https://serwist.pages.dev/)
- [idb Documentation](https://github.com/jakearchibald/idb)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)

## 🎯 Next Steps

1. **Build & Test**
   ```bash
   pnpm build
   pnpm start
   ```

2. **Verify Service Worker**
   - Open DevTools > Application > Service Workers
   - Check registration status
   - Verify caching strategies

3. **Test Offline**
   - Go offline in DevTools
   - Navigate the app
   - Verify cached content loads

4. **Implement Remaining Features**
   - Follow the pending tasks above
   - Test each feature thoroughly
   - Update this checklist as you go

## 💡 Tips

- **Development Mode**: Service worker is disabled in development. Always test in production build.
- **Cache Updates**: Clear cache when testing: DevTools > Application > Clear Storage
- **Network Tab**: Use "Offline" and "Slow 3G" to test different scenarios
- **Console Logs**: Check for service worker messages in console
- **IndexedDB**: Inspect data in DevTools > Application > IndexedDB

## 🆘 Need Help?

Refer to:
- `OFFLINE_PWA_IMPLEMENTATION_SUMMARY.md` - Full implementation details
- `OFFLINE_FEATURES_GUIDE.md` - Developer guide for using offline features
- `OFFLINE_PWA_IMPLEMENTATION_PLAN.md` - Original implementation plan

---

**Last Updated**: ${new Date().toLocaleDateString()}
