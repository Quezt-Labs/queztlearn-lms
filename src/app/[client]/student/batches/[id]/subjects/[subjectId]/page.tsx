"use client";

import { useParams, useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetClientSubject, useGetClientChaptersBySubject } from "@/hooks";
import { PageHeaderWithBack } from "@/components/common/page-header-with-back";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { HorizontalListItemCard } from "@/components/common/horizontal-list-item-card";
import { ChapterTopicCount } from "@/components/student/chapter-topic-count";

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
    router.push(`/student/batches/${batchId}?tab=subjects`);
  };

  if (subjectLoading || chaptersLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <LoadingSpinner />
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
    <div className="container max-w-7xl mx-auto px-4 py-4 lg:py-6">
      <PageHeaderWithBack
        title={subjectData.name}
        thumbnailUrl={subjectData.thumbnailUrl}
        icon={BookOpen}
        onBack={handleGoBack}
      />

      <div className="space-y-3">
        <SectionHeader
          title="Chapters"
          subtitle={`${chapters.length} ${
            chapters.length === 1 ? "Chapter" : "Chapters"
          } available`}
          showAccent
        />

        {chapters.length === 0 ? (
          <EmptyStateCard
            icon={BookOpen}
            title="No chapters available"
            description="Chapters will be available here once they are added to this subject."
          />
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <HorizontalListItemCard
                key={chapter.id}
                id={chapter.id}
                name={chapter.name}
                href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapter.id}`}
                index={index + 1}
                subtitle={<ChapterTopicCount chapterId={chapter.id} />}
                animationDelay={index * 0.03}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
