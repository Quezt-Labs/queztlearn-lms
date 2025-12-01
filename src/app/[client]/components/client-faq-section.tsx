"use client";

import { motion } from "framer-motion";
import { FAQDisplay } from "@/components/common/faq-display";
import type { ClientHomepageData } from "../types";
import type { Client } from "@/lib/types/client";

interface ClientFAQSectionProps {
  homepage: ClientHomepageData;
  client: Client;
}

export function ClientFAQSection({ homepage, client }: ClientFAQSectionProps) {
  if (!homepage.faq.length) return null;

  const topQuestions = homepage?.faq?.slice(0, 2) || [];

  return (
    <section className="py-20 bg-muted/40">
      <div className="px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] items-start"
          >
            <div className="space-y-4 text-left">
              <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Help &amp; Support
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">
                Have questions? We&apos;ve got answers.
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Find quick answers to the most common questions about{" "}
                <span className="font-semibold">{client.name}</span>. Still need
                help? Reach us anytime at{" "}
                <span className="font-semibold">
                  {homepage.supportEmail || homepage.contactEmail}
                </span>
                .
              </p>

              {topQuestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Popular questions
                  </p>
                  <ul className="space-y-1 text-sm text-foreground">
                    {topQuestions.map((item) => (
                      <li key={item.id} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item.question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-background/80 border border-muted/70 rounded-xl px-2 py-2 sm:px-4 sm:py-4 shadow-sm">
              <FAQDisplay
                faqs={homepage.faq.map((item) => ({
                  id: String(item.id),
                  question: item.question,
                  answer: item.answer,
                }))}
                showCard={false}
                accordionClassName="w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
