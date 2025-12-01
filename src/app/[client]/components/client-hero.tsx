"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ClientHomepageData } from "../types";
import { BannerCarousel } from "./banner-carousel";
import { TypewriterText } from "./typewriter-text";

interface ClientHeroSectionProps {
  homepage: ClientHomepageData;
}

export function ClientHeroSection({ homepage }: ClientHeroSectionProps) {
  return (
    <section className="pb-16 md:pb-20">
      {/* Full-width banner at top */}
      {homepage.bannerUrls.length > 0 && (
        <div className="w-full">
          <BannerCarousel banners={homepage.bannerUrls} />
        </div>
      )}

      {/* Text + CTA */}
      <div className="px-4">
        <div className="container mx-auto max-w-6xl pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-5xl flex flex-col items-center text-center gap-6 lg:items-start lg:text-left"
          >
            <div className="space-y-4 lg:space-y-5">
              <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                Modern learning experience
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {homepage.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                <TypewriterText text={homepage.tagline} />
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
                {homepage.description}
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" asChild>
                  <Link href={homepage.ctaUrl}>
                    {homepage.ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Explore features</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                No complicated setup. Start learning in minutes with guided
                courses and clear progress tracking.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
