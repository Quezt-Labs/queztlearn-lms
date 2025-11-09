"use client";

import { useParams, useRouter } from "next/navigation";
import { FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetClientTopic, useGetContentsByTopic } from "@/hooks";
import { PageHeaderWithBack } from "@/components/common/page-header-with-back";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyStateCard } from "@/components/common/empty-state-card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ContentFilterTabs } from "@/components/common/content-filter-tabs";
import { ContentGrid } from "@/components/common/content-grid";
import { ContentCard, type Content } from "@/components/student/content-card";
import { formatDuration } from "@/lib/utils/format-duration";

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;
  const topicId = params.topicId as string;

  const { data: topicResponse, isLoading: topicLoading } =
    useGetClientTopic(topicId);
  const { data: contentsResponse, isLoading: contentsLoading } =
    useGetContentsByTopic(topicId);

  const topic = topicResponse?.data || topicResponse;
  const contents: Content[] = contentsResponse?.data || [];

  const handleGoBack = () => {
    router.push(
      `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}`
    );
  };

  const handleOpenVideo = (content: Content) => {
    router.push(
      `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/content/${content.id}`
    );
  };

  const lectures = contents.filter(
    (content) => content.type === "Lecture" && content.videoUrl
  );
  const pdfs = contents.filter(
    (content) => content.type === "PDF" && content.pdfUrl
  );

  if (topicLoading || contentsLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Topic not found</h2>
            <Button onClick={handleGoBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topicData = topic.data || topic;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 lg:py-6">
      <PageHeaderWithBack
        title={topicData.name}
        description={topicData.description}
        icon={FileText}
        onBack={handleGoBack}
      />

      <div className="space-y-4">
        <SectionHeader
          title="Content"
          subtitle={`${contents.length} ${
            contents.length === 1 ? "Item" : "Items"
          } available`}
          showAccent
        />

        {contents.length === 0 ? (
          <EmptyStateCard
            icon={FileText}
            title="No content available"
            description="This topic doesn't have any lectures or PDFs yet."
          />
        ) : (
          <ContentFilterTabs
            totalCount={contents.length}
            lecturesCount={lectures.length}
            pdfsCount={pdfs.length}
            label=""
            allContent={
              <ContentGrid>
                {contents.map((content, index) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    formatDuration={formatDuration}
                    onPlayVideo={handleOpenVideo}
                    animationDelay={index * 0.05}
                  />
                ))}
              </ContentGrid>
            }
            lecturesContent={
              lectures.length === 0 ? (
                <EmptyStateCard
                  icon={Video}
                  title="No lectures available"
                  description=""
                />
              ) : (
                <ContentGrid>
                  {lectures.map((content, index) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      formatDuration={formatDuration}
                      onPlayVideo={handleOpenVideo}
                      animationDelay={index * 0.05}
                    />
                  ))}
                </ContentGrid>
              )
            }
            pdfsContent={
              pdfs.length === 0 ? (
                <EmptyStateCard
                  icon={FileText}
                  title="No PDFs available"
                  description=""
                />
              ) : (
                <ContentGrid>
                  {pdfs.map((content, index) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      formatDuration={formatDuration}
                      onPlayVideo={handleOpenVideo}
                      animationDelay={index * 0.05}
                    />
                  ))}
                </ContentGrid>
              )
            }
          />
        )}
      </div>
    </div>
  );
}
