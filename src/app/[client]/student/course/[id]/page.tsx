"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useCourses } from "@/hooks";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import {
  CourseContent,
  Course,
  Subject,
  Chapter,
} from "@/components/student/course";
import {
  ContentViewer,
  ChapterList,
  CourseSidebar,
  calculateCourseProgress,
} from "@/components/student/course";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(
    null
  );

  const { data: coursesData, isLoading, error } = useCourses();

  interface CoursesResponse {
    courses?: Course[];
    [key: string]: unknown;
  }

  const courseData = useMemo(() => {
    const courses = (coursesData as CoursesResponse | undefined)?.courses;
    return courses?.find((c: Course) => c.id === courseId);
  }, [coursesData, courseId]);

  // Extract all chapters from all subjects
  const allChapters = useMemo(() => {
    if (!courseData?.subjects || !Array.isArray(courseData.subjects)) {
      return [];
    }
    return (courseData.subjects as Subject[]).flatMap(
      (subject) => subject.chapters || []
    );
  }, [courseData]);

  // Calculate progress
  const progress = useMemo(
    () => calculateCourseProgress(courseData?.subjects),
    [courseData?.subjects]
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading course details..." />;
  }

  if (error || !courseData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load course details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={(courseData.title as string) || "Course Details"}
        description={(courseData.description as string) || ""}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Content */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <ContentViewer
              content={selectedContent}
              onBack={() => setSelectedContent(null)}
            />
          ) : (
            <ChapterList
              chapters={allChapters}
              onContentSelect={setSelectedContent}
            />
          )}
        </div>

        {/* Course Info Sidebar */}
        <CourseSidebar course={courseData} progress={progress} />
      </div>
    </div>
  );
}
