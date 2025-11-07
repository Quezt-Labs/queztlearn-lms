"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetClientSubjectsByBatch,
  useGetClientChaptersBySubject,
} from "@/hooks";
import { useParams } from "next/navigation";
import { ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Subject {
  id: string;
  name: string;
  thumbnailUrl?: string;
  description?: string;
}

// Subject-specific styling configuration
const getSubjectConfig = (subjectName: string) => {
  const name = subjectName.toLowerCase();

  if (name.includes("physics")) {
    return {
      gradient: "from-blue-500/10 via-purple-500/10 to-indigo-500/10",
      borderColor: "border-blue-200 dark:border-blue-800",
    };
  }
  if (name.includes("chemistry")) {
    return {
      gradient: "from-green-500/10 via-emerald-500/10 to-teal-500/10",
      borderColor: "border-green-200 dark:border-green-800",
    };
  }
  if (name.includes("math") || name.includes("mathematics")) {
    return {
      gradient: "from-orange-500/10 via-red-500/10 to-pink-500/10",
      borderColor: "border-orange-200 dark:border-orange-800",
    };
  }
  // Default styling
  return {
    gradient: "from-gray-500/10 via-slate-500/10 to-zinc-500/10",
    borderColor: "border-border",
  };
};

// Component to fetch and display chapter count for a subject
function SubjectChapterCount({ subjectId }: { subjectId: string }) {
  const { data: chaptersResponse, isLoading } =
    useGetClientChaptersBySubject(subjectId);
  const chapterCount = chaptersResponse?.data?.length || 0;

  if (isLoading) {
    return <div className="h-4 w-16 bg-muted rounded animate-pulse" />;
  }

  return (
    <Badge variant="secondary" className="text-xs font-medium">
      {chapterCount} {chapterCount === 1 ? "Chapter" : "Chapters"}
    </Badge>
  );
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
        className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
      >
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="animate-pulse space-y-4">
                <div className="aspect-video bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-10 bg-muted rounded w-full" />
                </div>
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
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">
              No Subjects Available
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Subjects will be available here once they are added to this batch.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold tracking-tight mb-1">Subjects</h2>
        <p className="text-muted-foreground text-sm">
          Explore all subjects and their chapters
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
      >
        {subjects.map((subject, index) => {
          const config = getSubjectConfig(subject.name);

          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                href={`/student/batches/${batchId}/subjects/${subject.id}`}
                className="block h-full"
              >
                <Card
                  className={cn(
                    "group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer h-full flex flex-col",
                    config.borderColor,
                    "hover:border-primary/50"
                  )}
                >
                  {/* Gradient Background */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity",
                      config.gradient
                    )}
                  />

                  <CardContent className="relative p-0 flex flex-col h-full">
                    {/* Thumbnail Preview */}
                    {subject.thumbnailUrl ? (
                      <div className="relative overflow-hidden">
                        <div className="aspect-video relative bg-muted">
                          <img
                            src={subject.thumbnailUrl}
                            alt={subject.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted" />
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      {/* Header with Title */}
                      <div className="mb-3">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {subject.name}
                        </h3>
                        <SubjectChapterCount subjectId={subject.id} />
                      </div>

                      {/* Description */}
                      {subject.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                          {subject.description}
                        </p>
                      )}

                      {/* CTA Button */}
                      <div
                        className={cn(
                          "w-full mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md border-2 text-sm font-medium transition-colors",
                          "group-hover:bg-primary group-hover:text-primary-foreground",
                          config.borderColor
                        )}
                      >
                        <PlayCircle className="h-4 w-4" />
                        Explore Chapters
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
