"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sun, Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="px-4">
        <div className="container mx-auto py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo + brand */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden ring-1 ring-primary/20">
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm md:text-base font-semibold">
                    {client.name}
                  </h1>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Powered by QueztLearn
                  </span>
                </div>
                {homepage.motto && (
                  <p className="hidden md:block text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {homepage.motto}
                  </p>
                )}
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 md:gap-3">
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[10px] md:text-xs px-2 py-1"
              >
                {client.settings.maxUsers.toLocaleString()} learners capacity
              </Badge>
              <Button
                variant="outline"
                size="icon"
                aria-label="Toggle theme"
                className="h-8 w-8 rounded-full"
                onClick={onToggleTheme}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href={homepage.ctaUrl}>
                  Login
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="sm:hidden">
                <Link href={homepage.ctaUrl}>
                  Login
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
