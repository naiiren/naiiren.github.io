#!/bin/sh
# Local build and serve script

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

# Convert relative asset paths to local URLs
echo "Converting relative asset paths to local URLs..."
SITE_URL="http://127.0.0.1:4000" ./convert_assets.sh

# Build and serve the site locally
echo "Building and serving Jekyll site locally..."
bundle exec jekyll serve --host 127.0.0.1 --port 4000

echo "Local build and serve completed!"
