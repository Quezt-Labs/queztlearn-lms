declare global {
  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
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
    theme?: { color: string };
    modal?: { ondismiss: () => void };
  }
}

declare module "embla-carousel-react";
