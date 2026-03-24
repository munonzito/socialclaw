import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  getCampaigns,
  getAdSets,
  getAds,
  getInsights,
  updateCampaignStatus,
  updateAdSetBudget,
  getAccountInfo,
  updateAdSetStatus,
  updateAdStatus,
  updateCampaignBudget,
  updateAdSetTargeting,
  batchUpdateAdStatuses,
  batchUpdateAdSetStatuses,
  executeBatch,
} from "./meta-api.js";
import { getInstagramPosts, getInstagramAccounts } from "./instagram-api.js";
import {
  getUserAccount as pinterestGetUserAccount,
  listBoards as pinterestListBoards,
  createBoard as pinterestCreateBoard,
  createPin as pinterestCreatePin,
  listPins as pinterestListPins,
  getPin as pinterestGetPin,
  updatePin as pinterestUpdatePin,
  deletePin as pinterestDeletePin,
  getPinAnalytics as pinterestGetPinAnalytics,
} from "./pinterest-api.js";
import { transcribeVideo, batchTranscribeVideos } from "./transcribe-api.js";
import { generateImage } from "./image-api.js";
import {
  getAdvertiserInfo as tiktokGetAdvertiserInfo,
  getCampaigns as tiktokGetCampaigns,
  getAdGroups as tiktokGetAdGroups,
  getAds as tiktokGetAds,
  getReport as tiktokGetReport,
  updateCampaignStatus as tiktokUpdateCampaignStatus,
  updateCampaignBudget as tiktokUpdateCampaignBudget,
  updateAdGroupStatus as tiktokUpdateAdGroupStatus,
  updateAdGroupBudget as tiktokUpdateAdGroupBudget,
  updateAdStatus as tiktokUpdateAdStatus,
  updateAdGroupTargeting as tiktokUpdateAdGroupTargeting,
} from "./tiktok-api.js";

const server = new McpServer({
  name: "socialclaw",
  version: "1.0.0",
});

server.tool(
  "get_account_info",
  "Get Meta ad account information including status, currency, timezone, and spend",
  {},
  async () => {
    try {
      const data = await getAccountInfo();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "get_campaigns",
  "List all campaigns in the Meta ad account with their status, budget, and objective",
  {
    fields: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of fields to return. Default: id,name,status,objective,daily_budget,lifetime_budget,budget_remaining,start_time,stop_time"
      ),
  },
  async ({ fields }) => {
    try {
      const data = await getCampaigns(fields);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "get_adsets",
  "List ad sets, optionally filtered by campaign ID. Shows targeting, budget, and optimization settings",
  {
    campaign_id: z.string().optional().describe("Filter ad sets by campaign ID"),
    fields: z.string().optional().describe("Comma-separated list of fields to return"),
  },
  async ({ campaign_id, fields }) => {
    try {
      const data = await getAdSets(campaign_id, fields);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "get_ads",
  "List ads, optionally filtered by ad set ID. Shows creative details and status",
  {
    adset_id: z.string().optional().describe("Filter ads by ad set ID"),
    fields: z.string().optional().describe("Comma-separated list of fields to return"),
  },
  async ({ adset_id, fields }) => {
    try {
      const data = await getAds(adset_id, fields);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "get_insights",
  "Get performance metrics (impressions, clicks, spend, CPC, CTR, conversions, etc.) for campaigns, ad sets, or ads",
  {
    object_id: z
      .string()
      .optional()
      .describe("Campaign, ad set, or ad ID. If omitted, returns account-level insights"),
    date_preset: z
      .string()
      .optional()
      .describe(
        "Date preset: today, yesterday, this_month, last_month, this_quarter, last_3d, last_7d, last_14d, last_28d, last_30d, last_90d, last_year"
      ),
    since: z.string().optional().describe("Start date (YYYY-MM-DD). Use with 'until'"),
    until: z.string().optional().describe("End date (YYYY-MM-DD). Use with 'since'"),
    breakdowns: z
      .string()
      .optional()
      .describe(
        "Comma-separated breakdowns: age, gender, country, region, publisher_platform, platform_position, device_platform, impression_device"
      ),
    fields: z.string().optional().describe("Comma-separated metric fields to return"),
    level: z
      .string()
      .optional()
      .describe("Aggregation level: account, campaign, adset, ad"),
  },
  async ({ object_id, date_preset, since, until, breakdowns, fields, level }) => {
    try {
      const timeRange = since && until ? { since, until } : undefined;
      const data = await getInsights(
        object_id,
        date_preset,
        timeRange,
        breakdowns,
        fields,
        level
      );
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "update_campaign_status",
  "Pause or activate a campaign",
  {
    campaign_id: z.string().describe("The campaign ID to update"),
    status: z.enum(["ACTIVE", "PAUSED"]).describe("New status: ACTIVE or PAUSED"),
  },
  async ({ campaign_id, status }) => {
    try {
      const data = await updateCampaignStatus(campaign_id, status);
      return {
        content: [
          {
            type: "text",
            text: `Campaign ${campaign_id} status updated to ${status}. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "update_adset_budget",
  "Update the daily or lifetime budget of an ad set. Budget values are in cents (e.g., 5000 = $50.00)",
  {
    adset_id: z.string().describe("The ad set ID to update"),
    daily_budget: z
      .string()
      .optional()
      .describe("New daily budget in cents (e.g., '5000' for $50.00)"),
    lifetime_budget: z
      .string()
      .optional()
      .describe("New lifetime budget in cents (e.g., '100000' for $1000.00)"),
  },
  async ({ adset_id, daily_budget, lifetime_budget }) => {
    try {
      const data = await updateAdSetBudget(adset_id, daily_budget, lifetime_budget);
      return {
        content: [
          {
            type: "text",
            text: `Ad set ${adset_id} budget updated. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "update_adset_status",
  "Pause or activate an ad set",
  {
    adset_id: z.string().describe("The ad set ID to update"),
    status: z.enum(["ACTIVE", "PAUSED"]).describe("New status: ACTIVE or PAUSED"),
  },
  async ({ adset_id, status }) => {
    try {
      const data = await updateAdSetStatus(adset_id, status);
      return {
        content: [
          {
            type: "text",
            text: `Ad set ${adset_id} status updated to ${status}. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "update_ad_status",
  "Pause or activate an individual ad",
  {
    ad_id: z.string().describe("The ad ID to update"),
    status: z.enum(["ACTIVE", "PAUSED"]).describe("New status: ACTIVE or PAUSED"),
  },
  async ({ ad_id, status }) => {
    try {
      const data = await updateAdStatus(ad_id, status);
      return {
        content: [
          {
            type: "text",
            text: `Ad ${ad_id} status updated to ${status}. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "update_campaign_budget",
  "Update the daily or lifetime budget of a campaign (CBO). Budget values in the smallest currency unit.",
  {
    campaign_id: z.string().describe("The campaign ID to update"),
    daily_budget: z.string().optional().describe("New daily budget"),
    lifetime_budget: z.string().optional().describe("New lifetime budget"),
  },
  async ({ campaign_id, daily_budget, lifetime_budget }) => {
    try {
      const data = await updateCampaignBudget(campaign_id, daily_budget, lifetime_budget);
      return {
        content: [
          {
            type: "text",
            text: `Campaign ${campaign_id} budget updated. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "update_adset_targeting",
  "Update targeting for an ad set (age, gender, geo, etc.)",
  {
    adset_id: z.string().describe("The ad set ID to update"),
    targeting_json: z.string().describe("JSON string of the targeting object"),
  },
  async ({ adset_id, targeting_json }) => {
    try {
      const targeting = JSON.parse(targeting_json);
      const data = await updateAdSetTargeting(adset_id, targeting);
      return {
        content: [
          {
            type: "text",
            text: `Ad set ${adset_id} targeting updated. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "batch_update_ad_statuses",
  "Batch update statuses for multiple ads in a single API call (up to 50 per batch). Much more efficient than individual calls.",
  {
    updates: z
      .string()
      .describe(
        'JSON array of objects with "id" and "status" fields. Example: [{"id":"123","status":"PAUSED"},{"id":"456","status":"ACTIVE"}]'
      ),
  },
  async ({ updates }) => {
    try {
      const parsed = JSON.parse(updates);
      const results = await batchUpdateAdStatuses(parsed);
      const summary = results.map((r, i) => {
        const body = JSON.parse(r.body);
        return {
          id: parsed[i].id,
          status: parsed[i].status,
          success: r.code === 200 && body?.success === true,
          code: r.code,
          error: r.code !== 200 ? body?.error?.message : undefined,
        };
      });
      const succeeded = summary.filter((s) => s.success).length;
      const failed = summary.filter((s) => !s.success).length;
      return {
        content: [
          {
            type: "text",
            text: `Batch complete: ${succeeded} succeeded, ${failed} failed.\n${JSON.stringify(summary, null, 2)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "batch_update_adset_statuses",
  "Batch update statuses for multiple ad sets in a single API call (up to 50 per batch).",
  {
    updates: z
      .string()
      .describe(
        'JSON array of objects with "id" and "status" fields. Example: [{"id":"123","status":"PAUSED"},{"id":"456","status":"ACTIVE"}]'
      ),
  },
  async ({ updates }) => {
    try {
      const parsed = JSON.parse(updates);
      const results = await batchUpdateAdSetStatuses(parsed);
      const summary = results.map((r, i) => {
        const body = JSON.parse(r.body);
        return {
          id: parsed[i].id,
          status: parsed[i].status,
          success: r.code === 200 && body?.success === true,
          code: r.code,
          error: r.code !== 200 ? body?.error?.message : undefined,
        };
      });
      const succeeded = summary.filter((s) => s.success).length;
      const failed = summary.filter((s) => !s.success).length;
      return {
        content: [
          {
            type: "text",
            text: `Batch complete: ${succeeded} succeeded, ${failed} failed.\n${JSON.stringify(summary, null, 2)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "batch_request",
  "Execute arbitrary batch requests against the Meta API (up to 50 per call). Each request has method, relative_url, and optional body.",
  {
    requests: z
      .string()
      .describe(
        'JSON array of batch requests. Example: [{"method":"GET","relative_url":"act_123/campaigns?fields=id,name"}]'
      ),
  },
  async ({ requests }) => {
    try {
      const parsed = JSON.parse(requests);
      const results = await executeBatch(parsed);
      const summary = results.map((r, i) => ({
        request: parsed[i].relative_url,
        code: r.code,
        body: JSON.parse(r.body),
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// ==================== Instagram Organic Tools ====================

server.tool(
  "get_instagram_posts",
  "Get recent organic posts from a public Instagram profile with view counts (for videos/reels), video URLs, and post dates. No authentication required.",
  {
    username: z
      .string()
      .optional()
      .describe("Instagram username/handle to fetch posts from. If omitted, uses the first available account."),
    limit: z
      .number()
      .optional()
      .describe("Number of posts to fetch (default: 20, max depends on profile)"),
  },
  async ({ username, limit }) => {
    try {
      const data = await getInstagramPosts(username, limit);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "get_instagram_accounts",
  "List all Instagram Business/Creator accounts linked to Facebook Pages accessible by the current Meta token. Returns IG user IDs, usernames, and linked Page info.",
  {},
  async () => {
    try {
      const data = await getInstagramAccounts();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "transcribe_video",
  "Transcribe a video's audio to text using Whisper (via Replicate). Returns the full transcript and timestamped chunks. Works with any public video URL.",
  {
    video_url: z.string().describe("Public URL of the video to transcribe"),
    language: z
      .string()
      .optional()
      .describe(
        "Language spoken in the video (e.g. 'english', 'spanish'). Default: 'None' for auto-detection"
      ),
  },
  async ({ video_url, language }) => {
    try {
      const data = await transcribeVideo(video_url, language);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "batch_transcribe_videos",
  "Transcribe multiple videos in parallel using Whisper (via Replicate). Accepts an array of video URLs and returns all transcriptions at once. Up to 10 concurrent transcriptions.",
  {
    video_urls: z
      .string()
      .describe(
        'JSON array of video objects. Example: [{"url":"https://..."},{"url":"https://...","language":"spanish"}]'
      ),
    language: z
      .string()
      .optional()
      .describe(
        "Default language for all videos (individual per-video language overrides this). Default: 'None' for auto-detection"
      ),
  },
  async ({ video_urls, language }) => {
    try {
      const videos = JSON.parse(video_urls);
      if (!Array.isArray(videos) || videos.length === 0) {
        return {
          content: [{ type: "text", text: "Error: video_urls must be a non-empty JSON array" }],
          isError: true,
        };
      }
      const data = await batchTranscribeVideos(videos, language);
      return {
        content: [
          {
            type: "text",
            text: `Batch transcription complete: ${data.summary.succeeded} succeeded, ${data.summary.failed} failed out of ${data.summary.total}.\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// ==================== AI Image Generation Tools ====================

server.tool(
  "generate_image",
  "Generate AI images from text prompts using Azure OpenAI GPT Image model. Returns generated image(s) as base64 and saves to temp files.",
  {
    prompt: z.string().describe("Text prompt describing the image to generate"),
    size: z
      .enum(["1024x1024", "1024x1536", "1536x1024"])
      .optional()
      .describe("Image size. Default: 1024x1024"),
    quality: z
      .enum(["low", "medium", "high"])
      .optional()
      .describe("Image quality. Default: high"),
    n: z
      .number()
      .optional()
      .describe("Number of images to generate (1-10). Default: 1"),
    output_format: z
      .enum(["png", "jpeg", "webp"])
      .optional()
      .describe("Output image format. Default: png"),
    output_compression: z
      .number()
      .optional()
      .describe("Compression level 0-100. Default: 100 (no compression)"),
    background: z
      .enum(["opaque", "transparent"])
      .optional()
      .describe("Background type. Transparent only works with png/webp. Default: opaque"),
    output_directory: z
      .string()
      .optional()
      .describe("Directory path where generated images will be saved. Default: system temp directory"),
  },
  async ({ prompt, size, quality, n, output_format, output_compression, background, output_directory }) => {
    try {
      const result = await generateImage({
        prompt,
        size,
        quality,
        n,
        output_format,
        output_compression,
        background,
        output_directory,
      });

      const content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }> = [];

      const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" } as const;
      const mime = mimeMap[output_format ?? "png"];

      const filePaths = result.images.map((img) => img.file_path);
      content.push({
        type: "text",
        text: `Generated ${result.images.length} image(s). Saved to:\n${filePaths.join("\n")}`,
      });

      for (const img of result.images) {
        content.push({
          type: "image",
          data: img.b64_json,
          mimeType: mime,
        });
      }

      return { content };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// ==================== TikTok Ads Tools ====================

server.tool(
  "tiktok_get_advertiser_info",
  "Get TikTok ad account information including name, status, currency, timezone, and balance",
  {},
  async () => {
    try {
      const data = await tiktokGetAdvertiserInfo();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_get_campaigns",
  "List all campaigns in the TikTok ad account with their status, budget, and objective",
  {
    filtering: z
      .string()
      .optional()
      .describe(
        'JSON object for filtering. Example: {"campaign_ids":["123"],"status":"CAMPAIGN_STATUS_ENABLE","objective_type":"TRAFFIC"}'
      ),
  },
  async ({ filtering }) => {
    try {
      const data = await tiktokGetCampaigns(filtering);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_get_adgroups",
  "List ad groups in the TikTok ad account, optionally filtered by campaign IDs or status",
  {
    filtering: z
      .string()
      .optional()
      .describe(
        'JSON object for filtering. Example: {"campaign_ids":["123"],"adgroup_ids":["456"],"status":"ADGROUP_STATUS_ENABLE"}'
      ),
  },
  async ({ filtering }) => {
    try {
      const data = await tiktokGetAdGroups(filtering);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_get_ads",
  "List ads in the TikTok ad account, optionally filtered by ad group IDs, campaign IDs, or status",
  {
    filtering: z
      .string()
      .optional()
      .describe(
        'JSON object for filtering. Example: {"adgroup_ids":["123"],"campaign_ids":["456"],"ad_ids":["789"]}'
      ),
  },
  async ({ filtering }) => {
    try {
      const data = await tiktokGetAds(filtering);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_get_report",
  "Get performance metrics (impressions, clicks, spend, CPC, CTR, conversions) for TikTok campaigns, ad groups, or ads",
  {
    data_level: z
      .enum(["AUCTION_CAMPAIGN", "AUCTION_ADGROUP", "AUCTION_AD"])
      .describe("Data level for the report"),
    start_date: z.string().describe("Start date (YYYY-MM-DD)"),
    end_date: z.string().describe("End date (YYYY-MM-DD)"),
    report_type: z
      .enum(["BASIC", "AUDIENCE"])
      .optional()
      .describe("Report type. Default: BASIC"),
    dimensions: z
      .string()
      .optional()
      .describe('JSON array of dimensions. Example: ["campaign_id","stat_time_day"]'),
    metrics: z
      .string()
      .optional()
      .describe(
        'JSON array of metrics. Example: ["spend","impressions","clicks","cpc","ctr"]. Default includes spend, impressions, clicks, cpc, cpm, ctr, reach, conversion, cost_per_conversion'
      ),
    filters: z
      .string()
      .optional()
      .describe(
        'JSON array of filter objects. Example: [{"field_name":"campaign_ids","filter_type":"IN","filter_value":"[\\"123\\"]"}]'
      ),
  },
  async ({ data_level, start_date, end_date, report_type, dimensions, metrics, filters }) => {
    try {
      const data = await tiktokGetReport(
        report_type || "BASIC",
        data_level,
        start_date,
        end_date,
        dimensions,
        metrics,
        filters
      );
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_update_campaign_status",
  "Enable or disable one or more TikTok campaigns",
  {
    campaign_ids: z
      .string()
      .describe('Comma-separated campaign IDs. Example: "123,456"'),
    status: z.enum(["ENABLE", "DISABLE"]).describe("New status: ENABLE or DISABLE"),
  },
  async ({ campaign_ids, status }) => {
    try {
      const ids = campaign_ids.split(",").map((id) => id.trim());
      const data = await tiktokUpdateCampaignStatus(ids, status);
      return {
        content: [
          {
            type: "text",
            text: `Campaign(s) ${campaign_ids} status updated to ${status}. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_update_campaign_budget",
  "Update the budget of a TikTok campaign. Budget values are in actual currency units (e.g., 50.00 = $50)",
  {
    campaign_id: z.string().describe("The campaign ID to update"),
    budget: z.number().describe("New budget in currency units (e.g., 50.00 for $50)"),
    budget_mode: z
      .enum(["BUDGET_MODE_DAY", "BUDGET_MODE_TOTAL", "BUDGET_MODE_DYNAMIC_DAILY_BUDGET"])
      .optional()
      .describe("Budget mode: BUDGET_MODE_DAY, BUDGET_MODE_TOTAL, or BUDGET_MODE_DYNAMIC_DAILY_BUDGET"),
  },
  async ({ campaign_id, budget, budget_mode }) => {
    try {
      const data = await tiktokUpdateCampaignBudget(campaign_id, budget, budget_mode);
      return {
        content: [
          {
            type: "text",
            text: `Campaign ${campaign_id} budget updated to ${budget}. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_update_adgroup_status",
  "Enable or disable one or more TikTok ad groups",
  {
    adgroup_ids: z
      .string()
      .describe('Comma-separated ad group IDs. Example: "123,456"'),
    status: z.enum(["ENABLE", "DISABLE"]).describe("New status: ENABLE or DISABLE"),
  },
  async ({ adgroup_ids, status }) => {
    try {
      const ids = adgroup_ids.split(",").map((id) => id.trim());
      const data = await tiktokUpdateAdGroupStatus(ids, status);
      return {
        content: [
          {
            type: "text",
            text: `Ad group(s) ${adgroup_ids} status updated to ${status}. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_update_adgroup_budget",
  "Update the budget for one or more TikTok ad groups. Budget values are in actual currency units",
  {
    adgroup_ids: z
      .string()
      .describe('Comma-separated ad group IDs. Example: "123,456"'),
    budget: z.number().describe("New budget in currency units (e.g., 50.00 for $50)"),
  },
  async ({ adgroup_ids, budget }) => {
    try {
      const ids = adgroup_ids.split(",").map((id) => id.trim());
      const data = await tiktokUpdateAdGroupBudget(ids, budget);
      return {
        content: [
          {
            type: "text",
            text: `Ad group(s) ${adgroup_ids} budget updated to ${budget}. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_update_ad_status",
  "Enable or disable one or more TikTok ads",
  {
    ad_ids: z.string().describe('Comma-separated ad IDs. Example: "123,456"'),
    status: z.enum(["ENABLE", "DISABLE"]).describe("New status: ENABLE or DISABLE"),
  },
  async ({ ad_ids, status }) => {
    try {
      const ids = ad_ids.split(",").map((id) => id.trim());
      const data = await tiktokUpdateAdStatus(ids, status);
      return {
        content: [
          {
            type: "text",
            text: `Ad(s) ${ad_ids} status updated to ${status}. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "tiktok_update_adgroup_targeting",
  "Update targeting for a TikTok ad group (location, age, gender, interests, etc.)",
  {
    adgroup_id: z.string().describe("The ad group ID to update"),
    targeting_json: z
      .string()
      .describe(
        'JSON string of targeting fields to update. Example: {"location_ids":["6252001"],"age_groups":["AGE_18_24","AGE_25_34"],"gender":"GENDER_UNLIMITED"}'
      ),
  },
  async ({ adgroup_id, targeting_json }) => {
    try {
      const targeting = JSON.parse(targeting_json);
      const data = await tiktokUpdateAdGroupTargeting(adgroup_id, targeting);
      return {
        content: [
          {
            type: "text",
            text: `Ad group ${adgroup_id} targeting updated. Response: ${JSON.stringify(data)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// ==================== Pinterest Tools ====================

server.tool(
  "pinterest_get_account",
  "Get Pinterest user account info (username, board count, follower count, monthly views, etc.)",
  {},
  async () => {
    try {
      const data = await pinterestGetUserAccount();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "pinterest_list_boards",
  "List all boards owned by the authenticated Pinterest user",
  {
    page_size: z.number().optional().describe("Number of boards per page (1-250, default: 25)"),
    bookmark: z.string().optional().describe("Cursor for pagination from previous response"),
  },
  async ({ page_size, bookmark }) => {
    try {
      const data = await pinterestListBoards(page_size, bookmark);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "pinterest_create_board",
  "Create a new Pinterest board with name, description, and privacy setting",
  {
    name: z.string().describe("Board name"),
    description: z.string().optional().describe("Board description"),
    privacy: z
      .enum(["PUBLIC", "PROTECTED", "SECRET"])
      .optional()
      .describe("Privacy setting (default: PUBLIC)"),
  },
  async ({ name, description, privacy }) => {
    try {
      const data = await pinterestCreateBoard(name, description, privacy);
      return {
        content: [
          {
            type: "text",
            text: `Board "${name}" created successfully.\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "pinterest_create_pin",
  "Create a pin (image or video) on a Pinterest board with title, description, link, and media",
  {
    board_id: z.string().describe("The board ID to pin to"),
    title: z.string().optional().describe("Pin title (max 100 chars)"),
    description: z.string().optional().describe("Pin description (max 800 chars)"),
    link: z.string().optional().describe("Destination URL when pin is clicked"),
    alt_text: z.string().optional().describe("Alt text for accessibility (max 500 chars)"),
    media_type: z
      .enum(["image_url", "image_base64", "video_url"])
      .describe("Type of media source: image_url (public image URL), image_base64 (base64 data), video_url (public video URL or local path)"),
    media_url: z.string().optional().describe("Public URL of the image or video (for image_url and video_url types)"),
    media_base64: z.string().optional().describe("Base64-encoded image data (for image_base64 type)"),
    media_content_type: z
      .string()
      .optional()
      .describe("MIME type for base64 images (e.g. image/jpeg, image/png). Default: image/jpeg"),
    board_section_id: z.string().optional().describe("Optional board section ID"),
  },
  async ({ board_id, title, description, link, alt_text, media_type, media_url, media_base64, media_content_type, board_section_id }) => {
    try {
      const data = await pinterestCreatePin({
        board_id,
        title,
        description,
        link,
        alt_text,
        media_type,
        media_url,
        media_base64,
        media_content_type,
        board_section_id,
      });
      return {
        content: [
          {
            type: "text",
            text: `Pin created successfully.\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "pinterest_list_pins",
  "List pins owned by the authenticated Pinterest user with optional metrics",
  {
    page_size: z.number().optional().describe("Number of pins per page (1-250, default: 25)"),
    bookmark: z.string().optional().describe("Cursor for pagination from previous response"),
    pin_metrics: z
      .boolean()
      .optional()
      .describe("Include 90-day and lifetime pin metrics (default: false)"),
  },
  async ({ page_size, bookmark, pin_metrics }) => {
    try {
      const data = await pinterestListPins(page_size, bookmark, pin_metrics);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "pinterest_get_pin",
  "Get details of a specific Pinterest pin by ID",
  {
    pin_id: z.string().describe("The pin ID to retrieve"),
  },
  async ({ pin_id }) => {
    try {
      const data = await pinterestGetPin(pin_id);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "pinterest_update_pin",
  "Update a Pinterest pin's title, description, link, board, or alt text",
  {
    pin_id: z.string().describe("The pin ID to update"),
    title: z.string().optional().describe("New title (max 100 chars)"),
    description: z.string().optional().describe("New description (max 800 chars)"),
    link: z.string().optional().describe("New destination URL"),
    board_id: z.string().optional().describe("Move pin to a different board"),
    board_section_id: z.string().optional().describe("Move pin to a different board section"),
    alt_text: z.string().optional().describe("New alt text (max 500 chars)"),
  },
  async ({ pin_id, title, description, link, board_id, board_section_id, alt_text }) => {
    try {
      const data = await pinterestUpdatePin(pin_id, {
        title,
        description,
        link,
        board_id,
        board_section_id,
        alt_text,
      });
      return {
        content: [
          {
            type: "text",
            text: `Pin ${pin_id} updated successfully.\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "pinterest_delete_pin",
  "Delete a Pinterest pin by ID",
  {
    pin_id: z.string().describe("The pin ID to delete"),
  },
  async ({ pin_id }) => {
    try {
      const data = await pinterestDeletePin(pin_id);
      return {
        content: [
          {
            type: "text",
            text: `Pin ${pin_id} deleted successfully.\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

server.tool(
  "pinterest_get_pin_analytics",
  "Get analytics (impressions, clicks, saves, video views, etc.) for a specific Pinterest pin",
  {
    pin_id: z.string().describe("The pin ID to get analytics for"),
    start_date: z.string().describe("Start date (YYYY-MM-DD). Max 90 days back from today."),
    end_date: z.string().describe("End date (YYYY-MM-DD). Max 90 days past start_date."),
    metric_types: z
      .string()
      .describe(
        'Comma-separated metric types: IMPRESSION, SAVE, PIN_CLICK, OUTBOUND_CLICK, VIDEO_MRC_VIEW, VIDEO_AVG_WATCH_TIME, VIDEO_V50_WATCH_TIME, QUARTILE_95_PERCENT_VIEW, VIDEO_10S_VIEW, VIDEO_START, TOTAL_COMMENTS, TOTAL_REACTIONS'
      ),
  },
  async ({ pin_id, start_date, end_date, metric_types }) => {
    try {
      const types = metric_types.split(",").map((t) => t.trim());
      const data = await pinterestGetPinAnalytics(pin_id, start_date, end_date, types);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SocialClaw MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
