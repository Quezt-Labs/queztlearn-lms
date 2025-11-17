"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ClientProvider, useClient } from "@/components/client/client-provider";
import { Loader2 } from "lucide-react";

// Client Student Register Component - Redirects to login (OTP handles both login and registration)
function ClientStudentRegisterContent() {
  const router = useRouter();
  const { client, isLoading } = useClient();

  useEffect(() => {
    if (!isLoading && client) {
      // Redirect to login page which now handles both login and registration via OTP
      router.replace(`/${client.subdomain}/login`);
    }
  }, [router, client, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return null;
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
