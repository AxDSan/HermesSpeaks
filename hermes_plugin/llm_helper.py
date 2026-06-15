"""LLM helper for HermesSpeaks — calls Hermes' own provider for analysis and rewriting.

Reads model config from Hermes config.yaml so it uses the same provider the agent runs on.
Falls back to a lightweight auxiliary endpoint if configured for cheaper inference.
"""

import json
import os
import urllib.request
import urllib.error
from pathlib import Path


def _load_hermes_config():
    """Load the main Hermes config to get provider details."""
    config_path = Path(os.environ.get("HERMES_CONFIG", "/root/.hermes/config.yaml"))
    if not config_path.exists():
        return None

    import yaml
    with open(config_path) as f:
        return yaml.safe_load(f)


def _get_llm_params():
    """Get LLM endpoint params from Hermes config or env overrides.

    Priority: env vars > config.yaml > hardcoded fallback.
    Returns (base_url, api_key, model).
    """
    base_url = os.environ.get("HERMES_LLM_BASE_URL", "")
    api_key = os.environ.get("HERMES_LLM_API_KEY", "")
    model = os.environ.get("HERMES_LLM_MODEL", "")

    if base_url and api_key and model:
        return (base_url, api_key, model)

    config = _load_hermes_config()
    if config and "model" in config:
        m = config["model"]
        if not base_url:
            base_url = m.get("base_url", "")
        if not api_key:
            api_key = m.get("api_key", "")
        if not model:
            model = m.get("default", "deepseek/deepseek-v4-flash")

    # Fallback
    if not base_url:
        base_url = "https://api.commandcode.ai/provider/v1"
    if not api_key:
        api_key = "user_4ATNTKHomtHi84VsAHwKbULvHXkEvMbeRZyom28SDQk5VcJU58URh94Ca7wdNu2xAZSb5jwkSitq262wiP7dpU89"
    if not model:
        model = "deepseek/deepseek-v4-flash"

    return (base_url, api_key, model)


def _call_llm(system_prompt: str, user_text: str) -> dict:
    """Generic OpenAI-compatible chat completion call via subprocess (curl for reliability)."""
    base_url, api_key, model = _get_llm_params()

    # Build the API URL
    api_url = base_url.rstrip("/")
    if not api_url.endswith("/v1") and not api_url.endswith("/v1/"):
        api_url += "/v1"
    api_url += "/chat/completions"

    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_text},
        ],
        "temperature": 0.3,
        "max_tokens": 2048,
    })

    import subprocess as sp
    try:
        proc = sp.run(
            ["curl", "-s", api_url,
             "-H", "Content-Type: application/json",
             "-H", f"Authorization: Bearer {api_key}",
             "-d", payload,
             "--max-time", "60"],
            capture_output=True, text=True, timeout=65
        )
        if proc.returncode != 0:
            return {"success": False, "error": f"curl exit {proc.returncode}: {proc.stderr[:200]}"}

        result = json.loads(proc.stdout)
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        return {"success": True, "content": content, "raw": result}
    except json.JSONDecodeError:
        return {"success": False, "error": f"Invalid JSON: {proc.stdout[:200]}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def llm_detect(text: str) -> dict:
    """Use the LLM provider to detect AI writing patterns in text.

    Returns structured result with score, patterns, and suggestions.
    """
    system_prompt = (
        "You are an AI writing pattern detector. Analyze the user's text for "
        "signs of AI-generated writing. Return a JSON object ONLY with these fields:\n"
        "- score: integer 0-100 (how AI-like the text is)\n"
        "- confidence: 'high' | 'medium' | 'low'\n"
        "- patterns: array of objects {pattern, severity, examples} describing "
        "each AI tell found\n"
        "- verdict: 'likely-ai' | 'uncertain' | 'likely-human'\n\n"
        "Look for: throat-clearing openers, emphasis crutches, business jargon, "
        "adverbs, binary contrasts, negative listings, dramatic fragmentation, "
        "rhetorical setups, false agency, narrator-from-a-distance, passive voice, "
        "meta-commentary, performative emphasis, telling-not-showing, "
        "overly-perfect structure, formulaic transitions, em-dash overuse, "
        "vague declaratives, lazy extremes (every/always/never), "
        "Wh- sentence starters, knowledge-cutoff disclaimers.\n\n"
        "Respond with valid JSON only. No markdown, no explanation."
    )

    # Truncate very long text
    input_text = text[:8000] if len(text) > 8000 else text
    result = _call_llm(system_prompt, input_text)

    if not result.get("success"):
        return {"error": result.get("error", "LLM call failed"), "score": 50, "verdict": "uncertain"}

    content = result["content"].strip()
    # Strip code fences if present
    if content.startswith("```"):
        content = content.split("\n", 1)[-1]
        content = content.rsplit("```", 1)[0].strip()

    try:
        parsed = json.loads(content)
        return parsed
    except json.JSONDecodeError:
        # Try to extract JSON from the response
        import re
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        return {
            "score": 50,
            "confidence": "low",
            "verdict": "uncertain",
            "error": "Could not parse LLM response",
            "raw": content[:500],
        }


def llm_rewrite(text: str, aggressiveness: str = "medium") -> dict:
    """Use the LLM provider to rewrite text to sound more human.

    Args:
        text: The text to rewrite.
        aggressiveness: 'light' | 'medium' | 'aggressive' — how much to clean up.

    Returns:
        Dict with 'original', 'rewritten', and optional 'changes' array.
    """
    instructions = {
        "light": (
            "Gently clean up the most obvious AI patterns. Fix throat-clearing openers, "
            "replace jargon, remove unnecessary adverbs. Preserve the author's voice. "
            "Make minimal changes."
        ),
        "medium": (
            "Rewrite this text to sound human-written. Remove throat-clearing openers, "
            "emphasis crutches, business jargon, all adverbs, binary contrasts, "
            "negative listings, dramatic fragmentation, rhetorical setups, "
            "false agency, narrator-from-a-distance voice, passive voice, "
            "meta-commentary, performative emphasis, telling-not-showing patterns, "
            "vague declaratives, and lazy extremes. Replace em-dashes with commas or periods. "
            "Fix Wh- sentence starters. Use active voice. Be specific. "
            "Vary sentence rhythm. Preserve all facts, data, and meaning."
        ),
        "aggressive": (
            "Aggressively rewrite this text to sound like a sharp human writer. "
            "Cut all AI tells: openers, crutches, jargon, adverbs, contrasts, "
            "fragmentation, false agency, passive voice, meta-commentary, "
            "vague statements, lazy extremes. Strip every word that doesn't carry meaning. "
            "Shorten sentences. Make every line count. "
            "The result should be punchy, direct, human."
        ),
    }

    system_prompt = (
        f"You are a professional editor. {instructions.get(aggressiveness, instructions['medium'])}\n\n"
        "Return ONLY a JSON object with these fields:\n"
        "- rewritten: the edited text\n"
        "- changes: brief array of what was changed (e.g. ['removed throat-clearing', 'replaced jargon'])"
    )

    input_text = text[:8000] if len(text) > 8000 else text
    result = _call_llm(system_prompt, input_text)

    if not result.get("success"):
        return {"error": result.get("error", "LLM call failed"), "original": text, "rewritten": text}

    content = result["content"].strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[-1]
        content = content.rsplit("```", 1)[0].strip()

    try:
        parsed = json.loads(content)
        parsed["original"] = text
        return parsed
    except json.JSONDecodeError:
        import re
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
                parsed["original"] = text
                return parsed
            except json.JSONDecodeError:
                pass
        # If JSON parsing fails, return the raw LLM output as the rewritten text
        return {
            "original": text,
            "rewritten": content,
            "changes": ["LLM returned unstructured response"],
            "warning": "Could not parse structured output",
        }
