#!/usr/bin/env bash
# Install Node.js dependencies for this project.
# Usage: run ./setup.sh after cloning.

set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not installed. Please install Node.js." >&2
  exit 1
fi

npm install
