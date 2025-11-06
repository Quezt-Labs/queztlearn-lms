"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Eye, EyeOff, CheckCircle, Shield } from "lucide-react";
import Link from "next/link";
import { useStudentSetPassword, useStudentLogin } from "@/hooks/api";
import { useStudentAuthStore } from "@/lib/store/student-auth";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";
import { calculatePasswordStrength } from "@/lib/utils/validation";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import Image from "next/image";

// Client Student Set Password Component
function ClientStudentSetPasswordContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const { client } = useClient();
  const { studentData, userId, setPasswordSet, completeStudentAuth } =
    useStudentAuthStore();
  const setPasswordMutation = useStudentSetPassword();
  const loginMutation = useStudentLogin();

  // Form validation
  const {
    updateField,
    validateFieldOnBlur,
    validateAllFields,
    getFieldValue,
    getFieldError,
    isFormValid,
  } = useEnhancedFormValidation({
    password: "",
    confirmPassword: "",
  });

  // Loading state management
  const { isLoading, error, setError, executeWithLoading } = useLoadingState({
    autoReset: true,
  });

  // Initialize
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    return () => clearTimeout(initTimer);
  }, []);

  const handlePasswordChange = (value: string) => {
    updateField("password", value);
    // Re-validate confirm password if it has a value
    if (getFieldValue("confirmPassword")) {
      updateField("confirmPassword", getFieldValue("confirmPassword"));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    updateField("confirmPassword", value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateAllFields()) {
      setError("Please fix the form errors before submitting");
      return;
    }

    if (!userId) {
      setError(
        "User information is missing. Please try again or contact support."
      );
      return;
    }

    try {
      await executeWithLoading(async () => {
        // Start showing the multi-step loader
        setIsPasswordSet(true);

        // Set the password
        await setPasswordMutation.mutateAsync({
          userId: userId,
          password: getFieldValue("password"),
        });

        setPasswordSet(true);

        // Complete student auth
        completeStudentAuth();

        // Auto-login the student after password setup
        if (studentData?.email && getFieldValue("password")) {
          try {
            console.log("Auto-logging in student:", studentData.email);
            await loginMutation.mutateAsync({
              email: studentData.email,
              password: getFieldValue("password"),
            });

            // Login hook will handle redirect to student dashboard
            return;
          } catch (loginError) {
            console.error("Auto-login failed:", loginError);
            // If auto-login fails, redirect to login page
            setTimeout(() => {
              window.location.href = `/${client?.subdomain}/login`;
            }, 2000);
            return;
          }
        }

        // Fallback: redirect to login page if no student data
        setTimeout(() => {
          window.location.href = `/${client?.subdomain}/login`;
        }, 4000);
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

  const onboardingSteps = [
    { text: "Setting up your account" },
    { text: "Creating your secure profile" },
    { text: "Logging you in automatically" },
    { text: `Welcome to ${client?.name || "QueztLearn"}!` },
  ];

  const passwordStrength = calculatePasswordStrength(getFieldValue("password"));
  const strengthColor =
    passwordStrength.score >= 75
      ? "bg-green-500"
      : passwordStrength.score >= 50
      ? "bg-yellow-500"
      : passwordStrength.score >= 25
      ? "bg-orange-500"
      : "bg-red-500";

  const strengthLabel =
    passwordStrength.score >= 75
      ? "Strong"
      : passwordStrength.score >= 50
      ? "Medium"
      : passwordStrength.score >= 25
      ? "Weak"
      : "Very Weak";

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Multi-step loader - shown during password setup */}
      {isPasswordSet && !isInitializing && (
        <MultiStepLoader
          loadingStates={onboardingSteps}
          loading={isPasswordSet}
          duration={1500}
          loop={false}
        />
      )}

      <div className="min-h-screen flex overflow-hidden">
        {/* Left Side - Progress State */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary to-primary/80 flex-col justify-center p-8 text-primary-foreground">
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
                    src={client?.logo || "/images/Logo.png"}
                    alt={client?.name || "Organization"}
                    width={96}
                    height={96}
                    quality={100}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {client?.name || "Organization"}
                  </h1>
                  <p className="text-primary-foreground/80">Password Setup</p>
                </div>
              </div>
              <p className="text-primary-foreground/80">
                Create a strong password to protect your account with{" "}
                {client?.name || "our platform"}.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm">Account created</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm">Email verified</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-foreground/30 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Set secure password</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Password Form */}
        <div className="flex-1 lg:w-3/5 flex items-center justify-center p-6 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Set Your Password</h2>
              <p className="text-muted-foreground">
                Create a secure password for your account
              </p>
            </div>

            {/* Password Form */}
            <Card>
              <CardHeader>
                <CardTitle>Password Setup</CardTitle>
                <CardDescription>
                  Choose a strong password to secure your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <ErrorMessage error={error} />

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={getFieldValue("password")}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        onBlur={() => validateFieldOnBlur("password")}
                        className="pr-20"
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

                  {/* Password Strength Indicator */}
                  {getFieldValue("password") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Password strength
                        </span>
                        <span
                          className={`font-medium ${
                            passwordStrength.score >= 75
                              ? "text-green-600"
                              : passwordStrength.score >= 50
                              ? "text-yellow-600"
                              : passwordStrength.score >= 25
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {strengthLabel}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength.score}
                        className="h-2"
                      />
                      <div className="flex space-x-1">
                        <div
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength.score >= 25
                              ? strengthColor
                              : "bg-muted"
                          }`}
                        />
                        <div
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength.score >= 50
                              ? strengthColor
                              : "bg-muted"
                          }`}
                        />
                        <div
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength.score >= 75
                              ? strengthColor
                              : "bg-muted"
                          }`}
                        />
                        <div
                          className={`h-1 flex-1 rounded-full ${
                            passwordStrength.score >= 100
                              ? strengthColor
                              : "bg-muted"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={getFieldValue("confirmPassword")}
                        onChange={(e) =>
                          handleConfirmPasswordChange(e.target.value)
                        }
                        onBlur={() => validateFieldOnBlur("confirmPassword")}
                        className="pr-20"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {getFieldError("confirmPassword") && (
                      <p className="text-sm text-destructive">
                        {getFieldError("confirmPassword")}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !isFormValid || setPasswordMutation.isPending || isLoading
                    }
                  >
                    {isLoading || setPasswordMutation.isPending
                      ? "Setting Password..."
                      : "Set Password"}
                  </Button>
                </form>

                {/* Back button */}
                <div className="mt-6 text-center">
                  <Button variant="outline" asChild>
                    <Link href={`/verify-email`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Email Verification
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function ClientStudentSetPassword() {
  const params = useParams();
  const clientSlug = params.client as string;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ClientProvider subdomain={clientSlug}>
        <ClientStudentSetPasswordContent />
      </ClientProvider>
    </Suspense>
  );
}
