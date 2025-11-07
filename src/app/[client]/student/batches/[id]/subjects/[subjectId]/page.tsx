"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileText,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetClientSubject,
  useGetClientChaptersBySubject,
  useGetClientTopicsByChapter,
} from "@/hooks";
import Link from "next/link";

interface Chapter {
  id: string;
  name: string;
  subjectId: string;
}

// Component to fetch and display topic count for a chapter
function ChapterTopicCount({ chapterId }: { chapterId: string }) {
  const { data: topicsResponse, isLoading } =
    useGetClientTopicsByChapter(chapterId);
  const topicCount = topicsResponse?.data?.length || 0;

  if (isLoading) {
    return <div className="h-5 w-20 bg-muted rounded animate-pulse" />;
  }

  return (
    <Badge variant="secondary" className="text-xs font-medium">
      {topicCount} {topicCount === 1 ? "Topic" : "Topics"}
    </Badge>
  );
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  const subjectId = params.subjectId as string;

  const { data: subjectResponse, isLoading: subjectLoading } =
    useGetClientSubject(subjectId);
  const { data: chaptersResponse, isLoading: chaptersLoading } =
    useGetClientChaptersBySubject(subjectId);

  const subject = subjectResponse?.data || subjectResponse;
  const chapters: Chapter[] = chaptersResponse?.data || [];

  const handleGoBack = () => {
    router.push(`/student/batches/${batchId}?tab=subjects`);
  };

  if (subjectLoading || chaptersLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Subject not found</h2>
            <Button onClick={handleGoBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subjectData = subject.data || subject;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {subjectData.name}
          </h1>
          {subjectData.description && (
            <p className="text-muted-foreground mt-2 text-sm lg:text-base">
              {subjectData.description}
            </p>
          )}
        </div>
      </div>

      {/* Subject Thumbnail */}
      {subjectData.thumbnailUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="h-48 lg:h-64 w-full rounded-lg overflow-hidden relative">
            <img
              src={subjectData.thumbnailUrl}
              alt={`Subject thumbnail for ${subjectData.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      )}

      {/* Chapters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">Chapters</h2>
            <p className="text-muted-foreground text-sm">
              {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}{" "}
              available
            </p>
          </div>
        </div>

        {chapters.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No chapters available
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Chapters will be available here once they are added to this
                subject.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapter.id}`}
                  className="block h-full"
                >
                  <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer h-full flex flex-col hover:border-primary/50">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardContent className="relative p-6 flex flex-col h-full">
                      {/* Chapter Number and Icon */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Chapter {index + 1}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {chapter.name}
                          </h3>
                          <ChapterTopicCount chapterId={chapter.id} />
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-md border-2 border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors text-sm font-medium">
                          <PlayCircle className="h-4 w-4" />
                          Explore Topics
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
