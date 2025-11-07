"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/common/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  BookOpen,
  GraduationCap,
  Star,
  Clock,
} from "lucide-react";
import { useGetAllTeachers, useDeleteTeacher } from "@/hooks";
import { ViewTeacherModal } from "@/components/common/view-teacher-modal";
import { EditTeacherModal } from "@/components/common/edit-teacher-modal";

interface Teacher {
  id: string;
  name: string;
  imageUrl?: string;
  subjects?: string[];
  highlights?: {
    experience?: string;
    education?: string;
    achievements?: string[];
    content?: string;
  };
  batchIds?: string[];
  batches?: Array<{ id: string; name: string }>;
  rating?: number;
  students?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminTeachersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacherForView, setSelectedTeacherForView] =
    useState<Teacher | null>(null);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] =
    useState<Teacher | null>(null);

  const { data: teachersResponse, isLoading } = useGetAllTeachers();
  const deleteTeacherMutation = useDeleteTeacher();

  const teachers = (teachersResponse?.data || []) as Teacher[];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects?.some((subject: string) =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesSubject =
      subjectFilter === "all" || teacher.subjects?.includes(subjectFilter);
    return matchesSearch && matchesSubject;
  });

  const handleCreateTeacher = () => {
    router.push("/admin/teachers/create");
  };

  const handleEditTeacher = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (teacher) {
      setSelectedTeacherForEdit(teacher);
      setIsEditModalOpen(true);
    }
  };

  const handleViewTeacher = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (teacher) {
      setSelectedTeacherForView(teacher);
      setIsViewModalOpen(true);
    }
  };

  const handleTeacherUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedTeacherForEdit(null);
  };

  const handleDeleteTeacher = (teacher: { id: string; name: string }) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTeacher) {
      deleteTeacherMutation.mutate(selectedTeacher.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedTeacher(null);
        },
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const allSubjects = Array.from(
    new Set(teachers.flatMap((teacher) => teacher.subjects || []))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading teachers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Teachers"
        description="Manage teachers and their batch assignments"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Teachers" },
        ]}
        actions={
          <Button onClick={handleCreateTeacher} className="bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        }
        className="mb-6"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Teachers
                </p>
                <p className="text-2xl font-bold">{teachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold">
                  {teachers
                    .reduce((sum, teacher) => sum + (teacher.students || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Rating
                </p>
                <p className="text-2xl font-bold">
                  {teachers.length > 0
                    ? (
                        teachers.reduce(
                          (sum, teacher) => sum + (teacher.rating || 0),
                          0
                        ) / teachers.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Batches
                </p>
                <p className="text-2xl font-bold">
                  {teachers.reduce(
                    (sum, teacher) => sum + (teacher.batchIds?.length || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search teachers, subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {allSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card
            key={teacher.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={teacher.imageUrl} alt={teacher.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(teacher.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{teacher.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {teacher.rating}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({teacher.students?.toLocaleString() || 0} students)
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTeacher(teacher.id)}
                        aria-label={`View ${teacher.name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTeacher(teacher.id)}
                        aria-label={`Edit ${teacher.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTeacher(teacher)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Delete ${teacher.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {teacher.subjects?.map((subject: string) => (
                        <Badge
                          key={subject}
                          variant="secondary"
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      {teacher.highlights?.experience && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{teacher.highlights.experience}</span>
                        </div>
                      )}
                      {teacher.highlights?.education && (
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>{teacher.highlights.education}</span>
                        </div>
                      )}
                    </div>

                    {teacher.batches && teacher.batches.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">
                          Assigned Batches:
                        </p>
                        <div className="space-y-1">
                          {teacher.batches.map((batch) => (
                            <div
                              key={batch.id}
                              className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded"
                            >
                              {batch.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-3">
                      {teacher.createdAt && (
                        <span>Added: {formatDate(teacher.createdAt)}</span>
                      )}
                      {teacher.createdAt && teacher.updatedAt && " • "}
                      {teacher.updatedAt && (
                        <span>Updated: {formatDate(teacher.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No teachers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || subjectFilter !== "all"
                ? "Try adjusting your search criteria or filters"
                : "Get started by adding your first teacher"}
            </p>
            {!searchQuery && subjectFilter === "all" && (
              <Button onClick={handleCreateTeacher}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Teacher
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedTeacher?.name}
              &quot;? This action cannot be undone. The teacher will be removed
              from all assigned batches.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Teacher Modal */}
      <ViewTeacherModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTeacherForView(null);
        }}
        teacher={selectedTeacherForView}
        onEdit={(teacherId: string) => {
          setIsViewModalOpen(false);
          handleEditTeacher(teacherId);
        }}
      />

      {/* Edit Teacher Modal */}
      {selectedTeacherForEdit && (
        <EditTeacherModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTeacherForEdit(null);
          }}
          teacher={{
            id: selectedTeacherForEdit.id,
            name: selectedTeacherForEdit.name,
            imageUrl: selectedTeacherForEdit.imageUrl,
            subjects: selectedTeacherForEdit.subjects || [],
            highlights:
              typeof selectedTeacherForEdit.highlights === "string"
                ? selectedTeacherForEdit.highlights
                : JSON.stringify(selectedTeacherForEdit.highlights || {}),
            batchIds: selectedTeacherForEdit.batchIds || [],
            createdAt: selectedTeacherForEdit.createdAt,
            updatedAt: selectedTeacherForEdit.updatedAt,
          }}
          onSuccess={handleTeacherUpdated}
        />
      )}
    </div>
  );
}
