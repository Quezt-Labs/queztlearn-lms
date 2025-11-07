"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  User,
  Building,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";
import { useStudentRegister, useStudentResendVerification } from "@/hooks/api";
import { useStudentAuthStore } from "@/lib/store/student-auth";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import Image from "next/image";

// Client Student Register Component
function ClientStudentRegisterContent() {
  const router = useRouter();
  const { client } = useClient();
  const registerMutation = useStudentRegister();
  const resendVerificationMutation = useStudentResendVerification();
  const { setStudentData } = useStudentAuthStore();

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
    username: "",
  });

  // Loading state management
  const { isLoading, error, setError, executeWithLoading } = useLoadingState({
    autoReset: true,
  });

  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isRegistrationSuccess, setIsRegistrationSuccess] =
    useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [canResend, setCanResend] = useState<boolean>(true);
  const [resendCount, setResendCount] = useState<number>(0);

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuthAndRedirect = async () => {
      try {
        // For now, we'll skip auth check for student registration
        // This can be enhanced later to check if student is already logged in
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsCheckingAuth(false);
      }
    };

    const timer = setTimeout(checkAuthAndRedirect, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateAllFields()) {
      setError("Please fix the form errors before submitting");
      return;
    }

    if (!client?.id) {
      setError("Client information is missing. Please try again.");
      return;
    }

    try {
      await executeWithLoading(async () => {
        const result = await registerMutation.mutateAsync({
          organizationId: client.organizationId,
          email: getFieldValue("email"),
          username: getFieldValue("username"),
        });

        if (result.success) {
          // Store student data for the verification flow
          setStudentData({
            email: getFieldValue("email"),
            username: getFieldValue("username"),
            organizationId: client.organizationId,
          });

          // Show success state instead of redirecting
          setRegisteredEmail(getFieldValue("email"));
          setIsRegistrationSuccess(true);
        }
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

  const handleResendEmail = async () => {
    if (!canResend || !registeredEmail) return;

    try {
      await executeWithLoading(async () => {
        await resendVerificationMutation.mutateAsync({
          email: registeredEmail,
        });

        setResendCount((prev) => prev + 1);
        setCanResend(false);

        // Allow resend after 60 seconds
        setTimeout(() => {
          setCanResend(true);
        }, 60000);
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show success state after registration
  if (isRegistrationSuccess) {
    return (
      <div className="min-h-screen flex overflow-hidden">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-2/5 bg-linear-to-br from-primary to-primary/80 flex-col justify-center p-8 text-primary-foreground">
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
                  <p className="text-primary-foreground/80">Email Sent</p>
                </div>
              </div>
              <p className="text-primary-foreground/80">
                We've sent a verification link to your email address.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-foreground/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Account Created</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-foreground/30 rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">
                  Verification Email Sent
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground/50 rounded-full"></div>
                </div>
                <span className="text-sm text-primary-foreground/70">
                  Check your email
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Success Message */}
        <div className="flex-1 lg:w-3/5 flex items-center justify-center p-6 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            {/* Success Icon */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4"
              >
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Check Your Email!</h2>
              <p className="text-muted-foreground">
                We've sent a verification link to
              </p>
              <p className="text-foreground font-semibold mt-1">
                {registeredEmail}
              </p>
            </div>

            {/* Instructions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Check your inbox</strong> and click the verification
                    link to activate your account.
                  </AlertDescription>
                </Alert>

                <ErrorMessage error={error} />

                {/* Resend Button */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Didn't receive the email?
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={
                      !canResend || resendVerificationMutation.isPending
                    }
                    className="w-full"
                  >
                    {resendVerificationMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Verification Email
                        {!canResend && " (Wait 60s)"}
                      </>
                    )}
                  </Button>
                  {resendCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Email sent {resendCount} time{resendCount > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {/* Back to Login */}
                <div className="text-center pt-2">
                  <Button variant="ghost" asChild>
                    <Link href={`/login`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-linear-to-br from-primary to-primary/80 flex-col justify-center p-8 text-primary-foreground">
        <div className="max-w-md">
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
                <p className="text-primary-foreground/80">
                  Student Registration
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/80">
              Join {client?.name || "our platform"} as a student and start your
              learning journey.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm">Create your student account</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-sm">Verify your email address</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Building className="h-4 w-4" />
              </div>
              <span className="text-sm">Access course materials</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Student Registration</h2>
            <p className="text-muted-foreground">
              Create your account to start learning with{" "}
              {client?.name || "our platform"}
            </p>
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Student Account</CardTitle>
              <CardDescription>
                Fill in your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorMessage
                  error={
                    error ||
                    (registerMutation.error
                      ? getFriendlyErrorMessage(registerMutation.error)
                      : null)
                  }
                />

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      value={getFieldValue("email")}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => validateFieldOnBlur("email")}
                      className="pl-10"
                      required
                    />
                  </div>
                  {getFieldError("email") && (
                    <p className="text-sm text-destructive">
                      {getFieldError("email")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={getFieldValue("username")}
                      onChange={(e) => updateField("username", e.target.value)}
                      onBlur={() => validateFieldOnBlur("username")}
                      className="pl-10"
                      required
                    />
                  </div>
                  {getFieldError("username") && (
                    <p className="text-sm text-destructive">
                      {getFieldError("username")}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading || registerMutation.isPending || !isFormValid
                  }
                >
                  {isLoading || registerMutation.isPending
                    ? "Creating Account..."
                    : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => router.push(`/login`)}
                    >
                      Sign In
                    </Button>
                  </p>
                </div>

                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link href={`/login`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ClientStudentRegister() {
  const params = useParams();
  const clientSlug = params.client as string;

  return (
    <ClientProvider subdomain={clientSlug}>
      <ClientStudentRegisterContent />
    </ClientProvider>
  );
}
