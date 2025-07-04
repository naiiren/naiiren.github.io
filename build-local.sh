#!/bin/sh
bundle install

./restore_assets.sh

if [ -d "_articles/assets" ]; then
    echo "Copying assets from _articles/assets to assets/"
    mkdir -p assets
    cp -r _articles/assets/* assets/
fi

SITE_URL="http://127.0.0.1:4000" ./convert_assets.sh

echo "Building and serving Jekyll site locally..."
bundle exec jekyll serve --host 127.0.0.1 --port 4000

echo "Local build and serve completed!"
