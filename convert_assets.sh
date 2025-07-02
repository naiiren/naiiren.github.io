#!/bin/bash

# GitHub Pages compatible asset URL converter
# This script converts relative asset paths to absolute URLs in markdown files

echo "Converting relative asset paths to absolute URLs..."

# Configuration - prioritize environment variable, then fallback to config
if [ -n "$SITE_URL" ]; then
    echo "Using SITE_URL from environment: $SITE_URL"
else
    # Extract URL from _config.yml as fallback
    if [ -f "_config.yml" ]; then
        CONFIG_URL=$(grep "^url:" "_config.yml" | sed 's/url:[[:space:]]*"\([^"]*\)".*/\1/' | sed 's/url:[[:space:]]*\([^[:space:]]*\).*/\1/')
        SITE_URL="${CONFIG_URL:-https://naiiren.github.io}"
        echo "Using URL from _config.yml: $SITE_URL"
    else
        SITE_URL="https://naiiren.github.io"
        echo "Using default URL: $SITE_URL"
    fi
fi

ARTICLES_DIR="_articles"

echo "Final site URL: $SITE_URL"

# Function to convert asset paths in a file
convert_asset_paths() {
    local file="$1"
    echo "Processing: $file"
    
    # Show original content for debugging
    echo "Original image references in $file:"
    grep -n "src=\"assets/" "$file" || echo "No HTML img asset references found"
    
    # Create a temporary file
    local temp_file=$(mktemp)
    
    # Convert HTML img tags: <img src="assets/image.ext" -> <img src="https://site.url/assets/image.ext"
    # Use a more specific pattern to avoid double conversion
    sed "s|<img\([^>]*\)src=\"assets/\([^\"]*\)\"|<img\1src=\"${SITE_URL}/assets/\2\"|g" "$file" > "$temp_file"
    
    # Show converted content for debugging
    echo "Converted image references in $file:"
    grep -n "src=\"https://" "$temp_file" || echo "No converted HTML img references found"
    
    # Move the temporary file back
    mv "$temp_file" "$file"
    
    echo "Converted asset paths in: $file"
    echo "---"
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
