"use client";

import React, { useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFile, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") onFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file?.type === "application/pdf") onFile(file);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-b from-blue-50 to-white px-8 py-16 text-center transition-colors hover:border-blue-400 hover:from-blue-100"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
        <Upload className="h-8 w-8 text-blue-500" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-700">Drop your billing PDF here</p>
        <p className="mt-1 text-sm text-gray-400">or click to browse · PDF files only · max 20 MB</p>
      </div>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-1 border-blue-200 text-blue-600 hover:bg-blue-50"
      >
        Browse file
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
