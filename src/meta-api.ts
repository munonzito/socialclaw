import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

const BASE_URL = "https://graph.facebook.com/v21.0";
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID!;

function accountId(): string {
  const id = AD_ACCOUNT_ID.startsWith("act_")
    ? AD_ACCOUNT_ID
    : `act_${AD_ACCOUNT_ID}`;
  return id;
}

async function metaGet(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("access_token", ACCESS_TOKEN);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Meta API error (${res.status}): ${error}`);
  }
  return res.json();
}

export async function getCampaigns(fields?: string): Promise<any> {
  const defaultFields =
    "id,name,status,objective,daily_budget,lifetime_budget,budget_remaining,start_time,stop_time,created_time,updated_time";
  return metaGet(`${accountId()}/campaigns`, {
    fields: fields || defaultFields,
    limit: "100",
  });
}

export async function getAdSets(campaignId?: string, fields?: string): Promise<any> {
  const defaultFields =
    "id,name,status,campaign_id,daily_budget,lifetime_budget,budget_remaining,targeting,optimization_goal,billing_event,bid_amount,start_time,end_time,created_time";
  const endpoint = campaignId
    ? `${campaignId}/adsets`
    : `${accountId()}/adsets`;
  return metaGet(endpoint, {
    fields: fields || defaultFields,
    limit: "100",
  });
}

export async function getAds(adSetId?: string, fields?: string): Promise<any> {
  const defaultFields =
    "id,name,status,adset_id,campaign_id,creative{id,name,title,body,image_url,thumbnail_url,link_url},created_time,updated_time";
  const endpoint = adSetId ? `${adSetId}/ads` : `${accountId()}/ads`;
  return metaGet(endpoint, {
    fields: fields || defaultFields,
    limit: "100",
  });
}

export async function getInsights(
  objectId?: string,
  datePreset?: string,
  timeRange?: { since: string; until: string },
  breakdowns?: string,
  fields?: string,
  level?: string
): Promise<any> {
  const defaultFields =
    "campaign_name,adset_name,ad_name,impressions,clicks,spend,cpc,cpm,ctr,actions,cost_per_action_type,conversions,conversion_values,reach,frequency";
  const endpoint = objectId
    ? `${objectId}/insights`
    : `${accountId()}/insights`;

  const params: Record<string, string> = {
    fields: fields || defaultFields,
    limit: "500",
  };

  if (datePreset) {
    params.date_preset = datePreset;
  } else if (timeRange) {
    params.time_range = JSON.stringify(timeRange);
  } else {
    params.date_preset = "last_30d";
  }

  if (breakdowns) {
    params.breakdowns = breakdowns;
  }

  if (level) {
    params.level = level;
  }

  return metaGet(endpoint, params);
}

export async function updateCampaignStatus(
  campaignId: string,
  status: "ACTIVE" | "PAUSED"
): Promise<any> {
  const url = new URL(`${BASE_URL}/${campaignId}`);
  url.searchParams.set("access_token", ACCESS_TOKEN);
  url.searchParams.set("status", status);

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Meta API error (${res.status}): ${error}`);
  }
  return res.json();
}

export async function updateAdSetBudget(
  adSetId: string,
  dailyBudget?: string,
  lifetimeBudget?: string
): Promise<any> {
  const url = new URL(`${BASE_URL}/${adSetId}`);
  url.searchParams.set("access_token", ACCESS_TOKEN);
  if (dailyBudget) url.searchParams.set("daily_budget", dailyBudget);
  if (lifetimeBudget) url.searchParams.set("lifetime_budget", lifetimeBudget);

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Meta API error (${res.status}): ${error}`);
  }
  return res.json();
}

export async function getAccountInfo(): Promise<any> {
  return metaGet(accountId(), {
    fields:
      "id,name,account_status,currency,timezone_name,amount_spent,balance,spend_cap",
  });
}

export async function updateAdSetStatus(
  adSetId: string,
  status: "ACTIVE" | "PAUSED"
): Promise<any> {
  const url = new URL(`${BASE_URL}/${adSetId}`);
  url.searchParams.set("access_token", ACCESS_TOKEN);
  url.searchParams.set("status", status);

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Meta API error (${res.status}): ${error}`);
  }
  return res.json();
}

export async function updateAdStatus(
  adId: string,
  status: "ACTIVE" | "PAUSED"
): Promise<any> {
  const url = new URL(`${BASE_URL}/${adId}`);
  url.searchParams.set("access_token", ACCESS_TOKEN);
  url.searchParams.set("status", status);

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Meta API error (${res.status}): ${error}`);
  }
  return res.json();
}

export async function updateCampaignBudget(
  campaignId: string,
  dailyBudget?: string,
  lifetimeBudget?: string
): Promise<any> {
  const url = new URL(`${BASE_URL}/${campaignId}`);
  url.searchParams.set("access_token", ACCESS_TOKEN);
  if (dailyBudget) url.searchParams.set("daily_budget", dailyBudget);
  if (lifetimeBudget) url.searchParams.set("lifetime_budget", lifetimeBudget);

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Meta API error (${res.status}): ${error}`);
  }
  return res.json();
}

export async function updateAdSetTargeting(
  adSetId: string,
  targeting: Record<string, any>
): Promise<any> {
  const url = new URL(`${BASE_URL}/${adSetId}`);
  url.searchParams.set("access_token", ACCESS_TOKEN);
  url.searchParams.set("targeting", JSON.stringify(targeting));

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Meta API error (${res.status}): ${error}`);
  }
  return res.json();
}

export interface BatchRequest {
  method: "GET" | "POST" | "DELETE";
  relative_url: string;
  body?: string;
}

export interface BatchResult {
  code: number;
  body: string;
  headers: Array<{ name: string; value: string }>;
}

export async function executeBatch(
  requests: BatchRequest[]
): Promise<BatchResult[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set("access_token", ACCESS_TOKEN);

  const formData = new URLSearchParams();
  formData.set("batch", JSON.stringify(requests));
  formData.set("access_token", ACCESS_TOKEN);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Meta Batch API error (${res.status}): ${error}`);
  }

  return res.json();
}

export async function batchUpdateAdStatuses(
  updates: Array<{ id: string; status: "ACTIVE" | "PAUSED" }>
): Promise<BatchResult[]> {
  const allResults: BatchResult[] = [];

  for (let i = 0; i < updates.length; i += 50) {
    const chunk = updates.slice(i, i + 50);
    const requests: BatchRequest[] = chunk.map((u) => ({
      method: "POST" as const,
      relative_url: u.id,
      body: `status=${u.status}`,
    }));
    const results = await executeBatch(requests);
    allResults.push(...results);
  }

  return allResults;
}

export async function batchUpdateAdSetStatuses(
  updates: Array<{ id: string; status: "ACTIVE" | "PAUSED" }>
): Promise<BatchResult[]> {
  const allResults: BatchResult[] = [];

  for (let i = 0; i < updates.length; i += 50) {
    const chunk = updates.slice(i, i + 50);
    const requests: BatchRequest[] = chunk.map((u) => ({
      method: "POST" as const,
      relative_url: u.id,
      body: `status=${u.status}`,
    }));
    const results = await executeBatch(requests);
    allResults.push(...results);
  }

  return allResults;
}
