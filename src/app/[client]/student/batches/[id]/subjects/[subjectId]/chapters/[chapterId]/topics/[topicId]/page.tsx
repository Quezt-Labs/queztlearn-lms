"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Video,
  Download,
  PlayCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const handleOpenVideo = (content: Content) => {
    // Navigate to dedicated video player page
    router.push(
      `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/content/${content.id}`
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

      {/* Content Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">Content</h2>
            <p className="text-muted-foreground text-sm">
              {contents.length} {contents.length === 1 ? "Item" : "Items"}{" "}
              available
            </p>
          </div>
        </div>

        {contents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No content available
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                This topic doesn&apos;t have any lectures or PDFs yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all">All ({contents.length})</TabsTrigger>
                <TabsTrigger value="lectures">
                  Lectures ({lectures.length})
                </TabsTrigger>
                <TabsTrigger value="pdfs">PDFs ({pdfs.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {contents.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ContentCard
                        content={content}
                        formatDuration={formatDuration}
                        onPlayVideo={handleOpenVideo}
                      />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="lectures" className="mt-6">
                {lectures.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Video className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No lectures available
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {lectures.map((content, index) => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ContentCard
                          content={content}
                          formatDuration={formatDuration}
                          onPlayVideo={handleOpenVideo}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pdfs" className="mt-6">
                {pdfs.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No PDFs available</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {pdfs.map((content, index) => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ContentCard
                          content={content}
                          formatDuration={formatDuration}
                          onPlayVideo={handleOpenVideo}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentCard({
  content,
  formatDuration,
  onPlayVideo,
}: {
  content: Content;
  formatDuration: (seconds?: number) => string;
  onPlayVideo: (content: Content) => void;
}) {
  const isLecture = content.type === "Lecture" && content.videoUrl;
  const isPdf = content.type === "PDF" && content.pdfUrl;

  const handleOpenPdf = (url: string) => {
    window.open(url, "_blank");
  };

  const handlePlayVideo = () => {
    onPlayVideo(content);
  };

  return (
    <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer h-full flex flex-col hover:border-primary/50">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardContent className="relative p-0 flex flex-col h-full">
        {/* Thumbnail/Icon Section */}
        {isLecture && content.videoThumbnail ? (
          <div
            className="relative aspect-video overflow-hidden bg-muted cursor-pointer group/thumbnail"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayVideo();
            }}
          >
            <motion.img
              src={content.videoThumbnail}
              alt={content.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 bg-black/30 flex items-center justify-center"
              initial={{ opacity: 0.3 }}
              whileHover={{ opacity: 0.2 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="h-14 w-14 rounded-full bg-white dark:bg-white/95 flex items-center justify-center shadow-2xl border-2 border-white/20 backdrop-blur-sm"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <PlayCircle className="h-7 w-7 text-primary fill-primary/20" />
                </motion.div>
              </motion.div>
            </motion.div>
            {content.isCompleted && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-600 text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            {isLecture ? (
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Video className="h-8 w-8 text-primary" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            )}
            {content.isCompleted && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-600 text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content Info */}
        <div className="p-6 flex flex-col flex-1">
          <div className="mb-3">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {content.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className={
                  content.type === "Lecture"
                    ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs"
                    : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-xs"
                }
              >
                {content.type}
              </Badge>
              {isLecture && content.videoDuration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(content.videoDuration)}
                </div>
              )}
              {content.videoType && (
                <Badge variant="outline" className="text-xs">
                  {content.videoType}
                </Badge>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-auto pt-4 border-t border-border/50">
            {isLecture && content.videoUrl ? (
              <Button
                size="sm"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayVideo();
                }}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Watch Now
              </Button>
            ) : isPdf && content.pdfUrl ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenPdf(content.pdfUrl!);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
