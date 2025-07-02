#!/bin/bash

# Restore script - converts absolute URLs back to relative paths
# Useful for development when you want to restore Typora compatibility

echo "Restoring absolute URLs back to relative paths..."

# Configuration
ARTICLES_DIR="_articles"

# Function to restore asset paths in a file
restore_asset_paths() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    local temp_file=$(mktemp)
    
    # Convert absolute URLs back to relative paths for markdown images
    # Pattern: ![alt](https://any-domain/assets/image.ext) -> ![alt](assets/image.ext)
    sed "s|!\[\([^]]*\)\](https\?://[^/]*/assets/\([^)]*\))|![\1](assets/\2)|g" "$file" > "$temp_file"
    
    # Convert absolute URLs back to relative paths for HTML img tags
    # Pattern: <img src="https://any-domain/assets/image.ext" -> <img src="assets/image.ext"
    sed -i "s|<img\([^>]*\)src=\"https\?://[^/]*/assets/\([^\"]*\)\"|<img\1src=\"assets/\2\"|g" "$temp_file"
    
    # Move the temporary file back
    mv "$temp_file" "$file"
    
    echo "Restored asset paths in: $file"
}

# Process all markdown files in _articles directory
if [ -d "$ARTICLES_DIR" ]; then
    find "$ARTICLES_DIR" -name "*.md" -type f | while read -r file; do
        restore_asset_paths "$file"
    done
else
    echo "Directory $ARTICLES_DIR not found"
fi

echo "Asset path restoration completed! Files are now Typora-compatible again."
