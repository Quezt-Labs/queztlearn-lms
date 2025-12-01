"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  Star,
} from "lucide-react";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import { useOrganizationConfigStore } from "@/lib/store/organization-config";
import Link from "next/link";
import Image from "next/image";

// Client Homepage Component
function ClientHomepageContent({ slug }: { slug: string }) {
  const { client, isLoading, error } = useClient();

  // Get organization configuration from global store (populated by ClientConfigWrapper)
  const { config, isLoading: isOrgConfigLoading } =
    useOrganizationConfigStore();

  const homepage = {
    title:
      config?.heroTitle ||
      `Welcome to ${client?.name || config?.name || "Our Platform"}`,
    tagline:
      config?.heroSubtitle || "Transform Your Learning Experience with Mityy.",
    description:
      config?.description ||
      "Join thousands of learners who have already started their journey with us.",
    ctaText: config?.ctaText || "Get Started",
    ctaUrl: config?.ctaUrl || "/login",
    features: (config?.features || []).map((feature, index) => ({
      id: index,
      title: feature.title,
      description: feature.description,
      icon: feature.icon || "brain",
    })),
    testimonials: (config?.testimonials || []).map((t, index) => ({
      id: index,
      name: t.name,
      role: "Learner",
      content: t.message,
    })),
  };

  if (isLoading || isOrgConfigLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !client || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
          <p className="text-muted-foreground">
            The requested client does not exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getFeatureIcon = (iconName: string) => {
    const icons = {
      brain: Brain,
      "graduation-cap": GraduationCap,
      "chart-line": TrendingUp,
      university: Building2,
      clock: Clock,
      microscope: Microscope,
      briefcase: Briefcase,
      "file-chart": BarChart3,
      users: Users,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Brain;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={32}
                  height={32}
                  className="rounded"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">{client.name}</h1>
                <p className="text-sm text-muted-foreground">{client.domain}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {client.settings.maxUsers.toLocaleString()} max users
              </Badge>
              <Button asChild>
                <Link href={homepage.ctaUrl}>
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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

      {/* Features Section */}
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

      {/* Testimonials Section */}
      {homepage.testimonials.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our Users Say
              </h2>
              <p className="text-lg text-muted-foreground">
                Hear from students and professionals who have transformed their
                learning with us.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {homepage.testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {testimonial.content}
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">
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
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
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
            <Button size="lg" asChild>
              <Link href={`/login`}>
                {homepage.ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Image
              src={client.logo}
              alt={client.name}
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-semibold">{client.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by QueztLearn LMS • {client.domain}
          </p>
        </div>
      </footer>
    </div>
  );
}

// Main Client Homepage Page
export default function ClientHomepage() {
  const params = useParams();
  const clientSubdomain = params.client as string;

  return (
    <ClientProvider subdomain={clientSubdomain}>
      <ClientHomepageContent slug={clientSubdomain} />
    </ClientProvider>
  );
}
