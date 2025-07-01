#!/bin/sh
# Production build script for GitHub Pages deployment

bundle install

# Ensure we start with relative paths (restore from any previous builds)
echo "Restoring relative paths to ensure clean state..."
./restore_assets.sh

# Copy assets from _articles/assets to main assets directory
if [ -d "_articles/assets" ]; then
    echo "Copying assets from _articles/assets to assets/"
    mkdir -p assets
    cp -r _articles/assets/* assets/
fi

# Convert relative asset paths to production URLs
echo "Converting relative asset paths to production URLs..."
SITE_URL="https://naiiren.github.io" ./convert_assets.sh

# Build the site for production
echo "Building Jekyll site for production..."
JEKYLL_ENV=production bundle exec jekyll build

echo "Production build completed! Assets are using production URLs."
