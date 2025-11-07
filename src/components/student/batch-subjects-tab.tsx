"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetClientSubjectsByBatch } from "@/hooks";
import { useParams } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Subject {
  id: string;
  name: string;
  thumbnailUrl?: string;
  description?: string;
}

export function BatchSubjectsTab() {
  const params = useParams();
  const batchId = params.id as string;

  const { data: subjectsResponse, isLoading } =
    useGetClientSubjectsByBatch(batchId);
  const subjects: Subject[] = subjectsResponse?.data || [];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    );
  }

  if (subjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">No Subjects Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Subjects will be available here once they are added to this batch.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {subjects.map((subject, index) => (
        <motion.div
          key={subject.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">
                      {subject.name}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subject.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {subject.description}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href={`/student/batches/${batchId}/subjects/${subject.id}`}>
                  View Chapters
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

