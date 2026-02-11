"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const videoConstraints = {
  facingMode: "environment",
};

export default function CapturePage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "HKYTH7L";

  const webcamRef = useRef<Webcam>(null);

  const [qrResponse, setQrResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showCamera, setShowCamera] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/get-qr/${code}/`
        );
        const data = await res.json();
        setQrResponse(data);
      } catch (err) {
        console.error("QR fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQRData();
  }, [code]);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setShowCamera(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/upload-qr-image/${code}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: imageSrc }),
        }
      );

      const data = await res.json();
      setQrResponse(data);
      setUploadedPhoto(imageSrc);
    } catch (err) {
      console.error("Upload failed", err);
    }
  }, [code]);

  const backendImage = qrResponse?.picture;
  const displayedImage = backendImage ?? uploadedPhoto;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!showCamera && <Header />}

      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <h1 className="text-2xl font-bold">{code}</h1>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && displayedImage && !showCamera && (
          <div className="w-full max-w-sm space-y-4">
            <img
              src={displayedImage}
              alt="QR Image"
              className="w-full rounded border"
            />

            {!backendImage && (
              <button
                onClick={() => setShowCamera(true)}
                className="w-full bg-gray-200 py-3 rounded font-semibold"
              >
                RETAKE
              </button>
            )}
          </div>
        )}

        {!loading && !displayedImage && !showCamera && (
          <button
            onClick={() => setShowCamera(true)}
            className="w-full max-w-sm bg-blue-600 text-white text-lg font-semibold py-4 rounded"
          >
            CLICK PICTURE
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
