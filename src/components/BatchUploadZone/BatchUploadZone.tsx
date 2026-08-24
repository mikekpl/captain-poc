"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { FolderOpen, FileText, X } from "lucide-react";

interface BatchUploadZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function BatchUploadZone({ onFiles, disabled }: BatchUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const all = Array.from(e.target.files ?? []);
    const pdfs = all.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    setSelectedFiles(pdfs);
  }

  function handleClear() {
    setSelectedFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-b from-blue-50 to-white px-8 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
          <FolderOpen className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-700">Select a folder containing PDFs</p>
          <p className="mt-1 text-sm text-gray-400">All PDF files in the chosen directory will be parsed</p>
        </div>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          Choose Directory
        </Button>
        {/* webkitdirectory is non-standard but broadly supported for directory picking */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleChange}
          {...({ webkitdirectory: "" } as object)}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">
              {selectedFiles.length} PDF{selectedFiles.length !== 1 ? "s" : ""} found
            </span>
            <button onClick={handleClear} disabled={disabled} className="text-gray-400 hover:text-gray-600 disabled:opacity-40">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50">
            {selectedFiles.map((f) => (
              <li key={f.webkitRelativePath || f.name} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
                <FileText className="h-4 w-4 shrink-0 text-blue-400" />
                <span className="truncate">{f.name}</span>
                <span className="ml-auto text-xs text-gray-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 px-4 py-3">
            <Button disabled={disabled} onClick={() => onFiles(selectedFiles)} className="w-full">
              Parse All PDFs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
