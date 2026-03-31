"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, X, Loader2, PlayCircle, Sparkles } from "lucide-react";

interface MediaUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
}

/**
 * Converts an image File to JPEG format using a hidden canvas.
 * Returns the original file unchanged if it is a video or already JPEG.
 * Instagram API requires JPEG, so we strictly avoid WebP.
 */
async function convertToJPEG(file: File, quality = 0.88): Promise<{ file: File; converted: boolean }> {
  if (file.type === "image/jpeg" || file.type.startsWith("video/")) {
    return { file, converted: false };
  }
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ file, converted: false });
        return;
      }
      // Fill with white background in case it's a transparent PNG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ file, converted: false });
            return;
          }
          const jpegName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          resolve({ file: new File([blob], jpegName, { type: "image/jpeg" }), converted: true });
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, converted: false });
    };
    img.src = objectUrl;
  });
}

export default function MediaUploader({ onUploadComplete, multiple = false }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [convertedCount, setConvertedCount] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setConvertedCount(0);
      if (!e.target.files || e.target.files.length === 0) return;

      const rawFiles = Array.from(e.target.files);

      // --- Convert images to JPEG before upload ---
      let converted = 0;
      const convertedFiles = await Promise.all(
        rawFiles.map(async (f) => {
          const result = await convertToJPEG(f);
          if (result.converted) converted++;
          return result.file;
        })
      );
      setConvertedCount(converted);

      const uploadPromises = convertedFiles.map(async (file) => {
        const fileName = `${Math.random()}.${file.name.split(".").pop()}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("posts-assets")
          .upload(filePath, file, {
            contentType: file.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts-assets").getPublicUrl(filePath);

        // Registrar en la base de datos de la galería
        try {
          await fetch("/api/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              url: publicUrl,
              type: file.type.startsWith("video") ? "video" : "image",
              size: file.size,
              category: "general",
            }),
          });
        } catch (dbError) {
          console.error("Error registrando en galería:", dbError);
        }

        return publicUrl;
      });

      const newUrls = await Promise.all(uploadPromises);
      const updatedUrls = multiple ? [...previews, ...newUrls] : newUrls;

      setPreviews(updatedUrls);
      onUploadComplete(updatedUrls);
    } catch (error: any) {
      alert("Error subiendo archivo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onUploadComplete(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {(multiple || previews.length === 0) && (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-800 rounded-3xl cursor-pointer hover:bg-neutral-900/50 hover:border-blue-500/50 transition-all group overflow-hidden relative">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Convirtiendo a JPG...</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-neutral-500 mb-2 group-hover:text-blue-500 transition-colors" />
                <p className="text-xs text-neutral-400 font-medium">
                  Click para subir {multiple ? "archivos" : "foto o video"}
                </p>
                <p className="text-[9px] text-neutral-600 font-medium mt-0.5">
                  Las imágenes se optimizan a JPG automáticamente ⚡
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
            accept="image/*,video/*"
            multiple={multiple}
          />
        </label>
      )}

      {/* JPG conversion badge */}
      {convertedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">
            {convertedCount} imagen{convertedCount > 1 ? "es" : ""} optimizada{convertedCount > 1 ? "s" : ""} a JPG
          </p>
        </div>
      )}

      {/* Grid Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {previews.map((url, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 group aspect-square"
            >
              {url.toLowerCase().includes(".mp4") || url.toLowerCase().includes("video") ? (
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                  <PlayCircle className="w-8 h-8 text-white/50" />
                </div>
              ) : (
                <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover" />
              )}

              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-neutral-900/80 backdrop-blur-sm border-t border-neutral-800">
                <p className="text-[8px] text-neutral-500 font-mono truncate">{url.split("/").pop()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
