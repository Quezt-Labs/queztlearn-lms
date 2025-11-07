"use client";

import { ExploreCourseCard } from "./explore-course-card";

interface ExploreTestSeriesCardProps {
  id: string;
  exam: string;
  title: string;
  description?: string | null;
  slug: string;
  imageUrl?: string;
  totalPrice: number;
  discountPercentage?: number;
  isFree?: boolean;
  durationDays?: number;
  index?: number;
}

export function ExploreTestSeriesCard(props: ExploreTestSeriesCardProps) {
  return (
    <ExploreCourseCard
      {...props}
      type="test-series"
      imageUrl={props.imageUrl}
      discountPercentage={props.discountPercentage ?? 0}
      isFree={props.isFree ?? false}
      durationDays={props.durationDays}
    />
  );
}
