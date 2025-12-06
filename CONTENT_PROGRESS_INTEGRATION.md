# Content Progress APIs Integration Guide

## Overview

Yeh document batata hai ki content progress APIs ko kahan use karna hai client side par.

## API Hooks Available

1. `useRecentlyWatched()` - Recently watched videos with progress
2. `useTrackContentProgress()` - Track video watch progress
3. `useContentProgress(contentId)` - Get progress for specific content
4. `useWatchStats()` - Get overall watch statistics
5. `useMarkContentComplete()` - Mark content as completed manually
6. `useBatchProgress(batchId)` - Get batch progress overview

---

## Integration Points

### 1. **My Learning Page** - Recently Watched Videos

**File**: `src/app/[client]/student/my-learning/page.tsx`

**Current State**: Hardcoded `recentVideos` array use ho raha hai

**Integration**:

```typescript
// Replace hardcoded recentVideos with API call
const { data: recentlyWatchedResponse } = useRecentlyWatched({
  page: 1,
  limit: 6,
});

// Transform API response to match VideoCard props
const recentVideos = recentlyWatchedResponse?.data?.videos?.map((video) => ({
  id: video.content.id,
  title: video.content.name,
  subject: video.content.subject?.name || "General",
  thumbnail: video.content.videoThumbnail || "",
  duration: video.progress.totalDuration,
  watchedDuration: video.progress.watchedSeconds,
  lastWatchedAt: new Date(video.progress.lastWatchedAt),
  batchName: video.content.batch?.name || "Batch",
}));
```

**Benefits**:

- Real data from API
- Actual watch progress
- Last watched timestamp

---

### 2. **Video Player Page** - Progress Tracking

**File**: `src/app/[client]/student/batches/[id]/subjects/[subjectId]/chapters/[chapterId]/topics/[topicId]/content/[contentId]/page.tsx`

**Integration Points**:

#### A. Load Saved Progress on Video Load

```typescript
const { data: progressData } = useContentProgress(contentId);

// In onReady callback
onReady={(player) => {
  setPlayerInstance(player);

  // Resume from last watched position
  if (progressData?.data && !progressData.data.isCompleted) {
    const resumeTime = progressData.data.watchedSeconds;
    if (resumeTime > 0) {
      player.currentTime(resumeTime);
    }
  }
}}
```

#### B. Track Progress During Playback

```typescript
const trackProgress = useTrackContentProgress();
const lastTrackedTime = useRef(0);

// In onTimeUpdate callback
onTimeUpdate={(currentTime) => {
  const totalDuration = playerInstance?.duration() || 0;

  // Track every 10 seconds
  if (currentTime - lastTrackedTime.current >= 10) {
    trackProgress.mutate({
      contentId,
      data: {
        watchedSeconds: Math.floor(currentTime),
        totalDuration: Math.floor(totalDuration),
      },
    });
    lastTrackedTime.current = currentTime;
  }
}}
```

#### C. Auto-complete on Video End

```typescript
onEnded={() => {
  // Mark as complete if not already
  if (progressData?.data && !progressData.data.isCompleted) {
    markComplete.mutate(contentId);
  }

  // Auto-advance to next content
  if (nextContent) {
    handleNavigateContent(nextContent.content.id, nextContent.topicId);
  }
}}
```

---

### 3. **Content Cards** - Show Progress Badges

**File**: `src/components/student/content-card.tsx`

**Integration**:

```typescript
// In ContentCard component
const { data: progressData } = useContentProgress(content.id);

const progressPercentage = progressData?.data?.watchPercentage || 0;
const isCompleted = progressData?.data?.isCompleted || false;

// Show completion badge
{
  isCompleted && (
    <Badge variant="default" className="absolute top-2 right-2">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Completed
    </Badge>
  );
}

// Show progress bar
{
  progressPercentage > 0 && !isCompleted && (
    <Progress value={progressPercentage} className="h-1" />
  );
}
```

---

### 4. **Batch Detail Pages** - Overall Progress

**File**: `src/app/[client]/student/batches/[id]/page.tsx`

**Integration**:

```typescript
const { data: batchProgress } = useBatchProgress(batchId);

// Display progress
{
  batchProgress?.data && (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span>Progress</span>
        <span>{batchProgress.data.progressPercentage}%</span>
      </div>
      <Progress value={batchProgress.data.progressPercentage} />
      <p className="text-xs text-muted-foreground mt-2">
        {batchProgress.data.completedVideos} of {batchProgress.data.totalVideos}{" "}
        videos completed
      </p>
    </div>
  );
}
```

---

### 5. **My Learning Page** - Watch Statistics

**File**: `src/app/[client]/student/my-learning/page.tsx`

**Integration**:

```typescript
const { data: watchStats } = useWatchStats();

// Display stats section
{
  watchStats?.data && (
    <Card>
      <CardHeader>
        <CardTitle>Your Learning Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Videos Watched</p>
            <p className="text-2xl font-bold">
              {watchStats.data.totalVideosWatched}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">
              {watchStats.data.completedVideosCount}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Watch Time</p>
            <p className="text-2xl font-bold">
              {watchStats.data.totalWatchTimeFormatted}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">
              {watchStats.data.averageCompletionRate}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 6. **Schedule Player Page** - Live Class Progress

**File**: `src/app/[client]/student/batches/[id]/schedule/[scheduleId]/page.tsx`

**Integration**: Same as Video Player Page (#2)

---

## Implementation Priority

### Phase 1: Core Functionality (High Priority)

1. ✅ Video Player Page - Progress tracking & resume
2. ✅ My Learning Page - Recently watched videos

### Phase 2: Enhanced UX (Medium Priority)

3. ✅ Content Cards - Progress display
4. ✅ Batch Progress - Overall completion

### Phase 3: Analytics (Low Priority)

5. ✅ Watch Statistics - Dashboard stats

---

## Best Practices

1. **Debounce Progress Tracking**: Track progress every 10-15 seconds, not on every time update
2. **Resume Position**: Always resume from last watched position if not completed
3. **Auto-complete**: Mark as complete when watch percentage >= 95%
4. **Error Handling**: Handle API errors gracefully, don't break video playback
5. **Loading States**: Show loading states while fetching progress
6. **Cache Invalidation**: Progress updates automatically invalidate related queries

---

## Example: Complete Video Player Integration

```typescript
"use client";

import {
  useContentProgress,
  useTrackContentProgress,
  useMarkContentComplete,
} from "@/hooks/api";
import { useEffect, useRef } from "react";

export default function VideoPlayerWithProgress({ contentId, videoUrl }) {
  const { data: progressData } = useContentProgress(contentId);
  const trackProgress = useTrackContentProgress();
  const markComplete = useMarkContentComplete();
  const playerRef = useRef<Player | null>(null);
  const lastTrackedTime = useRef(0);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  // Resume from last position
  const handleReady = (player: Player) => {
    playerRef.current = player;

    if (progressData?.data && !progressData.data.isCompleted) {
      const resumeTime = progressData.data.watchedSeconds;
      if (resumeTime > 0 && resumeTime < player.duration()) {
        player.currentTime(resumeTime);
      }
    }
  };

  // Track progress every 10 seconds
  const handleTimeUpdate = (currentTime: number) => {
    if (!playerRef.current) return;

    const totalDuration = playerRef.current.duration() || 0;
    const watchPercentage = (currentTime / totalDuration) * 100;

    // Track every 10 seconds
    if (currentTime - lastTrackedTime.current >= 10) {
      trackProgress.mutate({
        contentId,
        data: {
          watchedSeconds: Math.floor(currentTime),
          totalDuration: Math.floor(totalDuration),
        },
      });
      lastTrackedTime.current = currentTime;

      // Auto-complete at 95%
      if (watchPercentage >= 95 && !progressData?.data?.isCompleted) {
        markComplete.mutate(contentId);
      }
    }
  };

  const handleEnded = () => {
    if (!progressData?.data?.isCompleted) {
      markComplete.mutate(contentId);
    }
  };

  return (
    <UnifiedVideoPlayer
      src={videoUrl}
      onReady={handleReady}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  );
}
```

---

## Notes

- All hooks automatically handle caching and invalidation
- Progress tracking is debounced to avoid excessive API calls
- Auto-completion happens at 95% watch percentage
- All mutations invalidate related queries for real-time updates
