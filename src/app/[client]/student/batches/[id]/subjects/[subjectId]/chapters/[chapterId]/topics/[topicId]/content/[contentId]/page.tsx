"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  FileText,
  Video,
  CheckCircle2,
  BookOpen,
  Search,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type Player from "video.js/dist/types/player";
import {
  useGetClientTopic,
  useGetClientChapter,
  useGetClientSubjectsByBatch,
  useGetClientTopicsByChapter,
  useGetClientChaptersBySubject,
  useGetClientContentsByTopic,
} from "@/hooks";
import {
  useContentProgress,
  useTrackContentProgress,
  useMarkContentComplete,
} from "@/hooks/api";
import { UnifiedVideoPlayer } from "@/components/common/unified-video-player";
import Link from "next/link";
import { cn } from "@/lib/utils";
import "./video-player.css";

// Dynamically import PDFViewer with SSR disabled to avoid canvas issues
const PDFViewer = dynamic(
  () =>
    import("@/components/common/pdf-viewer").then((mod) => ({
      default: mod.PDFViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-muted-foreground">
        Loading PDF viewer...
      </div>
    ),
  }
);

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

  // State for features
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [playerInstance, setPlayerInstance] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Refs for auto-scroll and progress tracking
  const currentContentRef = useRef<HTMLAnchorElement>(null);
  const lastTrackedTime = useRef<number>(0);
  const hasResumed = useRef<boolean>(false);

  // Content progress hooks
  const { data: progressData } = useContentProgress(contentId);
  const trackProgress = useTrackContentProgress();
  const markComplete = useMarkContentComplete();

  // Handle manual mark as complete
  const handleMarkAsComplete = () => {
    if (progressData?.data?.isCompleted) {
      toast.info("Content already completed");
      return;
    }

    markComplete.mutate(contentId, {
      onSuccess: () => {
        toast.success("Content marked as completed! 🎉");
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to mark as complete. Please try again.";
        toast.error("Error", {
          description: errorMessage,
        });
      },
    });
  };

  // Check if content is completed (from API progress data)
  const isCompleted = progressData?.data?.isCompleted || false;

  // Fetch current content
  const { data: topicResponse } = useGetClientTopic(topicId);
  const { data: contentsResponse } = useGetClientContentsByTopic(topicId);
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

  // Reset resume state when content changes
  useEffect(() => {
    hasResumed.current = false;
    lastTrackedTime.current = 0;
  }, [contentId]);

  // Auto-scroll to current content in sidebar
  useEffect(() => {
    if (currentContentRef.current) {
      setTimeout(() => {
        currentContentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 300);
    }
  }, [contentId]);

  // Track playback speed
  useEffect(() => {
    if (playerInstance) {
      const handleRateChange = () => {
        const rate = playerInstance.playbackRate();
        if (rate !== null && rate !== undefined) {
          setPlaybackSpeed(rate);
        }
      };

      playerInstance.on("ratechange", handleRateChange);
      // Get initial playback rate
      const initialRate = playerInstance.playbackRate();
      if (initialRate !== null && initialRate !== undefined) {
        setPlaybackSpeed(initialRate);
      }

      return () => {
        playerInstance.off("ratechange", handleRateChange);
      };
    }
  }, [playerInstance]);

  // Filter contents based on search
  const filteredContents = useMemo(() => {
    if (!searchQuery.trim()) return contents;
    const query = searchQuery.toLowerCase();
    return contents.filter((c) => c.name.toLowerCase().includes(query));
  }, [contents, searchQuery]);

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

  // Stable references for keyboard navigation
  const previousContentId = previousContent?.content.id;
  const previousTopicId = previousContent?.topicId;
  const nextContentId = nextContent?.content.id;
  const nextTopicId = nextContent?.topicId;

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && previousContentId && previousTopicId) {
        e.preventDefault();
        router.push(
          `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${previousTopicId}/content/${previousContentId}`
        );
      } else if (e.key === "ArrowRight" && nextContentId && nextTopicId) {
        e.preventDefault();
        router.push(
          `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${nextTopicId}/content/${nextContentId}`
        );
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    previousContentId,
    previousTopicId,
    nextContentId,
    nextTopicId,
    batchId,
    subjectId,
    chapterId,
    router,
  ]);

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
        <div className="container max-w-[1920px] mx-auto px-4 py-3 space-y-2">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </Button>
            {isCompleted ? (
              <Badge className="bg-green-600 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsComplete}
                disabled={markComplete.isPending}
                className="shrink-0"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {markComplete.isPending ? "Marking..." : "Mark as Complete"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Player Section */}
        <motion.div
          className="flex-1 flex flex-col overflow-hidden"
          animate={{
            marginRight: sidebarOpen ? 0 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="flex-1 bg-black relative overflow-hidden">
            {isLecture && currentContent.videoUrl ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-full h-full relative"
              >
                {/* Subtle background gradient animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none"
                />

                <div className="w-full h-full relative z-10">
                  <UnifiedVideoPlayer
                    src={currentContent.videoUrl}
                    poster={currentContent.videoThumbnail}
                    type={getVideoType(currentContent.videoType)}
                    className="w-full h-full"
                    autoplay={true}
                    onReady={(player) => {
                      setPlayerInstance(player);
                      // Ensure player fills container
                      const playerEl = player.el() as HTMLElement;
                      if (playerEl) {
                        playerEl.style.width = "100%";
                        playerEl.style.height = "100%";
                        // Disable fluid mode to allow full height
                        player.fluid(false);
                        // Set dimensions
                        player.dimensions("100%", "100%");
                      }

                      // Resume from last watched position
                      if (
                        progressData?.data &&
                        !progressData.data.isCompleted &&
                        !hasResumed.current
                      ) {
                        const resumeTime = progressData.data.watchedSeconds;
                        const totalDuration = player.duration() || 0;
                        if (
                          resumeTime > 0 &&
                          resumeTime < totalDuration &&
                          totalDuration > 0
                        ) {
                          // Small delay to ensure player is ready
                          setTimeout(() => {
                            player.currentTime(resumeTime);
                            hasResumed.current = true;
                          }, 500);
                        }
                      }
                    }}
                    onTimeUpdate={(currentTime) => {
                      if (!playerInstance) return;

                      const totalDuration = playerInstance.duration() || 0;
                      if (totalDuration === 0) return;

                      // Track progress every 10 seconds
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
                        const watchPercentage =
                          (currentTime / totalDuration) * 100;
                        if (
                          watchPercentage >= 95 &&
                          progressData?.data &&
                          !progressData.data.isCompleted
                        ) {
                          markComplete.mutate(contentId, {
                            onSuccess: () => {
                              toast.success(
                                "Content completed automatically! 🎉"
                              );
                            },
                          });
                        }
                      }
                    }}
                    onEnded={() => {
                      // Mark as complete if not already
                      if (
                        progressData?.data &&
                        !progressData.data.isCompleted
                      ) {
                        markComplete.mutate(contentId, {
                          onSuccess: () => {
                            toast.success("Content completed! 🎉");
                          },
                        });
                      }

                      // Auto-advance to next content if available
                      if (nextContent) {
                        handleNavigateContent(
                          nextContent.content.id,
                          nextContent.topicId
                        );
                      }
                    }}
                  />
                </div>
              </motion.div>
            ) : isPdf && currentContent.pdfUrl ? (
              <div className="w-full h-full bg-background">
                <PDFViewer
                  fileUrl={currentContent.pdfUrl}
                  title={currentContent.name}
                  height="100%"
                  className="h-full"
                />
              </div>
            ) : (
              <div className="text-center text-white">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Content not available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar - Course Content */}
        <motion.div
          className="border-l bg-card shrink-0 flex flex-col"
          initial={false}
          animate={{
            width: sidebarOpen ? 320 : 0,
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            overflow: sidebarOpen ? "visible" : "hidden",
            minWidth: sidebarOpen ? 320 : 0,
          }}
        >
          {sidebarOpen && (
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Course Content</h3>
                <Badge variant="outline" className="text-xs">
                  {allContents.length} items
                </Badge>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-8 h-8 text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-8 w-8 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
          {sidebarOpen && (
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
                                        (searchQuery
                                          ? filteredContents
                                          : topicContents
                                        ).map((c, idx) => {
                                          const isCurrent = c.id === contentId;
                                          const isWatched = c.isCompleted;
                                          return (
                                            <Link
                                              key={c.id}
                                              ref={
                                                isCurrent
                                                  ? currentContentRef
                                                  : null
                                              }
                                              href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/content/${c.id}`}
                                              className={cn(
                                                "block text-xs py-2 px-2 rounded transition-colors group",
                                                isCurrent
                                                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                                                  : "hover:bg-muted/50"
                                              )}
                                            >
                                              <div className="flex items-start gap-2">
                                                <div className="mt-0.5 shrink-0">
                                                  {isWatched ? (
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                                  ) : (
                                                    <div
                                                      className={cn(
                                                        "h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center",
                                                        isCurrent
                                                          ? "border-primary bg-primary/20"
                                                          : "border-muted-foreground/30"
                                                      )}
                                                    >
                                                      {isCurrent && (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-1.5 mb-0.5">
                                                    {c.type === "Lecture" ? (
                                                      <Video className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                    ) : (
                                                      <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                    )}
                                                    <span className="truncate text-xs">
                                                      {c.name}
                                                    </span>
                                                  </div>
                                                  {c.type === "Lecture" &&
                                                    c.videoDuration && (
                                                      <div className="text-[10px] text-muted-foreground ml-4.5">
                                                        {formatDuration(
                                                          c.videoDuration
                                                        )}
                                                      </div>
                                                    )}
                                                </div>
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
          )}
        </motion.div>

        {/* Floating toggle button when sidebar is closed */}
        <AnimatePresence>
          {!sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
            >
              <Button
                variant="default"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="rounded-full shadow-lg"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
