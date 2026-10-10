#!/usr/bin/env bash
#
# Interactive installer: registers the Apple Ads MCP server globally for
#   * Claude Code    (claude mcp add --scope user)
#   * Claude Desktop (merges an entry into claude_desktop_config.json, with a .bak backup)
#
# It uses `node <abs>/dist/index.js` (absolute node path) so it keeps working under GUI apps
# that do not inherit your shell PATH.
#
# Prompts for: clientId, teamId, keyId, path to your .pem private key, optional ad account ID
# and org ID. The key is copied to ~/.appleads/private_keys/ with mode 600.
#
# Any value can be supplied up front through the environment (APPLE_ADS_CLIENT_ID, ...,
# APPLE_ADS_PRIVATE_KEY_PATH, APPLE_ADS_AD_ACCOUNT_ID, APPLE_ADS_ORG_ID); set
# APPLE_ADS_INSTALL_YES=1 to skip all prompts and the confirmation.
#
# Overrides: CLAUDE_DESKTOP_CONFIG (default ~/Library/Application Support/Claude/claude_desktop_config.json),
#            APPLE_ADS_SERVER_NAME (default apple-ads).
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_NAME="${APPLE_ADS_SERVER_NAME:-apple-ads}"
DESKTOP_CONFIG="${CLAUDE_DESKTOP_CONFIG:-$HOME/Library/Application Support/Claude/claude_desktop_config.json}"
KEY_DIR="$HOME/.appleads/private_keys"
ASSUME_YES="${APPLE_ADS_INSTALL_YES:-0}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
die()  { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

# ask VAR "Prompt" [required|optional] [default]
ask() {
  local var="$1" prompt="$2" mode="${3:-required}" default="${4:-}" current reply
  current="${!var:-}"
  if [ -n "$current" ]; then return 0; fi
  if [ "$ASSUME_YES" = "1" ]; then
    if [ "$mode" = "required" ] && [ -z "$default" ]; then die "$var is required (set it in the environment)"; fi
    printf -v "$var" '%s' "$default"; return 0
  fi
  while true; do
    if [ -n "$default" ]; then read -r -p "$prompt [$default]: " reply || true; reply="${reply:-$default}"
    else read -r -p "$prompt: " reply || true; fi
    if [ -n "$reply" ] || [ "$mode" = "optional" ]; then printf -v "$var" '%s' "$reply"; return 0; fi
    echo "  (required)"
  done
}

expand_home() { case "$1" in "~") printf '%s' "$HOME";; "~/"*) printf '%s' "$HOME/${1#\~/}";; *) printf '%s' "$1";; esac; }

command -v node >/dev/null 2>&1 || die "node not found on PATH (Node 20+ required)"
command -v python3 >/dev/null 2>&1 || die "python3 not found (needed to merge the Claude Desktop config)"
NODE_BIN="$(command -v node)"
NODE_MAJOR="$("$NODE_BIN" -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || die "Node 20+ required (found $("$NODE_BIN" -v))"

bold "Apple Ads MCP Server - global install"
info "Repo:  $REPO_DIR"
info "Node:  $NODE_BIN ($("$NODE_BIN" -v))"
echo
echo "Find clientId / teamId / keyId in Apple Ads > Account Settings > API after uploading your public key."
echo

APPLE_ADS_CLIENT_ID="${APPLE_ADS_CLIENT_ID:-${ASA_CLIENT_ID:-}}"
APPLE_ADS_TEAM_ID="${APPLE_ADS_TEAM_ID:-${ASA_TEAM_ID:-}}"
APPLE_ADS_KEY_ID="${APPLE_ADS_KEY_ID:-${ASA_KEY_ID:-}}"
APPLE_ADS_PRIVATE_KEY_PATH="${APPLE_ADS_PRIVATE_KEY_PATH:-${ASA_PRIVATE_KEY_PATH:-}}"
APPLE_ADS_AD_ACCOUNT_ID="${APPLE_ADS_AD_ACCOUNT_ID:-${ASA_AD_ACCOUNT_ID:-}}"
APPLE_ADS_ORG_ID="${APPLE_ADS_ORG_ID:-${ASA_ORG_ID:-}}"

ask APPLE_ADS_CLIENT_ID "clientId (SEARCHADS.xxxxxxxx-...)"
ask APPLE_ADS_TEAM_ID "teamId (SEARCHADS.xxxxxxxx-...)"
ask APPLE_ADS_KEY_ID "keyId"
ask APPLE_ADS_PRIVATE_KEY_PATH "Path to your private key (.pem)"
ask APPLE_ADS_AD_ACCOUNT_ID "Default ad account ID (optional, Enter to skip)" optional
ask APPLE_ADS_ORG_ID "Org ID (optional, Enter to skip)" optional

SRC_KEY="$(expand_home "$APPLE_ADS_PRIVATE_KEY_PATH")"
[ -f "$SRC_KEY" ] || die "Private key not found: $SRC_KEY"
grep -q "PRIVATE KEY" "$SRC_KEY" || die "$SRC_KEY does not look like a PEM private key"

echo
bold "Plan"
info "Copy key to:        $KEY_DIR/$(basename "$SRC_KEY") (mode 600)"
info "Build:              $REPO_DIR/dist/index.js (if missing/outdated)"
info "Claude Code:        claude mcp add $SERVER_NAME --scope user -- $NODE_BIN $REPO_DIR/dist/index.js"
info "Claude Desktop:     merge into $DESKTOP_CONFIG (backup .bak)"
if [ "$ASSUME_YES" != "1" ]; then
  read -r -p "Proceed? [y/N] " go || true
  case "${go:-}" in y|Y|yes|YES) ;; *) echo "Aborted."; exit 0;; esac
fi

# 1) key -> ~/.appleads/private_keys (chmod 600)
umask 077
mkdir -p "$KEY_DIR"
chmod 700 "$HOME/.appleads" "$KEY_DIR" 2>/dev/null || true
DEST_KEY="$KEY_DIR/$(basename "$SRC_KEY")"
SRC_REAL="$(cd "$(dirname "$SRC_KEY")" && pwd)/$(basename "$SRC_KEY")"
if [ "$SRC_REAL" != "$DEST_KEY" ]; then cp "$SRC_KEY" "$DEST_KEY"; fi
chmod 600 "$DEST_KEY"
info "Key stored at $DEST_KEY"

# 2) build if needed
ENTRY="$REPO_DIR/dist/index.js"
needs_build=0
if [ ! -f "$ENTRY" ]; then needs_build=1
elif [ -n "$(find "$REPO_DIR/src" -type f -newer "$ENTRY" -print -quit 2>/dev/null)" ]; then needs_build=1; fi
if [ "$needs_build" = "1" ]; then
  info "Building..."
  ( cd "$REPO_DIR"
    [ -d node_modules ] || npm install --no-audit --no-fund
    npm run build )
fi
[ -f "$ENTRY" ] || die "Build did not produce $ENTRY"

ENV_ARGS=( "APPLE_ADS_CLIENT_ID=$APPLE_ADS_CLIENT_ID" "APPLE_ADS_TEAM_ID=$APPLE_ADS_TEAM_ID" "APPLE_ADS_KEY_ID=$APPLE_ADS_KEY_ID" "APPLE_ADS_PRIVATE_KEY_PATH=$DEST_KEY" )
[ -n "$APPLE_ADS_AD_ACCOUNT_ID" ] && ENV_ARGS+=( "APPLE_ADS_AD_ACCOUNT_ID=$APPLE_ADS_AD_ACCOUNT_ID" )
[ -n "$APPLE_ADS_ORG_ID" ] && ENV_ARGS+=( "APPLE_ADS_ORG_ID=$APPLE_ADS_ORG_ID" )

# 3) Claude Code (user scope)
if command -v claude >/dev/null 2>&1; then
  claude mcp remove "$SERVER_NAME" --scope user >/dev/null 2>&1 || true
  CLAUDE_ENV=()
  for kv in "${ENV_ARGS[@]}"; do CLAUDE_ENV+=( -e "$kv" ); done
  claude mcp add "$SERVER_NAME" --scope user "${CLAUDE_ENV[@]}" -- "$NODE_BIN" "$ENTRY"
  info "Registered with Claude Code (user scope)."
else
  warn "claude CLI not found; skipping Claude Code registration. Run manually:"
  echo "  claude mcp add $SERVER_NAME --scope user -e APPLE_ADS_CLIENT_ID=... -e APPLE_ADS_TEAM_ID=... -e APPLE_ADS_KEY_ID=... -e APPLE_ADS_PRIVATE_KEY_PATH=$DEST_KEY -- $NODE_BIN $ENTRY"
fi

# 4) Claude Desktop
MERGE_ENV=()
for kv in "${ENV_ARGS[@]}"; do MERGE_ENV+=( --env "$kv" ); done
python3 "$SCRIPT_DIR/merge_claude_desktop_config.py" --config "$DESKTOP_CONFIG" --name "$SERVER_NAME" --command "$NODE_BIN" --arg "$ENTRY" "${MERGE_ENV[@]}"

echo
bold "Done."
info "Restart Claude Desktop to load the server. In Claude Code run: /mcp"
info "Verify credentials by asking: \"call apple_ads_server_status with verify=true\""
