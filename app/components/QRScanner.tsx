"use client";

import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function QrScanner() {
  const router = useRouter();

  const handleScan = (detectedCodes: any[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return;

    const code = detectedCodes[0];
    router.push(`/capture?code=${encodeURIComponent(code.rawValue)}`);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <Scanner
        onScan={handleScan}
        onError={(error) => console.log(error)}
        constraints={{
          facingMode: "environment",
        }}
        components={{
          torch: true,
          zoom: true,
          finder: true,
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
  );
}
