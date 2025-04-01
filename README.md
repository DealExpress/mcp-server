# @dealx/mcp-server

This is a Model Context Protocol (MCP) server for the [DealX platform](https://dealx.com.ua). It allows other LLMs to interact with the [DealX platform](https://dealx.com.ua), specifically to search for ads.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Available Tools](#available-tools)
- [Extending the Server](#extending-the-server)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Overview

The DealX MCP Server implements the [Model Context Protocol](https://github.com/modelcontextprotocol/typescript-sdk) to provide a standardized way for LLMs to interact with the [DealX platform](https://dealx.com.ua). Currently, it supports searching for ads, with plans to add more functionality in the future.

### What is MCP?

The Model Context Protocol (MCP) is a standardized way for LLMs to interact with external systems. It provides a structured interface for LLMs to access data and perform actions in the real world. This server implements the MCP specification to allow LLMs to interact with the [DealX platform](https://dealx.com.ua).

## Installation

### Prerequisites

- Node.js (v20 or later)
- npm (v11 or later)

### Installation via npm

The easiest way to install the DealX MCP Server is via npm:

```shell
npm install -g @dealx/mcp-server
```

### Installation for Development

If you want to modify the server or contribute to its development:

- Clone the repository:

  ```shell
  git clone <repository-url>
  cd dealx/mcp
  ```

- Install dependencies:

  ```shell
  npm install
  ```

- Create a `.env` file based on the `.env.example` file:

  ```shell
  cp .env.example .env
  ```

- Edit the `.env` file to set the appropriate values:

  ```shell
  # DealX API URL
  DEALX_API_URL=http://localhost:3001

  # Optional: Specify the port for the MCP server
  MCP_SERVER_PORT=3100

  # Optional: Log level (debug, info, warn, error)
  LOG_LEVEL=info
  ```

- Build the server:

  ```shell
  npm run build
  ```

### Configuration for LLM Users

If you're using this server with an LLM like Claude, you'll need to add it to your LLM's MCP configuration. Here's how to do it for Claude:

- Open your Claude desktop app configuration file:

  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
  - Linux: `~/.config/Claude/claude_desktop_config.json`

- Add the DealX MCP server to the `mcpServers` section:

  ```json
  {
    "mcpServers": {
      "dealx": {
        "command": "npx",
        "args": ["-y", "@dealx/mcp-server"],
        "env": {
          "DEALX_API_URL": "https://dealx.com.ua"
        },
        "disabled": false,
        "autoApprove": []
      }
    }
  }
  ```

## Usage

### Starting the Server

If you've installed the package globally, you can start the server with:

```shell
node node_modules/@dealx/mcp-server/build/index.js
```

You can also run it directly with npx without installing (after publishing to npm):

```shell
npx -y @dealx/mcp-server
```

Environment variables can be passed directly:

```shell
DEALX_API_URL=https://dealx.com.ua npx -y @dealx/mcp-server
```

If you're working with the development version, you can start the server with:

```shell
npm start
```

This will start the server using the configuration from your `.env` file.

### Using the Server with an LLM

Once the server is running and configured in your LLM's MCP configuration, you can use it to search for ads on the [DealX platform](https://dealx.com.ua).

Example prompt for Claude:

```shell
Search for ads on DealX with the query "laptop".
```

Claude will use the MCP server to search for ads and return the results.

## Available Tools

### search_ads

Search for ads on the [DealX platform](https://dealx.com.ua).

**Parameters:**

- `query` (string, optional): Search query string
- `sort` (string, optional): Sort order (e.g., "-created" for newest first)
- `offset` (number, optional): Pagination offset (starts at 1, default: 1)
- `limit` (number, optional): Number of results per page (max 100, default: 30)

**Example:**

```json
{
  "query": "laptop",
  "sort": "-created",
  "offset": 1,
  "limit": 10
}
```

## Extending the Server

The server is designed to be easily extended with additional tools. Here's how to add a new tool:

- Define the tool in the `TOOLS` object in `src/index.ts`:

  ```typescript
  const TOOLS = {
    SEARCH_ADS: "search_ads",
    NEW_TOOL: "new_tool", // Add your new tool here
  };
  ```

- Create a new file in the `src/tools` directory for your tool implementation:

  ```typescript
  // src/tools/new-tool.ts
  import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

  interface NewToolParams {
    // Define your tool parameters here
  }

  export async function newTool(params: NewToolParams) {
    try {
      // Implement your tool logic here

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      // Handle errors
      // ...
    }
  }
  ```

- Add the tool to the `ListToolsRequestSchema` handler in `src/index.ts`:

  ```typescript
  this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      // Existing tools...
      {
        name: TOOLS.NEW_TOOL,
        description: "Description of your new tool",
        inputSchema: {
          type: "object",
          properties: {
            // Define your tool parameters here
          },
          required: [], // List required parameters
        },
      },
    ],
  }));
  ```

- Add the tool to the `CallToolRequestSchema` handler in `src/index.ts`:

  ```typescript
  this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      // Existing cases...
      case TOOLS.NEW_TOOL:
        return await newTool(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  });
  ```

- Import your new tool in `src/index.ts`:

  ```typescript
  import { newTool } from "./tools/new-tool.js";
  ```

### Planned Future Tools

The following tools are planned for future implementation:

- `create_ad`: Create a new ad on the [DealX platform](https://dealx.com.ua)
- `edit_ad`: Edit an existing ad
- `delete_ad`: Delete an ad
- `get_threads`: Get discussion threads for an ad
- `create_thread`: Create a new discussion thread

## Development

### Project Structure

```shell
mcp/
├── build/              # Compiled JavaScript files
├── src/                # TypeScript source files
│   ├── tools/          # Tool implementations
│   │   └── search-ads.ts
│   └── index.ts        # Main server implementation
├── .env                # Environment variables (not in git)
├── .env.example        # Example environment variables
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

### Development Workflow

- Make changes to the TypeScript files in the `src` directory
- Build the server:

  ```shell
  npm run build
  ```

- Start the server:

  ```shell
  npm start
  ```

### Linting and Formatting

To lint the code:

```shell
npm run lint
```

To format the code:

```shell
npm run format
```

## Troubleshooting

### Common Issues

#### Server Not Starting

If the server fails to start, check the following:

- Make sure you have the correct Node.js version installed
- Check that all dependencies are installed
- Verify that the `.env` file exists and has the correct values
- Check the console output for error messages

#### Connection Issues

If the LLM can't connect to the server:

- Make sure the server is running
- Check that the MCP configuration in the LLM's settings is correct
- Verify that the path to the server executable is correct
- Check that the environment variables are set correctly

#### API Connection Issues

If the server can't connect to the DealX API:

- Make sure the DealX API is running
- Check that the `DEALX_API_URL` environment variable is set correctly
- Verify that the API endpoint is accessible from the server

### Getting Help

If you encounter issues not covered here, please open an issue on the GitHub repository.
