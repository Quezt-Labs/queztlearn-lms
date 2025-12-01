"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import type { ClientHomepageData } from "../types";
import type { Client } from "@/lib/types/client";

interface ClientFooterProps {
  homepage: ClientHomepageData;
  client: Client;
}

const socialIconMap: Record<string, ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  x: Twitter,
  facebook: Facebook,
  fb: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
  insta: Instagram,
  youtube: Youtube,
  yt: Youtube,
};

export function ClientFooter({ homepage, client }: ClientFooterProps) {
  const socialEntries = Object.entries(homepage.socialLinks || {});
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 py-8">
      <div className="px-4">
        <div className="container mx-auto max-w-5xl flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <Image
                src={client.logo}
                alt={client.name}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-sm">{client.name}</span>
              <p className="text-[11px] text-muted-foreground">
                © {year} {client.name}. Powered by QueztLearn • {client.domain}
              </p>
            </div>
          </div>

          {(homepage.contactEmail ||
            homepage.supportEmail ||
            homepage.contactPhone) && (
            <div className="mt-1 text-[11px] text-muted-foreground space-x-4">
              {(homepage.contactEmail || homepage.supportEmail) && (
                <span>
                  <span className="font-semibold text-foreground">Email:</span>{" "}
                  {homepage.supportEmail || homepage.contactEmail}
                </span>
              )}
              {homepage.contactPhone && (
                <span>
                  <span className="font-semibold text-foreground">Phone:</span>{" "}
                  {homepage.contactPhone}
                </span>
              )}
            </div>
          )}

          {socialEntries.length > 0 && (
            <div className="mt-2 flex items-center gap-3">
              {socialEntries.map(([platform, url]) => {
                const key = platform.toLowerCase();
                const Icon = socialIconMap[key];
                return (
                  <Link
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={platform}
                  >
                    {Icon ? (
                      <Icon className="h-4 w-4" />
                    ) : (
                      <span className="text-[11px] capitalize">{platform}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
