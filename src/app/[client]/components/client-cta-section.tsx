"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ClientHomepageData } from "../types";
import type { Client } from "@/lib/types/client";

interface ClientCTASectionProps {
  homepage: ClientHomepageData;
  client: Client;
}

export function ClientCTASection({ homepage, client }: ClientCTASectionProps) {
  return (
    <section className="py-20 bg-primary/5">
      <div className="px-4">
        <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have already started their journey
            with {client.name}.
          </p>
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-block"
          >
            <Button size="lg" asChild>
              <Link href={homepage.ctaUrl}>
                {homepage.ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}


