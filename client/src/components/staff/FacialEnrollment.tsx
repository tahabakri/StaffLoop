import { useState, useRef } from "react";
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
import { useCamera } from "@/hooks/use-camera";
import { Loader2, Camera, Check, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FacialEnrollmentProps {
  staffId: number;
  onEnrollmentSuccess: () => void;
}

export function FacialEnrollment({ staffId, onEnrollmentSuccess }: FacialEnrollmentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [captureState, setCaptureState] = useState<"ready" | "processing" | "captured" | "enrolling" | "success">("ready");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const { 
    stream, 
    isLoading: cameraLoading, 
    error: cameraError,
    captureImage 
  } = useCamera(videoRef);

  // Facial enrollment mutation
  const enrollFaceMutation = useMutation({
    mutationFn: async (imageData: string) => {
      // For demo purposes, we'll simulate an API call
      // In a real app, this would call an API to enroll the facial data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the isFacialEnrolled flag on the server
      const response = await apiRequest(
        "POST", 
        `/api/staff/${staffId}/enroll-face`, 
        { image: imageData }
      );
      
      return await response.json();
    },
    onSuccess: () => {
      setCaptureState("success");
      toast({
        title: "Enrollment Successful",
        description: "Your face has been successfully enrolled",
        variant: "default",
      });
      
      // Move to the next step (normal check-in flow)
      setTimeout(() => {
        onEnrollmentSuccess();
      }, 1500);
    },
    onError: (error: Error) => {
      setCaptureState("ready");
      toast({
        title: "Enrollment Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleCapture = async () => {
    if (captureState !== "ready" || !videoRef.current) return;
    
    setCaptureState("processing");
    
    const imageData = captureImage();
    if (imageData) {
      // Simulate face detection processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCapturedImage(imageData);
      setCaptureState("captured");
    } else {
      setCaptureState("ready");
      toast({
        title: "Capture Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCaptureState("ready");
  };

  const handleEnroll = () => {
    if (!capturedImage) return;
    
    setCaptureState("enrolling");
    enrollFaceMutation.mutate(capturedImage);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Facial Enrollment</CardTitle>
        <CardDescription className="text-center">
          Capture your face to set up facial recognition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
          {captureState === "ready" && (
            <>
              {cameraLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Initializing camera...</p>
                  </div>
                </div>
              ) : cameraError ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-red-500 font-medium mb-2">Camera access error</p>
                    <p className="text-sm text-gray-600">
                      Please ensure you've granted camera permissions and try again
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Face outline overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-56 rounded-full border-2 border-dashed border-white opacity-70"></div>
                  </div>
                  
                  {/* Position guidance text */}
                  <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-40 py-2">
                    Center your face inside the circle and look directly at the camera
                  </div>
                </>
              )}
            </>
          )}

          {captureState === "processing" && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-primary font-medium">Processing image...</p>
              </div>
            </div>
          )}

          {captureState === "captured" && capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={capturedImage} 
                alt="Captured face" 
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          {captureState === "enrolling" && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-primary font-medium">Enrolling your face...</p>
                <p className="text-gray-400 text-sm">This will only take a moment</p>
              </div>
            </div>
          )}

          {captureState === "success" && (
            <div className="absolute inset-0 bg-green-50 flex items-center justify-center">
              <div className="text-center">
                <div className="rounded-full h-20 w-20 bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-green-500 font-medium text-lg">Face Enrolled!</p>
                <p className="text-gray-600">You can now use facial recognition for check-ins</p>
              </div>
            </div>
          )}
        </div>
        
        {captureState === "ready" && (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              Position your face in the center of the frame in a well-lit area
            </p>
            <Button
              className="w-full"
              onClick={handleCapture}
              disabled={cameraLoading || !!cameraError}
            >
              <Camera className="mr-2 h-5 w-5" />
              Capture Image
            </Button>
          </div>
        )}
        
        {captureState === "captured" && (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleRetake}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button
              className="flex-1"
              onClick={handleEnroll}
            >
              Continue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 