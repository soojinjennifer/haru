#!/usr/bin/env python3
"""HARU write-path guard — PreToolUse hook for Write | Edit | NotebookEdit.

Stage 0 decision #26 (docs/decisions/stage-0-approvals.md):
- apps/api/** and supabase/** are denied for everyone (Frontend-only scope).
- apps/** and packages/** are denied unless the call comes from the
  `development-agent` subagent (hook input field `agent_type`).
Paths outside the project directory are not checked.
"""
import json
import os
import sys


def deny(reason: str) -> int:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    return 0


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0

    tool_input = data.get("tool_input") or {}
    target = tool_input.get("file_path") or tool_input.get("notebook_path")
    if not target:
        return 0

    project = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or os.getcwd()
    root = os.path.realpath(project)
    absolute = os.path.realpath(target if os.path.isabs(target) else os.path.join(root, target))
    rel = os.path.relpath(absolute, root).replace(os.sep, "/")
    if rel == ".." or rel.startswith("../"):
        return 0

    def under(prefix: str) -> bool:
        return rel == prefix or rel.startswith(prefix + "/")

    if under("apps/api") or under("supabase"):
        return deny(
            f"HARU Frontend-only scope: '{rel}' is under apps/api/** or supabase/**, "
            "which must not be created (CLAUDE.md Development Scope, Stage 0 #26)."
        )

    agent = data.get("agent_type")
    if (under("apps") or under("packages")) and agent != "development-agent":
        who = agent or "main session"
        return deny(
            f"Only the development-agent subagent may write apps/** and packages/** "
            f"(this call: {who}, path: '{rel}'). Invoke it with subagent_type "
            "'development-agent' (.claude/rules/workflow.md)."
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
