"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import { useOtpAuth } from "@/hooks/auth/use-otp-auth";
import { PhoneStep } from "@/components/auth/phone-step";
import { OtpStep } from "@/components/auth/otp-step";
import { UsernameStep } from "@/components/auth/username-step";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cookieStorage } from "@/lib/utils/storage";
import { useRouter } from "next/navigation";

// Client Login Component
function ClientLoginContent() {
  const router = useRouter();
  const params = useParams();
  const { client, isLoading, error } = useClient();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already authenticated and redirect to My Learning
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuthAndRedirect = async () => {
      try {
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

    if (!isLoading && client) {
      const timer = setTimeout(checkAuthAndRedirect, 100);
      return () => clearTimeout(timer);
    } else if (!isLoading) {
      setIsCheckingAuth(false);
    }
  }, [router, params.client, isLoading, client]);

  const auth = useOtpAuth({
    organizationId: client?.organizationId || "",
    onAuthSuccess: () => {
      router.push("/student/my-learning");
    },
  });

  const handleOtpComplete = (value: string) => {
    auth.setOtp(value);
    if (value.length === 6) {
      setTimeout(() => {
        auth.handleVerifyOtp(value);
      }, 100);
    }
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
    <AuthLayout
      client={client}
      step={auth.step}
      countryCode={auth.countryCode}
      phoneNumber={auth.phoneNumber}
    >
      <AnimatePresence mode="wait">
        {auth.step === "phone" && (
          <PhoneStep
            countryCode={auth.countryCode}
            phoneNumber={auth.phoneNumber}
            onCountryCodeChange={auth.setCountryCode}
            onPhoneNumberChange={auth.setPhoneNumber}
            onGetOtp={auth.handleGetOtp}
            isLoading={auth.isLoading}
            error={auth.error}
          />
        )}

        {auth.step === "otp" && (
          <OtpStep
            otp={auth.otp}
            countryCode={auth.countryCode}
            phoneNumber={auth.phoneNumber}
            onOtpChange={auth.setOtp}
            onOtpComplete={handleOtpComplete}
            onBack={auth.handleBackToPhone}
            onResend={auth.handleResendOtp}
            resendTimer={auth.resendTimer}
            isLoading={auth.isLoading}
            isVerifying={auth.isLoading}
            error={auth.error}
          />
        )}

        {auth.step === "username" && (
          <UsernameStep
            username={auth.username}
            onUsernameChange={auth.setUsername}
            onSubmit={auth.handleUsernameSubmit}
            onBack={auth.handleBackToOtp}
            isLoading={auth.isLoading}
            error={auth.error}
          />
        )}
      </AnimatePresence>
    </AuthLayout>
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
