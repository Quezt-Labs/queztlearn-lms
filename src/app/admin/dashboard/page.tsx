"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  UserPlus,
  BookPlus,
  UserCheck,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatsSkeleton } from "@/components/common/loading-skeleton";
import { InviteUserModal } from "@/components/common/invite-user-modal";
import { useCurrentUser } from "@/hooks";
import { useClearOrganizationCache } from "@/hooks/api";
import { useRolePermissions } from "@/hooks/common/use-role-permissions";
import Link from "next/link";

export default function AdminDashboard() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const { isAdmin } = useRolePermissions();
  console.log(isAdmin, "isAdmin");
  console.log(currentUser, "currentUser");
  const clearCache = useClearOrganizationCache();

  // Mock data since dashboard stats and activity endpoints are not available
  const stats = {
    data: {
      totalCourses: 12,
      totalStudents: 156,
      activeEnrollments: 89,
      totalTeachers: 8,
    },
  };
  const statsLoading = false;

  const activities = {
    data: [
      {
        id: "1",
        type: "enrollment",
        message: "New student enrolled in React Fundamentals course",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        type: "course",
        message: "New course 'Advanced TypeScript' published",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        type: "user",
        message: "Teacher John Doe joined the platform",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  };
  const activitiesLoading = false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Welcome back! Here's what's happening with your learning platform."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }]}
        actions={
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/admin/users">
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Invite
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/courses">
                <BookPlus className="mr-2 h-4 w-4" />
                Create Course
              </Link>
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => clearCache.mutate()}
                disabled={clearCache.isPending}
                title="Clear organization cache"
              >
                <TrendingUp className="hidden" />
                {/* Using RefreshCcw icon for clear cache */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0020.49 15" />
                </svg>
                {clearCache.isPending ? "Clearing..." : "Clear Cache"}
              </Button>
            )}
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <StatsSkeleton />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Courses
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.data as { totalCourses?: number })?.totalCourses ||
                      0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.data as { totalStudents?: number })
                      ?.totalStudents || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Enrollments
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.data as { activeEnrollments?: number })
                      ?.activeEnrollments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Teachers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.data as { totalTeachers?: number })
                      ?.totalTeachers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +1 from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(activities?.data as unknown[])
                    ?.slice(0, 5)
                    .map((activity, index) => {
                      const activityData = activity as {
                        id?: string;
                        type?: string;
                        message?: string;
                        timestamp?: string;
                      };
                      return (
                        <div
                          key={activityData.id || index}
                          className="flex items-start space-x-4"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm">
                              {activityData.message || "Activity"}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {activityData.type || "activity"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  activityData.timestamp || Date.now()
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/admin/users">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start w-full"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Invite Teacher
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/admin/courses">
                    <BookPlus className="mr-2 h-4 w-4" />
                    Manage Courses
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/admin/settings">
                    <Activity className="mr-2 h-4 w-4" />
                    Platform Settings
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/admin/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Course Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>
              Overview of course enrollments and completion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Introduction to React</p>
                  <p className="text-xs text-muted-foreground">
                    25 students enrolled
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">68%</p>
                  <Progress value={68} className="w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Advanced TypeScript</p>
                  <p className="text-xs text-muted-foreground">
                    18 students enrolled
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">45%</p>
                  <Progress value={45} className="w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invite User Modal */}
      {currentUser?.organizationId && (
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          organizationId={currentUser.organizationId}
        />
      )}
    </div>
  );
}
