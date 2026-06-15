"""HermesSpeaks plugin tools — schemas and handlers."""

import json
import subprocess
import os
from pathlib import Path

from . import llm_helper

PROJECT_DIR = Path(__file__).resolve().parent.parent
CLI_SCRIPT = str(PROJECT_DIR / "hermes-speaks.js")

# Real CLI lives in the HermesSpeaks project
_REAL_CLI = "/root/.hermes/projects/HermesSpeaks/hermes-speaks.js"
if not Path(CLI_SCRIPT).exists() and Path(_REAL_CLI).exists():
    CLI_SCRIPT = _REAL_CLI


def _run_hermes_speaks(args: list[str]) -> dict:
    """Run the HermesSpeaks Node.js CLI and return parsed JSON output."""
    node_bin = os.environ.get("HERMES_NODE_BIN", "node")
    # If 'node' isn't in PATH but we know where it lives, use that
    if node_bin == "node":
        for candidate in ["/root/.local/bin/node", "/usr/local/bin/node", "/usr/bin/node"]:
            if Path(candidate).exists():
                node_bin = candidate
                break
    cmd = [node_bin, CLI_SCRIPT, "--json"] + args
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
            cwd=str(PROJECT_DIR),
        )
        if result.returncode != 0:
            return {"error": result.stderr.strip() or "Unknown error", "exit_code": result.returncode}
        return json.loads(result.stdout)
    except subprocess.TimeoutExpired:
        return {"error": "HermesSpeaks timed out after 30s"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON output from HermesSpeaks", "raw_stdout": result.stdout[:500] if result else ""}
    except Exception as e:
        return {"error": str(e)}


# ─────────────────────────────────────────────
# Tool 1: hermes_speaks_deslop (heuristic regex)
# ─────────────────────────────────────────────

DESLOP_SCHEMA = {
    "name": "hermes_speaks_deslop",
    "description": "Remove AI slop patterns from text to make it sound human. Strips phrases like 'it is important to note that', 'leveraging cutting-edge technology', 'in today's world', and other AI-isms. Use this when your response sounds too robotic or corporate, or when the user asks you to sound more human.",
    "parameters": {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "The text to de-slop (remove AI writing patterns from)"
            }
        },
        "required": ["text"]
    }
}


def hermes_speaks_deslop(args: dict, **kwargs) -> str:
    """Remove AI slop patterns from text using fast regex heuristics."""
    text = args.get("text", "")
    if not text.strip():
        return json.dumps({"error": "No text provided"})
    result = _run_hermes_speaks([text])
    return json.dumps(result)


# ─────────────────────────────────────────────
# Tool 2: hermes_speaks_detect (heuristic + LLM)
# ─────────────────────────────────────────────

DETECT_SCHEMA = {
    "name": "hermes_speaks_detect",
    "description": "Detect AI writing patterns (slop) in text. Returns a list of detected patterns and a score. Uses Hermes' own LLM provider for smart detection. Use this to check if text sounds AI-generated before sending it, or to audit your own output.",
    "parameters": {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "The text to analyze for AI writing patterns"
            }
        },
        "required": ["text"]
    }
}


def hermes_speaks_detect(args: dict, **kwargs) -> str:
    """Detect AI slop patterns in text using LLM-powered analysis."""
    text = args.get("text", "")
    if not text.strip():
        return json.dumps({"error": "No text provided"})
    result = llm_helper.llm_detect(text)
    return json.dumps(result)


# ─────────────────────────────────────────────
# Tool 3: hermes_speaks_rewrite (LLM-powered)
# ─────────────────────────────────────────────

REWRITE_SCHEMA = {
    "name": "hermes_speaks_rewrite",
    "description": "Rewrite text to sound more human using Hermes' LLM provider. Goes beyond simple pattern stripping — understands context and rewrites sentences naturally. Use when the regex-based deslop isn't enough and you want a full rewrite.",
    "parameters": {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "The text to rewrite"
            },
            "aggressiveness": {
                "type": "string",
                "enum": ["light", "medium", "aggressive"],
                "description": "How aggressively to clean up AI patterns. 'light' = minimal changes, 'medium' = thorough cleanup, 'aggressive' = punchy rewrite."
            }
        },
        "required": ["text"]
    }
}


def hermes_speaks_rewrite(args: dict, **kwargs) -> str:
    """Rewrite text to sound human using LLM."""
    text = args.get("text", "")
    aggressiveness = args.get("aggressiveness", "medium")
    if not text.strip():
        return json.dumps({"error": "No text provided"})
    result = llm_helper.llm_rewrite(text, aggressiveness)
    return json.dumps(result)


# ─────────────────────────────────────────────
# Tool 4: hermes_speaks_heuristic_detect (pure local, no LLM cost)
# ─────────────────────────────────────────────

HEURISTIC_DETECT_SCHEMA = {
    "name": "hermes_speaks_heuristic_detect",
    "description": "Quick local AI pattern detection using regex heuristics. No LLM cost, no network. Use for rapid checks when you don't need deep analysis.",
    "parameters": {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "The text to analyze for AI writing patterns"
            }
        },
        "required": ["text"]
    }
}


def hermes_speaks_heuristic_detect(args: dict, **kwargs) -> str:
    """Quick local detection using regex heuristics (no LLM)."""
    text = args.get("text", "")
    if not text.strip():
        return json.dumps({"error": "No text provided"})
    result = _run_hermes_speaks(["--detect", "--heuristic-only", text])
    return json.dumps(result)
