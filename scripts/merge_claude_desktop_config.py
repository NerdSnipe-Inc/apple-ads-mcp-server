#!/usr/bin/env python3
"""Merge an MCP server entry into a Claude Desktop config (claude_desktop_config.json).

- Creates the file (and parent directory) when it does not exist.
- Never touches other keys or other mcpServers entries.
- Writes a backup first: <config>.bak (or <config>.bak.<timestamp> if a .bak already exists).
- Refuses to modify a file that is not valid JSON (exit code 2, file untouched).
- Writes atomically.

Usage:
  merge_claude_desktop_config.py --config PATH --name apple-ads --command /abs/node \
      --arg /abs/dist/index.js --env KEY=VALUE [--env KEY=VALUE ...] [--dry-run]
"""
import argparse
import json
import os
import shutil
import sys
import tempfile
import time


def load(path):
    if not os.path.exists(path):
        return {}, False
    with open(path, "r", encoding="utf-8") as fh:
        raw = fh.read()
    if not raw.strip():
        return {}, True
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise ValueError("top-level JSON value must be an object")
    return data, True


def merge(data, name, command, args, env):
    servers = data.get("mcpServers")
    if servers is None:
        servers = {}
    if not isinstance(servers, dict):
        raise ValueError('"mcpServers" must be an object')
    entry = {"command": command, "args": list(args)}
    if env:
        entry["env"] = dict(env)
    servers[name] = entry
    data["mcpServers"] = servers
    return data


def backup(path):
    bak = path + ".bak"
    if os.path.exists(bak):
        bak = "%s.bak.%s" % (path, time.strftime("%Y%m%d%H%M%S"))
    shutil.copy2(path, bak)
    return bak


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", required=True)
    ap.add_argument("--name", default="apple-ads")
    ap.add_argument("--command", required=True, help="absolute path to node")
    ap.add_argument("--arg", action="append", default=[], help="argument for the command (repeatable)")
    ap.add_argument("--env", action="append", default=[], help="KEY=VALUE (repeatable)")
    ap.add_argument("--dry-run", action="store_true")
    ns = ap.parse_args(argv)

    env = {}
    for item in ns.env:
        if "=" not in item:
            ap.error("--env expects KEY=VALUE, got %r" % item)
        k, v = item.split("=", 1)
        if v != "":
            env[k] = v

    try:
        data, existed = load(ns.config)
        data = merge(data, ns.name, ns.command, ns.arg, env)
    except (ValueError, json.JSONDecodeError) as exc:
        sys.stderr.write("ERROR: %s is not a usable Claude Desktop config (%s). Nothing was changed.\n" % (ns.config, exc))
        return 2

    text = json.dumps(data, indent=2) + "\n"
    if ns.dry_run:
        sys.stdout.write(text)
        return 0

    parent = os.path.dirname(os.path.abspath(ns.config))
    os.makedirs(parent, exist_ok=True)
    bak = backup(ns.config) if existed else None

    fd, tmp = tempfile.mkstemp(prefix=".claude_desktop_config.", dir=parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(text)
        os.replace(tmp, ns.config)
    except Exception:
        if os.path.exists(tmp):
            os.unlink(tmp)
        raise

    sys.stdout.write("Updated %s (server %r)%s\n" % (ns.config, ns.name, "; backup: %s" % bak if bak else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
