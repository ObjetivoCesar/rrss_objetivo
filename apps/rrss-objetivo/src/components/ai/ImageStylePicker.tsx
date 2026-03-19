"use client";

import { IMAGE_STYLES, ImageStyle } from "@/lib/ai/images/styles";
import { Check } from "lucide-react";
import Image from "next/image";

interface ImageStylePickerProps {
  selectedStyleId: string;
  onStyleSelect: (style: ImageStyle) => void;
}

export default function ImageStylePicker({ selectedStyleId, onStyleSelect }: ImageStylePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
      {IMAGE_STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onStyleSelect(style)}
          className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 h-24 ${
            selectedStyleId === style.id 
              ? "border-purple-500 ring-2 ring-purple-500/20" 
              : "border-neutral-800 hover:border-neutral-700"
          }`}
        >
          {/* Preview Image */}
          <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-500">
            <img 
              src={style.previewUrl} 
              alt={style.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Overlay Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2 ${
            selectedStyleId === style.id ? "from-purple-900/80" : ""
          }`}>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{style.name}</span>
          </div>

          {/* Selected Indicator */}
          {selectedStyleId === style.id && (
            <div className="absolute top-1 right-1 bg-purple-500 rounded-full p-0.5 shadow-lg">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
