import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

const BASE_URL = "https://business-api.tiktok.com/open_api/v1.3";
const ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN!;
const ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID!;

async function tiktokGet(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<any> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("advertiser_id", ADVERTISER_ID);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: { "Access-Token": ACCESS_TOKEN },
  });

  const body = await res.json();
  if (body.code !== 0) {
    throw new Error(
      `TikTok API error (${body.code}): ${body.message}`
    );
  }
  return body.data;
}

async function tiktokPost(
  endpoint: string,
  data: Record<string, any>
): Promise<any> {
  const url = new URL(`${BASE_URL}${endpoint}`);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Access-Token": ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ advertiser_id: ADVERTISER_ID, ...data }),
  });

  const body = await res.json();
  if (body.code !== 0) {
    throw new Error(
      `TikTok API error (${body.code}): ${body.message}`
    );
  }
  return body.data;
}

export async function getAdvertiserInfo(): Promise<any> {
  const url = new URL(`${BASE_URL}/advertiser/info/`);
  url.searchParams.set("advertiser_ids", JSON.stringify([ADVERTISER_ID]));
  url.searchParams.set(
    "fields",
    JSON.stringify([
      "advertiser_id",
      "name",
      "status",
      "currency",
      "timezone",
      "balance",
      "country",
      "company",
      "create_time",
    ])
  );

  const res = await fetch(url.toString(), {
    headers: { "Access-Token": ACCESS_TOKEN },
  });

  const body = await res.json();
  if (body.code !== 0) {
    throw new Error(
      `TikTok API error (${body.code}): ${body.message}`
    );
  }
  return body.data;
}

export async function getCampaigns(filtering?: string): Promise<any> {
  const params: Record<string, string> = {
    page_size: "100",
  };
  if (filtering) {
    params.filtering = filtering;
  }
  return tiktokGet("/campaign/get/", params);
}

export async function getAdGroups(filtering?: string): Promise<any> {
  const params: Record<string, string> = {
    page_size: "100",
  };
  if (filtering) {
    params.filtering = filtering;
  }
  return tiktokGet("/adgroup/get/", params);
}

export async function getAds(filtering?: string): Promise<any> {
  const params: Record<string, string> = {
    page_size: "100",
  };
  if (filtering) {
    params.filtering = filtering;
  }
  return tiktokGet("/ad/get/", params);
}

export async function getReport(
  reportType: string,
  dataLevel: string,
  startDate: string,
  endDate: string,
  dimensions?: string,
  metrics?: string,
  filters?: string
): Promise<any> {
  const defaultMetrics = JSON.stringify([
    "spend",
    "impressions",
    "clicks",
    "cpc",
    "cpm",
    "ctr",
    "reach",
    "conversion",
    "cost_per_conversion",
  ]);

  const defaultDimensions: Record<string, string[]> = {
    AUCTION_CAMPAIGN: ["campaign_id"],
    AUCTION_ADGROUP: ["adgroup_id"],
    AUCTION_AD: ["ad_id"],
  };

  const params: Record<string, string> = {
    report_type: reportType || "BASIC",
    data_level: dataLevel,
    start_date: startDate,
    end_date: endDate,
    dimensions: dimensions || JSON.stringify(defaultDimensions[dataLevel] || ["campaign_id"]),
    metrics: metrics || defaultMetrics,
    page_size: "200",
  };

  if (filters) {
    params.filtering = filters;
  }

  return tiktokGet("/report/integrated/get/", params);
}

export async function updateCampaignStatus(
  campaignIds: string[],
  optStatus: "ENABLE" | "DISABLE"
): Promise<any> {
  return tiktokPost("/campaign/status/update/", {
    campaign_ids: campaignIds,
    operation_status: optStatus,
  });
}

export async function updateCampaignBudget(
  campaignId: string,
  budget: number,
  budgetMode?: string
): Promise<any> {
  const data: Record<string, any> = {
    campaign_id: campaignId,
    budget: budget,
  };
  if (budgetMode) {
    data.budget_mode = budgetMode;
  }
  return tiktokPost("/campaign/update/", data);
}

export async function updateAdGroupStatus(
  adgroupIds: string[],
  optStatus: "ENABLE" | "DISABLE"
): Promise<any> {
  return tiktokPost("/adgroup/status/update/", {
    adgroup_ids: adgroupIds,
    operation_status: optStatus,
  });
}

export async function updateAdGroupBudget(
  adgroupIds: string[],
  budget: number
): Promise<any> {
  const budgetList = adgroupIds.map((id) => ({
    adgroup_id: id,
    budget: budget,
  }));
  return tiktokPost("/adgroup/budget/update/", {
    budget_list: budgetList,
  });
}

export async function updateAdStatus(
  adIds: string[],
  optStatus: "ENABLE" | "DISABLE"
): Promise<any> {
  return tiktokPost("/ad/status/update/", {
    ad_ids: adIds,
    operation_status: optStatus,
  });
}

export async function updateAdGroupTargeting(
  adgroupId: string,
  targeting: Record<string, any>
): Promise<any> {
  return tiktokPost("/adgroup/update/", {
    adgroup_id: adgroupId,
    ...targeting,
  });
}
