"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, X, Check, Loader2, PlayCircle, Image as ImageIcon } from "lucide-react";

interface MediaUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
}

export default function MediaUploader({ onUploadComplete, multiple = false }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const files = Array.from(e.target.files);
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("posts-assets")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("posts-assets")
          .getPublicUrl(filePath);
        
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
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-neutral-500 mb-2 group-hover:text-blue-500 transition-colors" />
                <p className="text-xs text-neutral-400 font-medium">Click para subir {multiple ? "archivos" : "foto o video"}</p>
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

      {/* Grid Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {previews.map((url, index) => (
            <div key={index} className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 group aspect-square">
              {url.toLowerCase().endsWith(".mp4") ? (
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
                <p className="text-[8px] text-neutral-500 font-mono truncate">{url.split('/').pop()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
