import { useRef, useState, useEffect } from "react";
import { Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { cn } from "@/lib/utils";

interface CameraViewProps {
  onCapture: (imageData: string) => void;
}

export function CameraView({ onCapture }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [captureState, setCaptureState] = useState<"ready" | "processing" | "success">("ready");
  const { 
    stream, 
    isLoading: cameraLoading, 
    error: cameraError,
    captureImage 
  } = useCamera(videoRef);

  const handleCapture = async () => {
    if (captureState !== "ready" || !videoRef.current) return;
    
    setCaptureState("processing");
    
    const imageData = captureImage();
    if (imageData) {
      try {
        // Simulate face detection processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Success state
        setCaptureState("success");
        
        // After showing success for a moment, pass the image data to parent
        setTimeout(() => {
          if (onCapture) onCapture(imageData);
        }, 1000);
      } catch (error) {
        console.error("Error processing image:", error);
        setCaptureState("ready");
      }
    } else {
      setCaptureState("ready");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Camera View */}
      <div
        className={cn(
          "relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-4 border-primary mb-6",
          captureState === "success" && "border-green-500"
        )}
      >
        {captureState === "ready" && (
          <>
            {/* Video stream */}
            {cameraError ? (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-red-500">{cameraError}</p>
                  <p className="text-sm text-gray-500 mt-2">Please allow camera access</p>
                </div>
              </div>
            ) : cameraLoading ? (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Initializing camera...</p>
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

        {/* Processing view */}
        {captureState === "processing" && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-primary font-medium">Verifying your identity...</p>
            </div>
          </div>
        )}

        {/* Success view */}
        {captureState === "success" && (
          <div className="absolute inset-0 bg-green-50 flex items-center justify-center">
            <div className="text-center">
              <div className="rounded-full h-20 w-20 bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-green-500 font-medium text-lg">Identity Verified!</p>
              <p className="text-gray-600">Checking you in...</p>
            </div>
          </div>
        )}
      </div>
      
      {captureState === "ready" && (
        <>
          <div className="text-center text-gray-600 mb-4">
            <p>Position your face in the center</p>
            <p className="text-sm text-gray-500">Make sure there's enough light and your face is clearly visible</p>
          </div>
          
          <Button
            onClick={handleCapture}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-xl transition duration-200 flex items-center justify-center"
            disabled={cameraLoading || !!cameraError}
          >
            <Camera className="h-6 w-6 mr-2" />
            Capture Selfie
          </Button>
        </>
      )}
    </div>
  );
}
