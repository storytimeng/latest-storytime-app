# PWA Icons

This directory contains the PWA app icons in various sizes.

## Required Icon Sizes

The following icon sizes are needed for full PWA support:

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## How to Generate Icons

1. **Create a high-resolution icon (512x512 or larger)** with your app logo
2. **Use an online tool** to generate all required sizes:

   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/
   - https://favicon.io/

3. **OR use a script** to generate icons from a source image:
   ```bash
   # Using ImageMagick
   convert icon-source.png -resize 72x72 icon-72x72.png
   convert icon-source.png -resize 96x96 icon-96x96.png
   convert icon-source.png -resize 128x128 icon-128x128.png
   convert icon-source.png -resize 144x144 icon-144x144.png
   convert icon-source.png -resize 152x152 icon-152x152.png
   convert icon-source.png -resize 192x192 icon-192x192.png
   convert icon-source.png -resize 384x384 icon-384x384.png
   convert icon-source.png -resize 512x512 icon-512x512.png
   ```

## Design Guidelines

- Use a **square image** (1:1 aspect ratio)
- **Solid background** recommended (use brand color #F8951D or #FFEBD0)
- **Simple, clear logo** that works at small sizes
- **Padding** of 10-15% around the logo for better appearance
- **Maskable icons**: Ensure important content stays within the safe zone (center 80%)

## Temporary Placeholder

Currently using placeholder icons. Replace with actual branded icons before production deployment.
