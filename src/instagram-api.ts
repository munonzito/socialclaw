import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

const BASE_URL = "https://graph.facebook.com/v25.0";
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;

async function igGet(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<any> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("access_token", ACCESS_TOKEN);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Instagram API error (${res.status}): ${error}`);
  }
  return res.json();
}

interface IGAccount {
  ig_user_id: string;
  ig_username: string;
  page_id: string;
  page_name: string;
}

async function discoverIGAccounts(): Promise<IGAccount[]> {
  const pagesData = await igGet("me/accounts", {
    fields: "id,name,instagram_business_account",
    limit: "100",
  });

  if (!pagesData?.data) return [];

  const accounts: IGAccount[] = [];
  for (const page of pagesData.data) {
    if (page.instagram_business_account?.id) {
      let username = "";
      try {
        const igUser = await igGet(page.instagram_business_account.id, {
          fields: "username",
        });
        username = igUser.username || "";
      } catch {}

      accounts.push({
        ig_user_id: page.instagram_business_account.id,
        ig_username: username,
        page_id: page.id,
        page_name: page.name,
      });
    }
  }

  return accounts;
}

async function resolveIGUserId(username?: string): Promise<string> {
  const accounts = await discoverIGAccounts();

  if (accounts.length === 0) {
    throw new Error(
      "No Instagram Business Accounts found linked to your Facebook Pages"
    );
  }

  if (!username) {
    return accounts[0].ig_user_id;
  }

  const match = accounts.find(
    (a) => a.ig_username.toLowerCase() === username.toLowerCase()
  );
  if (!match) {
    const available = accounts.map((a) => a.ig_username).join(", ");
    throw new Error(
      `Instagram account "${username}" not found. Available: ${available}`
    );
  }
  return match.ig_user_id;
}

async function getViewCount(mediaId: string): Promise<number | null> {
  try {
    const data = await igGet(`${mediaId}/insights`, { metric: "views" });
    const viewsMetric = data?.data?.find((m: any) => m.name === "views");
    return viewsMetric?.values?.[0]?.value ?? null;
  } catch {
    return null;
  }
}

export interface OrganicPost {
  id: string;
  shortcode: string;
  post_url: string;
  date: string;
  media_type: string;
  views: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
}

export async function getInstagramAccounts(): Promise<IGAccount[]> {
  return discoverIGAccounts();
}

export interface GetPostsOptions {
  username?: string;
  limit?: number;
  max_fetch?: number;
  sort_by?: "date" | "views";
  sort_order?: "desc" | "asc";
  since?: string;
  until?: string;
  media_type?: "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM" | "all";
}

export async function getInstagramPosts(
  options: GetPostsOptions = {}
): Promise<{ ig_user_id: string; posts: OrganicPost[]; total_fetched: number }> {
  const {
    username,
    limit = 20,
    max_fetch = 50,
    sort_by = "date",
    sort_order = "desc",
    since,
    until,
    media_type = "all",
  } = options;

  const igUserId = await resolveIGUserId(username);

  const mediaFields =
    "id,media_type,media_url,thumbnail_url,timestamp,permalink,shortcode";

  const allMedia: any[] = [];
  let nextUrl: string | null = null;
  const pageSize = Math.min(max_fetch, 50);

  const firstPage = await igGet(`${igUserId}/media`, {
    fields: mediaFields,
    limit: String(pageSize),
  });

  if (!firstPage?.data) {
    throw new Error("No media data returned from Instagram API");
  }

  allMedia.push(...firstPage.data);
  nextUrl = firstPage.paging?.next ?? null;

  while (nextUrl && allMedia.length < max_fetch) {
    const res = await fetch(nextUrl);
    if (!res.ok) break;
    const page = await res.json();
    if (!page?.data?.length) break;
    allMedia.push(...page.data);
    nextUrl = page.paging?.next ?? null;
  }

  const fetched = allMedia.slice(0, max_fetch);

  const sinceDate = since ? new Date(since) : null;
  const untilDate = until ? new Date(until) : null;

  const filtered = fetched.filter((media: any) => {
    if (media_type !== "all" && media.media_type !== media_type) return false;
    if (sinceDate || untilDate) {
      const postDate = new Date(media.timestamp);
      if (sinceDate && postDate < sinceDate) return false;
      if (untilDate && postDate > untilDate) return false;
    }
    return true;
  });

  const posts: OrganicPost[] = [];
  for (const media of filtered) {
    const views = await getViewCount(media.id);
    posts.push({
      id: media.id,
      shortcode: media.shortcode,
      post_url: media.permalink,
      date: media.timestamp,
      media_type: media.media_type,
      views,
      video_url:
        media.media_type === "VIDEO" ? (media.media_url ?? null) : null,
      thumbnail_url: media.thumbnail_url ?? null,
    });
  }

  posts.sort((a, b) => {
    let cmp: number;
    if (sort_by === "views") {
      cmp = (a.views ?? 0) - (b.views ?? 0);
    } else {
      cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return sort_order === "desc" ? -cmp : cmp;
  });

  return {
    ig_user_id: igUserId,
    posts: posts.slice(0, limit),
    total_fetched: fetched.length,
  };
}
