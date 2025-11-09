"use client";

import { FileText, Video, LucideIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

export interface ContentFilterTabsProps {
  /** Total count of all content */
  totalCount: number;
  /** Count of lectures */
  lecturesCount: number;
  /** Count of PDFs */
  pdfsCount: number;
  /** Content to display in "All" tab */
  allContent: ReactNode;
  /** Content to display in "Lectures" tab */
  lecturesContent: ReactNode;
  /** Content to display in "PDFs" tab */
  pdfsContent: ReactNode;
  /** Optional label above tabs */
  label?: string;
  /** Default tab value */
  defaultValue?: string;
  /** Optional className */
  className?: string;
}

/**
 * Reusable content filter tabs component
 *
 * Displays tabs for filtering content by type (All, Lectures, PDFs)
 * with animated underline indicators and count badges
 *
 * @example
 * ```tsx
 * <ContentFilterTabs
 *   totalCount={10}
 *   lecturesCount={7}
 *   pdfsCount={3}
 *   allContent={<ContentGrid contents={allContents} />}
 *   lecturesContent={<ContentGrid contents={lectures} />}
 *   pdfsContent={<ContentGrid contents={pdfs} />}
 * />
 * ```
 */
export function ContentFilterTabs({
  totalCount,
  lecturesCount,
  pdfsCount,
  allContent,
  lecturesContent,
  pdfsContent,
  label = "Filter by type",
  defaultValue = "all",
  className,
}: ContentFilterTabsProps) {
  const isFlexLayout = className?.includes("flex");

  return (
    <div className={className}>
      <Tabs
        defaultValue={defaultValue}
        className={
          isFlexLayout
            ? "w-full flex-1 flex flex-col overflow-hidden"
            : "w-full"
        }
      >
        {label && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-sm font-semibold text-muted-foreground">
              {label}
            </h3>
          </div>
        )}
        <TabsList className="inline-flex h-11 items-center justify-start gap-2 rounded-lg bg-transparent p-0 w-full max-w-2xl border-b border-border/60 shrink-0">
          <TabsTrigger
            value="all"
            className="group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-t-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>All</span>
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/20 data-[state=active]:bg-primary/20">
              {totalCount}
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200 origin-center" />
          </TabsTrigger>
          <TabsTrigger
            value="lectures"
            className="group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-t-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <Video className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Lectures</span>
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/20 data-[state=active]:bg-primary/20">
              {lecturesCount}
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200 origin-center" />
          </TabsTrigger>
          <TabsTrigger
            value="pdfs"
            className="group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-t-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>PDFs</span>
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/20 data-[state=active]:bg-primary/20">
              {pdfsCount}
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200 origin-center" />
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="all"
          className={isFlexLayout ? "mt-4 flex-1 overflow-y-auto" : "mt-6"}
        >
          {allContent}
        </TabsContent>

        <TabsContent
          value="lectures"
          className={isFlexLayout ? "mt-4 flex-1 overflow-y-auto" : "mt-6"}
        >
          {lecturesContent}
        </TabsContent>

        <TabsContent
          value="pdfs"
          className={isFlexLayout ? "mt-4 flex-1 overflow-y-auto" : "mt-6"}
        >
          {pdfsContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
