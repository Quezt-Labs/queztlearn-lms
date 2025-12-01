"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import type { ClientHomepageData } from "../types";

interface ClientTestimonialsSectionProps {
  homepage: ClientHomepageData;
}

export function ClientTestimonialsSection({
  homepage,
}: ClientTestimonialsSectionProps) {
  if (!homepage.testimonials.length) return null;

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What learners say about their experience
          </h2>
          <p className="text-lg text-muted-foreground">
            Short, focused programs that actually fit into busy schedules—and
            still feel structured.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {homepage.testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="h-full border-muted/70 bg-background/90">
                <CardContent className="pt-6 flex h-full flex-col justify-between gap-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <Quote className="h-5 w-5 text-primary/60" />
                  </div>

                  <CardDescription className="text-sm md:text-base leading-relaxed">
                    {testimonial.content}
                  </CardDescription>

                  <div className="flex items-center space-x-3 pt-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm md:text-base">
                        {testimonial.name}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


