#!/usr/bin/env bash
set -e

# Install Claude Code via npm with user-writable prefix (enables auto-update)
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
npm install -g @anthropic-ai/claude-code

echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.bashrc
echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.zshrc

if [ -f ~/.claude/commands/devcontainer-setup.sh ]; then
    bash ~/.claude/commands/devcontainer-setup.sh
fi
