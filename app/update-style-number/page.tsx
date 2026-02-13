"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import Image from "next/image";
import api from "@/app/lib/axios";
import Loader from "../components/ui/Loader";
import { ApiItem, ImageItem } from "../types/type";

const Page = () => {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [originalItems, setOriginalItems] = useState<ImageItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFetch = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/v1/list-qr/");

      const formatted: ImageItem[] = res.data
        .filter((item: ApiItem) => item.picture !== null)
        .map((item: ApiItem) => ({
          id: item.id,
          src: item.picture!,
          styleName: item.style_number || "",
        }));

      setItems(formatted);
      setOriginalItems(formatted);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load QR list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  const handleChange = useCallback((id: string, value: string) => {
    const upperValue = value.toUpperCase();

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, styleName: upperValue } : item,
      ),
    );
  }, []);

  const handleBlur = useCallback(
    async (id: string, value: string) => {
      const trimmedValue = value.trim();

      if (!trimmedValue) return;

      const original = originalItems.find((item) => item.id === id);
      if (!original || original.styleName === trimmedValue) return;

      try {
        await api.post("/v1/update-style-number/", {
          id,
          style_number: trimmedValue,
        });

        setOriginalItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, styleName: trimmedValue } : item,
          ),
        );
      } catch (err) {
        console.error("Failed to update style number", err);
      }
    },
    [originalItems],
  );

  return (
    <>
      <Header />

      <main className="relative min-h-screen px-6 py-10 pb-28">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <Loader fullscreen color="#1E90FF" size={18} />
          </div>
        )}

        <div className="max-w-7xl mx-auto space-y-20">
          {error && <p className="text-center text-red-500">{error}</p>}

          {items.map((item, idx ) => (
            <div
              key={item.id}
              className="flex flex-col lg:flex-row items-start"
            >
              <div className="w-full lg:w-1/3">
                <div
                  className="relative w-full h-52 overflow-hidden rounded-2xl cursor-pointer flex items-center"
                  onClick={() => setSelectedImage(item.src)}
                >
                  <span className="text-3xl font-bold"> {idx + 1}</span>
                  <Image
                    src={item.src}
                    alt="preview"
                    fill
                    className="object-contain transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="w-full lg:w-1/2 flex flex-col justify-center mt-8 lg:mt-0">
                <div className="space-y-8">
                  <div className="relative group">
                    <input
                      type="text"
                      value={item.styleName}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      onBlur={(e) => handleBlur(item.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 outline-none text-3xl font-semibold tracking-widest uppercase py-2 transition duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full max-w-4xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <Image
              src={selectedImage}
              alt="Large preview"
              fill
              className="object-contain rounded-xl transition-transform duration-500"
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Page;
