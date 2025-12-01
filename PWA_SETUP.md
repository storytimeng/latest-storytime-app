# Progressive Web App (PWA) Setup

This document outlines the PWA setup for Storytime, enabling users to install the app on their devices for an app-like experience with offline capabilities.

## ✅ Completed Setup

### 1. PWA Plugin Configuration

- **Installed**: `next-pwa@5.6.0`
- **Configuration**: `next.config.js` wrapped with PWA plugin
- **Service Worker**: Auto-generated in production builds
- **Disabled in Development**: SW only works in production mode

### 2. Web App Manifest

**Location**: `/public/manifest.json`

Key Features:

- App Name: "Storytime - Read & Write Stories"
- Short Name: "Storytime"
- Display Mode: `standalone` (full-screen app experience)
- Theme Color: `#F8951D` (brand orange)
- Background Color: `#FFEBD0` (brand cream)
- Start URL: `/`
- Orientation: `portrait`

### 3. PWA Meta Tags

**Location**: `app/layout.tsx`

Added meta tags:

- Manifest link
- Apple Web App capable
- Viewport settings optimized for mobile
- Theme color for browser chrome

### 4. App Icons

**Location**: `/public/icons/`

Generated 8 icon sizes (72x72 to 512x512):

- ✅ Placeholder icons created
- 🔄 **TODO**: Replace with branded icons before production

## 📱 Installation Experience

### Desktop

1. Visit the site in Chrome/Edge
2. Look for install icon in address bar
3. Click to install as desktop app

### Mobile (Android)

1. Visit site in Chrome
2. Tap browser menu (⋮)
3. Select "Add to Home Screen"
4. App installs with icon on home screen

### Mobile (iOS)

1. Visit site in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App installs with icon

## 🔧 Service Worker Features

The auto-generated service worker provides:

### Caching Strategy

- **Static Assets**: Pre-cached for instant loading
- **Pages**: Cached after first visit
- **API Calls**: Network-first with fallback
- **Images**: Cache-first for performance

### Offline Support

- **Downloaded Stories**: Fully functional offline via IndexedDB
- **Static Pages**: Cached and available offline
- **Graceful Degradation**: Online-only features disabled when offline

### Auto-Updates

- **Background Sync**: Updates cache in background
- **Skip Waiting**: New versions activate immediately
- **User Notification**: Can add update prompts if needed

## 🎨 Customizing Icons

### Using Logo.png

If you have `public/images/logo.png`:

1. **Online Tool** (Recommended):

   - Visit https://www.pwabuilder.com/imageGenerator
   - Upload `public/images/logo.png`
   - Download generated icons
   - Extract to `public/icons/`

2. **ImageMagick** (Command Line):
   ```bash
   # Install ImageMagick first
   # Then run:
   .\generate-pwa-icons.ps1
   ```

### Icon Design Guidelines

- **Square Format**: 1:1 aspect ratio
- **Safe Zone**: Keep important content in center 80%
- **Background**: Solid color (#F8951D or #FFEBD0)
- **Logo**: Clear and simple for small sizes
- **Padding**: 10-15% around logo

## 🚀 Production Deployment

### Build for Production

```bash
pnpm build
```

This will:

- Generate service worker (`sw.js`)
- Pre-cache static assets
- Optimize for offline use

### Testing PWA

1. **Build Production Bundle**:

   ```bash
   pnpm build
   pnpm start
   ```

2. **Test with Lighthouse**:

   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run PWA audit
   - Aim for 100% PWA score

3. **Test Offline**:
   - Install the app
   - Open DevTools → Network → Offline
   - Navigate the app
   - Verify offline functionality

## 📊 PWA Checklist

- ✅ Manifest.json configured
- ✅ Service worker enabled
- ✅ Icons (8 sizes)
- ✅ Meta tags for mobile
- ✅ HTTPS (required for PWA)
- ✅ Offline fallback pages
- ✅ IndexedDB for offline data
- ✅ Theme colors set
- ✅ Viewport optimized
- 🔄 Replace placeholder icons
- 🔄 Test on real devices
- 🔄 Monitor service worker updates

## 🛠️ Advanced Configuration

### Custom Service Worker

To add custom SW logic, create `worker/index.js`:

```javascript
// Custom service worker logic
self.addEventListener("push", (event) => {
  // Handle push notifications
});
```

### Update Prompts

Add update notification in `app/layout.tsx`:

```typescript
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      showToast.success("App updated! Refresh for new features.");
    });
  }
}, []);
```

## 🐛 Troubleshooting

### Service Worker Not Updating

```bash
# Clear cache and rebuild
rm -rf .next
rm -rf public/sw.js*
pnpm build
```

### Icons Not Showing

1. Check manifest.json path is correct
2. Verify icon files exist in `/public/icons/`
3. Clear browser cache
4. Check console for manifest errors

### Install Prompt Not Appearing

- Ensure HTTPS is enabled
- Check manifest is valid (DevTools → Application → Manifest)
- Verify icons meet size requirements
- Some browsers delay prompt until user engagement

## 📚 Resources

- [Next-PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## 🔄 Next Steps

1. **Replace Icons**: Use branded logo for all icon sizes
2. **Test Installation**: Try installing on iOS and Android
3. **Performance Audit**: Run Lighthouse and optimize
4. **User Testing**: Validate offline experience
5. **Monitor**: Track PWA install rates and usage
