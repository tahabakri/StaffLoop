/**
 * Camera utilities for StaffSnap facial recognition check-in
 */

// Function to initiate the camera and return a video stream
export async function initCamera(deviceId?: string): Promise<MediaStream | null> {
  try {
    const constraints: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" },
      audio: false,
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error("Error accessing camera:", error);
    return null;
  }
}

// Function to list available cameras
export async function listCameras(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === "videoinput");
  } catch (error) {
    console.error("Error listing cameras:", error);
    return [];
  }
}

// Function to capture an image from the video stream
export function captureImage(videoElement: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const context = canvas.getContext("2d");
    if (!context) return null;
    
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Return as base64 data URL
    return canvas.toDataURL("image/jpeg");
  } catch (error) {
    console.error("Error capturing image:", error);
    return null;
  }
}

// Function to detect faces in image (simplified placeholder)
export async function detectFace(imageData: string): Promise<boolean> {
  // In a real app, this would call a facial recognition API
  // For this demo, we'll simulate a delay and return true
  return new Promise(resolve => {
    setTimeout(() => resolve(true), 1500);
  });
}

// Function to verify a face matches a profile image (simplified placeholder)
export async function verifyFaceMatch(imageData: string, profileImageUrl: string): Promise<boolean> {
  // In a real app, this would call a facial recognition API to compare faces
  // For this demo, we'll simulate a delay and return true
  return new Promise(resolve => {
    setTimeout(() => resolve(true), 2000);
  });
}

// Function to get current location
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  if (!navigator.geolocation) {
    console.error("Geolocation not supported by this browser");
    return null;
  }

  try {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.error("Error getting location:", error);
          reject(null);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

// Helper to stop camera stream
export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach(track => track.stop());
}
