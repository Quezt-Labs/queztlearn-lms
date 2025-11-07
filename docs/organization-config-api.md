# Organization Configuration API Integration

This document explains how to use the organization configuration API integration in your QueztLearn LMS client application.

## Overview

The organization configuration API allows you to fetch public organization settings by slug. This is used to customize the client experience based on the organization's branding, features, and settings.

## API Endpoint

```
GET /api/organization-config/{slug}
```

**Parameters:**

- `slug` (string, required): Organization slug extracted from the URL

**Example URLs:**

- `stanford.queztlearn.com` → slug: `stanford`
- `mit.queztlearn.com` → slug: `mit`

## Response Format

```typescript
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Stanford University",
    "slug": "stanford",
    "domain": "stanford.queztlearn.com",
    "contactEmail": "contact@stanford.edu",
    "contactPhone": "+1-650-723-2300",
    "currency": "USD",
    "logoUrl": "https://example.com/stanford-logo.png",
    "faviconUrl": "https://example.com/stanford-favicon.ico",
    "bannerUrls": ["https://example.com/banner1.jpg"],
    "motto": "The wind of freedom blows",
    "description": "Stanford University's learning management system",
    "theme": {
      "primaryColor": "#8C1515",
      "secondaryColor": "#2E2D29"
    },
    "heroTitle": "Welcome to Stanford Learning",
    "heroSubtitle": "Advance your education with our world-class courses",
    "ctaText": "Get Started",
    "ctaUrl": "/register",
    "socialLinks": {
      "facebook": "https://facebook.com/stanford",
      "twitter": "https://twitter.com/stanford"
    },
    "metaTitle": "Stanford Learning Platform",
    "metaDescription": "Stanford University's online learning platform",
    "ogImage": "https://example.com/og-image.jpg",
    "supportEmail": "support@stanford.edu",
    "featuresEnabled": {
      "selfRegistration": true,
      "analytics": true,
      "apiAccess": true,
      "customBranding": true
    },
    "maintenanceMode": false,
    "customCSS": ".custom-styles { color: red; }",
    "customJS": "console.log('Custom JS loaded');"
  }
}
```

## Usage

### 1. Using the Client Provider (Recommended)

The `ClientProvider` automatically detects the organization slug and fetches the configuration:

```tsx
import { ClientProvider } from "@/components/client/client-provider";

function App() {
  return (
    <ClientProvider>
      <YourAppContent />
    </ClientProvider>
  );
}
```

Then use the `useClient` hook to access the organization data:

```tsx
import { useClient } from "@/components/client/client-provider";

function MyComponent() {
  const { client, isLoading, error } = useClient();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!client) return <div>No organization found</div>;

  return (
    <div>
      <h1>{client.name}</h1>
      <img src={client.logo} alt="Logo" />
      <p>Primary Color: {client.primaryColor}</p>
    </div>
  );
}
```

### 2. Using the Hook Directly

If you have the organization slug, you can use the hook directly:

```tsx
import { useOrganizationConfig } from "@/hooks/api";

function MyComponent() {
  const { data, isLoading, error } = useOrganizationConfig("stanford");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data?.success) return <div>Failed to load config</div>;

  const config = data.data;
  return (
    <div>
      <h1>{config.name}</h1>
      <p>{config.description}</p>
    </div>
  );
}
```

### 3. Utility Functions

Use utility functions to extract organization information:

```tsx
import {
  extractOrganizationSlug,
  getOrganizationDomain,
  isOrganizationSubdomain,
} from "@/lib/utils/organization";

function MyComponent() {
  const slug = extractOrganizationSlug(); // "stanford" from stanford.queztlearn.com
  const domain = getOrganizationDomain(slug); // "stanford.queztlearn.com"
  const isSubdomain = isOrganizationSubdomain(); // true if on *.queztlearn.com

  return (
    <div>
      <p>Slug: {slug}</p>
      <p>Domain: {domain}</p>
      <p>Is Subdomain: {isSubdomain ? "Yes" : "No"}</p>
    </div>
  );
}
```

## Automatic Theme Injection

The `ClientProvider` automatically injects CSS custom properties for theming:

```css
:root {
  --tenant-primary: #8c1515;
  --tenant-secondary: #2e2d29;
}
```

You can use these in your CSS:

```css
.my-button {
  background-color: var(--tenant-primary);
  color: white;
}

.my-secondary-element {
  background-color: var(--tenant-secondary);
}
```

## Error Handling

The integration handles various error scenarios:

1. **No slug provided**: Shows "No organization slug or domain provided"
2. **API error**: Shows "Failed to load organization configuration for {slug}"
3. **404 error**: Organization not found
4. **Network error**: Connection issues

## Development

For local development, you can use URL parameters:

```
http://localhost:3000?subdomain=stanford
```

This will fetch the configuration for the "stanford" organization.

## TypeScript Types

All types are available in `@/lib/types/api`:

```typescript
import {
  OrganizationConfig,
  OrganizationConfigResponse,
} from "@/lib/types/api";
```

## Caching

The API responses are cached for 5 minutes using React Query. This improves performance and reduces API calls.

## Security

This is a public endpoint that only returns non-sensitive organization configuration data. Sensitive information like payment credentials and admin settings are not included in the response.
