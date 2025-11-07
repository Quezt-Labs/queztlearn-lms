"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Video,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetClientTopic,
  useGetClientChapter,
  useGetClientSubjectsByBatch,
  useGetClientTopicsByChapter,
  useGetClientChaptersBySubject,
  useGetContentsByTopic,
} from "@/hooks";
import { UnifiedVideoPlayer } from "@/components/common/unified-video-player";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Content {
  id: string;
  name: string;
  topicId: string;
  type: "Lecture" | "PDF";
  pdfUrl?: string;
  videoUrl?: string;
  videoType?: "YOUTUBE" | "HLS";
  videoThumbnail?: string;
  videoDuration?: number;
  isCompleted?: boolean;
  description?: string;
}

interface Subject {
  id: string;
  name: string;
  description?: string;
}

interface Chapter {
  id: string;
  name: string;
  subjectId: string;
}

interface Topic {
  id: string;
  name: string;
  chapterId: string;
  description?: string;
}

export default function ContentPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;
  const topicId = params.topicId as string;
  const contentId = params.contentId as string;

  // Fetch current content
  const { data: topicResponse } = useGetClientTopic(topicId);
  const { data: contentsResponse } = useGetContentsByTopic(topicId);
  const { data: chapterResponse } = useGetClientChapter(chapterId);
  const { data: subjectsResponse } = useGetClientSubjectsByBatch(batchId);
  const { data: topicsResponse } = useGetClientTopicsByChapter(chapterId);
  const { data: chaptersResponse } = useGetClientChaptersBySubject(subjectId);

  const topic = topicResponse?.data || topicResponse;
  const contents: Content[] = contentsResponse?.data || [];
  const chapter = chapterResponse?.data || chapterResponse;
  const subjects: Subject[] = subjectsResponse?.data || [];
  const topics: Topic[] = topicsResponse?.data || [];
  const chapters: Chapter[] = chaptersResponse?.data || [];

  const currentContent = contents.find((c) => c.id === contentId);

  // Get all contents from current topic for navigation
  const allContents: Array<{
    content: Content;
    topicId: string;
    topicName: string;
  }> = [];
  contents.forEach((c) => {
    allContents.push({
      content: c,
      topicId: topicId,
      topicName: topic?.name || "",
    });
  });

  const currentIndex = allContents.findIndex(
    (item) => item.content.id === contentId
  );
  const previousContent =
    currentIndex > 0 ? allContents[currentIndex - 1] : null;
  const nextContent =
    currentIndex < allContents.length - 1
      ? allContents[currentIndex + 1]
      : null;

  const getVideoType = (
    videoType?: string
  ): "video/mp4" | "application/x-mpegURL" | "video/webm" | "video/youtube" => {
    if (!videoType) return "video/mp4";
    if (videoType === "HLS") return "application/x-mpegURL";
    if (videoType === "YOUTUBE") return "video/youtube";
    return "video/mp4";
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGoBack = () => {
    router.push(
      `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`
    );
  };

  const handleNavigateContent = (newContentId: string, newTopicId: string) => {
    router.push(
      `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${newTopicId}/content/${newContentId}`
    );
  };

  if (!currentContent) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Content not found</h2>
            <Button onClick={handleGoBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLecture =
    currentContent.type === "Lecture" && currentContent.videoUrl;
  const isPdf = currentContent.type === "PDF" && currentContent.pdfUrl;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card shrink-0">
        <div className="container max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">
                {currentContent.name}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {chapter?.name || "Chapter"} • {topic?.name || "Topic"}
              </p>
            </div>
            {currentContent.isCompleted && (
              <Badge className="bg-green-600 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 bg-black flex items-center justify-center p-4">
            {isLecture && currentContent.videoUrl ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-7xl"
              >
                <UnifiedVideoPlayer
                  src={currentContent.videoUrl}
                  poster={currentContent.videoThumbnail}
                  type={getVideoType(currentContent.videoType)}
                  className="w-full"
                  autoplay={true}
                  onEnded={() => {
                    // Auto-advance to next content if available
                    if (nextContent) {
                      handleNavigateContent(
                        nextContent.content.id,
                        nextContent.topicId
                      );
                    }
                  }}
                  onTimeUpdate={(time) => {
                    // Track progress
                    console.log("Current time:", time);
                  }}
                />
              </motion.div>
            ) : isPdf && currentContent.pdfUrl ? (
              <div className="w-full h-full">
                <iframe
                  src={currentContent.pdfUrl}
                  className="w-full h-full rounded-lg border"
                  title={currentContent.name}
                />
              </div>
            ) : (
              <div className="text-center text-white">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Content not available</p>
              </div>
            )}
          </div>

          {/* Content Info Section */}
          <div className="bg-card border-t shrink-0">
            <div className="container max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">
                    {currentContent.name}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <Badge
                      variant="secondary"
                      className={
                        currentContent.type === "Lecture"
                          ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                          : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      }
                    >
                      {currentContent.type}
                    </Badge>
                    {isLecture && currentContent.videoDuration && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDuration(currentContent.videoDuration)}
                      </div>
                    )}
                    {currentContent.videoType && (
                      <Badge variant="outline" className="text-xs">
                        {currentContent.videoType}
                      </Badge>
                    )}
                  </div>
                  {currentContent.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {currentContent.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (previousContent) {
                      handleNavigateContent(
                        previousContent.content.id,
                        previousContent.topicId
                      );
                    }
                  }}
                  disabled={!previousContent}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    if (nextContent) {
                      handleNavigateContent(
                        nextContent.content.id,
                        nextContent.topicId
                      );
                    }
                  }}
                  disabled={!nextContent}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="w-80 border-l bg-card shrink-0 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Course Content</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {subjects.map((subject) => {
                const subjectChapters = chapters.filter(
                  (ch) => ch.subjectId === subject.id
                );
                const isCurrentSubject = subject.id === subjectId;

                return (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {subject.name}
                    </div>
                    {isCurrentSubject &&
                      subjectChapters.map((ch) => {
                        const chapterTopics = topics.filter(
                          (t) => t.chapterId === ch.id
                        );
                        const isCurrentChapter = ch.id === chapterId;

                        return (
                          <div key={ch.id} className="ml-4 space-y-1">
                            <div
                              className={cn(
                                "text-sm font-medium py-1",
                                isCurrentChapter && "text-primary"
                              )}
                            >
                              {ch.name}
                            </div>
                            {isCurrentChapter &&
                              chapterTopics.map((t) => {
                                const isCurrentTopic = t.id === topicId;
                                const topicContents =
                                  t.id === topicId ? contents : [];

                                return (
                                  <div key={t.id} className="ml-4 space-y-1">
                                    <div
                                      className={cn(
                                        "text-xs font-medium py-1 text-muted-foreground",
                                        isCurrentTopic && "text-primary"
                                      )}
                                    >
                                      {t.name}
                                    </div>
                                    {isCurrentTopic &&
                                      topicContents.map((c) => {
                                        const isCurrent = c.id === contentId;
                                        return (
                                          <Link
                                            key={c.id}
                                            href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/content/${c.id}`}
                                            className={cn(
                                              "block text-xs py-1.5 px-2 rounded hover:bg-muted transition-colors",
                                              isCurrent &&
                                                "bg-primary/10 text-primary font-medium"
                                            )}
                                          >
                                            <div className="flex items-center gap-2">
                                              {c.type === "Lecture" ? (
                                                <Video className="h-3 w-3 shrink-0" />
                                              ) : (
                                                <FileText className="h-3 w-3 shrink-0" />
                                              )}
                                              <span className="truncate">
                                                {c.name}
                                              </span>
                                              {c.isCompleted && (
                                                <CheckCircle2 className="h-3 w-3 text-green-600 ml-auto shrink-0" />
                                              )}
                                            </div>
                                          </Link>
                                        );
                                      })}
                                  </div>
                                );
                              })}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
