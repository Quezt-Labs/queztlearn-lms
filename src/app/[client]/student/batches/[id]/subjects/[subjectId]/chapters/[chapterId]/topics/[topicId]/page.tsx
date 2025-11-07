"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Video, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetClientTopic, useGetContentsByTopic } from "@/hooks";

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
}

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;
  const topicId = params.topicId as string;

  const { data: topicResponse, isLoading: topicLoading } =
    useGetClientTopic(topicId);
  const { data: contentsResponse, isLoading: contentsLoading } =
    useGetContentsByTopic(topicId);

  const topic = topicResponse?.data || topicResponse;
  const contents: Content[] = contentsResponse?.data || [];

  const handleGoBack = () => {
    router.push(
      `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}`
    );
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const lectures = contents.filter(
    (content) => content.type === "Lecture" && content.videoUrl
  );
  const pdfs = contents.filter(
    (content) => content.type === "PDF" && content.pdfUrl
  );

  if (topicLoading || contentsLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Topic not found</h2>
            <Button onClick={handleGoBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topicData = topic.data || topic;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {topicData.name}
          </h1>
          {topicData.description && (
            <p className="text-muted-foreground mt-2 text-sm lg:text-base">
              {topicData.description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {contents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No content available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              This topic doesn&apos;t have any lectures or PDFs yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Content ({contents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({contents.length})</TabsTrigger>
                <TabsTrigger value="lectures">
                  Lectures ({lectures.length})
                </TabsTrigger>
                <TabsTrigger value="pdfs">PDFs ({pdfs.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-3">
                {contents.map((content, index) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ContentCard
                      content={content}
                      formatDuration={formatDuration}
                    />
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="lectures" className="mt-4 space-y-3">
                {lectures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No lectures available
                  </div>
                ) : (
                  lectures.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ContentCard
                        content={content}
                        formatDuration={formatDuration}
                      />
                    </motion.div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="pdfs" className="mt-4 space-y-3">
                {pdfs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No PDFs available
                  </div>
                ) : (
                  pdfs.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ContentCard
                        content={content}
                        formatDuration={formatDuration}
                      />
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContentCard({
  content,
  formatDuration,
}: {
  content: Content;
  formatDuration: (seconds?: number) => string;
}) {
  const isLecture = content.type === "Lecture" && content.videoUrl;
  const isPdf = content.type === "PDF" && content.pdfUrl;

  const handleOpenPdf = (url: string) => {
    window.open(url, "_blank");
  };

  const handlePlayVideo = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isLecture && <Video className="h-5 w-5 text-green-600 shrink-0" />}
            {isPdf && <FileText className="h-5 w-5 text-purple-600 shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base lg:text-lg truncate">
                {content.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant="secondary"
                  className={
                    content.type === "Lecture"
                      ? "bg-green-100 text-green-800 text-xs"
                      : content.type === "PDF"
                      ? "bg-purple-100 text-purple-800 text-xs"
                      : "bg-blue-100 text-blue-800 text-xs"
                  }
                >
                  {content.type}
                </Badge>
                {isLecture && content.videoDuration && (
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(content.videoDuration)}
                  </span>
                )}
                {content.videoType && (
                  <Badge variant="outline" className="text-xs">
                    {content.videoType}
                  </Badge>
                )}
                {content.isCompleted && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {isLecture && content.videoUrl && (
              <Button
                size="sm"
                onClick={() => handlePlayVideo(content.videoUrl!)}
              >
                <Video className="h-4 w-4 mr-2" />
                Watch
              </Button>
            )}
            {isPdf && content.pdfUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenPdf(content.pdfUrl!)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
