#!/usr/bin/env bash

# DealX MCP Server Installation Script

# Exit on error
set -e

echo "Installing DealX MCP Server..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
  echo "Please edit the .env file to set the appropriate values."
fi

# Build the server
echo "Building the server..."
npm run build

echo "Installation complete!"
echo "You can now start the server with: npm start"
echo ""
echo "To use this server with Claude or another LLM, add it to your MCP configuration."
echo "See the README.md file for more information."
