"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CloudUpload, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    setUploading(false);
    setMessage(data.ok ? "🎉 File uploaded successfully!" : `❌ ${data.error}`);
  }

  return (
    <Card className="w-full max-w-md bg-neutral-900/70 border border-white/10 shadow-2xl rounded-2xl">
      <CardHeader>
        <p className="text-xs uppercase tracking-widest text-blue-400">
          askmydoc
        </p>

        <CardTitle className="text-xl text-white sm:text-2xl">
          Upload Document
        </CardTitle>

        <CardDescription className="text-neutral-400 text-sm">
          Upload a PDF or DOCX to start chatting.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <label className="border border-dashed border-neutral-700 bg-neutral-800/40 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer">
          <CloudUpload className="w-12 h-12 text-neutral-400" />
          <span className="text-sm text-neutral-300 text-center">
            Tap to upload or drag & drop
          </span>
          <Input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        {file && (
          <div className="flex items-center gap-3 bg-neutral-800/70 p-3 rounded-lg">
            <FileText className="w-8 h-8 text-blue-400" />
            <div className="truncate">
              <p className="text-sm text-black font-medium truncate">{file.name}</p>
              <p className="text-xs text-neutral-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        <Button disabled={uploading} onClick={handleUpload}>
          {uploading ? (
            <span className="flex items-center gap-2 cursor-pointer">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing…
            </span>
          ) : (
            "Upload File"
          )}
        </Button>

        {message && (
          <p className="text-center text-sm text-neutral-300">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
