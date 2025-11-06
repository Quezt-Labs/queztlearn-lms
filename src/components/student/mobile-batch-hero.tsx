"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Globe, GraduationCap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MobileBatchHeroProps {
  batch: {
    name: string;
    class: "11" | "12" | "12+" | "Grad";
    exam: string;
    imageUrl?: string;
    language: string;
    startDate: Date | string;
    endDate: Date | string;
    discountPercentage: number;
  };
  isLive: boolean;
  isUpcoming: boolean;
  isEnded: boolean;
  isHotDeal: boolean;
  onBack: () => void;
}

export function MobileBatchHero({
  batch,
  isLive,
  isUpcoming,
  isEnded,
  isHotDeal,
  onBack,
}: MobileBatchHeroProps) {
  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);

  return (
    <div className="relative bg-background/95 backdrop-blur-md border-b shadow-sm">
      <div className="relative">
        {/* Back Button - More compact and thumb-friendly */}
        <div className="px-3 pt-2.5">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-2 h-9 px-2 -ml-2"
            size="sm"
          >
            <span className="mr-1.5">←</span>
            Back
          </Button>
        </div>

        {/* Image - Full width on mobile, ultra compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative aspect-video sm:aspect-21/9 overflow-hidden shadow-sm mb-2.5 max-h-[160px] border-y"
        >
          {batch.imageUrl ? (
            <img
              src={batch.imageUrl}
              alt={batch.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/20 to-primary/10">
              <GraduationCap className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}

          {/* Status Badge Overlay - Smaller and cleaner */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {isLive && (
              <Badge className="bg-emerald-500 text-white border-0 shadow-md text-xs px-2 py-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                Live
              </Badge>
            )}
            {isUpcoming && (
              <Badge className="bg-blue-500 text-white border-0 shadow-md text-xs px-2 py-0.5">
                <Clock className="h-2.5 w-2.5 mr-1" />
                Upcoming
              </Badge>
            )}
            {isEnded && (
              <Badge className="bg-gray-500 text-white border-0 shadow-md text-xs px-2 py-0.5">
                Ended
              </Badge>
            )}
            {isHotDeal && (
              <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md text-xs px-2 py-0.5">
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                Hot Deal
              </Badge>
            )}
          </div>

          {/* Discount Badge - Smaller and positioned better */}
          {batch.discountPercentage > 0 && (
            <div className="absolute top-2 right-2">
              <div className="bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md">
                {batch.discountPercentage}% OFF
              </div>
            </div>
          )}
        </motion.div>

        {/* Title & Meta - Ultra compact below image */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="px-3 pb-2.5 space-y-1.5"
        >
          <h1 className="text-base sm:text-lg font-bold leading-tight line-clamp-2 text-foreground">
            {batch.name}
          </h1>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-xs shrink-0">
                {batch.class}
              </Badge>
              <Badge variant="secondary" className="text-xs shrink-0">
                {batch.exam}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {startDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
