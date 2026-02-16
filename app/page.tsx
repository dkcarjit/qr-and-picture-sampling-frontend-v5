"use client";

import QrScanner from "../components/QRScanner";

export default function QRScanner() {
  return (
    <div className="relative w-full min-h-screen mx-auto">
      <QrScanner />

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-[70vw] max-w-87.5 aspect-square border-4 border-green-500 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-16 bg-linear-to-b from-green-400/60 to-transparent animate-scan"></div>
        </div>
      </div>
    </div>
  );
}
