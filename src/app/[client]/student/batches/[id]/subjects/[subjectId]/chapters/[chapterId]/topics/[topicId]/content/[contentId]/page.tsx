"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type Player from "video.js/dist/types/player";
import {
  useGetClientTopic,
  useGetClientChapter,
  useGetClientSubjectsByBatch,
  useGetClientTopicsByChapter,
  useGetClientChaptersBySubject,
  useGetClientContentsByTopic,
} from "@/hooks";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { ContentPlayerHeader } from "./components/content-player-header";
import { ContentPlayerSidebar } from "./components/content-player-sidebar";
import { VideoPlayerWrapper } from "./components/video-player-wrapper";
import {
  type Content,
  type Subject,
  type Chapter,
  type Topic,
  buildContentPath,
  buildTopicPath,
} from "./utils/content-player-utils";
import "./video-player.css";

export default function ContentPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;
  const topicId = params.topicId as string;
  const contentId = params.contentId as string;

  // State
  const [playerInstance, setPlayerInstance] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Refs
  const currentContentRef = useRef<HTMLAnchorElement | null>(null);

  // Video progress tracking
  const {
    isCompleted,
    handleMarkAsComplete,
    setupPlayerHandlers,
    handleTimeUpdate,
    handleVideoEnded,
    isMarkingComplete,
    cleanup: cleanupProgress,
  } = useVideoProgress({
    contentId,
  });

  // Fetch data
  const { data: topicResponse } = useGetClientTopic(topicId);
  const { data: contentsResponse } = useGetClientContentsByTopic(topicId);
  const { data: chapterResponse } = useGetClientChapter(chapterId);
  const { data: subjectsResponse } = useGetClientSubjectsByBatch(batchId);
  const { data: topicsResponse } = useGetClientTopicsByChapter(chapterId);
  const { data: chaptersResponse } = useGetClientChaptersBySubject(subjectId);

  // Extract data
  const topic = topicResponse?.data || topicResponse;
  const contents: Content[] = contentsResponse?.data || [];
  const chapter = chapterResponse?.data || chapterResponse;
  const subjects: Subject[] = subjectsResponse?.data || [];
  const topics: Topic[] = topicsResponse?.data || [];
  const chapters: Chapter[] = chaptersResponse?.data || [];

  const currentContent = contents.find((c) => c.id === contentId);

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

  // Cleanup when content changes or component unmounts
  useEffect(() => {
    return () => {
      if (cleanupHandlersRef.current) {
        cleanupHandlersRef.current();
        cleanupHandlersRef.current = null;
      }
      cleanupProgress();
    };
  }, [contentId, cleanupProgress]);

  // Filter contents based on search
  const filteredContents = useMemo(() => {
    if (!searchQuery.trim()) return contents;
    const query = searchQuery.toLowerCase();
    return contents.filter((c) => c.name.toLowerCase().includes(query));
  }, [contents, searchQuery]);

  // Navigation helpers
  const allContents = contents.map((c) => ({
    content: c,
    topicId: topicId,
    topicName: topic?.name || "",
  }));

  const currentIndex = allContents.findIndex(
    (item) => item.content.id === contentId
  );
  const nextContent =
    currentIndex < allContents.length - 1
      ? allContents[currentIndex + 1]
      : null;

  // Handlers
  const handleGoBack = () => {
    router.push(buildTopicPath(batchId, subjectId, chapterId, topicId));
  };

  const handleNavigateContent = (newContentId: string, newTopicId: string) => {
    router.push(
      buildContentPath(batchId, subjectId, chapterId, newTopicId, newContentId)
    );
  };

  const cleanupHandlersRef = useRef<(() => void) | null>(null);

  const handlePlayerReady = (player: Player) => {
    setPlayerInstance(player);
    // Cleanup previous handlers if any
    if (cleanupHandlersRef.current) {
      cleanupHandlersRef.current();
    }
    // Setup new handlers and store cleanup function
    cleanupHandlersRef.current = setupPlayerHandlers(player);
  };

  const handleTimeUpdateCallback = (currentTime: number) => {
    handleTimeUpdate(currentTime, playerInstance);
  };

  const handleVideoEndedCallback = () => {
    handleVideoEnded();
    // Auto-advance to next content if available
    if (nextContent) {
      handleNavigateContent(nextContent.content.id, nextContent.topicId);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const previousContent =
        currentIndex > 0 ? allContents[currentIndex - 1] : null;

      if (e.key === "ArrowLeft" && previousContent) {
        e.preventDefault();
        router.push(
          buildContentPath(
            batchId,
            subjectId,
            chapterId,
            previousContent.topicId,
            previousContent.content.id
          )
        );
      } else if (e.key === "ArrowRight" && nextContent) {
        e.preventDefault();
        router.push(
          buildContentPath(
            batchId,
            subjectId,
            chapterId,
            nextContent.topicId,
            nextContent.content.id
          )
        );
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    currentIndex,
    allContents,
    nextContent,
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

  return (
    <div className="h-screen flex flex-col bg-background">
      <ContentPlayerHeader
        contentName={currentContent.name}
        chapterName={chapter?.name}
        topicName={topic?.name}
        isCompleted={isCompleted}
        isMarkingComplete={isMarkingComplete}
        onGoBack={handleGoBack}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onMarkAsComplete={handleMarkAsComplete}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <motion.div
          className="flex-1 flex flex-col overflow-hidden"
          animate={{
            marginRight: sidebarOpen ? 0 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <VideoPlayerWrapper
            content={currentContent}
            playerInstance={playerInstance}
            onPlayerReady={handlePlayerReady}
            onTimeUpdate={handleTimeUpdateCallback}
            onEnded={handleVideoEndedCallback}
          />
        </motion.div>

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
          <ContentPlayerSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            subjects={subjects}
            chapters={chapters}
            topics={topics}
            contents={contents}
            filteredContents={filteredContents}
            currentSubjectId={subjectId}
            currentChapterId={chapterId}
            currentTopicId={topicId}
            currentContentId={contentId}
            batchId={batchId}
            sidebarOpen={sidebarOpen}
            currentContentRef={currentContentRef}
          />
        </motion.div>

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
