#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
plugin_dir="$repo_root/wp-plugin/trail-trivia"
dist_dir="$repo_root/dist"

version=$(grep -m1 '^\s*\*\s*Version:' "$plugin_dir/trail-trivia.php" | sed -E 's/.*Version:[[:space:]]*//' | tr -d '[:space:]')

echo "Building player and admin assets..."
npm --prefix "$repo_root/react-app" run build:player
npm --prefix "$repo_root/react-app" run build:admin

mkdir -p "$dist_dir"
zip_path="$dist_dir/trail-trivia-$version.zip"
rm -f "$zip_path"

echo "Zipping trail-trivia $version..."
cd "$repo_root/wp-plugin"
zip -r "$zip_path" trail-trivia -x '*.DS_Store' -x '*.map'

echo "Created $zip_path"
