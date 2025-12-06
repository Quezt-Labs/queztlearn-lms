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
    <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
      <TableCell className="py-4">
        <div className="space-y-1.5">
          <div className="font-mono text-xs font-medium">
            {order.receiptId || order.id.slice(0, 8)}
          </div>
          {entityName && (
            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
              {entityName}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Badge variant="outline" className="font-medium">
          {order.entityType === "BATCH" ? "Batch" : "Test Series"}
        </Badge>
      </TableCell>
      <TableCell className="py-4 font-semibold text-right">
        {formatCurrency(order.amount, order.currency)}
      </TableCell>
      <TableCell className="py-4">
        <Badge
          variant={getStatusBadgeVariant(order.paymentStatus)}
          className="font-medium"
        >
          {order.paymentStatus}
        </Badge>
      </TableCell>
      <TableCell className="py-4 text-muted-foreground capitalize">
        {order.paymentProvider || "N/A"}
      </TableCell>
      <TableCell className="py-4 text-muted-foreground text-sm">
        {formatDate(order.createdAt)}
      </TableCell>
    </TableRow>
  );
}
