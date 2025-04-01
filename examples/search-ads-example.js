#!/usr/bin/env node

/**
 * Example script demonstrating how to use the DealX MCP Server
 * to search for ads.
 *
 * This script simulates how an LLM would interact with the MCP server.
 */

// Import required modules
import { spawn } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

// Path to the MCP server executable
const serverPath = resolve(__dirname, "../build/index.js");

// Check if the server executable exists
if (!existsSync(serverPath)) {
  console.error(`Error: Server executable not found at ${serverPath}`);
  console.error("Please build the server first with: npm run build");
  process.exit(1);
}

// Start the MCP server process
const serverProcess = spawn("node", [serverPath], {
  stdio: ["pipe", "pipe", process.stderr],
});

// Handle server process errors
serverProcess.on("error", (error) => {
  console.error(`Failed to start MCP server: ${error.message}`);
  process.exit(1);
});

// Handle server process exit
serverProcess.on("exit", (code) => {
  if (code !== 0) {
    console.error(`MCP server exited with code ${code}`);
  }
});

// Create a request to list available tools
const listToolsRequest = {
  jsonrpc: "2.0",
  id: "1",
  method: "listTools",
  params: {},
};

// Send the request to the server
serverProcess.stdin.write(JSON.stringify(listToolsRequest) + "\n");

// Create a request to search for ads
const searchAdsRequest = {
  jsonrpc: "2.0",
  id: "2",
  method: "callTool",
  params: {
    name: "search_ads",
    arguments: {
      query: "laptop",
      sort: "-created",
      offset: 1,
      limit: 5,
    },
  },
};

// Listen for responses from the server
let buffer = "";
serverProcess.stdout.on("data", (data) => {
  buffer += data.toString();

  // Process complete JSON messages
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
    const message = buffer.slice(0, newlineIndex);
    buffer = buffer.slice(newlineIndex + 1);

    try {
      const response = JSON.parse(message);

      // Handle the response
      if (response.id === "1") {
        console.log("Available tools:");
        response.result.tools.forEach((tool) => {
          console.log(`- ${tool.name}: ${tool.description}`);
        });

        // After receiving the list of tools, send the search request
        console.log('\nSearching for ads with query "laptop"...\n');
        serverProcess.stdin.write(JSON.stringify(searchAdsRequest) + "\n");
      } else if (response.id === "2") {
        // Handle the search results
        if (response.result && response.result.content) {
          const content = response.result.content[0];
          if (content.type === "text") {
            try {
              // Try to parse the JSON response
              const searchResults = JSON.parse(content.text);
              console.log(`Found ${searchResults.totalItems} ads:`);

              // Display the search results
              searchResults.items.forEach((ad, index) => {
                console.log(`\n--- Ad ${index + 1} ---`);
                console.log(`Title: ${ad.title}`);
                console.log(
                  `Description: ${ad.description.substring(0, 100)}...`,
                );
                console.log(`Price: ${ad.price}`);
                console.log(`Created: ${ad.created}`);

                // Display author information if available
                if (ad.expand && ad.expand.author) {
                  console.log(`Author: ${ad.expand.author.name}`);
                }

                // Display tags if available
                if (ad.expand && ad.expand.tags) {
                  const tagNames = ad.expand.tags
                    .map((tag) => tag.name)
                    .join(", ");
                  console.log(`Tags: ${tagNames}`);
                }
              });
            } catch {
              // If the response is not valid JSON, just display the text
              console.log(content.text);
            }
          } else {
            console.log(content);
          }
        } else if (response.error) {
          console.error(`Error: ${response.error.message}`);
        }

        // Close the server process after receiving the search results
        serverProcess.stdin.end();
      }
    } catch (error) {
      console.error(`Error parsing response: ${error.message}`);
    }
  }
});

// Handle process termination
process.on("SIGINT", () => {
  serverProcess.kill();
  process.exit(0);
});
