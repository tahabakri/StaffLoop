import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface OtpVerificationProps {
  staffId: number;
  phone: string;
  onVerificationSuccess: () => void;
}

export function OtpVerification({ staffId, phone, onVerificationSuccess }: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      // For demo purposes, we'll simulate an API call
      // In a real app, this would call an API to send the OTP via WhatsApp
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to your WhatsApp on ${phone}`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (otp: string) => {
      // In a real app, this would call the API to verify the OTP
      // For demo purposes, we'll accept any 6-digit OTP and simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the isOtpVerifiedForInitialEnrollment flag on the server
      const response = await apiRequest(
        "POST", 
        `/api/staff/${staffId}/verify-otp`, 
        { otp }
      );
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Successful",
        description: "Your phone number has been verified",
        variant: "default",
      });
      
      // Move to the next step (facial enrollment)
      setTimeout(() => {
        onVerificationSuccess();
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSendOtp = () => {
    sendOtpMutation.mutate();
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      verifyOtpMutation.mutate(otp);
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Phone Verification</CardTitle>
        <CardDescription className="text-center">
          {otpSent 
            ? "Enter the 6-digit code sent to your WhatsApp" 
            : "Please verify your phone number to continue"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
        </div>
        
        {!otpSent ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              We'll send a verification code to your WhatsApp on <strong>{phone}</strong>
            </p>
            <Button 
              className="w-full" 
              onClick={handleSendOtp}
              disabled={sendOtpMutation.isPending}
            >
              {sendOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : "Send Verification Code"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <p className="text-center text-sm text-gray-600">
              Didn't receive the code? {" "}
              <button 
                className="text-primary hover:underline" 
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
              >
                Send again
              </button>
            </p>
            
            <Button 
              className="w-full" 
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : verifyOtpMutation.isSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verified
                </>
              ) : "Verify"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 