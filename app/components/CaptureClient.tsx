"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { Flashlight } from "lucide-react";

type TorchConstraint = MediaTrackConstraintSet & {
  torch?: boolean;
};

export default function CapturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "HKYTH7L";

  const [qrResponse, setQrResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [showCamera, setShowCamera] = useState(false);
  // const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    const fetchQRData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/get-qr/${code}/`,
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.message || `Request failed with status ${res.status}`,
          );
        }

        const data = await res.json();
        setQrResponse(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (code) fetchQRData();
  }, [code]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(
        err.message ||
          "Unable to access camera. Please allow camera permissions and try again.",
      );
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;

    if (!capabilities.torch) {
      alert("Torch is not supported on this device.");
      return;
    }

    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as TorchConstraint],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.error("Torch error:", err);
    }
  };

  const capture = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg"),
    );

    if (!blob) return;

    stopCamera();
    setShowCamera(false);
    setUploading(true);

    const formData = new FormData();
    formData.append("picture", blob, "capture.jpg");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/update-picture/${code}/`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.message || `Upload Failed with status ${res.status}`,
        );
      }

      const data = await res.json();
      setQrResponse(data);
      // setUploadedPhoto(imageSrc);
    } catch (err: any) {
      setError(err.message || "Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const backendImage = qrResponse?.picture;
  const displayedImage = backendImage;
  // const displayedImage = backendImage ?? uploadedPhoto;

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
          <h2 className="text-2xl font-bold">{error}</h2>
          <button
            className="bg-red-600 text-white p-3 rounded font-semibold"
            onClick={() => router.push("/")}
          >
            Try Again
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6 pb-16">
        <h1 className="text-2xl font-bold">{code}</h1>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && displayedImage && !showCamera && (
          <div className="w-full max-w-sm space-y-4">
            <div className="relative">
              <img
                src={displayedImage}
                alt="QR Image"
                className="w-full rounded border"
              />

              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowCamera(true);
                startCamera();
              }}
              disabled={uploading}
              className="w-full bg-gray-200 py-3 rounded font-semibold mb-4 disabled:opacity-50"
            >
              {uploading ? "UPLOADING..." : "TAKE NEW PHOTO"}
            </button>
          </div>
        )}

        {!loading && !displayedImage && !showCamera && (
          <button
            onClick={() => setShowCamera(true)}
            disabled={uploading}
            className="w-full max-w-sm bg-blue-600 text-white text-lg font-semibold py-4 rounded"
          >
            {uploading ? "UPLOADING..." : "CLICK PICTURE"}
          </button>
        )}
      </main>

      {!showCamera && <Footer />}

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
          />

          <div className="absolute top-8 left-8 w-full flex justify-start">
            <button
              onClick={() => {
                stopCamera();
                setShowCamera(false);
              }}
              className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="absolute top-8 right-8">
            <button
              className="p-3 bg-black/40 rounded-full text-white"
              onClick={toggleTorch}
            >
              <Flashlight />
            </button>
          </div>

          <div className="absolute bottom-8 w-full flex justify-center">
            <button
              onClick={capture}
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
