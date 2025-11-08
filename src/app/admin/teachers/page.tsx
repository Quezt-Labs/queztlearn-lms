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
import { useGetAllTeachers, useDeleteTeacher, useCurrentUser } from "@/hooks";
import { ViewTeacherModal } from "@/components/common/view-teacher-modal";
import { EditTeacherModal } from "@/components/common/edit-teacher-modal";
import { InviteUserModal } from "@/components/common/invite-user-modal";

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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { data: teachersResponse, isLoading } = useGetAllTeachers();
  const deleteTeacherMutation = useDeleteTeacher();
  const { data: currentUser } = useCurrentUser();

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
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Invite Teacher
            </Button>
          </div>
        }
        className="mb-6"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Total Teachers
              </p>
              <p className="text-xl font-bold">{teachers.length}</p>
            </div>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Total Students
              </p>
              <p className="text-xl font-bold">
                {teachers
                  .reduce((sum, teacher) => sum + (teacher.students || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Avg Rating
              </p>
              <p className="text-xl font-bold">
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
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Active Batches
              </p>
              <p className="text-xl font-bold">
                {teachers.reduce(
                  (sum, teacher) => sum + (teacher.batchIds?.length || 0),
                  0
                )}
              </p>
            </div>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search teachers, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => (
          <Card
            key={teacher.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={teacher.imageUrl} alt={teacher.name} />
                  <AvatarFallback className="text-sm">
                    {getInitials(teacher.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {teacher.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-current shrink-0" />
                        <span className="text-xs font-medium">
                          {teacher.rating || "0.0"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {teacher.students?.toLocaleString() || 0} students
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleViewTeacher(teacher.id)}
                        aria-label={`View ${teacher.name}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleEditTeacher(teacher.id)}
                        aria-label={`Edit ${teacher.name}`}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteTeacher(teacher)}
                        aria-label={`Delete ${teacher.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {teacher.subjects.slice(0, 3).map((subject: string) => (
                        <Badge
                          key={subject}
                          variant="secondary"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {subject}
                        </Badge>
                      ))}
                      {teacher.subjects.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0.5"
                        >
                          +{teacher.subjects.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {(teacher.highlights?.experience ||
                    teacher.highlights?.education) && (
                    <div className="space-y-0.5 text-xs text-muted-foreground mb-2">
                      {teacher.highlights.experience && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {teacher.highlights.experience}
                          </span>
                        </div>
                      )}
                      {teacher.highlights.education && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {teacher.highlights.education}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {teacher.batches && teacher.batches.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Batches ({teacher.batches.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {teacher.batches.slice(0, 2).map((batch) => (
                          <Badge
                            key={batch.id}
                            variant="outline"
                            className="text-xs px-1.5 py-0.5"
                          >
                            {batch.name}
                          </Badge>
                        ))}
                        {teacher.batches.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0.5"
                          >
                            +{teacher.batches.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

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

      {/* Invite User Modal */}
      {currentUser?.organizationId && (
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          organizationId={currentUser.organizationId}
          defaultRole="TEACHER"
          allowedRoles={["TEACHER"]}
        />
      )}
    </div>
  );
}
