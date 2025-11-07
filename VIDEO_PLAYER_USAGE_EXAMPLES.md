# UnifiedVideoPlayer Usage Examples

This document provides practical examples of how to use the UnifiedVideoPlayer component with different configurations and features.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [YouTube Integration](#youtube-integration)
3. [DRM Protected Content](#drm-protected-content)
4. [Adaptive Streaming](#adaptive-streaming)
5. [Analytics Integration](#analytics-integration)
6. [Accessibility Features](#accessibility-features)
7. [Error Handling](#error-handling)
8. [Advanced Configuration](#advanced-configuration)

## Basic Usage

### Simple Video Player

```tsx
import { UnifiedVideoPlayer } from "@/components/common/unified-video-player";

function BasicVideoPlayer() {
  return (
    <UnifiedVideoPlayer
      src="https://example.com/video.mp4"
      poster="https://example.com/poster.jpg"
      type="video/mp4"
      onReady={(player) => console.log("Player ready")}
      onEnded={() => console.log("Video ended")}
      onTimeUpdate={(time) => console.log("Current time:", time)}
    />
  );
}
```

### Responsive Video Player

```tsx
function ResponsiveVideoPlayer() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <UnifiedVideoPlayer
        src="https://example.com/video.mp4"
        aspectRatio="16:9"
        className="w-full h-auto"
        onReady={(player) => {
          // Make player responsive
          player.ready(() => {
            player.fluid(true);
          });
        }}
      />
    </div>
  );
}
```

### Autoplay Video (Muted)

```tsx
function AutoplayVideoPlayer() {
  return (
    <UnifiedVideoPlayer
      src="https://example.com/video.mp4"
      autoplay={true}
      muted={true}
      loop={true}
      preload="auto"
      onPlay={() => console.log("Video started playing")}
    />
  );
}
```

## YouTube Integration

### Basic YouTube Video

```tsx
function YouTubeVideoPlayer() {
  return (
    <UnifiedVideoPlayer
      src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      type="video/youtube"
      youtubeConfig={{
        modestbranding: 1, // Hide YouTube logo
        rel: 0, // Don't show related videos
        showinfo: 0, // Hide video info
        color: "white", // White progress bar
        theme: "dark", // Dark theme
      }}
      onReady={(player) => console.log("YouTube player ready")}
    />
  );
}
```

### YouTube Video with Start/End Times

```tsx
function YouTubeVideoWithTimes() {
  return (
    <UnifiedVideoPlayer
      src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      type="video/youtube"
      startTime={30} // Start at 30 seconds
      endTime={120} // End at 2 minutes
      youtubeConfig={{
        start: 30,
        end: 120,
        modestbranding: 1,
        rel: 0,
      }}
    />
  );
}
```

### YouTube Playlist

```tsx
function YouTubePlaylistPlayer() {
  return (
    <UnifiedVideoPlayer
      src="https://www.youtube.com/playlist?list=PLAYLIST_ID"
      type="video/youtube"
      youtubeConfig={{
        list: "PLAYLIST_ID",
        listType: "playlist",
        modestbranding: 1,
        rel: 0,
      }}
    />
  );
}
```

## DRM Protected Content

### Widevine DRM (Chrome/Android)

```tsx
function DRMProtectedVideo() {
  const drmConfig = {
    keySystems: {
      "com.widevine.alpha": {
        licenseUrl: "https://license-server.example.com/widevine",
        headers: {
          Authorization: "Bearer your-token-here",
          "Content-Type": "application/json",
        },
      },
    },
  };

  return (
    <UnifiedVideoPlayer
      src="https://example.com/protected-video.mp4"
      type="video/mp4"
      drmConfig={drmConfig}
      onError={(error) => {
        console.error("DRM Error:", error);
        // Handle DRM errors
      }}
    />
  );
}
```

### Multi-DRM Support

```tsx
function MultiDRMVideo() {
  const drmConfig = {
    keySystems: {
      "com.widevine.alpha": {
        licenseUrl: "https://license-server.example.com/widevine",
        headers: { Authorization: "Bearer token" },
      },
      "com.microsoft.playready": {
        licenseUrl: "https://license-server.example.com/playready",
        headers: { Authorization: "Bearer token" },
      },
      "com.apple.fps.1_0": {
        licenseUrl: "https://license-server.example.com/fairplay",
        headers: { Authorization: "Bearer token" },
      },
    },
  };

  return (
    <UnifiedVideoPlayer
      src="https://example.com/multi-drm-video.mp4"
      type="video/mp4"
      drmConfig={drmConfig}
    />
  );
}
```

## Adaptive Streaming

### HLS Streaming

```tsx
function HLSVideoPlayer() {
  return (
    <UnifiedVideoPlayer
      src="https://example.com/playlist.m3u8"
      type="application/x-mpegURL"
      adaptiveStreaming={{
        enableLowInitialPlaylist: true,
        smoothQualityChange: true,
        overrideNative: true,
        bandwidth: 5000000, // 5 Mbps max bandwidth
        bufferSize: 30, // 30 seconds buffer
        maxBufferSize: 60, // 60 seconds max buffer
      }}
      onReady={(player) => {
        // Listen for quality changes
        player.on("loadeddata", () => {
          console.log("HLS data loaded");
        });
      }}
    />
  );
}
```

### DASH Streaming

```tsx
function DASHVideoPlayer() {
  return (
    <UnifiedVideoPlayer
      src="https://example.com/manifest.mpd"
      type="application/dash+xml"
      adaptiveStreaming={{
        enableLowInitialPlaylist: true,
        smoothQualityChange: true,
        bandwidth: 10000000, // 10 Mbps max bandwidth
      }}
    />
  );
}
```

## Analytics Integration

### Google Analytics

```tsx
function AnalyticsVideoPlayer() {
  return (
    <UnifiedVideoPlayer
      src="https://example.com/video.mp4"
      analytics={{
        trackingId: "GA_TRACKING_ID",
        events: ["play", "pause", "complete", "seek", "timeupdate"],
      }}
      onPlay={() => console.log("Video played")}
      onPause={() => console.log("Video paused")}
      onProgress={(progress) => {
        // Track progress milestones
        if (progress >= 25 && progress < 30) {
          console.log("25% watched");
        }
        if (progress >= 50 && progress < 55) {
          console.log("50% watched");
        }
        if (progress >= 75 && progress < 80) {
          console.log("75% watched");
        }
        if (progress >= 90) {
          console.log("90% watched");
        }
      }}
    />
  );
}
```

### Custom Analytics

```tsx
function CustomAnalyticsVideoPlayer() {
  return (
    <UnifiedVideoPlayer
      src="https://example.com/video.mp4"
      analytics={{
        customEndpoint: "https://your-analytics-api.com/track",
        events: ["play", "pause", "complete", "seek"],
      }}
      onTimeUpdate={(time) => {
        // Custom time-based tracking
        if (time % 30 === 0) {
          // Every 30 seconds
          fetch("https://your-api.com/track-time", {
            method: "POST",
            body: JSON.stringify({ time, videoId: "video-123" }),
          });
        }
      }}
    />
  );
}
```

## Accessibility Features

### Screen Reader Support

```tsx
function AccessibleVideoPlayer() {
  return (
    <UnifiedVideoPlayer
      src="https://example.com/video.mp4"
      accessibility={{
        announceVideoLoad: true,
        announceVideoPlay: true,
        ariaLabels: {
          playButton: "Start video playback",
          pauseButton: "Pause video playback",
          muteButton: "Mute audio",
          volumeSlider: "Adjust volume",
          progressBar: "Video progress",
          fullscreenButton: "Enter fullscreen mode",
        },
      }}
      onReady={(player) => {
        // Additional accessibility setup
        player.ready(() => {
          const playButton = player.controlBar.playToggle;
          if (playButton) {
            playButton.setAttribute("aria-label", "Start video playback");
          }
        });
      }}
    />
  );
}
```

## Error Handling

### Comprehensive Error Handling

```tsx
function ErrorHandlingVideoPlayer() {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = (error: any) => {
    console.error("Video error:", error);
    setError(`Video failed to load: ${error.message}`);

    // Auto-retry logic
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setError(null);
      }, 2000);
    }
  };

  return (
    <div>
      {error && (
        <div className="error-message">
          {error}
          {retryCount < 3 && <p>Retrying... ({retryCount}/3)</p>}
        </div>
      )}

      <UnifiedVideoPlayer
        src="https://example.com/video.mp4"
        errorHandling={{
          displayErrors: true,
          errorTimeout: 5000,
          retryOnError: true,
          maxRetries: 3,
          retryDelay: 2000,
        }}
        onError={handleError}
        onReady={() => setError(null)}
      />
    </div>
  );
}
```

## Advanced Configuration

### Complete Configuration Example

```tsx
function AdvancedVideoPlayer() {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  return (
    <div className="video-container">
      {/* Custom Controls */}
      <div className="custom-controls">
        <button
          onClick={() => (player?.paused() ? player.play() : player.pause())}
          disabled={!player}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => {
            const newVolume = parseFloat(e.target.value);
            setVolume(newVolume);
            player?.volume(newVolume);
          }}
        />

        <button
          onClick={() => {
            const newMuted = !muted;
            setMuted(newMuted);
            player?.muted(newMuted);
          }}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>

      {/* Video Player */}
      <UnifiedVideoPlayer
        src="https://example.com/video.mp4"
        poster="https://example.com/poster.jpg"
        type="video/mp4"
        // Basic Settings
        autoplay={false}
        muted={false}
        loop={false}
        preload="metadata"
        volume={1.0}
        aspectRatio="16:9"
        // Playback Settings
        playbackRates={[0.5, 0.75, 1, 1.25, 1.5, 2]}
        // YouTube Settings
        youtubeConfig={{
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          color: "white",
          theme: "dark",
        }}
        // Adaptive Streaming
        adaptiveStreaming={{
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          bandwidth: 5000000,
          bufferSize: 30,
        }}
        // Error Handling
        errorHandling={{
          displayErrors: true,
          retryOnError: true,
          maxRetries: 3,
        }}
        // Analytics
        analytics={{
          trackingId: "GA_TRACKING_ID",
          events: ["play", "pause", "complete", "seek"],
        }}
        // Accessibility
        accessibility={{
          announceVideoLoad: true,
          announceVideoPlay: true,
          ariaLabels: {
            playButton: "Start video playback",
            pauseButton: "Pause video playback",
          },
        }}
        // Event Handlers
        onReady={(playerInstance) => {
          setPlayer(playerInstance);
          setDuration(playerInstance.duration());
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(time) => {
          setCurrentTime(time);
        }}
        onSeek={(time) => {
          setCurrentTime(time);
        }}
        onVolumeChange={(vol, muteState) => {
          setVolume(vol);
          setMuted(muteState);
        }}
        onProgress={(progress) => {
          console.log(`Progress: ${progress.toFixed(1)}%`);
        }}
        onEnded={() => {
          setIsPlaying(false);
          console.log("Video completed");
        }}
        onError={(error) => {
          console.error("Video error:", error);
        }}
        className="w-full h-auto"
      />

      {/* Progress Display */}
      <div className="progress-info">
        <span>
          {Math.floor(currentTime / 60)}:
          {(currentTime % 60).toFixed(0).padStart(2, "0")}
        </span>
        <span>/</span>
        <span>
          {Math.floor(duration / 60)}:
          {(duration % 60).toFixed(0).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
```

### Course Video Player with Progress Tracking

```tsx
function CourseVideoPlayer({
  videoId,
  courseId,
}: {
  videoId: string;
  courseId: string;
}) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const saveProgress = async (currentTime: number, duration: number) => {
    const progressPercent = (currentTime / duration) * 100;
    setProgress(progressPercent);

    // Save to backend every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      await fetch(`/api/courses/${courseId}/videos/${videoId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTime,
          duration,
          progress: progressPercent,
          timestamp: Date.now(),
        }),
      });
    }
  };

  const markAsCompleted = async () => {
    setIsCompleted(true);
    await fetch(`/api/courses/${courseId}/videos/${videoId}/complete`, {
      method: "POST",
    });
  };

  return (
    <div className="course-video-player">
      <UnifiedVideoPlayer
        src={`https://example.com/courses/${courseId}/videos/${videoId}.mp4`}
        type="video/mp4"
        onTimeUpdate={(currentTime) => {
          // This will be called with duration from onReady
        }}
        onReady={(player) => {
          const duration = player.duration();

          player.on("timeupdate", () => {
            const currentTime = player.currentTime();
            saveProgress(currentTime, duration);
          });
        }}
        onEnded={() => {
          markAsCompleted();
        }}
        onProgress={(progressPercent) => {
          if (progressPercent >= 90 && !isCompleted) {
            // Mark as completed when 90% watched
            markAsCompleted();
          }
        }}
        analytics={{
          customEndpoint: "/api/analytics/video-events",
          events: ["play", "pause", "complete", "seek"],
        }}
      />

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {isCompleted && <div className="completion-badge">✓ Video Completed</div>}
    </div>
  );
}
```

## Best Practices

### 1. Always Handle Errors

```tsx
// Good
<UnifiedVideoPlayer
  src="video.mp4"
  onError={(error) => {
    console.error("Video error:", error);
    // Show user-friendly error message
  }}
/>

// Bad
<UnifiedVideoPlayer src="video.mp4" />
```

### 2. Use Appropriate Preload Settings

```tsx
// For mobile/slow connections
<UnifiedVideoPlayer src="video.mp4" preload="metadata" />

// For desktop/fast connections
<UnifiedVideoPlayer src="video.mp4" preload="auto" />
```

### 3. Implement Progress Tracking

```tsx
<UnifiedVideoPlayer
  src="video.mp4"
  onProgress={(progress) => {
    // Track viewing progress for analytics
    if (progress >= 25 && progress < 30) {
      trackEvent("video_25_percent");
    }
  }}
/>
```

### 4. Use DRM for Premium Content

```tsx
<UnifiedVideoPlayer
  src="premium-video.mp4"
  drmConfig={{
    keySystems: {
      "com.widevine.alpha": {
        licenseUrl: "https://license-server.com/widevine",
      },
    },
  }}
/>
```

### 5. Optimize for Performance

```tsx
<UnifiedVideoPlayer
  src="video.m3u8"
  adaptiveStreaming={{
    enableLowInitialPlaylist: true,
    smoothQualityChange: true,
    bandwidth: 5000000, // Limit bandwidth
  }}
/>
```

This comprehensive guide should help you implement the UnifiedVideoPlayer component effectively in your LMS application!
