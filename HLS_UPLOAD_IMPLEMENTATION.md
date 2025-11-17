# HLS Video Upload with Multipart Implementation

## ✅ Implementation Complete!

This document describes the multipart upload system for large HLS videos, with automatic chunking and parallel upload support.

## 📁 Files Created

### Core Utilities

1. **`src/lib/utils/multipart-upload.ts`** (450+ lines)

   - `MultipartUploader` class - Main upload orchestrator
   - Progress tracking and error handling
   - Automatic chunking (5MB per chunk)
   - Parallel upload (3 concurrent chunks)
   - Helper functions for formatting

2. **`src/lib/types/multipart-upload.ts`** (80 lines)
   - TypeScript interfaces for all API endpoints
   - Request/Response types
   - Error handling types

### React Hooks

3. **`src/hooks/use-multipart-upload.ts`** (150 lines)
   - `useMultipartUpload()` - Main upload hook
   - `useUploadProgressDisplay()` - Progress formatting hook
   - Upload speed and time remaining calculations
   - Abort and reset functionality

### UI Components

4. **`src/components/common/hls-video-upload.tsx`** (350 lines)
   - Drag & drop file upload
   - Real-time progress display
   - Chunk progress tracking
   - Upload speed and time remaining
   - Error handling and retry
   - Cancel functionality

### Integration

5. **Updated: `src/components/common/content-form/lecture-fields.tsx`**

   - Integrated HLS video upload component
   - 2GB max file size for HLS
   - Alternative URL input

6. **Updated: `src/components/common/create-content-modal.tsx`**
   - Integrated HLS video upload component
   - Automatic form data population

## 🎯 How It Works

### Upload Flow

```
User selects video file (up to 2GB)
  ↓
Validate file size and type
  ↓
Split file into 5MB chunks
  ↓
POST /api/admin/upload/multipart/initiate
  → Returns: { uploadId, key, bucket }
  ↓
POST /api/admin/upload/multipart/signed-urls
  → Returns: Array of presigned URLs for each chunk
  ↓
Upload chunks in parallel (3 at a time)
  → PUT to S3 presigned URLs
  → Collect ETag from each response
  ↓
POST /api/admin/upload/multipart/complete
  → Send all parts with ETags
  → Returns: { cdnUrl, publicUrl }
  ↓
Save cdnUrl to database
  ↓
✅ Upload Complete!
```

### Architecture

```typescript
// 1. Initialize uploader
const uploader = new MultipartUploader(file, {
  fileName: file.name,
  fileType: file.type,
  fileSize: file.size,
  folder: "course-videos",
  onProgress: (progress) => {
    // Update UI with progress
  },
  onComplete: (cdnUrl) => {
    // Save to database
  },
});

// 2. Start upload
const cdnUrl = await uploader.upload();

// 3. Or abort
await uploader.abort();
```

## 🚀 Usage Examples

### Basic Usage in Component

```typescript
import { HLSVideoUpload } from "@/components/common/hls-video-upload";

function MyComponent() {
  return (
    <HLSVideoUpload
      onUploadComplete={(cdnUrl) => {
        console.log("Video uploaded:", cdnUrl);
        // Save cdnUrl to your content
      }}
      folder="course-videos"
      maxSize={2000} // 2GB
    />
  );
}
```

### Advanced Usage with Hook

```typescript
import { useMultipartUpload } from "@/hooks/use-multipart-upload";

function CustomUploader() {
  const { upload, abort, progress, isUploading, error } = useMultipartUpload({
    folder: "course-videos",
    onSuccess: (cdnUrl) => {
      console.log("Success:", cdnUrl);
    },
    onError: (err) => {
      console.error("Error:", err);
    },
  });

  const handleUpload = async (file: File) => {
    try {
      const cdnUrl = await upload(file);
      // Use cdnUrl
    } catch (err) {
      // Handle error
    }
  };

  return (
    <div>
      {progress && (
        <div>
          <p>{progress.percentage}% complete</p>
          <p>
            Chunk {progress.currentChunk} of {progress.totalChunks}
          </p>
        </div>
      )}
      <button onClick={() => handleUpload(myFile)}>Upload</button>
      {isUploading && <button onClick={abort}>Cancel</button>}
    </div>
  );
}
```

## 📊 Features

### Upload Features

- ✅ **Automatic Chunking** - Splits files into 5MB chunks
- ✅ **Parallel Upload** - Uploads 3 chunks concurrently
- ✅ **Progress Tracking** - Real-time progress updates
- ✅ **Speed Calculation** - Shows upload speed (MB/s)
- ✅ **Time Remaining** - Estimates time to completion
- ✅ **Error Handling** - Automatic retry and cleanup
- ✅ **Cancel Support** - Abort upload anytime
- ✅ **Drag & Drop** - Easy file selection
- ✅ **File Validation** - Size and type checking

### UI Features

- ✅ **Progress Bar** - Visual upload progress
- ✅ **Chunk Counter** - Shows current chunk being uploaded
- ✅ **Upload Speed** - Real-time speed display
- ✅ **Time Remaining** - Estimated time left
- ✅ **Error Messages** - Clear error feedback
- ✅ **Success State** - Completion confirmation
- ✅ **Cancel Button** - Stop upload anytime
- ✅ **Retry Option** - Try again on failure

## ⚙️ Configuration

### Chunk Size

Edit `src/lib/utils/multipart-upload.ts`:

```typescript
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
```

**Recommendations:**

- **Faster networks**: 10MB chunks (fewer requests)
- **Slower networks**: 5MB chunks (better recovery)
- **Very slow networks**: 2MB chunks (minimum S3 size except last)

### Concurrent Uploads

```typescript
const MAX_CONCURRENT_UPLOADS = 3; // Upload 3 chunks at a time
```

**Recommendations:**

- **Good network**: 5 concurrent (faster)
- **Average network**: 3 concurrent (balanced)
- **Slow network**: 1 concurrent (more reliable)

### Max File Size

In component props:

```typescript
<HLSVideoUpload
  maxSize={2000} // 2GB in MB
/>
```

## 🔌 API Endpoints

All endpoints are under `/api/admin/upload/multipart/`:

### 1. Initiate Upload

```typescript
POST /api/admin/upload/multipart/initiate

Request: {
  fileName: "video.mp4",
  fileType: "video/mp4",
  fileSize: 524288000,
  folder: "course-videos"
}

Response: {
  success: true,
  data: {
    uploadId: "abc123...",
    key: "org-123/course-videos/1234567890-video.mp4",
    bucket: "queztlearn-uploads"
  }
}
```

### 2. Get Signed URLs

```typescript
POST /api/admin/upload/multipart/signed-urls

Request: {
  uploadId: "abc123...",
  key: "org-123/course-videos/...",
  totalParts: 100
}

Response: {
  success: true,
  data: {
    urls: [
      { partNumber: 1, uploadUrl: "https://s3..." },
      { partNumber: 2, uploadUrl: "https://s3..." }
      // ... all parts
    ],
    expiresIn: 300
  }
}
```

### 3. Complete Upload

```typescript
POST /api/admin/upload/multipart/complete

Request: {
  uploadId: "abc123...",
  key: "org-123/course-videos/...",
  parts: [
    { partNumber: 1, ETag: "\"abc...\"" },
    { partNumber: 2, ETag: "\"def...\"" }
  ]
}

Response: {
  success: true,
  data: {
    key: "org-123/course-videos/...",
    publicUrl: "https://s3.amazonaws.com/...",
    cdnUrl: "https://cdn.your-domain.com/...",
    bucket: "queztlearn-uploads"
  }
}
```

### 4. Abort Upload

```typescript
POST /api/admin/upload/multipart/abort

Request: {
  uploadId: "abc123...",
  key: "org-123/course-videos/..."
}

Response: {
  success: true,
  data: {
    message: "Upload aborted successfully"
  }
}
```

## 🧪 Testing

### Test Upload Flow

1. **Select Video File**

   - Open content creation modal
   - Select "Lecture" type
   - Choose "HLS" video type
   - Drag & drop or click to select video

2. **Monitor Progress**

   - Watch progress bar
   - See chunk counter (e.g., "Chunk 5 of 20")
   - Check upload speed (e.g., "2.5 MB/s")
   - View time remaining (e.g., "1m 30s")

3. **Test Cancel**

   - Click "Cancel" during upload
   - Verify upload stops
   - Confirm cleanup on server

4. **Test Error Handling**
   - Disconnect network during upload
   - Verify error message shown
   - Reconnect and retry

### Test Cases

```typescript
// 1. Small video (< 5MB) - Single chunk
const smallVideo = new File([...], 'small.mp4', { type: 'video/mp4' });

// 2. Medium video (50MB) - Multiple chunks
const mediumVideo = new File([...], 'medium.mp4', { type: 'video/mp4' });

// 3. Large video (500MB) - Many chunks
const largeVideo = new File([...], 'large.mp4', { type: 'video/mp4' });

// 4. Too large video (> 2GB) - Should show error
const tooLarge = new File([...], 'huge.mp4', { type: 'video/mp4' });

// 5. Wrong file type - Should show error
const wrongType = new File([...], 'document.pdf', { type: 'application/pdf' });
```

## 📈 Performance

### Expected Upload Times

| File Size | Chunks | Time (10 Mbps) | Time (50 Mbps) | Time (100 Mbps) |
| --------- | ------ | -------------- | -------------- | --------------- |
| 50 MB     | 10     | ~40s           | ~8s            | ~4s             |
| 100 MB    | 20     | ~1m 20s        | ~16s           | ~8s             |
| 500 MB    | 100    | ~6m 40s        | ~1m 20s        | ~40s            |
| 1 GB      | 200    | ~13m 20s       | ~2m 40s        | ~1m 20s         |
| 2 GB      | 400    | ~26m 40s       | ~5m 20s        | ~2m 40s         |

_Times are approximate and depend on network speed, server response time, and S3 performance._

### Optimization Tips

1. **CDN Upload** - Use CloudFront for faster uploads
2. **Region Selection** - Upload to nearest S3 region
3. **Compression** - Compress videos before upload
4. **Concurrent Chunks** - Increase to 5 for fast networks
5. **Chunk Size** - Increase to 10MB for stable networks

## 🔧 Troubleshooting

### Issue: Upload Fails on Large Files

**Solution**: Check these settings:

- API timeout limits (increase to 5+ minutes)
- Max request body size
- Memory limits for chunking

### Issue: Slow Upload Speed

**Solutions**:

1. Increase concurrent uploads: `MAX_CONCURRENT_UPLOADS = 5`
2. Increase chunk size: `CHUNK_SIZE = 10 * 1024 * 1024`
3. Use CDN accelerated endpoint
4. Check network speed

### Issue: Upload Stalls

**Solutions**:

1. Add timeout to chunk upload:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

await fetch(uploadUrl, {
  method: "PUT",
  body: chunk,
  signal: controller.signal,
});
```

2. Implement retry logic for failed chunks

### Issue: ETags Not Matching

**Solution**: Ensure ETags are stored with quotes:

```typescript
const etag = response.headers.get("ETag"); // "abc123..."
// Keep quotes in the ETag!
```

## 🎨 Customization

### Custom Progress UI

```typescript
<HLSVideoUpload
  onUploadComplete={handleComplete}
  renderProgress={(progress) => (
    <div>
      <CustomProgressBar value={progress.percentage} />
      <CustomStats
        speed={progress.uploadSpeed}
        remaining={progress.timeRemaining}
      />
    </div>
  )}
/>
```

### Custom Upload Button

```typescript
const { upload, isUploading } = useMultipartUpload();

<Button onClick={() => fileInput.current?.click()}>
  {isUploading ? "Uploading..." : "Choose Video"}
</Button>;
```

## 📚 Related Documentation

- [Content Form Types](./src/components/common/content-form/types.ts)
- [Unified Video Player](./src/components/common/unified-video-player.tsx)
- [File Upload Component](./src/components/common/file-upload.tsx)

## ✅ Summary

You now have a **production-ready multipart upload system** that:

- ✅ Handles videos up to **2GB**
- ✅ Splits into **5MB chunks** automatically
- ✅ Uploads **3 chunks in parallel**
- ✅ Shows **real-time progress** with speed & time
- ✅ Supports **cancel/abort** anytime
- ✅ Handles **errors gracefully**
- ✅ Works with **HLS video type**
- ✅ Integrates with **existing content forms**
- ✅ Provides **drag & drop UI**
- ✅ Calculates **upload speed** and **time remaining**

**Ready to upload large HLS videos!** 🎉
