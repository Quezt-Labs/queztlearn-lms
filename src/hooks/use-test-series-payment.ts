import { useCallback } from "react";
import {
  useRazorpayPaymentCommon,
  type RazorpayResponse,
} from "./use-razorpay-payment";

/**
 * Hook for test-series Razorpay payments
 * This is a wrapper around the common Razorpay hook for test-series-specific payments
 */
export const useTestSeriesRazorpayPayment = () => {
  const { initializePayment: initializePaymentCommon, isLoading } =
    useRazorpayPaymentCommon();

  const initializePayment = useCallback(
    async (
      testSeriesId: string,
      testSeriesTitle: string,
      amount: number,
      onVerify: (
        razorpayResponse: RazorpayResponse,
        orderId: string
      ) => Promise<void>,
      onFailure?: (error: Error | unknown) => void
    ) => {
      await initializePaymentCommon({
        type: "test-series",
        entityId: testSeriesId,
        entityName: testSeriesTitle,
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
