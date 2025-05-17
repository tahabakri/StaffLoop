import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (user?.emailVerifiedAt) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Mail className="h-16 w-16 text-primary" />
          </div>
          
          <p className="text-center text-gray-600">
            Please check your inbox and click the verification link to activate your account.
            If you don't see the email, check your spam folder.
          </p>

          <div className="space-y-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>

            <Button
              className="w-full"
              variant="ghost"
              onClick={() => setLocation("/auth")}
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 