# Configuration Files

This folder contains all the configurable settings for the StoryTime application. By centralizing configuration here, you can easily customize the app without editing component files directly.

## Files

### `app.ts`

Main application configuration including:

- App name and description
- Theme settings
- Logo configuration
- Analytics IDs
- UI component settings (TopLoader, Toaster)

### `onboarding.ts`

Onboarding flow configuration including:

- Onboarding steps (title, description, images, hash IDs)
- Animation settings (durations, easing curves)
- Layout dimensions
- Navigation routes

### `routes.ts`

Application routing configuration including:

- All route paths
- Navigation rules
- Auth-required vs guest-only routes

### `index.ts`

Main export file that re-exports all configuration modules.

## Usage

Import any configuration in your components:

```typescript
import { APP_CONFIG, ONBOARDING_STEPS, ROUTES } from "@/config";

// Use app configuration
const appName = APP_CONFIG.name;

// Use onboarding steps
const steps = ONBOARDING_STEPS;

// Use routes
router.push(ROUTES.auth);
```

## Customization

To customize the app:

1. **Change App Info**: Edit `app.ts` to update app name, description, colors, etc.
2. **Modify Onboarding**: Edit `onboarding.ts` to change steps, animations, or images
3. **Update Routes**: Edit `routes.ts` to change URL paths or navigation rules
4. **Add New Config**: Create new config files and export them in `index.ts`

## Benefits

- **Centralized**: All settings in one place
- **Type-safe**: Full TypeScript support
- **Maintainable**: Easy to find and update settings
- **Reusable**: Import config anywhere in the app
- **Version Control**: Track changes to app configuration
