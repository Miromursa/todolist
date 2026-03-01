#!/bin/bash

# Daily reset script for Questlog
# This script calls the daily reset API endpoint

API_URL="${1:-http://localhost:3000/api/reset}"

echo "[$(date)] Triggering daily reset..."

# Call the API endpoint
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo "[$(date)] Daily reset completed successfully"
    echo "Response: $body"
else
    echo "[$(date)] Daily reset failed with HTTP $http_code"
    echo "Response: $body"
    exit 1
fi
