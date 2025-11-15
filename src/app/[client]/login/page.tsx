"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { ArrowLeft, GraduationCap, Phone, Shield, Loader2 } from "lucide-react";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import Link from "next/link";
import Image from "next/image";
import { useLoadingState } from "@/hooks/common";
import { getFriendlyErrorMessage } from "@/lib/utils/error-handling";
import { ErrorMessage } from "@/components/common/error-message";
import { useGetOtp, useVerifyOtp } from "@/hooks/api";
import { useRouter } from "next/navigation";
import { cookieStorage } from "@/lib/utils/storage";
import { PhoneInput } from "@/components/common/phone-input";
import { OtpInput } from "@/components/common/otp-input";

type Step = "phone" | "otp" | "username";

// Client Login Component
function ClientLoginContent() {
  const router = useRouter();
  const params = useParams();
  const { client, isLoading, error } = useClient();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const getOtpMutation = useGetOtp();
  const verifyOtpMutation = useVerifyOtp();

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
            router.push(`/student/my-learning`);
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

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleGetOtp = async () => {
    if (!client?.organizationId) {
      setError("Client information is missing. Please try again.");
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    try {
      await executeWithLoading(async () => {
        const result = await getOtpMutation.mutateAsync({
          countryCode,
          phoneNumber,
          organizationId: client.organizationId,
        });

        if (result.success) {
          setIsExistingUser(result.data?.isExistingUser ?? false);
          setOtpSent(true);
          setStep("otp");
          setResendTimer(60); // 60 seconds cooldown
          setError(null);
        }
      });
    } catch (error: unknown) {
      const errorMessage = getFriendlyErrorMessage(error);
      // Handle 400 response for new users (this is expected)
      if (
        errorMessage.includes("new user") ||
        errorMessage.includes("registered")
      ) {
        setIsExistingUser(false);
        setOtpSent(true);
        setStep("otp");
        setResendTimer(60);
        setError(null);
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!client?.organizationId) {
      setError("Client information is missing. Please try again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    // If new user and no username, show username step
    if (isExistingUser === false && !username && step === "otp") {
      setStep("username");
      return;
    }

    try {
      await executeWithLoading(async () => {
        await verifyOtpMutation.mutateAsync({
          countryCode,
          phoneNumber,
          otp,
          organizationId: client.organizationId,
          username: isExistingUser === false ? username : undefined,
        });
        // onSuccess in hook will handle redirect
      });
    } catch (error: unknown) {
      setError(getFriendlyErrorMessage(error));
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtp("");
    await handleGetOtp();
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    // Auto-submit when OTP is complete
    if (value.length === 6) {
      setTimeout(() => {
        handleVerifyOtp();
      }, 300);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setOtpSent(false);
    setIsExistingUser(null);
  };

  const handleBackToOtp = () => {
    setStep("otp");
    setUsername("");
  };

  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
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
              Welcome to {client.name}&apos;s learning platform. Sign in with
              OTP to access your courses.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Phone className="h-4 w-4" />
              </div>
              <span className="text-sm">Quick OTP login</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm">Secure authentication</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-sm">Access your courses</span>
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
              <CardTitle>
                {step === "phone"
                  ? "Sign In / Register"
                  : step === "otp"
                    ? "Enter OTP"
                    : "Choose Username"}
              </CardTitle>
              <CardDescription>
                {step === "phone"
                  ? "Enter your phone number to get started"
                  : step === "otp"
                    ? `We've sent a 6-digit OTP to ${countryCode} ${phoneNumber}`
                    : "Choose a username for your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {step === "phone" && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <ErrorMessage
                      error={
                        submitError ||
                        (getOtpMutation.error
                          ? getFriendlyErrorMessage(getOtpMutation.error)
                          : null)
                      }
                    />

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <PhoneInput
                        countryCode={countryCode}
                        phoneNumber={phoneNumber}
                        onCountryCodeChange={setCountryCode}
                        onPhoneNumberChange={setPhoneNumber}
                        disabled={isSubmitting || getOtpMutation.isPending}
                        error={!!submitError || !!getOtpMutation.error}
                      />
                      {phoneNumber && phoneNumber.length < 10 && (
                        <p className="text-sm text-muted-foreground">
                          Phone number must be at least 10 digits
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={handleGetOtp}
                      className="w-full"
                      disabled={
                        !phoneNumber ||
                        phoneNumber.length < 10 ||
                        isSubmitting ||
                        getOtpMutation.isPending
                      }
                    >
                      {isSubmitting || getOtpMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Phone className="mr-2 h-4 w-4" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <ErrorMessage
                      error={
                        submitError ||
                        (verifyOtpMutation.error
                          ? getFriendlyErrorMessage(verifyOtpMutation.error)
                          : null)
                      }
                    />

                    <div className="space-y-2">
                      <Label>Enter 6-digit OTP</Label>
                      <OtpInput
                        length={6}
                        value={otp}
                        onChange={setOtp}
                        onComplete={handleOtpComplete}
                        disabled={
                          isSubmitting || verifyOtpMutation.isPending
                        }
                        error={!!submitError || !!verifyOtpMutation.error}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToPhone}
                        className="flex-1"
                        disabled={isSubmitting || verifyOtpMutation.isPending}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Change Number
                      </Button>
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="flex-1"
                        disabled={
                          otp.length !== 6 ||
                          isSubmitting ||
                          verifyOtpMutation.isPending
                        }
                      >
                        {isSubmitting || verifyOtpMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0}
                        className="text-sm"
                      >
                        {resendTimer > 0
                          ? `Resend OTP in ${resendTimer}s`
                          : "Resend OTP"}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "username" && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <ErrorMessage error={submitError} />

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isSubmitting || verifyOtpMutation.isPending}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && username.trim()) {
                            handleVerifyOtp();
                          }
                        }}
                        autoFocus
                      />
                      <p className="text-sm text-muted-foreground">
                        This will be your display name
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToOtp}
                        className="flex-1"
                        disabled={isSubmitting || verifyOtpMutation.isPending}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="flex-1"
                        disabled={
                          !username.trim() ||
                          isSubmitting ||
                          verifyOtpMutation.isPending
                        }
                      >
                        {isSubmitting || verifyOtpMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    New users will be automatically registered
                  </p>
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
