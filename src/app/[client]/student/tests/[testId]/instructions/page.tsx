"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { StudentHeader } from "@/components/student/student-header";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Info,
  Clock,
  FileText,
  Save,
  AlertTriangle,
  Monitor,
  Wifi,
  Battery,
  BookOpen,
  Target,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { useStartAttempt } from "@/hooks/test-attempts-client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ErrorMessage,
  SuccessMessage,
} from "@/components/common/error-message";

export default function TestInstructionsPage() {
  const params = useParams<{ testId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [agreedToInstructions, setAgreedToInstructions] = useState(false);
  const startAttempt = useStartAttempt();

  const mock = searchParams.get("mock") === "1";
  const testId = params.testId;

  // Validate testId
  if (!testId) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] bg-linear-to-br from-background via-background to-muted/20">
        <StudentHeader />
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 space-y-6 md:space-y-8 max-w-7xl w-full">
          <PageHeader
            title="Test Instructions"
            description="Please read the instructions carefully before starting your test"
            breadcrumbs={[
              { label: "Student", href: "/student/my-learning" },
              { label: "Instructions" },
            ]}
          />
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Invalid test ID. Please select a test to view instructions.
              </p>
              <Button asChild>
                <Link href="/student/my-learning">Go to My Learning</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleStartTest = async () => {
    setErrorMessage(null);

    // Request fullscreen as part of user gesture (button click)
    try {
      if (typeof document !== "undefined" && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen request failed:", e);
    }

    // For mock tests, skip API call and go directly to attempt
    if (mock) {
      router.push(`/student/tests/${testId}/attempt?mock=1`);
      return;
    }

    // For real tests, use API
    try {
      const res = await startAttempt.mutateAsync(testId);
      const attemptId = res.data.id;
      router.push(`/student/tests/${testId}/attempt?attemptId=${attemptId}`);
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Failed to start attempt. Please ensure you are enrolled.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-linear-to-br from-background via-background to-muted/20">
      <StudentHeader />
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 space-y-6 md:space-y-8 max-w-7xl w-full">
        {/* Success/Error Messages */}
        {successMessage && (
          <SuccessMessage
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        )}
        {errorMessage && (
          <ErrorMessage
            error={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        <PageHeader
          title="Test Instructions"
          description="Please read the following instructions carefully before starting your test"
          breadcrumbs={[
            { label: "Student", href: "/student/my-learning" },
            { label: "Instructions" },
          ]}
        />

        <div className="space-y-6">
          {/* Important Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> Once you start the test, the timer
                will begin immediately. Make sure you have a stable internet
                connection and are in a distraction-free environment.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Main Instructions Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* General Guidelines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-blue-500" />
                    General Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InstructionItem
                    icon={<Clock className="h-4 w-4 text-blue-500" />}
                    text="Timer starts immediately when you begin the test"
                  />
                  <InstructionItem
                    icon={<FileText className="h-4 w-4 text-green-500" />}
                    text="Navigate between sections and questions freely"
                  />
                  <InstructionItem
                    icon={<BookOpen className="h-4 w-4 text-purple-500" />}
                    text="Mark questions for review to revisit later"
                  />
                  <InstructionItem
                    icon={<Save className="h-4 w-4 text-emerald-500" />}
                    text="Answers are auto-saved as you progress"
                  />
                  <InstructionItem
                    icon={<Target className="h-4 w-4 text-orange-500" />}
                    text="Submit test before time expires"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Important Don'ts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full border-red-200 dark:border-red-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Important Don&apos;ts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DontItem
                    icon={<X className="h-4 w-4 text-red-500" />}
                    text="Do not refresh or close the browser tab"
                  />
                  <DontItem
                    icon={<X className="h-4 w-4 text-red-500" />}
                    text="Do not use browser back button during test"
                  />
                  <DontItem
                    icon={<X className="h-4 w-4 text-red-500" />}
                    text="Do not switch tabs or minimize window"
                  />
                  <DontItem
                    icon={<X className="h-4 w-4 text-red-500" />}
                    text="Do not use any unauthorized material"
                  />
                  <DontItem
                    icon={<X className="h-4 w-4 text-red-500" />}
                    text="Do not attempt from multiple devices"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* System Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Monitor className="h-5 w-5 text-indigo-500" />
                    System Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InstructionItem
                    icon={<Wifi className="h-4 w-4 text-indigo-500" />}
                    text="Stable internet connection (minimum 2 Mbps)"
                  />
                  <InstructionItem
                    icon={<Monitor className="h-4 w-4 text-indigo-500" />}
                    text="Updated Chrome, Firefox, Safari or Edge browser"
                  />
                  <InstructionItem
                    icon={<Battery className="h-4 w-4 text-indigo-500" />}
                    text="Ensure device is charged or plugged in"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Exam Day Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-full border-green-200 dark:border-green-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Pro Tips for Success
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InstructionItem
                    icon={<Target className="h-4 w-4 text-green-500" />}
                    text="Start with questions you know best"
                  />
                  <InstructionItem
                    icon={<Clock className="h-4 w-4 text-green-500" />}
                    text="Manage your time wisely across sections"
                  />
                  <InstructionItem
                    icon={<BookOpen className="h-4 w-4 text-green-500" />}
                    text="Review marked questions if time permits"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Agreement Checkbox */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree"
                    checked={agreedToInstructions}
                    onCheckedChange={(checked: boolean) =>
                      setAgreedToInstructions(checked)
                    }
                    className="mt-1"
                  />
                  <label
                    htmlFor="agree"
                    className="text-sm font-medium leading-relaxed cursor-pointer"
                  >
                    I have read and understood all the instructions mentioned
                    above. I am ready to begin the test and agree to follow all
                    the guidelines during the examination.
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <Button
              variant="outline"
              size="lg"
              className="flex-1 sm:flex-initial"
              asChild
            >
              <Link href="/student/my-learning">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button
              size="lg"
              className="flex-1 font-semibold text-base"
              disabled={
                !agreedToInstructions || (!mock && startAttempt.isPending)
              }
              onClick={handleStartTest}
            >
              {startAttempt.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  I&apos;m Ready, Start Test
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InstructionItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className="text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function DontItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className="text-red-600 dark:text-red-400 leading-relaxed">{text}</p>
    </div>
  );
}
