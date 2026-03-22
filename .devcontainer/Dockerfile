FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install any additional system packages if needed
RUN apt-get update -qq && export DEBIAN_FRONTEND=noninteractive \
  && apt-get install --no-install-recommends -y git

# Pre-create ~/.claude with correct ownership so file-level bind mounts don't create it as root
RUN mkdir -p /home/node/.claude \
    && chown -R node:node /home/node/.claude
