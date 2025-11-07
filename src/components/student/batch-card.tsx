"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDateRange } from "@/lib/utils/date";

interface BatchCardProps {
  id: string;
  name: string;
  class: string;
  exam: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  language: string;
  totalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  progress: number;
  totalSubjects: number;
  completedSubjects: number;
  index?: number;
}

export function BatchCard({
  id,
  name,
  class: className,
  exam,
  imageUrl,
  startDate,
  endDate,
  language,
  progress,
  totalSubjects,
  completedSubjects,
  index = 0,
}: BatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="p-0 group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/50 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden bg-linear-to-br from-primary/20 to-primary/5 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-20 w-20 text-primary/40" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-black/60 text-white border-0">{exam}</Badge>
            <Badge
              variant="secondary"
              className="bg-black/60 text-white border-0"
            >
              Class {className}
            </Badge>
          </div>
        </div>
        <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
          <div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {language} • {totalSubjects} Subjects
            </p>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-accent">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 [&>div]:bg-accent" />
            <p className="text-xs text-muted-foreground">
              {completedSubjects} of {totalSubjects} subjects completed
            </p>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Calendar className="h-4 w-4" />
            <span>{formatDateRange(startDate, endDate)}</span>
          </div>

          <Button className="w-full mt-auto" asChild>
            <Link href={`/student/batches/${id}`}>
              Continue Learning
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
