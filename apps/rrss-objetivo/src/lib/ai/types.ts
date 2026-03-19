export interface ImageProvider {
  name: string;
  generate(prompt: string, seed?: number): Promise<Buffer>;
}

export interface ImageGenerationOptions {
  prompt: string;
  seed?: number;
  width?: number;
  height?: number;
  model?: string;
}
