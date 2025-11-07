"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TestSeries, useDeleteTestSeries } from "@/hooks/test-series";
import { EditTestSeriesModal } from "./edit-test-series-modal";

interface TestSeriesDataTableProps {
  data: TestSeries[];
  isLoading?: boolean;
  onRefetch?: () => void;
  basePath?: "admin" | "teacher";
}

export function TestSeriesDataTable({
  data,
  isLoading,
  onRefetch,
  basePath = "admin",
}: TestSeriesDataTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editSeries, setEditSeries] = useState<TestSeries | null>(null);
  const deleteMutation = useDeleteTestSeries();

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
      onRefetch?.();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No test series found
                </TableCell>
              </TableRow>
            ) : (
              data.map((series) => (
                <TableRow key={series.id}>
                  <TableCell>
                    <div className="flex items-start space-x-3">
                      {series.imageUrl && (
                        <img
                          src={series.imageUrl}
                          alt={series.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <Link
                          href={`/${basePath}/test-series/${series.id}`}
                          className="font-medium hover:underline"
                        >
                          {series.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {series.exam} • {series.testCount} tests
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{series.exam}</Badge>
                  </TableCell>
                  <TableCell>
                    {series.isFree ? (
                      <Badge className="bg-green-100 text-green-800">
                        Free
                      </Badge>
                    ) : (
                      <div>
                        <p className="font-semibold">
                          ₹
                          {(
                            (series.discountedPrice ?? series.finalPrice) ||
                            0
                          ).toFixed(2)}
                        </p>
                        {series.discountPercentage > 0 && series.totalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            ₹{series.totalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Tests: {series.testCount}</p>
                      <p className="text-muted-foreground">
                        Questions: {series.totalQuestions}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={series.isActive ? "default" : "secondary"}
                        className={
                          series.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : ""
                        }
                      >
                        {series.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {series.publishedAt && (
                        <Badge variant="outline" className="text-xs">
                          Published
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(series.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(series.id)
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/${basePath}/test-series/${series.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditSeries(series)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(series.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              test series and all associated tests, sections, and questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editSeries && (
        <EditTestSeriesModal
          open={!!editSeries}
          onOpenChange={(open) => {
            if (!open) setEditSeries(null);
          }}
          testSeries={editSeries}
          onSuccess={() => {
            setEditSeries(null);
            onRefetch?.();
          }}
        />
      )}
    </>
  );
}
