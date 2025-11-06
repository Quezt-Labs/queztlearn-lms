"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  useStudentVerifyEmail,
  useStudentResendVerification,
} from "@/hooks/api";
import { useStudentAuthStore } from "@/lib/store/student-auth";
import { useEnhancedFormValidation, useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import Image from "next/image";

// Client Student Verify Email Component
function ClientStudentVerifyEmailContent() {
  const [isVerified, setIsVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasProcessedToken = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { client } = useClient();

  // Student auth store
  const { studentData, setEmailVerified, setUserId } = useStudentAuthStore();

  // Student verification hooks
  const verifyEmailMutation = useStudentVerifyEmail();
  const resendVerificationMutation = useStudentResendVerification();

  // Form validation (simplified for token handling)
  const { updateField } = useEnhancedFormValidation({
    verificationToken: "",
  });

  // Loading state management
  const { error, setError, executeWithLoading } = useLoadingState({
    autoReset: true,
  });

  const handleVerifyEmail = useCallback(
    async (token?: string) => {
      const tokenToUse = token;

      if (!tokenToUse?.trim()) {
        setError("Invalid verification link");
        return;
      }

      try {
        await executeWithLoading(async () => {
          const result = (await verifyEmailMutation.mutateAsync({
            token: tokenToUse,
          })) as {
            success: boolean;
            data?: { userId: string; message: string };
          };

          if (result.success && result.data?.userId) {
            setIsVerified(true);
            setEmailVerified(true);
            setUserId(result.data.userId);

            // Auto-redirect to student password setup after 2 seconds
            setTimeout(() => {
              router.push(`/set-password`);
            }, 2000);
          } else {
            setError(
              "Invalid verification code. Please check the link or try again."
            );
          }
        });
      } catch (error: unknown) {
        setError(getFriendlyErrorMessage(error));
      }
    },
    [
      executeWithLoading,
      verifyEmailMutation,
      router,
      setError,
      setEmailVerified,
      setUserId,
      client?.subdomain,
    ]
  );

  // Get token from URL params - only run once when token is present
  useEffect(() => {
    const token = searchParams.get("token");
    if (token && !hasProcessedToken.current) {
      hasProcessedToken.current = true;
      setIsProcessingToken(true);
      updateField("verificationToken", token);

      // Create a separate async function to avoid dependency issues
      const processToken = async () => {
        try {
          await handleVerifyEmail(token);
        } finally {
          setIsProcessingToken(false);
        }
      };

      processToken();
    }
  }, [searchParams, handleVerifyEmail, updateField]);

  // Initialize and handle redirects
  useEffect(() => {
    const token = searchParams.get("token");

    // Set initializing to false after a short delay to allow store to load
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    // Only redirect if there's no token AND no student data AND we're not initializing
    if (!isInitializing && !token && !studentData) {
      router.push(`/register`);
    }

    return () => clearTimeout(initTimer);
  }, [studentData, router, searchParams, isInitializing, client?.subdomain]);

  const handleResendEmail = async () => {
    if (!canResend || !studentData?.email) return;

    try {
      await executeWithLoading(async () => {
        await resendVerificationMutation.mutateAsync({
          email: studentData.email,
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

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="h-8 w-8 text-primary-foreground" />
          </motion.div>

          <h1 className="text-2xl font-bold text-primary mb-2">
            Email Verified Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Your email has been verified. You&apos;ll be redirected to set your
            password shortly.
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Redirecting to password setup...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
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
                <p className="text-primary-foreground/80">Email Verification</p>
              </div>
            </div>
            <p className="text-primary-foreground/80">
              Verify your email address to complete your registration with{" "}
              {client?.name || "our platform"}.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-sm">Student account created</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-foreground/30 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Verify email address</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-foreground/50 rounded-full"></div>
              </div>
              <span className="text-sm text-primary-foreground/70">
                Set password
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Processing State */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg text-center"
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Verifying Your Email</h2>
            <p className="text-muted-foreground">
              We&apos;re processing your verification link for{" "}
              <span className="font-medium">
                {studentData?.email || "your email"}
              </span>
            </p>
          </div>

          {/* Processing State */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                {isProcessingToken ? (
                  <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-primary/30">
                    <div className="flex items-center justify-center space-x-2 text-primary">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="text-sm font-medium">
                        Processing verification link...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <div className="animate-pulse rounded-full h-6 w-6 bg-muted-foreground/20"></div>
                      <span className="text-sm">
                        Waiting for verification link...
                      </span>
                    </div>
                  </div>
                )}

                <ErrorMessage error={error} />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Didn&apos;t receive the email?
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
                      "Sending..."
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                  {resendCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Resend attempts: {resendCount}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <Button variant="ghost" asChild>
                    <Link href={`/${client?.subdomain}/register`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Registration
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

export default function ClientStudentVerifyEmail() {
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
        <ClientStudentVerifyEmailContent />
      </ClientProvider>
    </Suspense>
  );
}
