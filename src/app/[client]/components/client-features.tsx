"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  Brain,
  TrendingUp,
  Building2,
  Clock,
  Microscope,
  Briefcase,
  BarChart3,
  Users,
} from "lucide-react";
import type { ClientHomepageData } from "../types";
import type { Client } from "@/lib/types/client";

interface ClientFeaturesSectionProps {
  homepage: ClientHomepageData;
  client: Client;
}

const featureIcons = {
  brain: Brain,
  "graduation-cap": GraduationCap,
  "chart-line": TrendingUp,
  university: Building2,
  clock: Clock,
  microscope: Microscope,
  briefcase: Briefcase,
  "file-chart": BarChart3,
  users: Users,
} as const;

function getFeatureIcon(iconName: string) {
  const IconComponent =
    featureIcons[iconName as keyof typeof featureIcons] || Brain;
  return <IconComponent className="h-6 w-6" />;
}

export function ClientFeaturesSection({
  homepage,
  client,
}: ClientFeaturesSectionProps) {
  if (!homepage.features.length) return null;

  return (
    <section id="features" className="py-16 md:py-20 bg-muted/30">
      <div className="px-4">
        <div className="container mx-auto max-w-6xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div className="text-left space-y-2 max-w-2xl">
              <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Why learners pick {client.name}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">
                Built for clear, structured learning.
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Each feature is designed to keep learners focused, guided, and
                confident—from the first module to the final assessment.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {homepage.features.length}
              </span>{" "}
              core capabilities tailored for modern training teams.
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {homepage.features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full border-muted/70 bg-background/80 hover:border-primary/40 hover:shadow-md transition-all">
                  <CardHeader className="space-y-3">
                    <div className="inline-flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {getFeatureIcon(feature.icon)}
                      </div>
                      <CardTitle className="text-base md:text-lg">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm md:text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
