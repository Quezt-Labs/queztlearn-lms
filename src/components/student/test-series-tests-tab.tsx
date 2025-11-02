"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, Play, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClientTestInSeries } from "@/hooks/test-series-client";

interface TestSeriesTestsTabProps {
  tests: ClientTestInSeries[];
  isEnrolled: boolean;
  isLoading: boolean;
}

export function TestSeriesTestsTab({
  tests,
  isEnrolled,
  isLoading,
}: TestSeriesTestsTabProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading tests...
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <div className="max-w-md mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 animate-pulse" />
            </div>
            <FileText className="h-16 w-16 mx-auto text-primary relative z-10" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Tests Coming Soon!</h3>
          <p className="text-muted-foreground mb-4">
            We&apos;re currently preparing comprehensive tests for this series.
            Enroll now to get notified when they&apos;re available and enjoy
            early access.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Expected soon</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        {tests.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-2">{test.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {test.durationMinutes} min
                      </span>
                      <span>{test.totalMarks} marks</span>
                      {test.isFree && (
                        <Badge variant="secondary" className="text-xs">
                          Free
                        </Badge>
                      )}
                    </div>
                    {test.attemptStatus && (
                      <Badge
                        variant={
                          test.attemptStatus === "COMPLETED"
                            ? "default"
                            : test.attemptStatus === "IN_PROGRESS"
                            ? "secondary"
                            : "outline"
                        }
                        className="mt-3"
                      >
                        {test.attemptStatus === "COMPLETED" ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        ) : test.attemptStatus === "IN_PROGRESS" ? (
                          "In Progress"
                        ) : (
                          "Not Started"
                        )}
                      </Badge>
                    )}
                  </div>
                  {isEnrolled && (
                    <Button
                      asChild
                      size="sm"
                      variant={
                        test.attemptStatus === "COMPLETED"
                          ? "outline"
                          : "default"
                      }
                      className="shrink-0"
                    >
                      <Link href={`/student/tests/${test.id}/instructions`}>
                        <Play className="mr-2 h-4 w-4" />
                        {test.attemptStatus === "COMPLETED"
                          ? "Review"
                          : test.attemptStatus === "IN_PROGRESS"
                          ? "Resume"
                          : "Start"}
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
