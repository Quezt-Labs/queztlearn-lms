"use client";

import { useParams, useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetClientChapter, useGetClientTopicsByChapter } from "@/hooks";
import { PageHeaderWithBack } from "@/components/common/page-header-with-back";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { HorizontalListItemCard } from "@/components/common/horizontal-list-item-card";
import { TopicContentCount } from "@/components/student/topic-content-count";

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
        <LoadingSpinner />
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
    <div className="container max-w-7xl mx-auto px-4 py-4 lg:py-6">
      <PageHeaderWithBack
        title={chapterData.name}
        icon={FileText}
        onBack={handleGoBack}
      />

      <div className="space-y-3">
        <SectionHeader
          title="Topics"
          subtitle={`${topics.length} ${
            topics.length === 1 ? "Topic" : "Topics"
          } available`}
          showAccent
        />

        {topics.length === 0 ? (
          <EmptyStateCard
            icon={FileText}
            title="No topics available"
            description="Topics will be available here once they are added to this chapter."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, index) => (
              <HorizontalListItemCard
                key={topic.id}
                id={topic.id}
                name={topic.name}
                href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topic.id}`}
                index={index + 1}
                subtitle={<TopicContentCount topicId={topic.id} />}
                animationDelay={index * 0.03}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
