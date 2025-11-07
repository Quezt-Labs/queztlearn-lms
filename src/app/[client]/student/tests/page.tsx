"use client";

import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play } from "lucide-react";

// Temporary mock until student APIs are ready
const MOCK_TESTS = [
  {
    id: "mock-test-1",
    title: "Full Length Test 1",
    durationMinutes: 120,
    sectionCount: 3,
    questionCount: 90,
  },
  {
    id: "mock-test-2",
    title: "Subject Test - Physics",
    durationMinutes: 60,
    sectionCount: 1,
    questionCount: 30,
  },
];

export default function StudentTestsListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tests"
        description="Choose a test and start your attempt."
        breadcrumbs={[
          { label: "Student", href: "/student/dashboard" },
          { label: "Tests" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_TESTS.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{test.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Mock Test</Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {test.durationMinutes}m
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{test.sectionCount} sections • {test.questionCount} questions</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Practice test - No enrollment required
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button asChild>
                <Link href={`./tests/${test.id}/instructions?mock=1`}>
                  <Play className="mr-2 h-4 w-4" /> Start Mock Test
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
