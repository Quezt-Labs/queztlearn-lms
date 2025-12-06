"use client";

import { Search, X, BookOpen, Video, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Content, Subject, Chapter, Topic } from "../utils/content-player-utils";
import { formatDuration, buildContentPath } from "../utils/content-player-utils";

interface ContentPlayerSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  contents: Content[];
  filteredContents: Content[];
  currentSubjectId: string;
  currentChapterId: string;
  currentTopicId: string;
  currentContentId: string;
  batchId: string;
  sidebarOpen: boolean;
  currentContentRef: React.RefObject<HTMLAnchorElement | null>;
}

export function ContentPlayerSidebar({
  searchQuery,
  onSearchChange,
  subjects,
  chapters,
  topics,
  contents,
  filteredContents,
  currentSubjectId,
  currentChapterId,
  currentTopicId,
  currentContentId,
  batchId,
  sidebarOpen,
  currentContentRef,
}: ContentPlayerSidebarProps) {
  const allContents = contents.map((c) => ({
    content: c,
    topicId: currentTopicId,
    topicName: "",
  }));

  return (
    <>
      {sidebarOpen && (
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Course Content</h3>
            <Badge variant="outline" className="text-xs">
              {allContents.length} items
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-8 h-8 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-8 w-8 p-0"
                onClick={() => onSearchChange("")}
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
              const isCurrentSubject = subject.id === currentSubjectId;

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
                      const isCurrentChapter = ch.id === currentChapterId;

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
                              const isCurrentTopic = t.id === currentTopicId;
                              const topicContents =
                                t.id === currentTopicId ? contents : [];

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
                                    (searchQuery ? filteredContents : topicContents).map(
                                      (c) => {
                                        const isCurrent = c.id === currentContentId;
                                        const isWatched = c.isCompleted;
                                        return (
                                          <Link
                                            key={c.id}
                                            ref={isCurrent ? currentContentRef : null}
                                            href={buildContentPath(
                                              batchId,
                                              currentSubjectId,
                                              currentChapterId,
                                              currentTopicId,
                                              c.id
                                            )}
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
                                                      {formatDuration(c.videoDuration)}
                                                    </div>
                                                  )}
                                              </div>
                                            </div>
                                          </Link>
                                        );
                                      }
                                    )}
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
    </>
  );
}

