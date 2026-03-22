#!/usr/bin/env bash
set -e

# Install Claude Code via npm with user-writable prefix (enables auto-update)
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
npm install -g @anthropic-ai/claude-code

echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.bashrc
echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.zshrc

# Copy auth files from host-mounted staging locations into container-local files
# so Claude Code can read/write them without bind-mount permission issues
mkdir -p ~/.claude
cp ~/.host-claude.json ~/.claude.json 2>/dev/null || true
cp ~/.host-credentials.json ~/.claude/.credentials.json 2>/dev/null || true

if [ -f ~/.claude/commands/devcontainer-setup.sh ]; then
    bash ~/.claude/commands/devcontainer-setup.sh
fi
