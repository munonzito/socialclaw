import dotenv from "dotenv";
import path from "path";
import { readFileSync } from "fs";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

const BASE_URL = "https://api.pinterest.com/v5";
let ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN || "";
const REFRESH_TOKEN = process.env.PINTEREST_REFRESH_TOKEN || "";
const APP_ID = process.env.PINTEREST_APP_ID || "";
const APP_SECRET = process.env.PINTEREST_APP_SECRET || "";

let tokenExpiresAt = 0;

async function refreshAccessToken(): Promise<void> {
  if (!REFRESH_TOKEN || !APP_ID || !APP_SECRET) return;
  if (tokenExpiresAt > 0 && Date.now() < tokenExpiresAt - 60_000) return;

  const credentials = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString("base64");
  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
      continuous_refresh: "true",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`Pinterest token refresh failed (${res.status}): ${error}`);
    return;
  }

  const data = await res.json();
  ACCESS_TOKEN = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
}

async function pinterestGet(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<any> {
  await refreshAccessToken();
  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Pinterest API error (${res.status}): ${error}`);
  }
  return res.json();
}

async function pinterestPost(
  endpoint: string,
  data: Record<string, any>
): Promise<any> {
  await refreshAccessToken();
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Pinterest API error (${res.status}): ${error}`);
  }
  return res.json();
}

async function pinterestPatch(
  endpoint: string,
  data: Record<string, any>
): Promise<any> {
  await refreshAccessToken();
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Pinterest API error (${res.status}): ${error}`);
  }
  return res.json();
}

async function pinterestDelete(endpoint: string): Promise<any> {
  await refreshAccessToken();
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      Accept: "application/json",
    },
  });

  if (res.status === 204) return { success: true };
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Pinterest API error (${res.status}): ${error}`);
  }
  return res.json();
}

// ==================== Video Upload Helpers ====================

async function registerMediaUpload(): Promise<{
  media_id: string;
  upload_url: string;
  upload_parameters: Record<string, string>;
}> {
  return pinterestPost("media", { media_type: "video" });
}

async function uploadVideoToS3(
  uploadUrl: string,
  uploadParams: Record<string, string>,
  videoSource: string
): Promise<void> {
  let videoBuffer: Buffer;

  if (videoSource.startsWith("http://") || videoSource.startsWith("https://")) {
    const res = await fetch(videoSource);
    if (!res.ok) throw new Error(`Failed to download video: ${res.status}`);
    videoBuffer = Buffer.from(await res.arrayBuffer());
  } else {
    videoBuffer = readFileSync(videoSource);
  }

  const boundary = `----FormBoundary${Date.now()}`;
  const parts: Buffer[] = [];

  for (const [key, value] of Object.entries(uploadParams)) {
    if (key === "Content-Type") continue;
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
      )
    );
  }

  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="video.mp4"\r\nContent-Type: video/mp4\r\n\r\n`
    )
  );
  parts.push(videoBuffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`S3 upload error (${res.status}): ${error}`);
  }
}

async function waitForMediaReady(
  mediaId: string,
  maxAttempts = 30,
  intervalMs = 3000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await pinterestGet(`media/${mediaId}`);
    if (data.status === "succeeded") return;
    if (data.status === "failed") {
      throw new Error(`Media processing failed for media_id ${mediaId}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Media processing timed out for media_id ${mediaId}`);
}

// ==================== Exported Functions ====================

export async function getUserAccount(): Promise<any> {
  return pinterestGet("user_account");
}

export async function listBoards(
  pageSize?: number,
  bookmark?: string
): Promise<any> {
  const params: Record<string, string> = {};
  if (pageSize) params.page_size = String(pageSize);
  if (bookmark) params.bookmark = bookmark;
  return pinterestGet("boards", params);
}

export async function createBoard(
  name: string,
  description?: string,
  privacy?: string
): Promise<any> {
  const body: Record<string, any> = { name };
  if (description) body.description = description;
  if (privacy) body.privacy = privacy;
  return pinterestPost("boards", body);
}

export async function createPin(opts: {
  board_id: string;
  title?: string;
  description?: string;
  link?: string;
  alt_text?: string;
  board_section_id?: string;
  media_type: "image_url" | "image_base64" | "video_url";
  media_url?: string;
  media_base64?: string;
  media_content_type?: string;
}): Promise<any> {
  const body: Record<string, any> = { board_id: opts.board_id };
  if (opts.title) body.title = opts.title;
  if (opts.description) body.description = opts.description;
  if (opts.link) body.link = opts.link;
  if (opts.alt_text) body.alt_text = opts.alt_text;
  if (opts.board_section_id) body.board_section_id = opts.board_section_id;

  if (opts.media_type === "image_url") {
    if (!opts.media_url) throw new Error("media_url is required for image_url type");
    body.media_source = {
      source_type: "image_url",
      url: opts.media_url,
    };
  } else if (opts.media_type === "image_base64") {
    if (!opts.media_base64) throw new Error("media_base64 is required for image_base64 type");
    body.media_source = {
      source_type: "image_base64",
      content_type: opts.media_content_type || "image/jpeg",
      data: opts.media_base64,
    };
  } else if (opts.media_type === "video_url") {
    if (!opts.media_url) throw new Error("media_url is required for video_url type");
    const registration = await registerMediaUpload();
    await uploadVideoToS3(
      registration.upload_url,
      registration.upload_parameters,
      opts.media_url
    );
    await waitForMediaReady(registration.media_id);
    body.media_source = {
      source_type: "video_id",
      media_id: registration.media_id,
    };
  }

  return pinterestPost("pins", body);
}

export async function listPins(
  pageSize?: number,
  bookmark?: string,
  pinMetrics?: boolean
): Promise<any> {
  const params: Record<string, string> = {};
  if (pageSize) params.page_size = String(pageSize);
  if (bookmark) params.bookmark = bookmark;
  if (pinMetrics) params.pin_metrics = "true";
  return pinterestGet("pins", params);
}

export async function getPin(pinId: string): Promise<any> {
  return pinterestGet(`pins/${pinId}`);
}

export async function updatePin(
  pinId: string,
  updates: {
    title?: string;
    description?: string;
    link?: string;
    board_id?: string;
    board_section_id?: string;
    alt_text?: string;
  }
): Promise<any> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body.title = updates.title;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.link !== undefined) body.link = updates.link;
  if (updates.board_id !== undefined) body.board_id = updates.board_id;
  if (updates.board_section_id !== undefined) body.board_section_id = updates.board_section_id;
  if (updates.alt_text !== undefined) body.alt_text = updates.alt_text;
  return pinterestPatch(`pins/${pinId}`, body);
}

export async function deletePin(pinId: string): Promise<any> {
  return pinterestDelete(`pins/${pinId}`);
}

export async function getPinAnalytics(
  pinId: string,
  startDate: string,
  endDate: string,
  metricTypes: string[]
): Promise<any> {
  return pinterestGet(`pins/${pinId}/analytics`, {
    start_date: startDate,
    end_date: endDate,
    metric_types: metricTypes.join(","),
  });
}
