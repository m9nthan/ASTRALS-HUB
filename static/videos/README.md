# Splash Screen Video

## How to Add Your Video

1. **Video Requirements:**
   - Format: MP4 (primary) and WebM (fallback)
   - Duration: 3-5 seconds (loops automatically)
   - Resolution: 1920x1080 or higher
   - File size: Keep under 5MB for fast loading
   - Content: Space/astronomy themed videos work best

2. **File Names:**
   - `splash-video.mp4` (primary format)
   - `splash-video.webm` (fallback format)

3. **Video Suggestions:**
   - Animated space scenes
   - Floating planets and stars
   - Rocket launches
   - Galaxy animations
   - Particle effects

4. **Free Video Sources:**
   - Pixabay (pixabay.com)
   - Pexels (pexels.com)
   - Unsplash (unsplash.com)
   - NASA's video library

5. **Video Conversion:**
   - Use online converters like CloudConvert
   - Or use FFmpeg: `ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac splash-video.mp4`

## Current Setup

The splash screen is configured to:
- Play video automatically (muted)
- Loop continuously
- Fade out after 3 seconds
- Fall back to gradient background if video fails to load
- Maintain 30% opacity so text remains readable

## Customization

You can modify the video opacity in `styles.css`:
```css
.splash-video {
    opacity: 0.3; /* Change this value (0.1 to 1.0) */
}
```

