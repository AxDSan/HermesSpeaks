<!-- markdownlint-disable MD033 MD041 -->

<div align="center">

<img src="https://img.shields.io/badge/Stop%20Slop-Drop%20Top-E74C3C?style=for-the-badge&logo=robot&logoColor=white" alt="Stop Slop Drop Top" width="400">

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-E74C3C?style=flat-square)](LICENSE)
[![CI Status](https://img.shields.io/github/actions/workflow/status/tomkabel/stop-slop-drop-top/ci.yml?branch=main&style=flat-square)](https://github.com/tomkabel/stop-slop-drop-top/actions)
[![GitHub Issues](https://img.shields.io/github/issues-raw/tomkabel/stop-slop-drop-top?style=flat-square)](https://github.com/tomkabel/stop-slop-drop-top/issues)
[![GitHub Forks](https://img.shields.io/github/forks/tomkabel/stop-slop-drop-top?style=flat-square)](https://github.com/tomkabel/stop-slop-drop-top/network)
[![GitHub Stars](https://img.shields.io/github/stars/tomkabel/stop-slop-drop-top?style=flat-square)](https://github.com/tomkabel/stop-slop-drop-top/stargazers)
[![npm Version](https://img.shields.io/npm/v/stop-slop-drop-top?color=CB3837&style=flat-square)](https://www.npmjs.com/package/stop-slop-drop-top)
[![npm Downloads](https://img.shields.io/npm/dm/stop-slop-drop-top?color=CB3837&style=flat-square)](https://www.npmjs.com/package/stop-slop-drop-top)
[![Claude Compatible](https://img.shields.io/badge/Claude%20Code-Ready-7B68EE?style=flat-square)](https://claude.com/claude-code)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-4FFFCF?style=flat-square&logo=microsoft-academic&logoColor=white)](https://modelcontextprotocol.io)
[![nodriver](https://img.shields.io/badge/nodriver-0.47.0-FF6B6B?style=flat-square)](https://github.com/ultrafunkamsterdam/nodriver)
[![Browser Automation](https://img.shields.io/badge/Stealth%20Browser-Enabled-2ECC71?style=flat-square)](https://github.com/ultrafunkamsterdam/nodriver)
[![Chat](https://img.shields.io/discord/123456789?color=5865F2&label=Discord&logo=discord&style=flat-square)](https://discord.gg/)

---

**AI Detection Testing CLI Tool with Slop Removal Capabilities**

[Features](#-features) • [Quick Start](#-quick-start) • [Commands](#-commands) • [Architecture](#-architecture) • [Skill Usage](#-skill-usage) • [API Services](#-api-services) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## Table of Contents

1. [What is Stop Slop Drop Top?](#what-is-stop-slop-drop-top)
2. [Features](#-features)
3. [Quick Start](#-quick-start)
4. [Commands](#-commands)
5. [Architecture](#-architecture)
6. [Skill Usage](#-skill-usage)
7. [API Services](#-api-services)
8. [Slop Removal Guide](#-slop-removal-guide)
9. [Scoring System](#-scoring-system)
10. [Project Structure](#-project-structure)
11. [Contributing](#-contributing)
12. [License](#-license)

---

## What is Stop Slop Drop Top?

Stop Slop Drop Top is a dual-purpose AI detection and text improvement toolkit that:

- **Detects AI-generated text** using multiple detection services (GPTZero, ZeroGPT, Winston AI, Originality.ai) plus a local heuristic detector
- **Removes AI writing patterns** ("slop") from prose using comprehensive pattern-based guidelines

AI writing has recognizable patterns—predictable phrases, formulaic structures, and telltale rhythms. This project teaches AI agents to catch and eliminate these patterns while providing robust detection capabilities through multiple services.

---

## Features

### Core Detection Features

| Feature | Description |
|---------|-------------|
| **Multi-Detector Support** | Tests text against 5 detection services simultaneously |
| **Heuristic Detection** | Local, offline pattern-based detection (no browser needed) |
| **Stealth Browser** | Uses nodriver for undetectable browser automation |
| **Integrated Scoring** | Weighted average aggregation of all detector results |
| **Rich Visual Output** | Gradient bars, sparklines, and colored verdict boxes |
| **JSON Export** | Machine-readable output for automation |

### Slop Removal Features

| Feature | Description |
|---------|-------------|
| **Phrase Detection** | 50+ banned phrases documented |
| **Structure Analysis** | Pattern-based structural flaw detection |
| **Active Voice Enforcement** | Ensures human subjects perform actions |
| **Vague Declarative Detection** | Identifies unspecific claims |
| **Rhythm Analysis** | Sentence length variation checking |
| **Before/After Examples** | Reference transformations |

### Supported Detectors

| Detector | Type | Notes |
|----------|------|-------|
| `heuristic` | Local | Pattern-based, no browser required |
| `gptzero` | API | Via stealth browser automation |
| `zerogpt` | API | Via stealth browser automation |
| `winston` | API | Winston AI detection |
| `originality` | API | Originality.ai detection |

---

## Quick Start

### Prerequisites

```bash
# Node.js 20+
node --version

# Python 3.8+ (for nodriver-based detection)
python3 --version
```

### Installation

```bash
# Clone the repository
git clone https://github.com/tomkabel/stop-slop-drop-top.git
cd stop-slop-drop-top

# Install Node.js dependencies
npm install

# Set up Python environment (optional, for browser-based detection)
python3 -m venv .venv
source .venv/bin/activate  # Linux/macOS
# or: .venv\Scripts\activate  # Windows
pip install nodriver==0.47.0
```

### Basic Usage

```bash
# Quick heuristic check (no browser needed)
node detect-ai.js --detector heuristic "Your text to check"

# Check against specific detector
node detect-ai.js --detector gptzero "Your text here"

# Run all detectors
node detect-ai.js --detectors heuristic,gptzero,zerogpt,winston,originality "text"

# Use a file as input
node detect-ai.js --file samples/ai-text.txt

# Compact output
node detect-ai.js --compact --file samples/ai-text.txt

# JSON output
node detect-ai.js --json --file samples/ai-text.txt
```

---

## Commands

### npm Scripts

| Command | Description |
|---------|-------------|
| `npm run detect` | Run all detectors |
| `npm run detect:heuristic` | Run local heuristic only |
| `npm run detect:gptzero` | Run GPTZero detector |
| `npm run detect:all` | Run all 5 detectors |
| `npm run detect:compact` | Compact output mode |
| `npm run detect:json` | JSON output mode |
| `npm run test:slop` | Test slop removal effectiveness |

### CLI Options

```bash
node detect-ai.js [options]

Options:
  --detector, -d <name>     Specify detector (heuristic, gptzero, etc.)
  --detectors <names>       Multiple detectors (comma-separated)
  --file, -f <path>        Input file path
  --text <text>            Input text directly
  --batch, -b <path>       Batch process directory
  --compact, -c            Compact output
  --json                   JSON output
  --help, -h               Show help

Examples:
  node detect-ai.js --detector heuristic "Hello world"
  node detect-ai.js --file samples/ai-text.txt --compact
  node detect-ai.js --detectors gptzero,zerogpt --json "Sample text"
```

---

## Architecture

### Detection Flow

```
User Input (CLI/File)
          │
          ▼
┌─────────────────────┐
│  detector-runner.js │  ← Orchestrates multi-detector checks
└─────────┬───────────┘
          │
    ┌─────┴─────┬──────────┬──────────┬──────────┬──────────┐
    ▼           ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐
│heuristic│ │gptzero │ │ zerogpt │ │ winston │ │originality│ │ (more) │
└────────┘ └────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘
    │           │          │          │          │            │
    └───────────┴──────────┴──────────┴──────────┴────────────┘
                          │
                          ▼
               ┌──────────────────┐
               │  api.js         │  ← Integrates scores
               │  (weighted avg) │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │  visual-output   │  ← Rich CLI display
               └──────────────────┘
                        │
                        ▼
                  CLI Output
```

### Core Modules

| Module | Purpose |
|--------|---------|
| `detect-ai.js` | CLI entry point (192 lines) |
| `lib/detector-runner.js` | Orchestrates multi-detector checks |
| `lib/api.js` | Heuristic detection logic (198 lines) |
| `lib/visual-output.js` | Rich terminal output (304 lines) |
| `lib/detectors/*.js` | Individual detector implementations |
| `test-slop-removal.js` | Slop removal testing tool |
| `SKILL.md` | Slop removal guidelines (68 lines) |

---

## Skill Usage

The **Stop Slop** skill can be used in multiple AI contexts:

### Claude Code / Claude Projects

```bash
# Add this folder as a skill
claude mcp add skill ./stop-slop

# Or upload SKILL.md and references/ to project knowledge
```

### Custom Instructions

Copy core rules from `SKILL.md` into your system prompt:

```markdown
When editing prose, apply these rules:
1. Cut filler phrases - remove throat-clearing openers
2. Break formulaic structures - avoid "not X, it's Y"
3. Use active voice - no passive constructions
4. Be specific - no vague declaratives
5. Trust readers - skip justification
```

### API Calls

Include `SKILL.md` in your system prompt. Reference files (`references/*.md`) load on demand.

---

## API Services

### Setting Up Detectors

Each detector requires its own API setup. The project uses **nodriver** (undetectable browser automation) to interact with these services:

```bash
# Install nodriver in virtual environment
pip install nodriver==0.47.0
```

### Environment Variables

Create a `.env` file for API keys:

```bash
# Optional API keys for various detectors
GPTZERO_API_KEY=your_key_here
ZEROGPT_API_KEY=your_key_here
ORIGINALITY_API_KEY=your_key_here
WINSTON_API_KEY=your_key_here
```

### Heuristic Detection (Recommended)

The local heuristic detector works without any API keys or browser:

```bash
node detect-ai.js --detector heuristic --file samples/ai-text.txt
```

It detects:
- Connector words (furthermore, moreover, consequently)
- Formal phrases (it is important to note, in conclusion)
- Business jargon (leverage, navigate, unpack)
- Passive voice patterns
- And 30+ other AI tell patterns

---

## Slop Removal Guide

The `SKILL.md` file contains comprehensive guidelines for removing AI writing patterns:

### Core Rules

1. **Cut filler phrases** - Remove throat-clearing openers, emphasis crutches, all adverbs
2. **Break formulaic structures** - Avoid binary contrasts, negative listings
3. **Use active voice** - Every sentence needs a human subject doing something
4. **Be specific** - No vague declaratives, name the specific thing
5. **Put the reader in the room** - No narrator-from-a-distance voice
6. **Vary rhythm** - Mix sentence lengths, no em dashes
7. **Trust readers** - State facts directly, skip hand-holding
8. **Cut quotables** - If it sounds like a pull-quote, rewrite it

### Quick Checks

Before delivering any prose:

- [ ] Any adverbs? Kill them.
- [ ] Any passive voice? Find the actor, make them the subject.
- [ ] Sentence starts with Wh- word? Restructure it.
- [ ] "here's what/this/that" throat-clearing? Cut to the point.
- [ ] "not X, it's Y" contrasts? State Y directly.
- [ ] Three consecutive sentences same length? Break one.
- [ ] Em-dash anywhere? Remove it.
- [ ] Vague declarative? Name the specific thing.
- [ ] Meta-joiners? Delete them.

---

## Scoring System

Rate your prose 1-10 on each dimension:

| Dimension | Question |
|-----------|----------|
| **Directness** | Statements or announcements? |
| **Rhythm** | Varied or metronomic? |
| **Trust** | Respects reader intelligence? |
| **Authenticity** | Sounds human? |
| **Density** | Anything cuttable? |

**Below 35/50:** Revise.

---

## Project Structure

```
stop-slop-drop-top/
├── detect-ai.js              # CLI entry point
├── test-slop-removal.js      # Slop removal tester
├── SKILL.md                  # Core slop removal instructions
├── AI-DETECTION.md           # Detection automation docs
├── AGENTS.md                 # Agent context for AI tools
├── CHANGELOG.md              # Version history
├── package.json              # npm configuration
├── LICENSE                   # MIT License
│
├── lib/
│   ├── detector-runner.js    # Multi-detector orchestration
│   ├── api.js                # Heuristic detection logic
│   ├── visual-output.js     # Rich terminal output
│   └── detectors/           # Individual detector modules
│
├── references/               # Slop removal references
│   ├── phrases.md           # 50+ banned phrases
│   ├── structures.md        # Structural patterns to avoid
│   └── examples.md          # Before/after transformations
│
├── samples/                  # Test text samples
│   ├── ai-text.txt          # Known AI-generated text
│   └── human-text.txt       # Known human-written text
│
├── python/                   # Python nodriver scripts
│   └── stealth_detector.py  # Stealth browser detection
│
├── stealth-browser-mcp/      # MCP server integration
│   ├── src/
│   │   └── server.py        # MCP server
│   └── README.md            # MCP documentation
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI
│
└── .kilocode/
    └── skills/              # Kilo Code skills
        ├── stop-slop/       # Slop removal skill
        ├── detector-tester/ # Detection testing skill
        ├── slop-reviewer/   # Text review skill
        └── test-writer/    # Test writing skill
```

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests if applicable
4. **Run the test suite**: `npm run test:slop`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Setup

```bash
# Install dev dependencies
npm install

# Run heuristic detection test
node detect-ai.js --detector heuristic --file samples/ai-text.txt

# Run slop removal test
npm run test:slop

# Test compact output
node detect-ai.js --compact --file samples/ai-text.txt
```

---

## Badge Reference

This project incorporates badges from multiple sources:

| Badge Type | Source | Purpose |
|------------|--------|---------|
| Framework | shields.io | Node.js, Python, MCP |
| Status | shields.io | CI, issues, license |
| Social | shields.io | Stars, forks, downloads |
| Platform | shields.io | Claude Code, nodriver |
| Custom | shields.io | "Stop Slop Drop Top" branding |

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-E74C3C?style=for-the-badge)](LICENSE)

---

## Related Projects

- [nodriver](https://github.com/ultrafunkamsterdam/nodriver) - Undetectable browser automation
- [GPTZero](https://gptzero.me/) - AI detection service
- [ZeroGPT](https://zerogpt.com/) - AI detection service
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP standard

---

<div align="center">

**Star us on GitHub** if this project helped you!

[![GitHub Stars](https://img.shields.io/github/stars/tomkabel/stop-slop-drop-top?style=for-the-badge)](https://github.com/tomkabel/stop-slop-drop-top/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/tomkabel/stop-slop-drop-top?style=for-the-badge)](https://github.com/tomkabel/stop-slop-drop-top/network)

---

Made with ❤️ by [Tom Kristian Abel](https://tomabel.ee) (Github: @tomkabel) and contributors

</div>
