"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import MediaGallery from "@/components/MediaGallery";
import MediaUploader from "@/components/MediaUploader";
import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function GalleryPage() {
  const [showUploader, setShowUploader] = useState(false);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Biblioteca de Medios</h1>
            <p className="text-neutral-400 mt-1">Gestiona tus imágenes y videos para SEO y Redes Sociales</p>
          </div>
          
          <button 
            onClick={() => setShowUploader(!showUploader)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {showUploader ? <X className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            {showUploader ? "Cerrar Subida" : "Subir Nuevo"}
          </button>
        </div>

        {/* Uploader Section (Conditional) */}
        {showUploader && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-white mb-4 text-center">Subir a la Nube</h3>
              <MediaUploader 
                multiple 
                onUploadComplete={() => {
                  // La galería se refresca automáticamente al cambiar el estado o podemos forzar un refresh
                  // Pero como MediaGallery tiene su propio useEffect, al cerrarse el uploader o simplemente por polling
                  // En este caso, el componente MediaGallery se refrescará al montar/desmontar o podemos añadir un refresh key
                }} 
              />
              <p className="text-center text-xs text-neutral-500 mt-4">
                Los archivos se guardarán automáticamente en tu biblioteca personal.
              </p>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="h-[calc(100vh-300px)]">
           <MediaGallery />
        </div>
      </div>
    </DashboardLayout>
  );
}
