import { useCallback } from "react";
import {
  useRazorpayPaymentCommon,
  type RazorpayResponse,
} from "./use-razorpay-payment";

/**
 * Hook for batch Razorpay payments
 * This is a wrapper around the common Razorpay hook for batch-specific payments
 */
export const useBatchRazorpayPayment = () => {
  const { initializePayment: initializePaymentCommon, isLoading } =
    useRazorpayPaymentCommon();

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
      await initializePaymentCommon({
        type: "batch",
        entityId: batchId,
        entityName: batchName,
        amount,
        onVerify,
        onFailure,
      });
    },
    [initializePaymentCommon]
  );

  return {
    initializePayment,
    isLoading,
  };
};
