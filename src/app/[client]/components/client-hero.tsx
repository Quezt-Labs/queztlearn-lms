"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ClientHomepageData } from "../types";
import { BannerCarousel } from "./banner-carousel";

interface ClientHeroSectionProps {
  homepage: ClientHomepageData;
}

export function ClientHeroSection({ homepage }: ClientHeroSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {homepage.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            {homepage.tagline}
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            {homepage.description}
          </p>

          {homepage.bannerUrls.length > 0 && (
            <div className="mb-10">
              <BannerCarousel banners={homepage.bannerUrls} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={homepage.ctaUrl}>
                {homepage.ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


