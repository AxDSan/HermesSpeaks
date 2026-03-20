---
name: hermes-speaks
description: Remove AI slop patterns from text to make it sound human
---

# Project Context: HermesSpeaks

This is an AI slop removal tool that:
- Removes AI writing patterns ("slop") from text to make it sound human
- Provides local heuristic detection for identifying AI-generated text
- Includes a lightweight CLI optimized for <500MB RAM (Fly.io compatible)

## Key Files

| File | Description |
|------|-------------|
| `detect-ai.js` | Main CLI entry point |
| `lib/detector-runner.js` | Orchestrates multi-detector checks |
| `lib/api.js` | Heuristic detection logic |
| `lib/visual-output.js` | Rich CLI output with colors and formatting |
| `lib/slop-transform.js` | AI writing pattern removal transforms |
| `python/detector.py` | Browser-based detectors (GPTZero, ZeroGPT, Winston, Originality) |
| `python/stealth_detector.py` | StealthAIDetector with nodriver browser automation |
| `test-slop-removal.js` | Slop removal testing tool |
| `SKILL.md` | Slop removal guidelines (this project's core skill) |
| `AI-DETECTION.md` | AI detection automation documentation |

## Tech Stack

- **Runtime**: Node.js with CommonJS modules
- **Python**: Browser automation with nodriver
- **CLI**: npm scripts

## Python Detector Implementations

This project includes two Python detector implementations:

- **`python/detector.py`**: Browser-based detectors that interact with external AI detection services (GPTZero, ZeroGPT, Winston, Originality) using browser automation. Use when you need to check text against these online services.

- **`python/stealth_detector.py`**: StealthAIDetector with enhanced nodriver browser automation for more robust detection. Use when you need more reliable browser-based detection with stealth capabilities.

Both Python implementations use nodriver for browser automation and require the Python virtual environment to be activated (via `source .venv/bin/activate`).

## Kilo Code Guidelines

1. **Prioritize the `heuristic` detector** for quick local checks (no browser needed)
2. **Maintain backward compatibility** with existing CLI interface when adding features
3. **Follow SKILL.md patterns** for any text processing/AI writing guidelines
4. **Ensure proper nodriver cleanup** for browser-based detectors
5. **Test changes with `npm run detect:heuristic`** before committing
6. **Use `kilo agent list`** to see available agents

## Available Commands

```bash
# Run detection
npm run detect           # Run all detectors (default)
npm run detect:all       # Run all detectors explicitly
npm run detect:heuristic # Run local heuristic only (fastest, no browser)
npm run detect:gptzero  # Run GPTZero detector
npm run detect:compact  # Run with compact output
npm run detect:json     # Run with JSON output

# Test slop removal
npm run test:slop

# Python detector
npm run python:detector # Run the Python stealth detector

# Direct node execution
node detect-ai.js --detector heuristic --file samples/ai-text.txt
```

## Sample Files

- `samples/human-text.txt` - Known human-written text
- `samples/ai-text.txt` - Known AI-generated text

## Detection Flow

```
User Input (CLI/file)
       │
       ▼
┌──────────────────┐
│ detector-runner  │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌─────────────────────────────────────┐
│heuristic│ │         Python (nodriver)          │
└────────┘ │  ┌────────┐ ┌────────┐ ┌─────────┐ │
    │      │  │gptzero│ │ zerogpt │ │originality│ │
    │      │  └────────┘ └────────┘ └─────────┘ │
    │      │         │          │          │    │
    │      │  ┌──────┴──────────┴──────────┴────┤
    │      │  │  Browser Automation (Python)    │
    │      │  └─────────────────────────────────┘
    │      │                │
    └──────┴────────────────┘
                        ▼
               ┌────────────────┐
               │ Aggregate      │
               │ Results        │
               └────────────────┘
                        │
                        ▼
               CLI Output / JSON
```

- **Heuristic detector**: Runs locally in Node.js - fast, no browser needed
- **Browser-based detectors**: Run in Python using nodriver - slower but checks real online services