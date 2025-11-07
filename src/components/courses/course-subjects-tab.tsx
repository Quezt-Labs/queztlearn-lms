"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { SubjectDataTable } from "./subject-data-table";
import { Subject } from "./types";

interface CourseSubjectsTabProps {
  subjects: Subject[];
  isLoading: boolean;
  canManageCourse: boolean;
  basePath: "admin" | "teacher";
  courseId: string;
  onCreateSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
}

export function CourseSubjectsTab({
  subjects,
  isLoading,
  canManageCourse,
  basePath,
  courseId,
  onCreateSubject,
  onEditSubject,
  onDeleteSubject,
}: CourseSubjectsTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Subjects</CardTitle>
        {canManageCourse && (
          <Button onClick={onCreateSubject}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading subjects...</div>
        ) : subjects && subjects.length > 0 ? (
          <SubjectDataTable
            subjects={subjects}
            basePath={basePath}
            courseId={courseId}
            onEdit={onEditSubject}
            onDelete={onDeleteSubject}
            canManageCourse={canManageCourse}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No subjects added yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
