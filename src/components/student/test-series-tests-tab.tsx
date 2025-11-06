"use client";

import { motion } from "framer-motion";
import { Clock, FileText } from "lucide-react";
import { TestCard } from "@/components/common/test-card";
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
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="space-y-3"
      >
        {tests?.map((test, index) => (
          <motion.div
            key={test.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <TestCard
              id={test.id}
              title={test.title}
              durationMinutes={test.durationMinutes}
              totalMarks={test.totalMarks}
              isFree={test.isFree}
              attemptStatus={test.attemptStatus}
              isEnrolled={isEnrolled}
              isPurchased={isEnrolled}
              testLink={
                isEnrolled
                  ? `/student/tests/${test.id}/instructions`
                  : undefined
              }
              index={0}
              showAnimation={false}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
