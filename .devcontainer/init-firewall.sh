#!/bin/bash
# Default-deny egress firewall for the Trip AI sandbox.
# Based on Anthropic's reference init-firewall.sh:
# https://github.com/anthropics/claude-code/blob/main/.devcontainer/init-firewall.sh (MIT)
# Changes: DNS only to the container's own resolvers, no outbound SSH except to GitHub (its ranges
# are allowed on every port), Claude sign-in domains added, IPv6 egress dropped, npm registry
# verified, the box's Postgres allowed, an --engine mode for the Docker engine VM of `./box --docker`.
#   init-firewall.sh           the box itself (postStartCommand)
#   init-firewall.sh --engine <box IP>  the engine VM: the box keeps the allowlist, other containers get none
set -euo pipefail
IFS=$'\n\t'

# fill_allowlist <ipset>: GitHub's published ranges, Claude Code (API + sign-in) and the npm registry.
fill_allowlist() {
  local set="$1" gh_ranges cidr domain ips ip
  # GitHub (git over HTTPS, gh, api.github.com): the published IP ranges.
  gh_ranges=$(curl -s https://api.github.com/meta)
  echo "$gh_ranges" | jq -e '.web and .api and .git' >/dev/null || { echo "ERROR: GitHub meta missing fields"; exit 1; }
  while read -r cidr; do
    [[ "$cidr" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$ ]] || { echo "ERROR: bad CIDR $cidr"; exit 1; }
    ipset add "$set" "$cidr"
  done < <(echo "$gh_ranges" | jq -r '(.web + .api + .git)[]' | aggregate -q)

  # Claude Code (API + sign-in) and the npm registry. Nothing else.
  for domain in \
    "api.anthropic.com" \
    "claude.ai" \
    "claude.com" \
    "platform.claude.com" \
    "registry.npmjs.org"; do
    ips=$(dig +noall +answer A "$domain" | awk '$4 == "A" {print $5}')
    [ -n "$ips" ] || { echo "ERROR: failed to resolve $domain"; exit 1; }
    while read -r ip; do
      [[ "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]] || { echo "ERROR: bad IP $ip"; exit 1; }
      ipset add "$set" "$ip" 2>/dev/null || true
    done < <(echo "$ips")
  done
}

# --engine <box IP>: run by `./box --docker` in a host-network container on the Colima VM, so
# these rules land in the VM. A container started through the box's Docker socket skips the box's
# own firewall (and can remove it: the socket can exec into the box as root), so the VM limits
# every container: Docker sends all container traffic through the DOCKER-USER chain. Containers
# reach each other; the box also reaches the allowlist; nothing else leaves the VM (no internet,
# no ports on your machine). Testcontainers needs no more: its images are pulled by the engine.
if [ "${1:-}" = "--engine" ]; then
  BOX_IP="${2:-}"
  [[ "$BOX_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]] || { echo "ERROR: --engine needs the box's IP"; exit 1; }
  EXT_IF=$(ip route | awk '/default/ {print $5; exit}')
  [ -n "$EXT_IF" ] || { echo "ERROR: no default route in the VM"; exit 1; }
  ipset create box-egress hash:net -exist
  ipset create box-egress-next hash:net -exist
  ipset flush box-egress-next
  fill_allowlist box-egress-next
  ipset swap box-egress-next box-egress
  ipset destroy box-egress-next
  iptables -F DOCKER-USER
  iptables -A DOCKER-USER -m conntrack --ctstate ESTABLISHED,RELATED -j RETURN
  iptables -A DOCKER-USER ! -o "$EXT_IF" -j RETURN
  iptables -A DOCKER-USER -s "$BOX_IP" -m set --match-set box-egress dst -j RETURN
  iptables -A DOCKER-USER -j REJECT --reject-with icmp-admin-prohibited
  echo "Engine firewall OK: the box ($BOX_IP) reaches GitHub, npm and Claude; other containers reach only containers."
  exit 0
fi

# A new container allows all traffic, and a failed postStartCommand is not retried: on failure, block everything.
fail_closed() {
  iptables -F || true
  iptables -P INPUT DROP || true
  iptables -P FORWARD DROP || true
  iptables -P OUTPUT DROP || true
  ip6tables -P INPUT DROP 2>/dev/null || true
  ip6tables -P OUTPUT DROP 2>/dev/null || true
}
trap '[ $? -eq 0 ] || fail_closed' EXIT

# Keep Docker's internal DNS rules before flushing.
DOCKER_DNS_RULES=$(iptables-save -t nat | grep "127\.0\.0\.11" || true)

iptables -F; iptables -X
iptables -t nat -F; iptables -t nat -X
iptables -t mangle -F; iptables -t mangle -X
ipset destroy allowed-domains 2>/dev/null || true

if [ -n "$DOCKER_DNS_RULES" ]; then
  iptables -t nat -N DOCKER_OUTPUT 2>/dev/null || true
  iptables -t nat -N DOCKER_POSTROUTING 2>/dev/null || true
  echo "$DOCKER_DNS_RULES" | xargs -L 1 iptables -t nat
fi

# DNS only to the resolvers this container is configured with.
for ns in $(awk '/^nameserver/ {print $2}' /etc/resolv.conf); do
  if [[ "$ns" =~ ^[0-9.]+$ ]]; then
    iptables -A OUTPUT -p udp -d "$ns" --dport 53 -j ACCEPT
    iptables -A OUTPUT -p tcp -d "$ns" --dport 53 -j ACCEPT
  fi
done
iptables -A INPUT -p udp --sport 53 -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

ipset create allowed-domains hash:net
fill_allowlist allowed-domains

# The Docker host network (the editor talks to the container through it).
HOST_IP=$(ip route | awk '/default/ {print $3; exit}')
[ -n "$HOST_IP" ] || { echo "ERROR: no host IP"; exit 1; }
HOST_NETWORK=$(echo "$HOST_IP" | sed "s/\.[0-9]*$/.0\/24/")
iptables -A INPUT -s "$HOST_NETWORK" -j ACCEPT
iptables -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT

# The box's own Postgres (the postgres service in compose.yaml): port 5432 only.
DB_IP=$(getent ahostsv4 postgres | awk 'NR == 1 {print $1}')
[ -n "$DB_IP" ] || { echo "ERROR: failed to resolve postgres"; exit 1; }
iptables -A OUTPUT -p tcp -d "$DB_IP" --dport 5432 -j ACCEPT

iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m set --match-set allowed-domains dst -j ACCEPT
iptables -A OUTPUT -j REJECT --reject-with icmp-admin-prohibited

# No IPv6 way around the allowlist.
if command -v ip6tables >/dev/null 2>&1; then
  ip6tables -F 2>/dev/null || true
  ip6tables -A OUTPUT -o lo -j ACCEPT 2>/dev/null || true
  ip6tables -P OUTPUT DROP 2>/dev/null || true
  ip6tables -P INPUT DROP 2>/dev/null || true
  ip6tables -A INPUT -i lo -j ACCEPT 2>/dev/null || true
fi

echo "Firewall configured. Verifying..."
if curl --connect-timeout 5 -s https://example.com >/dev/null 2>&1; then
  echo "ERROR: example.com is reachable, the firewall is not working"; exit 1
fi
curl --connect-timeout 5 -s https://api.github.com/zen >/dev/null || { echo "ERROR: api.github.com unreachable"; exit 1; }
curl --connect-timeout 5 -s -o /dev/null https://registry.npmjs.org/ || { echo "ERROR: npm registry unreachable"; exit 1; }
timeout 5 bash -c '</dev/tcp/postgres/5432' || { echo "ERROR: Postgres (postgres:5432) unreachable"; exit 1; }
echo "Firewall OK: example.com blocked, GitHub, npm and Postgres (postgres:5432) reachable."
