#!/bin/bash

# GitHub Pages compatible asset URL converter
# This script converts relative asset paths to absolute URLs in markdown files

echo "Converting relative asset paths to absolute URLs..."

# Configuration
SITE_URL="${SITE_URL:-https://naiiren.github.io}"  # Use environment variable or default
ARTICLES_DIR="_articles"

echo "Using site URL: $SITE_URL"

# Function to convert asset paths in a file
convert_asset_paths() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    local temp_file=$(mktemp)
    
    # Convert markdown image syntax: ![alt](assets/image.ext) -> ![alt](https://site.url/assets/image.ext)
    sed "s|!\[\([^]]*\)\](assets/\([^)]*\))|![\1](${SITE_URL}/assets/\2)|g" "$file" > "$temp_file"
    
    # Move the temporary file back
    mv "$temp_file" "$file"
    
    echo "Converted asset paths in: $file"
}

# Process all markdown files in _articles directory
if [ -d "$ARTICLES_DIR" ]; then
    find "$ARTICLES_DIR" -name "*.md" -type f | while read -r file; do
        convert_asset_paths "$file"
    done
else
    echo "Directory $ARTICLES_DIR not found"
fi

echo "Asset path conversion completed!"
