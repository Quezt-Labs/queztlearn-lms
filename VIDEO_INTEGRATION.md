# Video Integration with Video.js

This document explains the video integration features added to the QueztLearn LMS.

## Overview

Video.js has been integrated into the platform, allowing teachers to upload videos or provide video URLs, and students to consume video content through a professional video player.

## Features Implemented

### 1. Video Player Component

**Location:** `src/components/common/video-player.tsx`

A reusable Video.js-based video player component with the following features:

- **Responsive Design**: Automatically adjusts to container size
- **Multiple Format Support**: Supports MP4, HLS, and WebM formats
- **Playback Controls**: Play/pause, volume, fullscreen, and playback speed controls
- **Progress Tracking**: Optional time update callbacks
- **Poster Images**: Support for video thumbnails
- **Event Handlers**: Ready, ended, and time update event support

#### Usage Example:

```tsx
<UnifiedVideoPlayer
  src="https://example.com/video.mp4"
  poster="https://example.com/poster.jpg"
  type="video/mp4"
  onReady={(player) => console.log("Player ready", player)}
  onEnded={() => console.log("Video ended")}
  onTimeUpdate={(currentTime) => console.log("Progress:", currentTime)}
/>
```

### 2. Student Course View Page

**Location:** `src/app/[client]/student/course/[id]/page.tsx`

A comprehensive course viewing page for students with:

- **Course Content Navigation**: Browse subjects, chapters, topics, and content
- **Expandable Chapter List**: Click to expand/collapse chapters
- **Content Type Indicators**: Visual badges for different content types
- **Video Player Integration**: Embedded video player for video content
- **PDF Viewer**: Built-in PDF viewer for PDF content
- **Progress Tracking**: View course progress and completion status
- **Responsive Layout**: Two-column layout with course content and sidebar

### 3. Video Upload Support for Teachers

#### Create Content Modal

**Location:** `src/components/common/create-content-modal.tsx`

Enhanced with video upload capabilities:

- **File Upload Option**: Upload video files directly (supports all video formats)
- **URL Input Option**: Alternatively provide a video URL
- **Video Type Selection**: Choose between HLS (streaming) or MP4 (direct)
- **Thumbnail Support**: Optional poster/thumbnail image
- **Duration Input**: Track video duration
- **Automatic Format Detection**: Smart MIME type handling

#### Edit Content Modal

**Location:** `src/components/common/edit-content-modal.tsx`

Similar video upload support for editing existing content.

### 4. File Upload Component Enhancement

**Location:** `src/components/common/file-upload.tsx`

Already supports video file uploads with:

- Drag and drop functionality
- File validation
- Progress tracking
- Success/error states
- Automatic upload to backend

## Installation

Video.js and related dependencies have been installed:

```bash
npm install video.js @videojs/vhs-utils @videojs/http-streaming
```

### Dependencies Added:

- `video.js` - Core video player library
- `@videojs/vhs-utils` - Utilities for video handling
- `@videojs/http-streaming` - HLS and MPEG-DASH support

## Content Types Supported

### Video Content

- **Format**: MP4, HLS, WebM, **YouTube**
- **Upload**: Direct file upload or URL
- **Features**: Thumbnails, duration tracking, progress tracking
- **Player**: Video.js with full controls

### PDF Content

- **Upload**: Direct file upload or URL
- **Viewer**: Embedded iframe viewer
- **Features**: Full document viewing

### Lecture Content

- **Type**: Text-based content
- **Display**: Coming soon - can be extended with rich text editor

### Assignment Content

- **Type**: Assignments for students
- **Features**: Submission tracking

## API Structure

### Content Data Model

```typescript
interface Content {
  id: string;
  name: string;
  topicId: string;
  type: "Lecture" | "Video" | "PDF" | "Assignment";
  pdfUrl?: string;
  videoUrl?: string;
  videoType?: "HLS" | "MP4";
  videoThumbnail?: string;
  videoDuration?: number;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## How to Use

### For Teachers

1. **Create Video Content:**

   - Navigate to a course → subject → chapter → topic
   - Click "Add Content"
   - Select "Video" as content type
   - Either:
     - Upload a video file (click or drag & drop)
     - OR provide a video URL
   - Select video type (HLS for streaming, MP4 for direct)
   - (Optional) Add thumbnail URL
   - (Optional) Enter video duration in seconds
   - Save

2. **Edit Video Content:**
   - Click edit on any video content
   - Update video file or URL
   - Modify other details
   - Save changes

### For Students

1. **View Course Content:**

   - Navigate to enrolled courses from dashboard
   - Click on a course to view details
   - Expand chapters to see topics
   - Click on video content to open player

2. **Watch Videos:**
   - Click on any video content
   - Video opens in full-featured player
   - Use controls for play/pause, volume, fullscreen, playback speed
   - Track progress (if enabled)
   - Mark as complete when done

## Technical Details

### Video.js Configuration

```typescript
{
  controls: true,                    // Show player controls
  responsive: true,                   // Responsive sizing
  fluid: true,                        // Fluid sizing
  playbackRates: [0.5, 1, 1.25, 1.5, 2], // Playback speed options
  sources: [{ src: string, type: string }], // Video sources
  poster: string                      // Poster image
}
```

### Supported MIME Types

- `video/mp4` - MP4 videos
- `application/x-mpegURL` - HLS streaming
- `video/webm` - WebM videos

## Future Enhancements

Potential improvements for the video system:

1. **Video Analytics**: Track watch time, engagement metrics
2. **Video Transcoding**: Automatic format conversion
3. **Subtitles/Captions**: Support for closed captions
4. **Video Quality Selection**: Adaptive bitrate streaming
5. **Interactive Elements**: In-video quizzes, timestamps
6. **Video Thumbnails**: Auto-generated from video
7. **Video Progress**: Save/restore playback position
8. **Download Capability**: Allow offline viewing

## Troubleshooting

### Video not playing

- Check video format is supported
- Verify video URL is accessible
- Check CORS headers if hosting externally
- Ensure proper MIME type

### Upload failing

- Check file size limits
- Verify network connection
- Check backend upload endpoint
- Review browser console for errors

### Video quality issues

- For better performance with long videos, use HLS format
- Compress videos before upload
- Consider CDN for video delivery
- Use adaptive streaming for varying network conditions

## Integration Points

- **Content Upload**: `src/components/common/create-content-modal.tsx`
- **Content Editing**: `src/components/common/edit-content-modal.tsx`
- **Video Player**: `src/components/common/video-player.tsx`
- **Student View**: `src/app/[client]/student/course/[id]/page.tsx`
- **File Upload**: `src/components/common/file-upload.tsx`
- **API Hooks**: `src/hooks/api.ts`
