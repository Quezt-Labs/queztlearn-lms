"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useOrganizationConfig } from "@/hooks/api";
import { useOrganizationConfigStore } from "@/lib/store/organization-config";
import { ClientThemeProvider } from "./theme-provider";

interface ClientConfigWrapperProps {
  children: React.ReactNode;
}

export function ClientConfigWrapper({ children }: ClientConfigWrapperProps) {
  const params = useParams();
  const clientSlug = params.client as string;

  const {
    config: storedConfig,
    setConfig,
    setLoading,
  } = useOrganizationConfigStore();
  const { data, isLoading, error } = useOrganizationConfig(clientSlug);

  // Update store when API data arrives
  useEffect(() => {
    setLoading(isLoading);

    if (data?.success && data?.data) {
      setConfig(data.data);
    }
  }, [data, isLoading, setConfig, setLoading]);

  // Show maintenance mode if enabled
  if (storedConfig?.maintenanceMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl font-bold">Under Maintenance</h1>
          <p className="text-muted-foreground max-w-md">
            We&apos;re currently performing scheduled maintenance. Please check
            back soon.
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !storedConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl font-bold text-destructive">
            Configuration Error
          </h1>
          <p className="text-muted-foreground max-w-md">
            Unable to load organization configuration. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state only if no cached config
  if (isLoading && !storedConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <ClientThemeProvider>{children}</ClientThemeProvider>;
}
