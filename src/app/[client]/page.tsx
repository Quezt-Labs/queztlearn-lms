"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import { useOrganizationConfigStore } from "@/lib/store/organization-config";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClientHeader } from "./components/client-header";
import { ClientHeroSection } from "./components/client-hero";
import { ClientFeaturesSection } from "./components/client-features";
import { ClientTestimonialsSection } from "./components/client-testimonials";
import { ClientFAQSection } from "./components/client-faq-section";
import { ClientCTASection } from "./components/client-cta-section";
import { ClientFooter } from "./components/client-footer";
import type { ClientHomepageData } from "./types";

// Client Homepage Component
function ClientHomepageContent({ slug }: { slug: string }) {
  const { client, isLoading, error } = useClient();
  const { theme, setTheme } = useTheme();

  // Get organization configuration from global store (populated by ClientConfigWrapper)
  const { config, isLoading: isOrgConfigLoading } =
    useOrganizationConfigStore();

  const homepage: ClientHomepageData = {
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
    motto: config?.motto || "",
    contactEmail: config?.contactEmail || "",
    contactPhone: config?.contactPhone || "",
    supportEmail: config?.supportEmail || "",
    bannerUrls: config?.bannerUrls || [],
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
    faq: (config?.faq || []).map((item, index) => ({
      id: index,
      question: item.question,
      answer: item.answer,
    })),
    socialLinks: config?.socialLinks || {},
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

  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
      <ClientHeader
        client={client}
        homepage={homepage}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <main className="flex flex-col">
        <ClientHeroSection homepage={homepage} />
        <ClientFeaturesSection homepage={homepage} client={client} />
        <ClientTestimonialsSection homepage={homepage} />
        <ClientFAQSection homepage={homepage} client={client} />
        <ClientCTASection homepage={homepage} client={client} />
      </main>
      <ClientFooter homepage={homepage} client={client} />
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
