"use client";

import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { CreateOrganizationConfigData } from "@/lib/types/api";

interface PaymentSettingsTabProps {
  formData: CreateOrganizationConfigData;
  setFormData: Dispatch<SetStateAction<CreateOrganizationConfigData>>;
  showRazorpayKeyId: boolean;
  setShowRazorpayKeyId: (value: boolean) => void;
  showRazorpayKeySecret: boolean;
  setShowRazorpayKeySecret: (value: boolean) => void;
}

export function PaymentSettingsTab({
  formData,
  setFormData,
  showRazorpayKeyId,
  setShowRazorpayKeyId,
  showRazorpayKeySecret,
  setShowRazorpayKeySecret,
}: PaymentSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Razorpay Payment Gateway Configuration</CardTitle>
        <CardDescription>
          Configure your Razorpay credentials to enable payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg
                className="h-5 w-5 text-amber-600 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Security Warning
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your Razorpay Key Secret is sensitive information. Never share
                it in emails, chat, or any public forums. Only authorized
                personnel should have access to these credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="razorpayKeyId">
              Razorpay Key ID <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="razorpayKeyId"
                type={showRazorpayKeyId ? "text" : "password"}
                value={formData.razorpayKeyId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    razorpayKeyId: e.target.value,
                  }))
                }
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                spellCheck={false}
                placeholder="rzp_test_xxxxxxxxxxxxx or rzp_live_xxxxxxxxxxxxx"
                className="font-mono text-sm pr-24"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRazorpayKeyId(!showRazorpayKeyId)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
              >
                {showRazorpayKeyId ? (
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-4 w-4" /> Hide
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> Show
                  </span>
                )}
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Found in: Razorpay Dashboard → Settings → API Keys
              </p>
              <p className="text-xs text-muted-foreground">
                Format: <code className="text-xs">rzp_test_*</code> or{" "}
                <code className="text-xs">rzp_live_*</code>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="razorpayKeySecret">
              Razorpay Key Secret <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="razorpayKeySecret"
                type={showRazorpayKeySecret ? "text" : "password"}
                value={formData.razorpayKeySecret || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    razorpayKeySecret: e.target.value,
                  }))
                }
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                autoComplete="off"
                spellCheck={false}
                placeholder="Enter your Razorpay key secret"
                className="font-mono text-sm pr-24"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRazorpayKeySecret(!showRazorpayKeySecret)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
              >
                {showRazorpayKeySecret ? (
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-4 w-4" /> Hide
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> Show
                  </span>
                )}
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Found in: Razorpay Dashboard → Settings → API Keys (reveal
                secret)
              </p>
              <p className="text-xs text-muted-foreground">
                This will be hidden for security. Make sure to copy it
                correctly.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Need Help?</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                • Get your credentials from{" "}
                <a
                  href="https://dashboard.razorpay.com/app/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Razorpay Dashboard
                </a>
              </p>
              <p>
                • For support, contact{" "}
                <a
                  href="mailto:admin@queztlearn.com"
                  className="text-primary hover:underline font-medium"
                >
                  admin@queztlearn.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
