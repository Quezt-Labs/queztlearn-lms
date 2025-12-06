"use client";

import { ArrowLeft, CheckCircle2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ContentPlayerHeaderProps {
  contentName: string;
  chapterName?: string;
  topicName?: string;
  isCompleted: boolean;
  isMarkingComplete: boolean;
  onGoBack: () => void;
  onToggleSidebar: () => void;
  onMarkAsComplete: () => void;
  sidebarOpen: boolean;
}

export function ContentPlayerHeader({
  contentName,
  chapterName,
  topicName,
  isCompleted,
  isMarkingComplete,
  onGoBack,
  onToggleSidebar,
  onMarkAsComplete,
  sidebarOpen,
}: ContentPlayerHeaderProps) {
  return (
    <div className="border-b bg-card shrink-0">
      <div className="container max-w-[1920px] mx-auto px-4 py-3 space-y-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{contentName}</h1>
            <p className="text-sm text-muted-foreground truncate">
              {chapterName || "Chapter"} • {topicName || "Topic"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="shrink-0"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
          {isCompleted ? (
            <Badge className="bg-green-600 text-white">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAsComplete}
              disabled={isMarkingComplete}
              className="shrink-0"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isMarkingComplete ? "Marking..." : "Mark as Complete"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

