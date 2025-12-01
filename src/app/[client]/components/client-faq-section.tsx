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

  return (
    <section className="py-20 px-4 bg-muted/40">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about {client.name}.
          </p>
        </motion.div>
        <FAQDisplay
          faqs={homepage.faq.map((item) => ({
            id: String(item.id),
            question: item.question,
            answer: item.answer,
          }))}
          showCard={true}
          title=""
        />
      </div>
    </section>
  );
}


