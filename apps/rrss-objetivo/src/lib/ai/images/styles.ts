export interface ImageStyle {
  id: string;
  name: string;
  previewUrl: string; // URL a una imagen de ejemplo del estilo
  promptSuffix: string; // Lo que se añade al prompt del post
}

export const IMAGE_STYLES: ImageStyle[] = [
  {
    id: "cinematic",
    name: "Cinematográfico",
    previewUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=200&h=200&auto=format&fit=crop",
    promptSuffix: "cinematic style, dramatic lighting, high contrast, 8k resolution, professional photography, shallow depth of field",
  },
  {
    id: "minimalist",
    name: "Minimalista",
    previewUrl: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=200&h=200&auto=format&fit=crop",
    promptSuffix: "minimalist clean style, solid pastel background, soft shadows, centered composition, high-end product photography",
  },
  {
    id: "3d_render",
    name: "Render 3D",
    previewUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&h=200&auto=format&fit=crop",
    promptSuffix: "3D isometric render, blender cycles, clay style, vibrant colors, soft global illumination, cute character or object",
  },
  {
    id: "tech_futuristic",
    name: "Tech Futurista",
    previewUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200&h=200&auto=format&fit=crop",
    promptSuffix: "futuristic technology style, blue and purple neon glow, circuit patterns, digital interface elements, sleek metallic surfaces",
  },
  {
    id: "corporate_pro",
    name: "Corporativo Pro",
    previewUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&h=200&auto=format&fit=crop",
    promptSuffix: "professional corporate style, architectural background, bright natural lighting, trust and reliability vibes, clean composition",
  },
  {
    id: "no-image",
    name: "Sin Imagen",
    previewUrl: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=200&h=200&auto=format&fit=crop",
    promptSuffix: "", // Sin imagen
  }
];
