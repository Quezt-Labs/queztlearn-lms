"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface CourseSchedulesTabProps {
  canManageCourse: boolean;
  onCreateSchedule: () => void;
}

export function CourseSchedulesTab({
  canManageCourse,
  onCreateSchedule,
}: CourseSchedulesTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Schedules</CardTitle>
        {canManageCourse && (
          <Button onClick={onCreateSchedule}>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          No schedules added yet
        </div>
      </CardContent>
    </Card>
  );
}
