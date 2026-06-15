"""
HermesSpeaks Plugin for Hermes Agent

Removes AI slop patterns from text to make it sound human.
Three modes:
  1. Heuristic regex (fast, local, free)
  2. LLM-powered detect (smart, uses Hermes' own provider)
  3. LLM-powered rewrite (contextual, goes beyond pattern stripping)

Zero API keys other than what Hermes already uses. Zero cloud infra.
"""


def register(ctx):
    """Register HermesSpeaks tools with Hermes."""
    from . import tools

    # Tool 1: Fast heuristic deslop
    ctx.register_tool(
        name="hermes_speaks_deslop",
        toolset="hermes-speaks",
        schema=tools.DESLOP_SCHEMA,
        handler=tools.hermes_speaks_deslop
    )

    # Tool 2: LLM-powered detect (replaces the broken ONNX model)
    ctx.register_tool(
        name="hermes_speaks_detect",
        toolset="hermes-speaks",
        schema=tools.DETECT_SCHEMA,
        handler=tools.hermes_speaks_detect
    )

    # Tool 3: LLM-powered rewrite
    ctx.register_tool(
        name="hermes_speaks_rewrite",
        toolset="hermes-speaks",
        schema=tools.REWRITE_SCHEMA,
        handler=tools.hermes_speaks_rewrite
    )

    # Tool 4: Fast local heuristic-only detect (no LLM cost)
    ctx.register_tool(
        name="hermes_speaks_heuristic_detect",
        toolset="hermes-speaks",
        schema=tools.HEURISTIC_DETECT_SCHEMA,
        handler=tools.hermes_speaks_heuristic_detect
    )

    return {
        "status": "registered",
        "plugin": "hermes-speaks",
        "tools": 4,
        "note": "detect and rewrite use Hermes' own LLM provider — no extra keys needed"
    }
