FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install any additional system packages if needed
RUN apt-get update -qq && export DEBIAN_FRONTEND=noninteractive \
  && apt-get install --no-install-recommends -y git
