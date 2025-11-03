import { useCallback } from "react";
import { useCreateBatchCheckout } from "./api";

// Reusing types from test-series implementation
// Note: Window.Razorpay is already declared in test-series/[id]/page.tsx
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill?: Record<string, string>;
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

export const useRazorpayPayment = () => {
  const { mutateAsync: createCheckout, isPending } = useCreateBatchCheckout();

  const initializePayment = useCallback(
    async (
      batchId: string,
      batchName: string,
      amount: number,
      onVerify: (
        razorpayResponse: RazorpayResponse,
        orderId: string
      ) => Promise<void>,
      onFailure?: (error: Error | unknown) => void
    ) => {
      try {
        // Create order from backend
        const response = await createCheckout(batchId);

        if (!response.success || !response.data) {
          throw new Error("Failed to create order");
        }

        const { orderId, key, currency, razorpayOrderId } = response.data;

        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          document.body.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }

        // Configure Razorpay options
        const options: RazorpayOptions = {
          key: key,
          amount: amount * 100, // Convert to paise
          currency: currency || "INR",
          name: "QueztLearn",
          description: batchName,
          order_id: razorpayOrderId,
          handler: async function (razorpayResponse: RazorpayResponse) {
            console.log("Payment successful:", razorpayResponse);
            // Call verification callback with razorpay response and orderId
            await onVerify(razorpayResponse, orderId);
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
              onFailure?.(new Error("Payment cancelled by user"));
            },
          },
        };

        console.log(options);

        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error: unknown) {
        console.error("Payment initialization error:", error);
        const errorInstance =
          error instanceof Error ? error : new Error(String(error));
        onFailure?.(errorInstance);
      }
    },
    [createCheckout]
  );

  return {
    initializePayment,
    isLoading: isPending,
  };
};
