"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const videoConstraints = {
  facingMode: "environment",
};

export default function CapturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "HKYTH7L";

  const webcamRef = useRef<Webcam>(null);

  const [qrResponse, setQrResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [showCamera, setShowCamera] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  const [authorized, setAuthorized] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
    } else {
      setToken(token);
      setAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    const fetchQRData = async () => {
      console.log("Fetching QR data for code:", code);
      if (!token) return;

      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/get-qr/${code}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
            },
          },
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

    if (authorized && token && code) {
      fetchQRData();
    }
  }, [authorized, token, code]);

  function base64ToBlob(base64: string): Blob {
    const [meta, data] = base64.split(",");
    const mime = meta.match(/:(.*?);/)?.[1] || "image/jpeg";

    const binary = atob(data);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    return new Blob([array], { type: mime });
  }

  const stopCamera = () => {
    const stream = webcamRef.current?.video?.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    stopCamera();
    setShowCamera(false);
    setUploading(true);

    const blob = base64ToBlob(imageSrc);

    const formData = new FormData();
    formData.append("picture", blob, "capture.jpg");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/update-picture/${code}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
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
      setUploadedPhoto(imageSrc);
    } catch (err: any) {
      setError(err.message || "Upload Failed");
    } finally {
      setUploading(false);
    }
  }, [code, token]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const backendImage = qrResponse?.picture;
  const displayedImage = backendImage ?? uploadedPhoto;

  if (!authorized) return "Loading...";

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
              onClick={() => setShowCamera(true)}
              disabled={uploading}
              className="w-full bg-gray-200 py-3 rounded font-semibold mb-14 disabled:opacity-50"
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
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
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
