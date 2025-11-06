"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleDescriptionProps {
  html?: string;
  plainText?: string;
  maxHeight?: number;
  className?: string;
  expandText?: string;
  collapseText?: string;
}

export function CollapsibleDescription({
  html,
  plainText,
  maxHeight = 200,
  className = "",
  expandText = "Read More",
  collapseText = "Read Less",
}: CollapsibleDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!html && !plainText) {
    return (
      <p className="text-muted-foreground text-sm">
        No description available.
      </p>
    );
  }

  return (
    <div className={className}>
      <motion.div
        initial={false}
        animate={{
          maxHeight: isExpanded ? "none" : maxHeight,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`overflow-hidden relative ${
          !isExpanded ? "mask-gradient-bottom" : ""
        }`}
      >
        {html ? (
          <div
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">
            {plainText}
          </p>
        )}
      </motion.div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-primary hover:text-primary hover:bg-primary/10 w-full sm:w-auto"
      >
        {isExpanded ? (
          <>
            {collapseText}
            <ChevronUp className="h-4 w-4 ml-1" />
          </>
        ) : (
          <>
            {expandText}
            <ChevronDown className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>

      <style jsx global>{`
        .mask-gradient-bottom::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(
            to bottom,
            transparent,
            hsl(var(--background))
          );
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

