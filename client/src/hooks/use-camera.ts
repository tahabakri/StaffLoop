import { useState, useEffect, RefObject } from "react";
import { initCamera, stopCameraStream, captureImage as captureCameraImage } from "@/lib/camera-utils";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
}

export function useCamera(
  videoRef: RefObject<HTMLVideoElement>,
  options: UseCameraOptions = { facingMode: "user" }
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      setIsLoading(true);
      setError(null);

      try {
        const cameraStream = await initCamera();
        
        if (!cameraStream) {
          setError("Failed to initialize camera");
          setIsLoading(false);
          return;
        }

        setStream(cameraStream);

        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      } catch (err) {
        console.error("Camera initialization error:", err);
        setError("Camera access denied. Please check your browser permissions.");
      } finally {
        setIsLoading(false);
      }
    }

    setupCamera();

    return () => {
      stopCameraStream(stream);
    };
  }, [videoRef]);

  // Function to capture image from the video stream
  const captureImage = (): string | null => {
    if (!videoRef.current) return null;
    return captureCameraImage(videoRef.current);
  };

  return {
    stream,
    isLoading,
    error,
    captureImage,
  };
}
