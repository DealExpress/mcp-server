#!/usr/bin/env bash

# Exit on error
set -e

echo "Publishing @dealx/mcp-server to npm..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Build the package
echo "Building the package..."
npm run build

# Publish to npm
echo "Publishing to npm..."
npm publish

echo "Package published successfully!"
echo "You can now use it with: npx -y @dealx/mcp-server"
