---
name: hermes-speaks
description: Remove AI slop patterns from text to make it sound human, natural, and direct. Use when editing AI-generated content, humanizing prose, or cleaning up robotic writing.
triggers:
  - remove slop
  - clean text
  - humanize
  - de-slop
  - make it human
  - remove AI patterns
  - fix AI writing
  - hermes-speaks
---

# HermesSpeaks Skill

## When to Use

Use this skill when the user wants to:
- Remove AI writing patterns ("slop") from text
- Make AI-generated content sound more human
- Clean up robotic/corporate language
- Transform formal/AI text into natural prose

## How to Use

### Option 1: CLI (for files or long text)

```bash
# Clean text directly
node ~/.hermes/projects/HermesSpeaks/hermes-speaks.js "Your AI text here"

# From file
node ~/.hermes/projects/HermesSpeaks/hermes-speaks.js --file input.txt --output output.txt

# Get JSON for processing
node ~/.hermes/projects/HermesSpeaks/hermes-speaks.js --json "Text to clean"
```

### Option 2: Programmatic (in code)

```javascript
const { transform } = require('~/.hermes/projects/HermesSpeaks/lib/slop-transform');

const cleaned = transform(`
  It is important to note that we are leveraging 
  cutting-edge technology to facilitate success.
`);

// Result: "We're using modern technology to help success."
```

## What Gets Removed

| Pattern | Example | Result |
|---------|---------|--------|
| Throat-clearing | "Here's the thing..." | Removed |
| "It is important to note" | "It is important to note that..." | Removed |
| Business jargon | "leverage" | "use" |
| Empty adverbs | "really, just, actually" | Removed |
| Filler phrases | "At its core..." | Removed |
| Passive voice | "was thrown by" | "threw" |

## CLI Options

```
-f, --file <path>      Read from file
-o, --output <path>    Write to file
-d, --detect           Detect AI (don't remove)
--score                Show before/after scores
-j, --json             JSON output
--no-color             Disable colors
```

## Installation

```bash
cd ~/.hermes/projects/HermesSpeaks
npm install
```

## Source

https://github.com/AxDSan/HermesSpeaks
