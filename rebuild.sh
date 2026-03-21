#!/bin/bash

echo "Fetching latest changes from git..."
git fetch origin

git pull origin master

echo "Rebuilding questlog containers..."
docker compose down
docker compose build --no-cache
docker compose up -d

echo "Checking container status..."
docker compose ps

echo "Showing recent logs..."
docker compose logs --tail=10 app
