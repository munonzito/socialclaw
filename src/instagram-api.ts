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

export async function getInstagramPosts(
  username?: string,
  limit: number = 20
): Promise<{ ig_user_id: string; posts: OrganicPost[] }> {
  const igUserId = await resolveIGUserId(username);

  const mediaFields =
    "id,media_type,media_url,thumbnail_url,timestamp,permalink,shortcode";

  const data = await igGet(`${igUserId}/media`, {
    fields: mediaFields,
    limit: String(limit),
  });

  if (!data?.data) {
    throw new Error("No media data returned from Instagram API");
  }

  const posts: OrganicPost[] = [];

  for (const media of data.data) {
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

  return { ig_user_id: igUserId, posts };
}
