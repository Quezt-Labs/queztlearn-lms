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
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose {client.name}?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the features that make our platform the best choice for
            your learning journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {homepage.features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {getFeatureIcon(feature.icon)}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


