"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/common/phone-input";
import { Phone, Loader2 } from "lucide-react";
import { ErrorMessage } from "@/components/common/error-message";

interface PhoneStepProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onGetOtp: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function PhoneStep({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  onGetOtp,
  isLoading,
  error,
}: PhoneStepProps) {
  const isPhoneValid = phoneNumber.length >= 10;

  return (
    <div className="space-y-4">
      <ErrorMessage error={error} />

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <PhoneInput
          countryCode={countryCode}
          phoneNumber={phoneNumber}
          onCountryCodeChange={onCountryCodeChange}
          onPhoneNumberChange={onPhoneNumberChange}
          disabled={isLoading}
          error={!!error}
        />
        {phoneNumber && phoneNumber.length < 10 && (
          <p className="text-sm text-muted-foreground">
            Phone number must be at least 10 digits
          </p>
        )}
      </div>

      <Button
        type="button"
        onClick={onGetOtp}
        className="w-full"
        disabled={!isPhoneValid || isLoading}
      >
        {isLoading ? (
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
    </div>
  );
}
