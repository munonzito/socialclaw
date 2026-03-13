import dotenv from "dotenv";
import path from "path";
import Replicate from "replicate";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODEL_VERSION =
  "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c";

export interface TranscriptionChunk {
  text: string;
  timestamp: [number, number];
}

export interface TranscriptionResult {
  text: string;
  chunks: TranscriptionChunk[];
}

export async function transcribeVideo(
  videoUrl: string,
  language: string = "None"
): Promise<TranscriptionResult> {
  const output = (await replicate.run(MODEL_VERSION, {
    input: {
      audio: videoUrl,
      task: "transcribe",
      language,
      batch_size: 64,
      timestamp: "chunk",
      diarise_audio: false,
    },
  })) as TranscriptionResult;

  return {
    text: output.text,
    chunks: output.chunks,
  };
}

const MAX_CONCURRENCY = 10;

async function withConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let index = 0;

  async function runNext(): Promise<void> {
    while (index < tasks.length) {
      const i = index++;
      try {
        const value = await tasks[i]();
        results[i] = { status: "fulfilled", value };
      } catch (reason: any) {
        results[i] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => runNext()
  );
  await Promise.all(workers);
  return results;
}

export interface VideoInput {
  url: string;
  language?: string;
}

export interface BatchTranscriptionEntry {
  url: string;
  status: "success" | "error";
  result?: TranscriptionResult;
  error?: string;
}

export interface BatchTranscriptionResponse {
  summary: { total: number; succeeded: number; failed: number };
  results: BatchTranscriptionEntry[];
}

export async function batchTranscribeVideos(
  videos: VideoInput[],
  defaultLanguage: string = "None"
): Promise<BatchTranscriptionResponse> {
  const tasks = videos.map(
    (video) => () => transcribeVideo(video.url, video.language ?? defaultLanguage)
  );

  const settled = await withConcurrencyLimit(tasks, MAX_CONCURRENCY);

  const results: BatchTranscriptionEntry[] = settled.map((entry, i) => {
    if (entry.status === "fulfilled") {
      return { url: videos[i].url, status: "success" as const, result: entry.value };
    }
    const reason = entry.reason;
    const errorMsg =
      reason instanceof Error ? reason.message : String(reason);
    return { url: videos[i].url, status: "error" as const, error: errorMsg };
  });

  const succeeded = results.filter((r) => r.status === "success").length;

  return {
    summary: { total: videos.length, succeeded, failed: videos.length - succeeded },
    results,
  };
}
