"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetContentsByTopic } from "@/hooks";
import { Video, FileText, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  createdAt?: string;
  updatedAt?: string;
}

interface Topic {
  id: string;
  name: string;
  chapterId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ViewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
}

export function ViewTopicModal({
  isOpen,
  onClose,
  topic,
}: ViewTopicModalProps) {
  // Preserve topic while modal is open to avoid null issues
  const [preservedTopic, setPreservedTopic] = useState<Topic | null>(null);

  // Update preserved topic when topic prop changes
  useEffect(() => {
    if (topic) {
      setPreservedTopic(topic);
    }
  }, [topic]);

  // Clear preserved topic when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Delay clearing to allow modal close animation
      const timer = setTimeout(() => {
        setPreservedTopic(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Use topic prop if available, otherwise fall back to preserved topic
  // This ensures we have a topic even if it becomes null briefly
  const currentTopic = topic || preservedTopic;

  // Only fetch contents when we have a valid topic ID and modal is open
  const topicId = isOpen && currentTopic?.id ? currentTopic.id : "";
  const { data: contentsData, isLoading: contentsLoading } =
    useGetContentsByTopic(topicId);

  const contents = contentsData?.data || [];

  const lectures = contents.filter(
    (content: Content) => content.type === "Lecture" && content.videoUrl
  );
  const pdfs = contents.filter(
    (content: Content) => content.type === "PDF" && content.pdfUrl
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>{currentTopic?.name || "View Topic"}</DialogTitle>
          <DialogDescription>
            View all lectures and PDFs associated with this topic
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {contentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                Loading content...
              </span>
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No content available</h3>
              <p className="text-muted-foreground">
                This topic doesn&apos;t have any lectures or PDFs yet.
              </p>
            </div>
          ) : (
            <Tabs
              defaultValue="all"
              className="w-full flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="grid w-full grid-cols-3 shrink-0">
                <TabsTrigger value="all">All ({contents.length})</TabsTrigger>
                <TabsTrigger value="lectures">
                  Lectures ({lectures.length})
                </TabsTrigger>
                <TabsTrigger value="pdfs">PDFs ({pdfs.length})</TabsTrigger>
              </TabsList>

              <TabsContent
                value="all"
                className="mt-4 flex-1 overflow-y-auto space-y-1"
              >
                <div className="grid grid-cols-1 gap-1">
                  {contents.map((content: Content) => (
                    <ContentCard
                      key={content.id}
                      content={{
                        ...content,
                        topicId: content.topicId || currentTopic?.id || "",
                      }}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent
                value="lectures"
                className="mt-4 flex-1 overflow-y-auto space-y-1"
              >
                {lectures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No lectures available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {lectures.map((content: Content) => (
                      <ContentCard
                        key={content.id}
                        content={{
                          ...content,
                          topicId: content.topicId || currentTopic?.id || "",
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="pdfs"
                className="mt-4 flex-1 overflow-y-auto space-y-1"
              >
                {pdfs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No PDFs available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {pdfs.map((content: Content) => (
                      <ContentCard
                        key={content.id}
                        content={{
                          ...content,
                          topicId: content.topicId || currentTopic?.id || "",
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContentCard({ content }: { content: Content }) {
  const isLecture = content.type === "Lecture" && content.videoUrl;
  const isPdf = content.type === "PDF" && content.pdfUrl;

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenPdf = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="border rounded-md p-2 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isLecture && <Video className="h-4 w-4 text-green-600 shrink-0" />}
          {isPdf && <FileText className="h-4 w-4 text-purple-600 shrink-0" />}
          <h4 className="font-medium text-sm truncate flex-1">
            {content.name}
          </h4>
          <Badge
            variant="secondary"
            className={
              content.type === "Lecture"
                ? "bg-green-100 text-green-800 text-xs py-0 px-1.5"
                : content.type === "PDF"
                ? "bg-purple-100 text-purple-800 text-xs py-0 px-1.5"
                : "bg-blue-100 text-blue-800 text-xs py-0 px-1.5"
            }
          >
            {content.type}
          </Badge>
          {isLecture && content.videoDuration && (
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDuration(content.videoDuration)}
            </span>
          )}
          {content.videoType && (
            <Badge variant="outline" className="text-xs py-0 px-1.5 shrink-0">
              {content.videoType}
            </Badge>
          )}
          {content.isCompleted && (
            <Badge
              variant="default"
              className="bg-green-600 text-xs py-0 px-1.5 shrink-0"
            >
              ✓
            </Badge>
          )}
        </div>

        {isPdf && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-7 text-xs px-2"
            onClick={() => content.pdfUrl && handleOpenPdf(content.pdfUrl)}
          >
            <Download className="h-3 w-3 mr-1" />
            Open
          </Button>
        )}
      </div>
    </div>
  );
}
