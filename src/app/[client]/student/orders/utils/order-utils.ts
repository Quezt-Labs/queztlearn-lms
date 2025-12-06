import { PaymentStatus } from "@/lib/types/api";
import { format } from "date-fns";

export const PAYMENT_STATUS_OPTIONS: {
  value: PaymentStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All Status" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "REFUNDED", label: "Refunded" },
];

export const getStatusBadgeVariant = (status: PaymentStatus) => {
  switch (status) {
    case "SUCCESS":
      return "default"; // Green/success color
    case "FAILED":
      return "destructive"; // Red/error color
    case "PENDING":
      return "destructive"; // Red for pending (as shown in image)
    case "PROCESSING":
      return "outline"; // Neutral for processing
    case "REFUNDED":
      return "secondary"; // Gray for refunded
    default:
      return "outline";
  }
};

export const formatCurrency = (amount: number, currency: string = "INR") => {
  // Amounts from API are already in rupees, not in paise
  // Format with Indian number format
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return dateString;
  }
};

export const getEntityName = (entityDetails?: Record<string, unknown>) => {
  if (!entityDetails || typeof entityDetails !== "object") return null;
  return (
    (entityDetails as { name?: string; title?: string }).name ||
    (entityDetails as { name?: string; title?: string }).title ||
    null
  );
};
