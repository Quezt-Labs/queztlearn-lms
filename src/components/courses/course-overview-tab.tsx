"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQDisplay } from "@/components/common/faq-display";
import { Batch } from "./types";

interface CourseOverviewTabProps {
  course: Batch;
}

export function CourseOverviewTab({ course }: CourseOverviewTabProps) {
  const formatPrice = (price: number) => {
    const discountPrice = price * (1 - 0.01);
    return {
      original: price.toLocaleString(),
      discounted: discountPrice.toLocaleString(),
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground course-description"
                dangerouslySetInnerHTML={{
                  __html: course.description || "",
                }}
              />
            </div>
            <div>
              <FAQDisplay
                faqs={course.faq}
                showCard={false}
                title="FAQ"
                emptyMessage="No FAQ available"
                className="mt-4"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground line-through">
                  ₹{formatPrice(course.totalPrice).original}
                </span>
                <span className="text-2xl font-bold">
                  ₹{formatPrice(course.totalPrice).discounted}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {course.discountPercentage}% discount
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
