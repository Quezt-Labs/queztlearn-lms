import { useCallback } from "react";
import { useCreateBatchCheckout } from "./api";
import { useClientCheckoutTestSeries } from "./test-series-client";

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export type PaymentType = "batch" | "test-series";

// Type alias for RazorpayOptions from global
type RazorpayOptions = {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill?: Record<string, string>;
  theme?: { color: string };
  modal?: { ondismiss: () => void };
};

interface PaymentConfig {
  type: PaymentType;
  entityId: string;
  entityName: string;
  amount: number;
  onVerify: (
    razorpayResponse: RazorpayResponse,
    orderId: string
  ) => Promise<void>;
  onFailure?: (error: Error | unknown) => void;
}

export const useRazorpayPaymentCommon = () => {
  const batchCheckoutMutation = useCreateBatchCheckout();
  const testSeriesCheckoutMutation = useClientCheckoutTestSeries();

  const initializePayment = useCallback(
    async (config: PaymentConfig) => {
      try {
        let response: {
          success: boolean;
          data?: {
            orderId: string;
            razorpayOrderId: string;
            currency: string;
            key?: string;
            amount?: number;
          };
        };

        // Call appropriate checkout API based on type
        if (config.type.toLowerCase() === "batch") {
          const batchResponse = await batchCheckoutMutation.mutateAsync(
            config.entityId
          );
          response = batchResponse;
        } else {
          const testSeriesResponse =
            await testSeriesCheckoutMutation.mutateAsync(config.entityId);
          response = testSeriesResponse;
        }

        if (!response.success || !response.data) {
          throw new Error("Failed to create order");
        }

        const {
          orderId,
          razorpayOrderId,
          currency,
          key,
          amount: orderAmount,
        } = response.data;

        // Get Razorpay key from response if available, otherwise use env var
        const razorpayKey = key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        if (!razorpayKey) {
          throw new Error("Razorpay key not configured");
        }

        // Load Razorpay script if not already loaded (using global Window.Razorpay from global.d.ts)
        if (!("Razorpay" in window)) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          document.body.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = reject;
          });
        }

        // Calculate amount: use orderAmount if available, otherwise convert config amount to paise
        const amountInPaise = orderAmount || config.amount * 100;

        // Configure Razorpay options (using global RazorpayOptions from global.d.ts)
        const options: RazorpayOptions = {
          key: razorpayKey,
          amount: amountInPaise,
          currency: currency || "INR",
          name: "QueztLearn",
          description: config.entityName,
          order_id: razorpayOrderId,
          handler: async function (razorpayResponse: RazorpayResponse) {
            console.log("Payment successful:", razorpayResponse);
            // Call verification callback with razorpay response and orderId
            await config.onVerify(razorpayResponse, orderId);
          },
          prefill: {
            name: "",
            email: "",
            contact: "",
          },
          theme: {
            color: "#8B5CF6", // Primary color
          },
          modal: {
            ondismiss: function () {
              console.log("Payment modal closed");
              config.onFailure?.(new Error("Payment cancelled by user"));
            },
          },
        };

        // Open Razorpay checkout (using global Window.Razorpay from global.d.ts)
        // Type assertion needed because Razorpay is loaded dynamically
        type RazorpayConstructorType = new (options: RazorpayOptions) => {
          open: () => void;
        };
        const RazorpayConstructor = (
          window as unknown as Window & { Razorpay: RazorpayConstructorType }
        ).Razorpay;
        const razorpay = new RazorpayConstructor(options);
        razorpay.open();
      } catch (error: unknown) {
        console.error("Payment initialization error:", error);
        const errorInstance =
          error instanceof Error ? error : new Error(String(error));
        config.onFailure?.(errorInstance);
      }
    },
    [batchCheckoutMutation, testSeriesCheckoutMutation]
  );

  const isLoading =
    batchCheckoutMutation.isPending || testSeriesCheckoutMutation.isPending;

  return {
    initializePayment,
    isLoading,
  };
};
