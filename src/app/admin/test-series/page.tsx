"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Search,
  Users,
  CheckCircle,
  Filter,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTestSeriesList, ExamType, TestSeries } from "@/hooks/test-series";
import { TestSeriesDataTable } from "@/components/test-series/test-series-data-table";
import { CreateTestSeriesModal } from "@/components/test-series/create-test-series-modal";

const EXAM_FILTERS: (ExamType | "ALL")[] = [
  "ALL",
  "JEE",
  "NEET",
  "UPSC",
  "BANK",
  "SSC",
  "GATE",
  "CAT",
  "NDA",
  "CLAT",
  "OTHER",
];

export default function TestSeriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState<ExamType | "ALL">("ALL");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, refetch } = useTestSeriesList({
    page,
    limit: 10,
    exam: examFilter !== "ALL" ? examFilter : undefined,
    isActive: isActiveFilter,
    search: searchQuery || undefined,
  });

  const testSeries = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination;

  const handleClearFilters = () => {
    setSearchQuery("");
    setExamFilter("ALL");
    setIsActiveFilter(undefined);
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery || examFilter !== "ALL" || isActiveFilter !== undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Series"
        description="Manage and create test series for your students"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Test Series" },
        ]}
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Test Series
          </Button>
        }
      />

      {/* Search and Filters */}
      <Card>
        <CardHeader className="sticky top-16 z-30 bg-card/80 backdrop-blur supports-backdrop-filter:bg-card/60 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle>All Test Series</CardTitle>
              <CardDescription>
                Browse and manage all test series in your platform
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="shrink-0"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search test series..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Exam Filter */}
            <Select
              value={examFilter}
              onValueChange={(value) => {
                setExamFilter(value as ExamType | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_FILTERS.map((exam) => (
                  <SelectItem key={exam} value={exam}>
                    {exam === "ALL" ? "All Exams" : exam}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={
                isActiveFilter === undefined
                  ? "ALL"
                  : isActiveFilter
                  ? "ACTIVE"
                  : "INACTIVE"
              }
              onValueChange={(value) => {
                setIsActiveFilter(
                  value === "ALL"
                    ? undefined
                    : value === "ACTIVE"
                    ? true
                    : false
                );
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <TestSeriesDataTable
            data={testSeries}
            isLoading={isLoading}
            onRefetch={() => refetch()}
            basePath="admin"
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page || pagination.currentPage} of{" "}
                {pagination.totalPages} ({pagination.totalCount} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!(pagination.hasPrevPage ?? pagination.hasPrevious)}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!(pagination.hasNextPage ?? pagination.hasNext)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {!isLoading && testSeries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No test series found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Get started by creating your first test series"}
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Test Series
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <CreateTestSeriesModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
