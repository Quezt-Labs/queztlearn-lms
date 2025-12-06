import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types/api";
import {
  formatCurrency,
  formatDate,
  getStatusBadgeVariant,
  getEntityName,
} from "../utils/order-utils";

interface OrderCardMobileProps {
  order: Order;
}

export function OrderCardMobile({ order }: OrderCardMobileProps) {
  const entityName = getEntityName(order.entityDetails);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-mono break-all">
              {order.receiptId || order.id.slice(0, 8)}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {formatDate(order.createdAt)}
            </CardDescription>
            {entityName && (
              <p className="text-sm font-medium mt-2 line-clamp-2">
                {entityName}
              </p>
            )}
          </div>
          <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
            {order.paymentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="outline">
            {order.entityType === "BATCH" ? "Batch" : "Test Series"}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-semibold text-base">
            {formatCurrency(order.amount, order.currency)}
          </span>
        </div>
        {order.paymentProvider && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Provider:</span>
            <span className="text-muted-foreground capitalize">
              {order.paymentProvider}
            </span>
          </div>
        )}
        {order.failureReason && (
          <div className="pt-2 border-t">
            <p className="text-xs text-destructive">
              <span className="font-medium">Reason: </span>
              {order.failureReason}
            </p>
          </div>
        )}
        {order.refundAmount && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Refunded:</span>
              <span className="font-medium text-destructive">
                {formatCurrency(order.refundAmount, order.currency)}
              </span>
            </div>
            {order.refundedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Refunded on {formatDate(order.refundedAt)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
