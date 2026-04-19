#!/usr/bin/env python3
"""LGTM - Fetch and display random alternative meanings from lgtm.airscript.it"""

import json
import random
import sys
import argparse
import urllib.request
import os
from pathlib import Path

DATA_URL = "https://raw.githubusercontent.com/airscripts/lgtm/main/data/lgtm.json"
CACHE_FILE = Path.home() / ".cache" / "openclaw" / "lgtm" / "entries.json"
RARITY_WEIGHTS = {"common": 0.55, "rare": 0.27, "epic": 0.14, "legendary": 0.05}


def ensure_cache_dir():
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)


def fetch_data():
    """Fetch LGTM data from GitHub."""
    try:
        req = urllib.request.Request(DATA_URL, headers={"User-Agent": "OpenClaw-LGTM/2.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            ensure_cache_dir()
            with open(CACHE_FILE, "w") as f:
                json.dump(data, f, indent=2)
            return data
    except Exception as e:
        print(f"Error fetching data: {e}", file=sys.stderr)
        return None


def load_data():
    """Load data from cache or fetch fresh."""
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    return fetch_data()


def weighted_random(entries):
    """Select random entry weighted by rarity."""
    weights = [RARITY_WEIGHTS.get(e["rarity"], 0.1) for e in entries]
    return random.choices(entries, weights=weights, k=1)[0]


def format_entry(entry):
    """Format entry for display."""
    rarity = entry["rarity"].upper()
    tags = ", ".join(entry.get("tags", []))
    return f"""LGTM #{entry['id']} [{rarity}]
"{entry['meaning']}"
Category: {entry['category']}
Description: {entry['description']}
Tags: {tags}"""


def main():
    parser = argparse.ArgumentParser(description="LGTM - Alternative meanings generator")
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    random_parser = subparsers.add_parser("random", help="Get random entry")
    random_parser.add_argument("--category", help="Filter by category")
    random_parser.add_argument("--rare", action="store_true", help="Only rare+")
    random_parser.add_argument("--epic", action="store_true", help="Only epic+")

    get_parser = subparsers.add_parser("get", help="Get entry by ID")
    get_parser.add_argument("id", type=int, help="Entry ID")

    list_parser = subparsers.add_parser("list", help="List categories or rarities")
    list_parser.add_argument("type", choices=["categories", "rarities"])

    subparsers.add_parser("fetch", help="Refresh data from source")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "fetch":
        data = fetch_data()
        if data:
            print(f"Cached {len(data)} entries")
        return

    if args.command == "list":
        if args.type == "categories":
            data = load_data()
            if data:
                cats = {}
                for e in data:
                    cats[e["category"]] = cats.get(e["category"], 0) + 1
                for cat, count in sorted(cats.items()):
                    print(f"  {cat}: {count} entries")
        elif args.type == "rarities":
            for rarity, weight in RARITY_WEIGHTS.items():
                pct = int(weight * 100)
                print(f"  {rarity}: {pct}%")
        return

    data = load_data()
    if not data:
        print("Failed to load data. Run 'fetch' first.", file=sys.stderr)
        sys.exit(1)

    if args.command == "get":
        entry = next((e for e in data if e["id"] == args.id), None)
        if entry:
            print(format_entry(entry))
        else:
            print(f"Entry #{args.id} not found", file=sys.stderr)
            sys.exit(1)

    elif args.command == "random":
        filtered = data
        if args.category:
            filtered = [e for e in data if e["category"] == args.category.lower()]
        if args.rare:
            filtered = [e for e in filtered if e["rarity"] in ("rare", "epic", "legendary")]
        if args.epic:
            filtered = [e for e in filtered if e["rarity"] in ("epic", "legendary")]

        if not filtered:
            print("No entries match criteria", file=sys.stderr)
            sys.exit(1)

        entry = weighted_random(filtered) if not any([args.category, args.rare, args.epic]) else random.choice(filtered)
        print(format_entry(entry))


if __name__ == "__main__":
    main()
