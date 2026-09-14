#!/usr/bin/env python3
"""HARU scope check — Stop / SubagentStop hook.

Warns (non-blocking) when backend directories that are out of the
Frontend-only scope exist, e.g. created through Bash, which the
PreToolUse write guard cannot intercept. Stage 0 decision #26.
"""
import json
import os
import sys

FORBIDDEN = ("apps/api", "supabase")


def main() -> int:
    try:
        json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        pass

    root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    found = [p for p in FORBIDDEN if os.path.exists(os.path.join(root, p))]
    if found:
        print(json.dumps({
            "systemMessage": (
                "HARU scope warning: " + ", ".join(found) + " exists. Backend code is out of the "
                "Frontend-only scope (CLAUDE.md). Remove it unless the user explicitly approved it."
            )
        }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
