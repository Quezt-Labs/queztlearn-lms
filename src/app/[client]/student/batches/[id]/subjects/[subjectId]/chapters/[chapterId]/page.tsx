"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  PlayCircle,
  Video,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetClientChapter,
  useGetClientTopicsByChapter,
  useGetContentsByTopic,
} from "@/hooks";
import Link from "next/link";

interface Topic {
  id: string;
  name: string;
  chapterId: string;
  description?: string;
}

interface TopicContent {
  type: "Lecture" | "PDF";
  videoUrl?: string;
  pdfUrl?: string;
}

// Component to fetch and display content count for a topic
function TopicContentCount({ topicId }: { topicId: string }) {
  const { data: contentsResponse, isLoading } = useGetContentsByTopic(topicId);
  const contents: TopicContent[] = contentsResponse?.data || [];

  const lectures = contents.filter(
    (content: TopicContent) => content.type === "Lecture" && content.videoUrl
  );
  const pdfs = contents.filter(
    (content: TopicContent) => content.type === "PDF" && content.pdfUrl
  );

  if (isLoading) {
    return <div className="h-5 w-24 bg-muted rounded animate-pulse" />;
  }

  const totalContent = lectures.length + pdfs.length;

  if (totalContent === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {lectures.length > 0 && (
        <Badge variant="secondary" className="text-xs font-medium">
          <Video className="h-3 w-3 mr-1" />
          {lectures.length} {lectures.length === 1 ? "Video" : "Videos"}
        </Badge>
      )}
      {pdfs.length > 0 && (
        <Badge variant="secondary" className="text-xs font-medium">
          <BookOpen className="h-3 w-3 mr-1" />
          {pdfs.length} {pdfs.length === 1 ? "PDF" : "PDFs"}
        </Badge>
      )}
    </div>
  );
}

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;

  const { data: chapterResponse, isLoading: chapterLoading } =
    useGetClientChapter(chapterId);
  const { data: topicsResponse, isLoading: topicsLoading } =
    useGetClientTopicsByChapter(chapterId);

  const chapter = chapterResponse?.data || chapterResponse;
  const topics: Topic[] = topicsResponse?.data || [];

  const handleGoBack = () => {
    router.push(`/student/batches/${batchId}/subjects/${subjectId}`);
  };

  if (chapterLoading || topicsLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Chapter not found</h2>
            <Button onClick={handleGoBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chapterData = chapter.data || chapter;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {chapterData.name}
          </h1>
        </div>
      </div>

      {/* Topics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">Topics</h2>
            <p className="text-muted-foreground text-sm">
              {topics.length} {topics.length === 1 ? "Topic" : "Topics"}{" "}
              available
            </p>
          </div>
        </div>

        {topics.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No topics available
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Topics will be available here once they are added to this
                chapter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topic.id}`}
                  className="block h-full"
                >
                  <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer h-full flex flex-col hover:border-primary/50">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardContent className="relative p-6 flex flex-col h-full">
                      {/* Topic Icon and Number */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Topic {index + 1}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {topic.name}
                          </h3>
                          <TopicContentCount topicId={topic.id} />
                        </div>
                      </div>

                      {/* Description */}
                      {topic.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                          {topic.description}
                        </p>
                      )}

                      {/* CTA Button */}
                      <div className="mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-md border-2 border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors text-sm font-medium">
                          <PlayCircle className="h-4 w-4" />
                          View Content
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
