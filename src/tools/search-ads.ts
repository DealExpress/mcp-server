import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { SearchAdsParams } from "../types.js";

// Get the DealX API URL from environment variables
const DEALX_API_URL = process.env.DEALX_API_URL ?? "https://dealx.com.ua";

/**
 * Search for ads on the DealX platform
 * @param params Search parameters
 * @returns Search results
 */
export async function searchAds(params: SearchAdsParams) {
  try {
    // Set default values if not provided
    const query = params.query ?? "";
    const sort = params.sort ?? "";
    const offset = params.offset ?? 1;
    const limit = params.limit ?? 30;

    // Validate offset and limit
    if (offset < 1) {
      throw new McpError(ErrorCode.InvalidParams, "Offset must be at least 1");
    }

    if (limit < 1 || limit > 100) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Limit must be between 1 and 100",
      );
    }

    // Build the search URL
    const searchUrl = new URL("/api/ads/search", DEALX_API_URL);
    searchUrl.searchParams.append("q", query);
    if (sort) {
      searchUrl.searchParams.append("sort", sort);
    }
    searchUrl.searchParams.append("offset", offset.toString());
    searchUrl.searchParams.append("limit", limit.toString());

    // Make the request to the DealX API
    const response = await axios.get(searchUrl.toString());

    // Return the search results
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    // Handle errors
    if (axios.isAxiosError(error)) {
      // Handle Axios errors
      const statusCode = error.response?.status || 500;
      const errorMessage =
        error.response?.data?.error || error.message || "Unknown error";

      return {
        content: [
          {
            type: "text",
            text: `Error searching ads: ${errorMessage} (${statusCode})`,
          },
        ],
        isError: true,
      };
    }

    // Handle other errors
    if (error instanceof McpError) {
      throw error;
    }

    // Handle unknown errors
    return {
      content: [
        {
          type: "text",
          text: `Error searching ads: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
}
