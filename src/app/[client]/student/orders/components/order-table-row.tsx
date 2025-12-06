import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types/api";
import {
  formatCurrency,
  formatDate,
  getStatusBadgeVariant,
  getEntityName,
} from "../utils/order-utils";

interface OrderTableRowProps {
  order: Order;
}

export function OrderTableRow({ order }: OrderTableRowProps) {
  const entityName = getEntityName(order.entityDetails);

  return (
    <TableRow key={order.id}>
      <TableCell>
        <div className="space-y-1">
          <div className="font-mono text-xs">
            {order.receiptId || order.id.slice(0, 8)}
          </div>
          {entityName && (
            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
              {entityName}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {order.entityType === "BATCH" ? "Batch" : "Test Series"}
        </Badge>
      </TableCell>
      <TableCell className="font-medium text-right">
        {formatCurrency(order.amount, order.currency)}
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
          {order.paymentStatus}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground capitalize">
        {order.paymentProvider || "N/A"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(order.createdAt)}
      </TableCell>
    </TableRow>
  );
}
