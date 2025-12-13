"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CloudUpload, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setUploading(false);
    setMessage(data.ok ? "🎉 File uploaded successfully!" : `❌ ${data.error}`);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-4 bg-gradient-to-b from-neutral-950 to-neutral-900 text-white">
      
      <Card className="w-full max-w-2xl backdrop-blur-md border border-white/10 bg-neutral-900/60 shadow-2xl rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold text-white tracking-wide">
            Upload Document
          </CardTitle>
          <CardDescription className="text-neutral-400 text-sm">
            Upload a PDF or DOCX file. We will extract text, chunk it, embed it,
            and store it in Pinecone.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 py-4">

          {/* Dropzone */}
          <label
            htmlFor="file_input"
            className="
              border border-dashed border-neutral-700
              bg-neutral-800/40 hover:bg-neutral-800/60
              transition-all duration-200 
              rounded-xl p-10 flex flex-col items-center justify-center gap-4 
              cursor-pointer group
            "
          >
            <CloudUpload className="w-14 h-14 text-neutral-400 group-hover:text-white transition" />
            <span className="text-neutral-300 text-sm group-hover:text-white">
              Click to browse or drag a file here
            </span>

            <Input
              id="file_input"
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* File preview */}
          {file && (
            <div
              className="
                flex items-center gap-4 border border-neutral-700 
                bg-neutral-800/70 p-4 rounded-lg shadow-md 
                animate-in fade-in slide-in-from-bottom-2
              "
            >
              <FileText className="w-10 h-10 text-blue-400" />
              <div>
                <p className="text-white text-sm font-medium">{file.name}</p>
                <p className="text-neutral-400 text-xs">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {/* Upload button */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 transition shadow-lg"
            disabled={uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing…
              </div>
            ) : (
              "Upload File"
            )}
          </Button>

          {/* System message */}
          {message && (
            <p className="text-center text-neutral-300 text-sm">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
