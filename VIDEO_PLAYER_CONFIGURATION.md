# Video.js Player Configuration Guide

## Overview

This document provides comprehensive configuration options for the UnifiedVideoPlayer component, covering all Video.js settings, YouTube integration, DRM protection, and adaptive streaming features.

## Table of Contents

1. [Basic Player Configuration](#basic-player-configuration)
2. [YouTube Integration](#youtube-integration)
3. [DRM Protection](#drm-protection)
4. [Adaptive Streaming](#adaptive-streaming)
5. [Advanced Features](#advanced-features)
6. [Event Handling](#event-handling)
7. [Styling and Theming](#styling-and-theming)
8. [Performance Optimization](#performance-optimization)

## Basic Player Configuration

### Core Settings

```tsx
const playerConfig = {
  // Basic Controls
  controls: true, // Show/hide control bar
  responsive: true, // Make player responsive
  fluid: true, // Fluid aspect ratio
  aspectRatio: "16:9", // Fixed aspect ratio (overrides fluid)

  // Playback Settings
  autoplay: false, // Auto-start playback
  muted: false, // Start muted
  loop: false, // Loop video
  preload: "metadata", // "none", "metadata", "auto"

  // Playback Speed
  playbackRates: [0.5, 1, 1.25, 1.5, 2], // Available speeds

  // Volume
  volume: 0.8, // Initial volume (0-1)

  // Poster Image
  poster: "path/to/poster.jpg", // Thumbnail image

  // Language
  language: "en", // Player language
  languages: {
    // Custom translations
    en: {
      "Play Video": "Start Learning",
    },
  },
};
```

### Video Sources

```tsx
const sources = [
  {
    src: "video.mp4",
    type: "video/mp4",
  },
  {
    src: "video.webm",
    type: "video/webm",
  },
  {
    src: "playlist.m3u8",
    type: "application/x-mpegURL",
  },
];
```

## YouTube Integration

### YouTube Configuration Options

```tsx
const youtubeConfig = {
  // Control Settings
  ytControls: 0, // 0=hide, 1=show, 2=show after delay
  controls: 0, // Disable YouTube controls

  // Branding
  modestbranding: 1, // Remove YouTube logo
  rel: 0, // Don't show related videos

  // Video Info
  showinfo: 0, // Hide video title/info
  iv_load_policy: 3, // Hide annotations

  // Captions
  cc_load_policy: 0, // Hide closed captions by default

  // Fullscreen
  fs: 0, // Disable fullscreen button

  // Keyboard
  disablekb: 1, // Disable keyboard controls

  // Auto-hide
  autohide: 1, // Auto-hide controls

  // Privacy
  enablePrivacyEnhancedMode: true, // Enhanced privacy mode

  // Display Mode
  wmode: "opaque", // Prevent overlay issues

  // Start Time
  start: 30, // Start at 30 seconds

  // End Time
  end: 120, // End at 2 minutes

  // Quality
  vq: "hd720", // Preferred quality: "small", "medium", "large", "hd720", "hd1080"

  // Playlist
  list: "PLAYLIST_ID", // YouTube playlist ID
  listType: "playlist", // "playlist" or "user_uploads"

  // Loop
  loop: 1, // Loop video

  // Color
  color: "white", // Progress bar color: "red" or "white"

  // Theme
  theme: "dark", // "dark" or "light"
};
```

### YouTube URL Formats Supported

```tsx
// Standard URLs
"https://www.youtube.com/watch?v=VIDEO_ID";
"https://youtu.be/VIDEO_ID";

// With Parameters
"https://www.youtube.com/watch?v=VIDEO_ID&t=30s";
"https://www.youtube.com/watch?v=VIDEO_ID&start=30&end=120";

// Playlist URLs
"https://www.youtube.com/playlist?list=PLAYLIST_ID";
"https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID";
```

## DRM Protection

### DRM Configuration

```tsx
interface DRMConfig {
  keySystems: {
    // Google Widevine (Chrome, Android)
    "com.widevine.alpha": {
      licenseUrl: "https://license-server.com/widevine";
      headers?: {
        Authorization: "Bearer token";
        "Content-Type": "application/json";
      };
      audioCapabilities?: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }];
      videoCapabilities?: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }];
    };

    // Microsoft PlayReady (Edge, Windows)
    "com.microsoft.playready": {
      licenseUrl: "https://license-server.com/playready";
      headers?: {
        Authorization: "Bearer token";
      };
    };

    // Apple FairPlay (Safari, iOS, macOS)
    "com.apple.fps.1_0": {
      licenseUrl: "https://license-server.com/fairplay";
      headers?: {
        Authorization: "Bearer token";
      };
      certificateUrl?: "https://cert-server.com/certificate";
    };
  };

  // Optional: Custom license request handling
  licenseRequestHandler?: (request: any) => Promise<any>;

  // Optional: Custom key request handling
  keyRequestHandler?: (request: any) => Promise<any>;
}
```

### DRM Event Handling

```tsx
// DRM Events
player.on("loadedmetadata", () => {
  console.log("DRM: Video metadata loaded");
});

player.on("error", (error) => {
  if (error.code === 4) {
    console.error("DRM: License request failed");
  } else if (error.code === 5) {
    console.error("DRM: License expired");
  }
});

player.on("keyload", () => {
  console.log("DRM: Key loaded successfully");
});

player.on("keyerror", (error) => {
  console.error("DRM: Key error:", error);
});
```

## Adaptive Streaming

### HLS Configuration

```tsx
const hlsConfig = {
  // Enable HLS
  html5: {
    hls: {
      enableLowInitialPlaylist: true,
      smoothQualityChange: true,
      overrideNative: true,
    },
  },

  // Quality Levels
  qualityLevels: [
    { width: 1920, height: 1080, bitrate: 5000000, label: "1080p" },
    { width: 1280, height: 720, bitrate: 3000000, label: "720p" },
    { width: 854, height: 480, bitrate: 1500000, label: "480p" },
    { width: 640, height: 360, bitrate: 800000, label: "360p" },
  ],

  // Adaptive Settings
  adaptiveBitrate: true,
  bandwidth: 5000000, // Max bandwidth in bits/sec

  // Buffer Settings
  bufferSize: 30, // Buffer size in seconds
  maxBufferSize: 60, // Max buffer size

  // Retry Settings
  maxRetries: 3,
  retryDelay: 1000,
};
```

### DASH Configuration

```tsx
const dashConfig = {
  html5: {
    dash: {
      overrideNative: true,
      limitRenditionByPlayerDimensions: true,
      limitBitrateByPortal: true,
    },
  },
};
```

## Advanced Features

### Analytics and Tracking

```tsx
const analyticsConfig = {
  // Google Analytics
  analytics: {
    trackingId: "GA_TRACKING_ID",
    events: {
      play: true,
      pause: true,
      ended: true,
      timeupdate: true,
      seek: true,
    },
  },

  // Custom Analytics
  customAnalytics: {
    endpoint: "https://analytics.example.com/track",
    events: ["play", "pause", "complete", "seek"],
  },
};
```

### Accessibility

```tsx
const accessibilityConfig = {
  // Keyboard Navigation
  keyboard: {
    alwaysUseTabStops: true,
    enableSmoothSeeking: true,
  },

  // Screen Reader Support
  screenReader: {
    announceVideoLoad: true,
    announceVideoPlay: true,
  },

  // ARIA Labels
  ariaLabels: {
    playButton: "Start video playback",
    pauseButton: "Pause video playback",
    muteButton: "Mute audio",
  },
};
```

### Error Handling

```tsx
const errorConfig = {
  // Error Messages
  errorDisplay: true,
  errorTimeout: 5000,

  // Custom Error Handler
  errorHandler: (error) => {
    console.error("Video error:", error);
    // Custom error handling logic
  },

  // Retry Logic
  retryOnError: true,
  maxRetries: 3,
  retryDelay: 2000,
};
```

## Event Handling

### Player Events

```tsx
// Lifecycle Events
player.on("loadstart", () => console.log("Loading started"));
player.on("loadedmetadata", () => console.log("Metadata loaded"));
player.on("loadeddata", () => console.log("Data loaded"));
player.on("canplay", () => console.log("Can start playing"));
player.on("canplaythrough", () => console.log("Can play through"));

// Playback Events
player.on("play", () => console.log("Playback started"));
player.on("pause", () => console.log("Playback paused"));
player.on("ended", () => console.log("Playback ended"));
player.on("seeking", () => console.log("Seeking"));
player.on("seeked", () => console.log("Seek completed"));

// Time Events
player.on("timeupdate", () => {
  const currentTime = player.currentTime();
  const duration = player.duration();
  console.log(`Time: ${currentTime}/${duration}`);
});

// Volume Events
player.on("volumechange", () => {
  const volume = player.volume();
  const muted = player.muted();
  console.log(`Volume: ${volume}, Muted: ${muted}`);
});

// Error Events
player.on("error", (error) => {
  console.error("Player error:", error);
});

// Custom Events
player.on("customEvent", (data) => {
  console.log("Custom event:", data);
});
```

### Progress Tracking

```tsx
// Track viewing progress
let lastProgressUpdate = 0;
player.on("timeupdate", () => {
  const currentTime = player.currentTime();
  const duration = player.duration();
  const progress = (currentTime / duration) * 100;

  // Update every 5 seconds
  if (currentTime - lastProgressUpdate >= 5) {
    lastProgressUpdate = currentTime;
    trackProgress(progress);
  }
});

// Track completion
player.on("ended", () => {
  trackCompletion();
});
```

## Styling and Theming

### CSS Customization

```css
/* Custom Player Styles */
.video-js {
  /* Player container */
  background-color: #000;
  border-radius: 8px;
}

.video-js .vjs-control-bar {
  /* Control bar */
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  height: 60px;
}

.video-js .vjs-big-play-button {
  /* Big play button */
  background-color: rgba(43, 51, 63, 0.7);
  border-radius: 50%;
  width: 80px;
  height: 80px;
}

/* Hide YouTube Controls */
.youtube-clean-player .ytp-chrome-top,
.youtube-clean-player .ytp-chrome-bottom,
.youtube-clean-player .ytp-watermark {
  display: none !important;
}
```

### Theme Configuration

```tsx
const themeConfig = {
  // Color Scheme
  colors: {
    primary: "#007bff",
    secondary: "#6c757d",
    success: "#28a745",
    danger: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  },

  // Typography
  typography: {
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  },

  // Spacing
  spacing: {
    controlBarHeight: "60px",
    borderRadius: "8px",
  },
};
```

## Performance Optimization

### Loading Optimization

```tsx
const performanceConfig = {
  // Preload Settings
  preload: "metadata", // "none", "metadata", "auto"

  // Lazy Loading
  lazyLoad: true,
  lazyLoadOffset: 100, // Pixels from viewport

  // Buffer Settings
  bufferSize: 30, // Seconds to buffer
  maxBufferSize: 60, // Max buffer size

  // Quality Settings
  defaultQuality: "auto", // Auto-select quality
  qualityLevels: "auto", // Auto-detect levels

  // Network Optimization
  bandwidth: 5000000, // Max bandwidth
  adaptiveBitrate: true, // Enable ABR
};
```

### Memory Management

```tsx
// Cleanup on component unmount
useEffect(() => {
  return () => {
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
  };
}, []);

// Dispose and recreate on source change
const changeSource = (newSrc) => {
  if (playerRef.current) {
    playerRef.current.dispose();
    playerRef.current = null;
    // Reinitialize with new source
  }
};
```

## Complete Configuration Example

```tsx
const completeConfig = {
  // Basic Settings
  controls: true,
  responsive: true,
  fluid: true,
  autoplay: false,
  muted: false,
  preload: "metadata",

  // Playback
  playbackRates: [0.5, 1, 1.25, 1.5, 2],
  volume: 0.8,

  // YouTube Integration
  youtube: {
    ytControls: 0,
    modestbranding: 1,
    rel: 0,
    showinfo: 0,
    enablePrivacyEnhancedMode: true,
  },

  // DRM Protection
  eme: {
    keySystems: {
      "com.widevine.alpha": {
        licenseUrl: "https://license-server.com/widevine",
      },
    },
  },

  // Adaptive Streaming
  html5: {
    hls: {
      enableLowInitialPlaylist: true,
      smoothQualityChange: true,
    },
  },

  // Error Handling
  errorDisplay: true,
  retryOnError: true,
  maxRetries: 3,

  // Analytics
  analytics: {
    trackingId: "GA_TRACKING_ID",
    events: ["play", "pause", "complete"],
  },
};
```

## Best Practices

1. **Always dispose players** when components unmount
2. **Use responsive/fluid** for mobile compatibility
3. **Enable error handling** for production environments
4. **Implement progress tracking** for analytics
5. **Use DRM** for premium content protection
6. **Optimize for performance** with proper buffer settings
7. **Test across browsers** for compatibility
8. **Implement accessibility** features for all users

## Troubleshooting

### Common Issues

- **Video not playing**: Check source URL and CORS settings
- **YouTube controls showing**: Verify `ytControls: 0` setting
- **DRM errors**: Check license server configuration
- **Performance issues**: Adjust buffer and quality settings
- **Mobile issues**: Ensure responsive configuration is enabled

### Debug Mode

```tsx
const debugConfig = {
  debug: true,
  logLevel: "debug",
  enableConsoleLogging: true,
};
```
