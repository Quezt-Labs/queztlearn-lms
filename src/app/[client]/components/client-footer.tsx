"use client";

import Image from "next/image";
import Link from "next/link";
import type { ClientHomepageData } from "../types";
import type { Client } from "@/lib/types/client";

interface ClientFooterProps {
  homepage: ClientHomepageData;
  client: Client;
}

export function ClientFooter({ homepage, client }: ClientFooterProps) {
  return (
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
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          {(homepage.contactEmail || homepage.supportEmail) && (
            <p>
              Email:{" "}
              <span className="font-medium">
                {homepage.supportEmail || homepage.contactEmail}
              </span>
            </p>
          )}
          {homepage.contactPhone && (
            <p>
              Phone: <span className="font-medium">{homepage.contactPhone}</span>
            </p>
          )}
        </div>
        {Object.keys(homepage.socialLinks).length > 0 && (
          <div className="mt-4 flex justify-center gap-4">
            {Object.entries(homepage.socialLinks).map(([platform, url]) => (
              <Link
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary text-xs capitalize"
              >
                {platform}
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}


