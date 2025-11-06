"use client";

import { motion } from "framer-motion";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobilePricingCardProps {
  originalPrice?: number;
  finalPrice: number;
  savings?: number;
  discountPercentage: number;
  isFree?: boolean;
  isEnrolled?: boolean;
  isProcessing?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  onEnrollClick: () => void;
  ctaText?: string;
  enrolledText?: string;
  className?: string;
}

export function MobilePricingCard({
  originalPrice,
  finalPrice,
  savings,
  discountPercentage,
  isFree = false,
  isEnrolled = false,
  isProcessing = false,
  isDisabled = false,
  disabledReason,
  onEnrollClick,
  ctaText = "Enroll Now",
  enrolledText = "You are enrolled",
  className = "",
}: MobilePricingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`lg:hidden ${className}`}
    >
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          {isEnrolled ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg dark:bg-green-900/10 dark:border-green-800/20 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{enrolledText}</span>
            </div>
          ) : (
            <>
              {/* Pricing Section */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  {isFree ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600">
                        Free
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary">
                          {formatPrice(finalPrice)}
                        </span>
                        {discountPercentage > 0 && originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                      {savings && savings > 0 && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Save {formatPrice(savings)} ({discountPercentage}% OFF)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full h-12 text-base font-semibold shadow-md"
                size="lg"
                onClick={onEnrollClick}
                disabled={isProcessing || isDisabled}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isDisabled ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {disabledReason || "Not Available"}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {ctaText}
                  </>
                )}
              </Button>

              {isDisabled && disabledReason && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {disabledReason}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

