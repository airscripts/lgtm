---
name: lgtm-openclaw
version: "1.0.0"
description: >
  Generate random alternative meanings for LGTM from the command line.
  Fetch entries from the official lgtm.airscript.it dataset with weighted rarity selection.
  Perfect for code reviews, CLI tools, and automation.
author: Clawdeeo (@clawdeeo)
source_url: https://github.com/airscripts/lgtm
---

# LGTM OpenClaw Skill

Generate creative alternative meanings for "Looks Good To Me" directly from your terminal.

## Features

- HTTP fetching of full dataset (260+ entries)
- Weighted random selection by rarity (Common 55%, Rare 27%, Epic 14%, Legendary 5%)
- Filter by category or rarity tier
- Local caching for offline use
- Perfect for CI/CD pipelines and git hooks

## Installation

```bash
cp -r openclaw-skill ~/.openclaw/skills/lgtm
```

## Commands

| Command | Description |
|---------|-------------|
| `python3 scripts/lgtm.py random` | Random entry (weighted) |
| `python3 scripts/lgtm.py random --category nerd` | Random from category |
| `python3 scripts/lgtm.py random --epic` | Random epic or legendary |
| `python3 scripts/lgtm.py get 42` | Get specific entry by ID |
| `python3 scripts/lgtm.py list categories` | Show all categories |
| `python3 scripts/lgtm.py fetch` | Refresh cache from source |

## Categories

- chaotic, corporate, existential, funny, mateo, nerd, sarcastic, wholesome

## Data Source

Entries sourced from lgtm.airscript.it by @airscript

## Example Output

LGTM #191 [COMMON]
"Low Grade, Totally Merged"
Category: sarcastic
Description: Not your best work. You know it. They know it. Merge anyway.
Tags: sarcasm, quality, merge

## License

MIT - Same as the main LGTM project.
