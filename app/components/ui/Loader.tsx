"use client";

import { PulseLoader } from "react-spinners";

type LoaderProps = {
  fullscreen?: boolean;
  size?: number;
  color?: string;
};

export default function FetchDataWithLoader({
  fullscreen = false,
  size = 15,
  color = "#1E90FF",
}: LoaderProps) {
  return (
    <div
      className={
        fullscreen
          ? "min-h-screen flex items-center justify-center"
          : "flex items-center justify-center"
      }
    >
      <PulseLoader color={color} size={size} />
    </div>
  );
}
