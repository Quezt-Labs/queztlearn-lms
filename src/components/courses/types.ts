// Shared types for course components
export interface Batch {
  id: string;
  name: string;
  description: string;
  class: string;
  exam: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  language: string;
  totalPrice: number;
  discountPercentage: number;
  faq: Array<{
    title: string;
    description: string;
  }>;
  teacherId: string;
  teacher?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Teacher {
  id: string;
  name: string;
  imageUrl?: string;
  highlights: string | { content: string };
  subjects: string[];
  batchIds: string[];
  rating?: number;
  experience?: string;
  totalStudents?: number;
  totalCourses?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  batchId: string;
  description?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Schedule {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  scheduledAt: string;
  duration: number;
  youtubeLink: string;
  description?: string;
  thumbnailUrl?: string;
  notifyBeforeMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseDetailPageProps {
  basePath?: "admin" | "teacher";
  showSubjectsTab?: boolean;
  showSchedulesTab?: boolean;
  showAnalyticsTab?: boolean;
  showSettingsTab?: boolean;
}
