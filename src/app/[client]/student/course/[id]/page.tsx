"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCourses } from "@/hooks";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  CheckCircle2,
  FileText,
  Video as VideoIcon,
  BookOpen,
  Clipboard,
} from "lucide-react";
import { UnifiedVideoPlayer } from "@/components/common/unified-video-player";
import { Separator } from "@/components/ui/separator";

interface Content {
  id: string;
  name: string;
  type: "Lecture" | "Video" | "PDF" | "Assignment";
  pdfUrl?: string;
  videoUrl?: string;
  videoType?: "HLS" | "MP4" | "YouTube";
  videoThumbnail?: string;
  videoDuration?: number;
  isCompleted: boolean;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
  contents?: Content[];
}

interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  topics?: Topic[];
}

interface Subject {
  id: string;
  name: string;
  courseId: string;
  chapters?: Chapter[];
}

interface Lesson {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

export default function StudentCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  // For now, we'll use a mock course since we don't have a specific course hook
  const { data: coursesData } = useCourses();
  interface Course {
    id: string;
    [key: string]: unknown;
  }
  interface CoursesResponse {
    courses?: Course[];
    [key: string]: unknown;
  }
  const courseData = (
    coursesData as CoursesResponse | undefined
  )?.courses?.find((c: Course) => c.id === courseId);
  const isLoading = false; // Mock loading state
  const error = null; // Mock error state

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <VideoIcon className="h-4 w-4" />;
      case "PDF":
        return <FileText className="h-4 w-4" />;
      case "Assignment":
        return <Clipboard className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    const colors = {
      Lecture: "bg-blue-100 text-blue-800",
      Video: "bg-green-100 text-green-800",
      PDF: "bg-purple-100 text-purple-800",
      Assignment: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || colors.Lecture;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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

  const course = courseData;

  // Get video type for Video.js
  const getVideoType = (
    videoType?: string
  ): "video/mp4" | "application/x-mpegURL" | "video/webm" | "video/youtube" => {
    if (videoType === "HLS") {
      return "application/x-mpegURL";
    }
    if (videoType === "YouTube") {
      return "video/youtube";
    }
    return "video/mp4";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={(course?.title as string) || "Course Details"}
        description={(course?.description as string) || ""}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Content */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedContent.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContent(null)}
                  >
                    Back to Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedContent.type === "Video" &&
                selectedContent.videoUrl ? (
                  <UnifiedVideoPlayer
                    src={selectedContent.videoUrl}
                    poster={selectedContent.videoThumbnail}
                    type={getVideoType(selectedContent.videoType)}
                    className="w-full"
                  />
                ) : selectedContent.type === "PDF" && selectedContent.pdfUrl ? (
                  <iframe
                    src={selectedContent.pdfUrl}
                    className="w-full h-[600px] rounded-lg border"
                    title={selectedContent.name}
                  />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No content available to display.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                {course?.subjects &&
                Array.isArray(course.subjects) &&
                course.subjects.length > 0 ? (
                  <div className="space-y-2">
                    {(course.subjects as Subject[]).map((subject: Subject) =>
                      subject.chapters?.map((chapter: Chapter) => (
                        <div
                          key={chapter.id}
                          className="border rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  expandedChapters.has(chapter.id)
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                              <span className="font-medium">
                                {chapter.name}
                              </span>
                            </div>
                            <Badge variant="secondary">
                              {chapter.topics?.length || 0} topics
                            </Badge>
                          </button>

                          {expandedChapters.has(chapter.id) && (
                            <div className="border-t p-4 space-y-2">
                              {chapter.topics?.map((topic: Topic) => (
                                <div key={topic.id} className="space-y-2">
                                  <div className="font-medium text-sm">
                                    {topic.name}
                                  </div>
                                  <div className="space-y-1">
                                    {topic.contents?.map((content: Content) => (
                                      <button
                                        key={content.id}
                                        onClick={() =>
                                          setSelectedContent(content)
                                        }
                                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded transition-colors text-left"
                                      >
                                        <div className="flex items-center space-x-2">
                                          {getContentTypeIcon(content.type)}
                                          <span className="text-sm">
                                            {content.name}
                                          </span>
                                          <Badge
                                            variant="secondary"
                                            className={`text-xs ${getContentTypeColor(
                                              content.type
                                            )}`}
                                          >
                                            {content.type}
                                          </Badge>
                                        </div>
                                        {content.isCompleted && (
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No content available yet.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Course Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>0%</span>
                </div>
                <Progress value={0} />
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lessons</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span>0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About This Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                {(course?.description as string) || "No description available."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
