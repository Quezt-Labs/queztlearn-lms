"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sun } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Client } from "@/lib/types/client";
import type { ClientHomepageData } from "../types";

interface ClientHeaderProps {
  client: Client;
  homepage: ClientHomepageData;
  theme: "light" | "dark" | "system";
  onToggleTheme: () => void;
}

export function ClientHeader({
  client,
  homepage,
  theme,
  onToggleTheme,
}: ClientHeaderProps) {
  return (
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
              {homepage.motto && (
                <p className="text-xs text-muted-foreground mt-1">
                  {homepage.motto}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              {client.settings.maxUsers.toLocaleString()} max users
            </Badge>
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle theme"
              onClick={onToggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
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
  );
}


