import type { Metadata } from "next";
import { ClientConfigWrapper } from "@/components/client/config-wrapper";
import type { OrganizationConfigResponse } from "@/lib/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ClientLayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ client: string }>;
}): Promise<Metadata> {
  const { client: slug } = await params;

  if (!API_BASE_URL || !slug) {
    return {
      title: "QueztLearn LMS",
      description: "Modern learning platform powered by QueztLearn.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/organization-config/${slug}`, {
      // Cache for 5 minutes, then revalidate
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch organization config for slug: ${slug}`);
    }

    const json = (await res.json()) as OrganizationConfigResponse;
    const config = json.data;

    const title =
      config.metaTitle || config.heroTitle || config.name || "QueztLearn LMS";

    const description =
      config.metaDescription ||
      config.description ||
      "Simple, structured learning experiences for students and organizations.";

    const ogImage = config.ogImage || config.bannerUrls?.[0];

    const siteUrl =
      config.domain && config.domain.startsWith("http")
        ? config.domain
        : config.domain
        ? `https://${config.domain}`
        : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: siteUrl,
        siteName: config.name ?? "QueztLearn",
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch {
    return {
      title: "QueztLearn LMS",
      description: "Modern learning platform powered by QueztLearn.",
    };
  }
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return <ClientConfigWrapper>{children}</ClientConfigWrapper>;
}
