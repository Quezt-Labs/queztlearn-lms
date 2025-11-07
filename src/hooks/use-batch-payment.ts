import { useCallback } from "react";
import { useRazorpayPaymentCommon } from "./use-razorpay-payment";
import { useVerifyBatchPayment } from "./api";

/**
 * Hook for batch Razorpay payments
 * This hook handles both payment initialization and verification internally.
 * The component only needs to provide success/error callbacks.
 */
export const useBatchRazorpayPayment = () => {
  const { initializePayment: initializePaymentCommon, isLoading } =
    useRazorpayPaymentCommon();
  const { mutateAsync: verifyPayment, isPending: isVerifying } =
    useVerifyBatchPayment();

  const initializePayment = useCallback(
    async (
      batchId: string,
      batchName: string,
      amount: number,
      onSuccess?: (verificationResult: {
        success: boolean;
        message?: string;
      }) => void | Promise<void>,
      onFailure?: (error: Error | unknown) => void
    ) => {
      await initializePaymentCommon({
        type: "batch",
        entityId: batchId,
        entityName: batchName,
        amount,
        onVerify: async (razorpayResponse, orderId) => {
          try {
            console.log("Razorpay Response:", razorpayResponse);
            console.log("Order ID:", orderId);

            // Verify payment
            const verificationResult = await verifyPayment({
              orderId: orderId,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
            });

            console.log("Verification Result:", verificationResult);

            if (verificationResult.success) {
              // Call success callback if provided
              await onSuccess?.(verificationResult);
            } else {
              const error = new Error(
                verificationResult.message || "Payment verification failed"
              );
              onFailure?.(error);
            }
          } catch (error: unknown) {
            console.error("Payment verification failed:", error);
            onFailure?.(error);
          }
        },
        onFailure,
      });
    },
    [initializePaymentCommon, verifyPayment]
  );

  return {
    initializePayment,
    isLoading: isLoading || isVerifying,
  };
};
