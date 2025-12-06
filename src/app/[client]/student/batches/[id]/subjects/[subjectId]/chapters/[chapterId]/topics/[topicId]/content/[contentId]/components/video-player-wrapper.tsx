"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type Player from "video.js/dist/types/player";
import dynamic from "next/dynamic";
import { UnifiedVideoPlayer } from "@/components/common/unified-video-player";
import type { Content } from "../utils/content-player-utils";
import { getVideoType } from "../utils/content-player-utils";

const PDFViewer = dynamic(
  () =>
    import("@/components/common/pdf-viewer").then((mod) => ({
      default: mod.PDFViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-muted-foreground">
        Loading PDF viewer...
      </div>
    ),
  }
);

interface VideoPlayerWrapperProps {
  content: Content;
  playerInstance: Player | null;
  onPlayerReady: (player: Player) => void;
  onTimeUpdate: (currentTime: number) => void;
  onEnded: () => void;
}

export function VideoPlayerWrapper({
  content,
  playerInstance,
  onPlayerReady,
  onTimeUpdate,
  onEnded,
}: VideoPlayerWrapperProps) {
  const isLecture = content.type === "Lecture" && content.videoUrl;
  const isPdf = content.type === "PDF" && content.pdfUrl;

  return (
    <div className="flex-1 bg-black relative overflow-hidden">
      {isLecture && content.videoUrl ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full h-full relative"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none"
          />

          <div className="w-full h-full relative z-10">
            <UnifiedVideoPlayer
              src={content.videoUrl}
              poster={content.videoThumbnail}
              type={getVideoType(content.videoType)}
              className="w-full h-full"
              autoplay={true}
              onReady={(player) => {
                // Ensure player fills container
                const playerEl = player.el() as HTMLElement;
                if (playerEl) {
                  playerEl.style.width = "100%";
                  playerEl.style.height = "100%";
                  player.fluid(false);
                  player.dimensions("100%", "100%");
                }
                onPlayerReady(player);
              }}
              onTimeUpdate={onTimeUpdate}
              onEnded={onEnded}
            />
          </div>
        </motion.div>
      ) : isPdf && content.pdfUrl ? (
        <div className="w-full h-full bg-background">
          <PDFViewer
            fileUrl={content.pdfUrl}
            title={content.name}
            height="100%"
            className="h-full"
          />
        </div>
      ) : (
        <div className="text-center text-white">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Content not available</p>
        </div>
      )}
    </div>
  );
}

