"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { upload } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import CircularProgress from "@/components/globals/CircularLoading";

const ImageUpload = ({
  onImageUpload,
  defaultValue = "",
  imageCount,
  maxSize,
}: {
  onImageUpload: (urls: string[] | string) => void;
  defaultValue?: string | string[];
  imageCount: number;
  maxSize: number;
}) => {
  const [images, setImages] = useState<string[]>(
    Array.isArray(defaultValue)
      ? defaultValue
      : defaultValue
      ? [defaultValue]
      : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Progress simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpg": [".jpg", ".jpeg"],
      "image/svg+xml": [".svg"],
      "image/webp": [".webp"],
    },
    maxFiles: imageCount,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > imageCount) {
        toast.error(`You can only upload ${imageCount} image(s).`);
        return;
      }

      const validFiles = acceptedFiles.filter(
        (file) => file.size <= maxSize * 1024 * 1024
      );

      if (validFiles.length === 0) {
        toast.error("Please upload a smaller image.");
        return;
      }

      setIsLoading(true);
      const toastId = toast.loading("Uploading image...");

      try {
        const urls: string[] = [];
        for (const file of validFiles) {
          // rename file
          const fileExtension = file.name.split(".").pop();
          const now = new Date();
          const formattedTimestamp = `${String(now.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear()}-${String(
            now.getHours()
          ).padStart(2, "0")}-${String(now.getMinutes()).padStart(
            2,
            "0"
          )}-${String(now.getSeconds()).padStart(2, "0")}`;
          const newFileName = `${formattedTimestamp}.${fileExtension}`;
          const renamedFile = new File([file], newFileName, { type: file.type });

          await new Promise((resolve) => setTimeout(resolve, 500));
          const { url } = await upload(renamedFile);
          urls.push(url);
        }

        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 300));

        toast.dismiss(toastId);
        toast.success("Image(s) uploaded successfully!");

        const newImages =
          imageCount === 1 ? [urls[0]] : [...images, ...urls].slice(0, imageCount);

        setImages(newImages);
        onImageUpload(imageCount === 1 ? newImages[0] : newImages);
      } catch (error) {
        toast.dismiss(toastId);
        toast.error("Image upload failed.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleRemoveImage = (url: string) => {
    const updated = images.filter((img) => img !== url);
    setImages(updated);
    onImageUpload(imageCount === 1 ? updated[0] || "" : updated);
    toast.info("Image removed.");
  };

  return (
    <div className="rounded-xl w-full">
      <div
        {...getRootProps({
          className:
            "border-dashed border-[2px] rounded-xl cursor-pointer py-8 flex justify-center items-center flex-col relative",
        })}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <CircularProgress
              value={progress}
              size={120}
              strokeWidth={10}
              showLabel
              labelClassName="text-xl font-bold"
              renderLabel={(val) => `${val}%`}
            />
            <p className="font-medium">Uploading...</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your image
            </p>
          </div>
        ) : images.length > 0 ? (
          <div
            className={`${
              imageCount === 1
                ? "flex flex-col items-center gap-2"
                : "flex flex-wrap gap-4 justify-center"
            }`}
          >
            {images.map((url, idx) => (
              <div key={idx} className="relative">
                <Image
                  src={url}
                  alt={`Uploaded Image ${idx}`}
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                  onClick={() => handleRemoveImage(url)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center size-12 rounded-full border">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="mt-2 font-medium">Drag & drop images here</p>
            <p className="mt-2 mb-4 text-sm text-muted-foreground">
              or click to browse (max {imageCount || 1} file(s), up to{" "}
              {maxSize || 4}MB each)
            </p>
            <Button type="button" variant="secondary">
              Browse files
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
