"use client";

import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";

export default function QrScanner() {
  const router = useRouter();
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );

  const handleScan = (detectedCodes: any[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return;

    const code = detectedCodes[0];
    router.push(`/capture?code=${encodeURIComponent(code.rawValue)}`);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <button
        onClick={switchCamera}
        className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all top-5 right-5 absolute z-5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
      <div>
        <Scanner
          key={facingMode}
          onScan={handleScan}
          onError={(error) => console.log(error)}
          constraints={{
            facingMode: facingMode,
          }}
          components={{
            torch: true,
            finder: false,
          }}
          styles={{
            container: {
              width: "100vw",
              height: "100vh",
            },
            video: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
            },
          }}
        />
      </div>
    </div>
  );
}
