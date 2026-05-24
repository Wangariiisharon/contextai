import { useEffect, useState } from "react";

interface UploadModalProps {
  onUploadSuccess?: () => void;
}

export default function DropFile({ onUploadSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setMessage(null);
      // Auto-start upload when a file is selected (no UI changes)
      handleUpload(selected);
    }
  };

  const handleUpload = async (fileParam?: File) => {
    const fileToUpload = fileParam || file;
    if (!fileToUpload) {
      setMessage({ type: "error", text: "Please select a file" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `File "${data.fileName}" uploaded successfully! Processed ${data.chunks} chunks.`,
        });
        setFile(null);
        // Clear the file input properly
        const fileInput = document.getElementById(
          "file-input",
        ) as HTMLInputElement | null;
        if (fileInput) {
          fileInput.value = "";
        }
        setTimeout(() => {
          onUploadSuccess?.();
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };
  return (
    <div
      className="mt-5 border border-dashed border-violet-900/60 rounded-xl p-7 text-center bg-violet-950/5 cursor-pointer hover:border-violet-700/60 hover:bg-violet-950/10 transition-colors"
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="w-9 h-9 rounded-full bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
        <svg
          className="w-4 h-4 text-violet-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <p className="text-[14px] font-medium text-violet-400 mb-1">
        Drop a file or click to upload
      </p>
      <p className="text-[12px] text-gray-600">
        PDF, DOCX, or TXT — processed &amp; embedded for RAG search
      </p>
      {message && (
        <div
          className={`mt-4 text-sm ${
            message.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
