#!/bin/bash
# Fix Claude plugin installPaths for devcontainer
CONFIG_DIR="/home/node/.claude"

# Patch top-level config files
for file in "$CONFIG_DIR/claude.json" "$CONFIG_DIR/marketplace.json"; do
  if [ -f "$file" ] && grep -q '/Users/pallan' "$file"; then
    sed -i 's|/Users/pallan/\.claude|/home/node/.claude|g' "$file"
    echo "Patched: $file"
  fi
done

# Patch any JSON files in plugins subdirectories
find "$CONFIG_DIR/plugins" -name "*.json" 2>/dev/null | while read file; do
  if grep -q '/Users/pallan' "$file"; then
    sed -i 's|/Users/pallan/\.claude|/home/node/.claude|g' "$file"
    echo "Patched: $file"
  fi
done

echo "Done patching Claude plugin paths"
