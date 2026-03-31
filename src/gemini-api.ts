import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

const execFileAsync = promisify(execFile);

const GEMINI_MODEL = "gemini-3-flash-preview";
const SIZE_THRESHOLD = 20 * 1024 * 1024; // 20MB

const DEFAULT_PROMPT =
  "Describe this video in detail. Include: " +
  "1) A summary of the overall content, " +
  "2) Key visual elements and scenes with approximate timestamps, " +
  "3) Any on-screen text or graphics, " +
  "4) The mood/tone of the video, " +
  "5) Any notable audio elements (music, speech, sound effects).";

function isYouTubeUrl(input: string): boolean {
  return /(?:youtube\.com\/(?:watch|shorts)|youtu\.be\/)/.test(input);
}

function isLocalPath(input: string): boolean {
  return input.startsWith("/") || input.startsWith("./") || input.startsWith("~") || /^[A-Za-z]:[\\/]/.test(input);
}

function inferMimeFromExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const map: Record<string, string> = {
    mp4: "video/mp4", mpeg: "video/mpeg", mov: "video/mov", avi: "video/avi",
    webm: "video/webm", wmv: "video/wmv", flv: "video/x-flv", "3gpp": "video/3gpp",
    mpg: "video/mpg", mkv: "video/x-matroska",
  };
  return map[ext] || "video/mp4";
}

function inferMimeType(contentType?: string | null): string {
  if (contentType) {
    const mime = contentType.split(";")[0].trim();
    if (mime.startsWith("video/")) return mime;
  }
  return "video/mp4";
}

async function downloadVideo(url: string): Promise<{ filePath: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
  }

  const mimeType = inferMimeType(response.headers.get("content-type"));
  const ext = mimeType.split("/")[1] || "mp4";
  const filePath = path.join(os.tmpdir(), `socialclaw_dl_${Date.now()}.${ext}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return { filePath, mimeType };
}

async function optimizeVideoForGemini(filePath: string): Promise<{ optimizedPath: string; wasOptimized: boolean }> {
  const stats = fs.statSync(filePath);
  if (stats.size <= SIZE_THRESHOLD) {
    return { optimizedPath: filePath, wasOptimized: false };
  }

  const outputPath = path.join(os.tmpdir(), `socialclaw_opt_${Date.now()}.mp4`);

  await execFileAsync("ffmpeg", [
    "-i", filePath,
    "-vf", "scale=-2:480",
    "-c:v", "libx264",
    "-crf", "32",
    "-preset", "fast",
    "-b:a", "48k",
    "-ac", "1",
    "-movflags", "+faststart",
    "-y",
    outputPath,
  ]);

  return { optimizedPath: outputPath, wasOptimized: true };
}

function cleanupFiles(...paths: string[]) {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {}
  }
}

export interface DescribeVideoOptions {
  videoUrl: string;
  prompt?: string;
  autoOptimize?: boolean;
}

export interface DescribeVideoResult {
  description: string;
}

async function sendVideoToGemini(
  ai: GoogleGenAI,
  filePath: string,
  mimeType: string,
  prompt: string,
  autoOptimize: boolean,
): Promise<DescribeVideoResult> {
  const filesToClean: string[] = [];

  try {
    let finalPath = filePath;
    let finalMime = mimeType;

    if (autoOptimize) {
      const { optimizedPath, wasOptimized } = await optimizeVideoForGemini(filePath);
      if (wasOptimized) {
        filesToClean.push(optimizedPath);
        finalPath = optimizedPath;
        finalMime = "video/mp4";
      }
    }

    const stats = fs.statSync(finalPath);

    if (stats.size < SIZE_THRESHOLD) {
      const base64Data = fs.readFileSync(finalPath, { encoding: "base64" });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          { inlineData: { mimeType: finalMime, data: base64Data } },
          { text: prompt },
        ],
      });

      return { description: response.text ?? "" };
    }

    let uploadedFile = await ai.files.upload({
      file: new Blob([fs.readFileSync(finalPath)], { type: finalMime }),
      config: { mimeType: finalMime },
    });

    // Poll until the file is in ACTIVE state (Google needs time to process videos)
    while (uploadedFile.state === "PROCESSING") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      uploadedFile = await ai.files.get({ name: uploadedFile.name! });
    }

    if (uploadedFile.state === "FAILED") {
      throw new Error("Gemini file processing failed. The video may be corrupted or in an unsupported format.");
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri!, uploadedFile.mimeType!),
        prompt,
      ]),
    });

    return { description: response.text ?? "" };
  } finally {
    cleanupFiles(...filesToClean);
  }
}

// ==================== Image Description ====================

const DEFAULT_IMAGE_PROMPT =
  "Describe this image in detail. Include: " +
  "1) The main subject and composition, " +
  "2) Colors, lighting, and visual style, " +
  "3) Any text or graphics visible, " +
  "4) The mood/atmosphere, " +
  "5) Notable details in foreground and background.";

function inferImageMimeFromExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
    webp: "image/webp", bmp: "image/bmp", tiff: "image/tiff", tif: "image/tiff",
    svg: "image/svg+xml", ico: "image/x-icon", heic: "image/heic", heif: "image/heif",
    avif: "image/avif",
  };
  return map[ext] || "image/jpeg";
}

function inferImageMimeType(contentType?: string | null): string {
  if (contentType) {
    const mime = contentType.split(";")[0].trim();
    if (mime.startsWith("image/")) return mime;
  }
  return "image/jpeg";
}

async function downloadImage(url: string): Promise<{ filePath: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const mimeType = inferImageMimeType(response.headers.get("content-type"));
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const filePath = path.join(os.tmpdir(), `socialclaw_img_${Date.now()}.${ext}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return { filePath, mimeType };
}

export interface DescribeImageOptions {
  imageUrl: string;
  prompt?: string;
}

export interface DescribeImageResult {
  description: string;
}

export async function describeImage(options: DescribeImageOptions): Promise<DescribeImageResult> {
  const { imageUrl, prompt = DEFAULT_IMAGE_PROMPT } = options;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  if (isLocalPath(imageUrl)) {
    const resolvedPath = imageUrl.startsWith("~")
      ? path.join(os.homedir(), imageUrl.slice(1))
      : path.resolve(imageUrl);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Local image file not found: ${resolvedPath}`);
    }

    const mimeType = inferImageMimeFromExtension(resolvedPath);
    const base64Data = fs.readFileSync(resolvedPath, { encoding: "base64" });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { inlineData: { mimeType, data: base64Data } },
        { text: prompt },
      ],
    });

    return { description: response.text ?? "" };
  }

  const { filePath: downloadedPath, mimeType } = await downloadImage(imageUrl);
  try {
    const base64Data = fs.readFileSync(downloadedPath, { encoding: "base64" });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { inlineData: { mimeType, data: base64Data } },
        { text: prompt },
      ],
    });

    return { description: response.text ?? "" };
  } finally {
    cleanupFiles(downloadedPath);
  }
}

// ==================== Video Description ====================

export async function describeVideo(options: DescribeVideoOptions): Promise<DescribeVideoResult> {
  const { videoUrl, prompt = DEFAULT_PROMPT, autoOptimize = true } = options;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // YouTube URLs: pass directly, no download needed
  if (isYouTubeUrl(videoUrl)) {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { fileData: { fileUri: videoUrl } },
        { text: prompt },
      ],
    });
    return { description: response.text ?? "" };
  }

  // Local file path: read directly from disk
  if (isLocalPath(videoUrl)) {
    const resolvedPath = videoUrl.startsWith("~")
      ? path.join(os.homedir(), videoUrl.slice(1))
      : path.resolve(videoUrl);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Local video file not found: ${resolvedPath}`);
    }

    const mimeType = inferMimeFromExtension(resolvedPath);
    return sendVideoToGemini(ai, resolvedPath, mimeType, prompt, autoOptimize);
  }

  // Remote URL: download first, then process
  const { filePath: downloadedPath, mimeType } = await downloadVideo(videoUrl);
  try {
    return await sendVideoToGemini(ai, downloadedPath, mimeType, prompt, autoOptimize);
  } finally {
    cleanupFiles(downloadedPath);
  }
}
