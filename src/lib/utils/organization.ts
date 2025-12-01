/**
 * Utility functions for organization configuration
 */

/**
 * Extracts organization slug from hostname
 * Examples:
 * - stanford.queztlearn.com -> stanford
 * - mit.queztlearn.com -> mit
 * - localhost:3000?subdomain=harvard -> harvard
 */
export function extractOrganizationSlug(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hostname = window.location.hostname;

  // Handle production subdomains (e.g., stanford.queztlearn.com)
  if (
    hostname.endsWith(".queztlearn.com") ||
    hostname.endsWith(".queztlearn.in")
  ) {
    const parts = hostname.split(".");
    if (parts.length > 2) {
      return parts[0];
    }
  }

  // Handle localhost development with subdomain parameter
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const urlParams = new URLSearchParams(window.location.search);
    const subdomainFromUrl = urlParams.get("subdomain");
    if (subdomainFromUrl) {
      return subdomainFromUrl;
    }
  }

  // Handle localhost subdomain like mit.localhost
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      // e.g., mityy.localhost -> mityy
      return parts[0];
    }
  }

  return null;
}

/**
 * Gets the full organization domain from slug
 */
export function getOrganizationDomain(slug: string): string {
  return `${slug}.queztlearn.com`;
}

/**
 * Checks if the current hostname is an organization subdomain
 */
export function isOrganizationSubdomain(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  return (
    (hostname.endsWith(".queztlearn.com") ||
      hostname.endsWith(".queztlearn.in")) &&
    hostname.split(".").length > 2
  );
}
