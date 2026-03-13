import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY!;
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT || "gpt-image-1.5";
const API_VERSION = "2025-04-01-preview";

export interface ImageGenerationOptions {
  prompt: string;
  n?: number;
  size?: "1024x1024" | "1024x1536" | "1536x1024";
  quality?: "low" | "medium" | "high";
  output_format?: "png" | "jpeg" | "webp";
  output_compression?: number;
  background?: "opaque" | "transparent";
  output_directory?: string;
}

export interface GeneratedImage {
  b64_json: string;
  file_path: string;
}

export interface ImageGenerationResult {
  images: GeneratedImage[];
}

export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const endpoint = AZURE_ENDPOINT.replace(/\/$/, "");
  const url = `${endpoint}/openai/deployments/${AZURE_DEPLOYMENT}/images/generations?api-version=${API_VERSION}`;

  const body: Record<string, unknown> = {
    prompt: options.prompt,
    n: options.n ?? 1,
    size: options.size ?? "1024x1024",
    quality: options.quality ?? "high",
    output_format: options.output_format ?? "png",
  };

  body.output_compression = options.output_compression ?? 100;
  if (options.background) {
    body.background = options.background;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": AZURE_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Azure OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    data: Array<{ b64_json: string }>;
  };

  const outputDir = options.output_directory ?? path.join(os.tmpdir(), "socialclaw-images");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const ext = options.output_format ?? "png";

  const images: GeneratedImage[] = data.data.map((item, idx) => {
    const filename = `image_${timestamp}_${idx + 1}.${ext}`;
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, Buffer.from(item.b64_json, "base64"));
    return { b64_json: item.b64_json, file_path: filePath };
  });

  return { images };
}
