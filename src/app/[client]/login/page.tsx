"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff, GraduationCap } from "lucide-react";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import Link from "next/link";
import Image from "next/image";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";
import { useStudentLogin } from "@/hooks/api";
import { useRouter } from "next/navigation";
import { cookieStorage } from "@/lib/utils/storage";

// Client Login Component
function ClientLoginContent() {
  const router = useRouter();
  const params = useParams();
  const { client, isLoading, error } = useClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const studentLoginMutation = useStudentLogin();

  // Form validation
  const {
    updateField,
    validateFieldOnBlur,
    validateAllFields,
    getFieldValue,
    getFieldError,
    isFormValid,
  } = useEnhancedFormValidation({
    email: "",
    password: "",
    userType: "student", // Default to student for client login
  });

  // Loading state management
  const {
    isLoading: isSubmitting,
    error: submitError,
    setError,
    executeWithLoading,
  } = useLoadingState({
    autoReset: true,
  });

  // Check if user is already authenticated and redirect to My Learning
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuthAndRedirect = async () => {
      try {
        // Check if QUEZT_AUTH token exists in cookies
        const authData = cookieStorage.get<{
          token: string;
          user: { role: string };
        }>("QUEZT_AUTH");

        if (
          authData &&
          typeof authData === "object" &&
          "token" in authData &&
          authData.token
        ) {
          const userData = authData.user;
          if (
            userData &&
            (userData as { role?: string }).role?.toLowerCase() === "student"
          ) {
            // Redirect authenticated students to My Learning page
            const clientSlug = params.client as string;
            router.push(`/${clientSlug}/student/my-learning`);
            return;
          }
        }
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsCheckingAuth(false);
      }
    };

    // Only check after client is loaded
    if (!isLoading && client) {
      const timer = setTimeout(checkAuthAndRedirect, 100);
      return () => clearTimeout(timer);
    } else if (!isLoading) {
      setIsCheckingAuth(false);
    }
  }, [router, params.client, isLoading, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateAllFields()) {
      setError("Please fix the form errors before submitting");
      return;
    }

    try {
      await executeWithLoading(async () => {
        // Use student login for client login
        await studentLoginMutation.mutateAsync({
          email: getFieldValue("email"),
          password: getFieldValue("password"),
        });
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            {isCheckingAuth ? "Checking authentication..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
          <p className="text-muted-foreground">
            The requested client does not exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex">
      {/* Left Side - Client Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-linear-to-br from-primary to-primary/80 flex-col justify-center p-8 text-white">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={96}
                  height={96}
                  quality={100}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <p className="text-primary-foreground/80">Learning Platform</p>
              </div>
            </div>
            <p className="text-primary-foreground/80">
              Welcome to {client.name}&apos;s learning platform. Sign in to
              access your courses and continue your learning journey.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-sm">Access your courses</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-sm">Track your progress</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-sm">Connect with instructors</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={80}
                  height={80}
                  quality={100}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">{client.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Learning Platform
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorMessage
                  error={
                    submitError ||
                    (studentLoginMutation.error
                      ? getFriendlyErrorMessage(studentLoginMutation.error)
                      : null)
                  }
                />

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={getFieldValue("email")}
                    onChange={(e) => updateField("email", e.target.value)}
                    onBlur={() => validateFieldOnBlur("email")}
                    required
                  />
                  {getFieldError("email") && (
                    <p className="text-sm text-destructive">
                      {getFieldError("email")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={getFieldValue("password")}
                      onChange={(e) => updateField("password", e.target.value)}
                      onBlur={() => validateFieldOnBlur("password")}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {getFieldError("password") && (
                    <p className="text-sm text-destructive">
                      {getFieldError("password")}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !isFormValid ||
                    isSubmitting ||
                    studentLoginMutation.isPending
                  }
                >
                  {isSubmitting || studentLoginMutation.isPending
                    ? "Signing In..."
                    : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => router.push("/register")}
                    >
                      Register as Student
                    </Button>
                  </p>
                </div>

                <div className="text-center">
                  <Button variant="ghost" asChild>
                    <Link href="/">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function ClientLogin() {
  const params = useParams();
  const clientId = params.client as string;

  return (
    <ClientProvider domain={clientId}>
      <ClientLoginContent />
    </ClientProvider>
  );
}
