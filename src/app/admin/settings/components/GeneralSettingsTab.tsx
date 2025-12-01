"use client";

import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateOrganizationConfigData } from "@/lib/types/api";

interface GeneralSettingsTabProps {
  formData: CreateOrganizationConfigData;
  setFormData: Dispatch<SetStateAction<CreateOrganizationConfigData>>;
}

export function GeneralSettingsTab({
  formData,
  setFormData,
}: GeneralSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
        <CardDescription>
          Basic information about your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 border rounded-lg">
          <p className="text-sm text-muted-foreground">
            To edit Organization Name, Slug, or Domain, please contact{" "}
            <a
              href="mailto:admin@queztlearn.com"
              className="text-primary hover:underline font-medium"
            >
              admin@queztlearn.com
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">
            Organization Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            disabled
            className="bg-muted cursor-not-allowed"
            placeholder="Your Organization Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            value={formData.slug}
            disabled
            className="bg-muted cursor-not-allowed"
            placeholder="your-org-slug"
          />
          <p className="text-xs text-muted-foreground">
            Used in URLs: {formData.slug || "your-org"}.queztlearn.com
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain">Domain</Label>
          <Input
            id="domain"
            value={formData.domain || ""}
            disabled
            className="bg-muted cursor-not-allowed"
            placeholder="yourdomain.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={3}
            placeholder="Brief description of your organization"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="motto">Motto</Label>
          <Input
            id="motto"
            value={formData.motto || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, motto: e.target.value }))
            }
            placeholder="Your organization motto or tagline"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={formData.currency || "INR"}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, currency: e.target.value }))
            }
            placeholder="INR"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="maintenanceMode"
            checked={formData.maintenanceMode || false}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, maintenanceMode: checked }))
            }
          />
          <Label htmlFor="maintenanceMode">
            Maintenance Mode
            <span className="text-xs text-muted-foreground block">
              Enable to show maintenance page to visitors
            </span>
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
