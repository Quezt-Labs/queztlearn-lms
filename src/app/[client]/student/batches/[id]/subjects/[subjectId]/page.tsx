"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetClientSubject,
  useGetClientChaptersBySubject,
} from "@/hooks";
import Link from "next/link";

interface Chapter {
  id: string;
  name: string;
  subjectId: string;
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
    router.push(`/student/batches/${batchId}`);
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

      {/* Chapters List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chapters ({chapters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chapters.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No chapters available</h3>
              <p className="text-muted-foreground">
                Chapters will be available here once they are added.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base lg:text-lg">
                            {chapter.name}
                          </h3>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          asChild
                        >
                          <Link
                            href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapter.id}`}
                          >
                            View Topics
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

