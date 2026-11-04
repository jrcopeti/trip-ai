# Trip AI sandbox. Based on Anthropic's reference dev container:
# https://github.com/anthropics/claude-code/tree/main/.devcontainer (MIT)
# Changes: Node 24 (as CI), bash instead of zsh, pinned Claude Code, Playwright's browsers.
FROM node:24-bookworm

ARG TZ
ENV TZ="$TZ"

RUN apt-get update && apt-get install -y --no-install-recommends \
  less git procps sudo man-db unzip gnupg2 gh \
  iptables ipset iproute2 dnsutils aggregate jq nano curl ca-certificates \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Chromium's system libraries, for Playwright and Playwright MCP (the node user has no apt).
ARG PLAYWRIGHT_VERSION=1.64.1
RUN npx --yes playwright@${PLAYWRIGHT_VERSION} install-deps chromium \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/share/npm-global && chown -R node:node /usr/local/share

# Persist bash history across rebuilds.
RUN mkdir /commandhistory && touch /commandhistory/.bash_history && chown -R node /commandhistory
RUN echo "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" >> /home/node/.bashrc

ENV DEVCONTAINER=true

RUN mkdir -p /workspace /home/node/.claude /home/node/brain /home/node/.config/brain && chown -R node:node /workspace /home/node/.claude /home/node/brain /home/node/.config
WORKDIR /workspace

ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
  curl -fsSLO "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

# The docker CLI only (no engine). It does nothing in the plain box, which has no socket;
# `./box --docker` gives it the socket of the box's own Colima VM.
ARG DOCKER_CLI_VERSION=29.8.2
RUN curl -fsSL "https://download.docker.com/linux/static/stable/$(uname -m)/docker-${DOCKER_CLI_VERSION}.tgz" | \
  tar -xz -C /usr/local/bin --strip-components=1 docker/docker

USER node
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin
ENV SHELL=/bin/bash
ENV EDITOR=nano

# Pinned: auto-update is off in devcontainer.json.
ARG CLAUDE_CODE_VERSION=2.1.311
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}

# Playwright MCP, pinned, with its browser downloaded here at build time: the firewall allows no
# browser downloads, so @latest would ask for a browser the running box cannot fetch.
# Keep the version in sync with compose.yaml and the `claude mcp add` line in README.md.
ARG PLAYWRIGHT_MCP_VERSION=0.0.83
RUN npx --yes @playwright/mcp@${PLAYWRIGHT_MCP_VERSION} install-browser chrome-for-testing

# The browser of the e2e suite (npm run test:e2e), for the same reason.
# Keep the version in sync with @playwright/test in package-lock.json and compose.yaml.
RUN npx --yes playwright@${PLAYWRIGHT_VERSION} install chromium

# Prisma's schema engine, for the same reason: `npm ci` and `prisma db push` otherwise fetch it from
# binaries.prisma.sh. Keep the version in sync with prisma in package-lock.json and compose.yaml.
ARG PRISMA_VERSION=7.10.1
RUN mkdir -p /home/node/prisma-engine && cd /home/node/prisma-engine && \
  npm install --no-audit --no-fund @prisma/engines@${PRISMA_VERSION} && \
  ln -s node_modules/@prisma/engines/schema-engine-* schema-engine && ./schema-engine --version
ENV PRISMA_SCHEMA_ENGINE_BINARY=/home/node/prisma-engine/schema-engine

# The firewall script. The node user may run exactly this one script as root.
COPY init-firewall.sh /usr/local/bin/
USER root
RUN chmod +x /usr/local/bin/init-firewall.sh && \
  echo "node ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh, /usr/bin/chown node\:node /workspace/node_modules /workspace/.next" > /etc/sudoers.d/node-firewall && \
  chmod 0440 /etc/sudoers.d/node-firewall
USER node
