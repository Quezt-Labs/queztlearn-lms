"use client";

import { useState } from "react";
import { UnifiedVideoPlayer } from "@/components/common/unified-video-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Video as VideoIcon,
  BookOpen,
  FileText,
  Clipboard,
  Shield,
  Zap,
} from "lucide-react";

// Dummy video data
const dummyVideos = [
  {
    id: "1",
    name: "Introduction to React",
    type: "Video" as const,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Roll for demo
    videoType: "YouTube" as const,
    videoThumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    videoDuration: 212,
    isCompleted: false,
    description: "Learn the basics of React development",
  },
  {
    id: "2",
    name: "JavaScript Fundamentals",
    type: "Video" as const,
    videoUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c", // JavaScript tutorial
    videoType: "YouTube" as const,
    videoThumbnail: "https://img.youtube.com/vi/hdI2bqOjy3c/maxresdefault.jpg",
    videoDuration: 1800,
    isCompleted: true,
    description: "Master JavaScript from basics to advanced",
  },
  {
    id: "3",
    name: "CSS Styling Guide",
    type: "Video" as const,
    videoUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc", // CSS tutorial
    videoType: "YouTube" as const,
    videoThumbnail: "https://img.youtube.com/vi/1Rs2ND1ryYc/maxresdefault.jpg",
    videoDuration: 900,
    isCompleted: false,
    description: "Complete guide to CSS styling",
  },
  {
    id: "4",
    name: "Adaptive Streaming Demo",
    type: "Video" as const,
    videoUrl:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    videoType: "HLS" as const,
    videoThumbnail:
      "https://via.placeholder.com/640x360/4F46E5/FFFFFF?text=Adaptive+Streaming",
    videoDuration: 734,
    isCompleted: false,
    description: "HLS adaptive bitrate streaming demo",
  },
  {
    id: "5",
    name: "DRM Protected Content",
    type: "Video" as const,
    videoUrl:
      "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd",
    videoType: "MP4" as const,
    videoThumbnail:
      "https://via.placeholder.com/640x360/DC2626/FFFFFF?text=DRM+Protected",
    videoDuration: 1200,
    isCompleted: false,
    description: "DRM protected premium content",
    drmConfig: {
      keySystems: {
        "com.widevine.alpha": {
          licenseUrl: "https://license-server.example.com/widevine",
          headers: {
            Authorization: "Bearer demo-token",
          },
        },
        "com.microsoft.playready": {
          licenseUrl: "https://license-server.example.com/playready",
          headers: {
            Authorization: "Bearer demo-token",
          },
        },
        "com.apple.fps.1_0": {
          licenseUrl: "https://license-server.example.com/fairplay",
          headers: {
            Authorization: "Bearer demo-token",
          },
        },
      },
    },
  },
  {
    id: "6",
    name: "Course Materials",
    type: "PDF" as const,
    pdfUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isCompleted: false,
    description: "Download course materials and resources",
  },
  {
    id: "7",
    name: "Assignment 1",
    type: "Assignment" as const,
    isCompleted: false,
    description: "Complete your first programming assignment",
  },
];

export default function DemoVideoPage() {
  const [selectedContent, setSelectedContent] = useState(dummyVideos[0]);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>(
    {}
  );

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <VideoIcon className="h-4 w-4" />;
      case "PDF":
        return <FileText className="h-4 w-4" />;
      case "Assignment":
        return <Clipboard className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    const colors = {
      Lecture: "bg-blue-100 text-blue-800",
      Video: "bg-green-100 text-green-800",
      PDF: "bg-purple-100 text-purple-800",
      Assignment: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || colors.Lecture;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getVideoType = (
    videoType?: string
  ): "video/mp4" | "application/x-mpegURL" | "video/webm" | "video/youtube" => {
    if (videoType === "HLS") {
      return "application/x-mpegURL";
    }
    if (videoType === "YouTube") {
      return "video/youtube";
    }
    return "video/mp4";
  };

  const handleVideoTimeUpdate = (currentTime: number) => {
    setVideoProgress((prev) => ({
      ...prev,
      [selectedContent.id]: currentTime,
    }));
  };

  const handleVideoEnded = () => {
    // Mark video as completed
    console.log("Video ended:", selectedContent.name);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <h1 className="text-xl font-bold">QueztLearn LMS - Video Demo</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Badge variant="secondary">Demo Mode</Badge>
            <Badge variant="outline">Student View</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player - Takes 3 columns */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {getContentTypeIcon(selectedContent.type)}
                      <span>{selectedContent.name}</span>
                      <Badge
                        variant="secondary"
                        className={getContentTypeColor(selectedContent.type)}
                      >
                        {selectedContent.type}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedContent.description}
                    </p>
                  </div>
                  {selectedContent.isCompleted && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedContent.type === "Video" &&
                selectedContent.videoUrl ? (
                  <div className="space-y-4">
                    <UnifiedVideoPlayer
                      src={selectedContent.videoUrl}
                      poster={selectedContent.videoThumbnail}
                      type={getVideoType(selectedContent.videoType)}
                      drmConfig={
                        "drmConfig" in selectedContent
                          ? selectedContent.drmConfig
                          : undefined
                      }
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleVideoEnded}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedContent.videoDuration
                            ? formatDuration(selectedContent.videoDuration)
                            : "Unknown duration"}
                        </span>
                        <span>
                          Progress:{" "}
                          {selectedContent.videoDuration
                            ? Math.round(
                                ((videoProgress[selectedContent.id] || 0) /
                                  selectedContent.videoDuration) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {"drmConfig" in selectedContent &&
                          selectedContent.drmConfig && (
                            <Badge variant="destructive" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              DRM Protected
                            </Badge>
                          )}
                        {selectedContent.videoType === "HLS" && (
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Adaptive Streaming
                          </Badge>
                        )}
                        {selectedContent.videoType === "YouTube" && (
                          <Badge variant="outline" className="text-xs">
                            <VideoIcon className="h-3 w-3 mr-1" />
                            YouTube
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : selectedContent.type === "PDF" && selectedContent.pdfUrl ? (
                  <iframe
                    src={selectedContent.pdfUrl}
                    className="w-full h-[600px] rounded-lg border"
                    title={selectedContent.name}
                  />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No content available to display.</p>
                    <p className="text-sm mt-2">
                      This is a {selectedContent.type.toLowerCase()} content
                      type.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
