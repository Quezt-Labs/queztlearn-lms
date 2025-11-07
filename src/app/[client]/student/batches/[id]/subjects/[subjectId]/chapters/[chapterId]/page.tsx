"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetClientChapter, useGetClientTopicsByChapter } from "@/hooks";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  chapterId: string;
  description?: string;
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

      {/* Topics List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Topics ({topics.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No topics available</h3>
              <p className="text-muted-foreground">
                Topics will be available here once they are added.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold text-base lg:text-lg">
                            {topic.name}
                          </h3>
                          {topic.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {topic.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          asChild
                        >
                          <Link
                            href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topic.id}`}
                          >
                            View Content
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
