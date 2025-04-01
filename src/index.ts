#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { searchAds } from "./tools/search-ads.js";
import { SearchAdsParams } from "./types.js";

// Load environment variables
dotenv.config();

// Define the server name and version
const SERVER_NAME = "dealx-mcp-server";
const SERVER_VERSION = "0.1.0";

// Define the available tools
const TOOLS = {
  SEARCH_ADS: "search_ads",
  // Future tools can be added here
  // CREATE_AD: 'create_ad',
  // EDIT_AD: 'edit_ad',
  // DELETE_AD: 'delete_ad',
  // GET_THREADS: 'get_threads',
  // CREATE_THREAD: 'create_thread',
};

class DealXMcpServer {
  private readonly server: Server;

  constructor() {
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error: unknown) =>
      console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: TOOLS.SEARCH_ADS,
          description: "Search for ads on the DealX platform",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query string",
              },
              sort: {
                type: "string",
                description: 'Sort order (e.g., "-created" for newest first)',
              },
              offset: {
                type: "number",
                description: "Pagination offset (starts at 1)",
                minimum: 1,
              },
              limit: {
                type: "number",
                description: "Number of results per page (max 100)",
                minimum: 1,
                maximum: 100,
              },
            },
            required: [],
          },
        },
        // Future tools can be defined here
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: {
        params: {
          name: string;
          arguments?: Record<string, unknown>;
        };
      }) => {
        const { name, arguments: args } = request.params;

        switch (name) {
          case TOOLS.SEARCH_ADS:
            return await searchAds(args as SearchAdsParams);
          // Future tool handlers can be added here
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`,
            );
        }
      },
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("DealX MCP server running on stdio");
  }
}

const server = new DealXMcpServer();
server.run().catch(console.error);
