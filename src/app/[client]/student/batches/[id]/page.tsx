"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, lazy, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetExploreBatch } from "@/hooks";
import { BatchDetailHeader } from "@/components/student/batch-detail-header";
import { MobileBatchHero } from "@/components/student/mobile-batch-hero";
import { DescriptionPageShimmer } from "@/components/common/description-page-shimmer";

// Lazy load tab content components
const BatchDescriptionTab = lazy(() =>
  import("@/components/student/batch-description-tab").then((mod) => ({
    default: mod.BatchDescriptionTab,
  }))
);

const BatchClassesTab = lazy(() =>
  import("@/components/student/batch-classes-tab").then((mod) => ({
    default: mod.BatchClassesTab,
  }))
);

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<"description" | "classes">(
    "description"
  );

  const { data, isLoading, error } = useGetExploreBatch(id);

  if (isLoading) {
    return <DescriptionPageShimmer />;
  }

  if (error || !data?.success || !data?.data) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-6xl">😕</div>
          <h2 className="text-2xl font-bold">Batch Not Found</h2>
          <p className="text-muted-foreground">
            The batch you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const batch = data.data;
  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);
  const now = new Date();

  const isLive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isEnded = now > endDate;

  const finalPrice = Math.round(
    batch.totalPrice * (1 - batch.discountPercentage / 100)
  );
  const savings = batch.totalPrice - finalPrice;
  const isHotDeal = batch.discountPercentage >= 30;

  return (
    <div className="h-full">
      <div className="hidden lg:block sticky top-0 z-50">
        <BatchDetailHeader
          batch={batch}
          isLive={isLive}
          isUpcoming={isUpcoming}
          isEnded={isEnded}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={() => router.back()}
        />
      </div>

      <div className="lg:hidden">
        <MobileBatchHero
          batch={batch}
          isLive={isLive}
          isUpcoming={isUpcoming}
          isEnded={isEnded}
          isHotDeal={isHotDeal}
          onBack={() => router.back()}
        />
      </div>

      {/* Main Content */}
      <div className="p-2.5 lg:px-10 lg:py-8">
        <div className="container max-w-7xl mx-auto">
          <Suspense fallback={<DescriptionPageShimmer />}>
            {activeTab === "description" ? (
              <BatchDescriptionTab
                batch={batch}
                finalPrice={finalPrice}
                savings={savings}
                isHotDeal={isHotDeal}
              />
            ) : (
              <BatchClassesTab />
            )}
          </Suspense>
        </div>
      </div>

      {/* Sticky Bottom CTA (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t shadow-lg">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Total Price</div>
              <div className="font-bold text-lg sm:text-xl text-primary">
                ₹{finalPrice.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="shrink-0">
                View Details
              </Button>
              <Button size="sm" className="shrink-0">
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
