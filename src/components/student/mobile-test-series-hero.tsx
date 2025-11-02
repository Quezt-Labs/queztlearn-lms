"use client";

import { motion } from "framer-motion";
import { FileText, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientTestSeriesListItem } from "@/hooks/test-series-client";

interface MobileTestSeriesHeroProps {
  testSeries: ClientTestSeriesListItem;
  testCount: number;
  isHotDeal: boolean;
  onBack: () => void;
}

export function MobileTestSeriesHero({
  testSeries,
  testCount,
  isHotDeal,
  onBack,
}: MobileTestSeriesHeroProps) {
  return (
    <div className="relative bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white bg-card border-b shadow-sm">
      <div className="absolute inset-0 bg-black/20 lg:bg-transparent" />
      <div className="relative container max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-white hover:bg-white/20 hover:text-white"
        >
          <span className="mr-2">←</span>
          Back to Test Series
        </Button>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl mb-4"
        >
          {testSeries.imageUrl ? (
            <img
              src={testSeries.imageUrl}
              alt={testSeries.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm">
              <FileText className="h-24 w-24 text-white/50" />
            </div>
          )}

          {/* Status Badge Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {testSeries.isFree && (
              <Badge className="bg-emerald-500 text-white border-0 shadow-lg">
                Free
              </Badge>
            )}
            {isHotDeal && (
              <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                Hot Deal
              </Badge>
            )}
          </div>

          {/* Discount Badge */}
          {testSeries.discountPercentage > 0 && (
            <div className="absolute top-4 right-4">
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {testSeries.discountPercentage}% OFF
              </div>
            </div>
          )}
        </motion.div>

        {/* Title & Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              <FileText className="h-3 w-3 mr-1" />
              {testSeries.exam}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            {testSeries.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{testCount} Tests</span>
            </div>
            {testSeries.durationDays > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Valid for {testSeries.durationDays} days</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

