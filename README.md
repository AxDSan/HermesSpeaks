# HermesSpeaks ✨

> **Remove AI slop patterns from text to make it sound human**
> 
> Built for [Hermes Agent](https://github.com/NousResearch/hermes-agent) • Works with any text • Zero setup

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![CLI](https://img.shields.io/badge/CLI-Ready-blue?style=flat-square)](https://github.com/AxDSan/HermesSpeaks)

---

## What is HermesSpeaks?

HermesSpeaks removes **AI writing patterns** ("slop") from text to make it sound more human, natural, and direct.

### The Problem

AI-generated text is full of repetitive patterns:
- **"It is important to note that..."**
- **"Leveraging cutting-edge technology..."**
- **"In today's world..."**
- **"First and foremost..."**

These phrases make writing sound robotic, corporate, and inauthentic.

### The Solution

HermesSpeaks strips these patterns and replaces them with simpler, more direct language:

```
Input:  "It is important to note that we are leveraging 
         cutting-edge technology to facilitate optimal outcomes."

Output: "We're using modern technology for better results."
```

---

## Quick Start

### Install

```bash
npm install -g hermes-speaks
# or
git clone https://github.com/AxDSan/HermesSpeaks.git
cd HermesSpeaks && npm install
```

### Use It

```bash
# Clean text directly
hermes-speaks "It is worth noting that this groundbreaking technology truly revolutionizes the landscape."

# From file
hermes-speaks --file essay.txt --output cleaned.txt

# Pipe text
echo "In today's world, we must leverage AI to unlock potential." | hermes-speaks

# Detect AI patterns (without removing)
hermes-speaks --detect "Your text here"

# Show before/after slop scores
hermes-speaks --score "Your AI-generated text here"
```

### Example Output

```
╔════════════════════════════════════════╗
║     HermesSpeaks - Slop Remover     ║
╚════════════════════════════════════════╝

  📈 Metrics:
     Original: 156 chars (28 words)
     Cleaned:  89 chars (15 words)
     Removed:  42.9% bloat (13 words)

  ✨ Cleaned Text:
  ────────────────────────────────────────
  This technology changes the field.
  ────────────────────────────────────────
```

---

## What Gets Removed

### 1. Throat-Clearing Openers
- ❌ "Here's the thing..."
- ❌ "It turns out..."
- ❌ "Let me be clear..."
- ✅ **Removed entirely**

### 2. Filler Phrases
- ❌ "At its core..."
- ❌ "In today's world..."
- ❌ "When it comes to..."
- ✅ **Removed entirely**

### 3. Business Jargon
- ❌ "leverage" → ✅ "use"
- ❌ "utilize" → ✅ "use"
- ❌ "facilitate" → ✅ "help"
- ❌ "implement" → ✅ "do"

### 4. Empty Adverbs
- ❌ "really, just, literally, genuinely, honestly"
- ✅ **Removed entirely**

### 5. Binary Contrasts
- ❌ "Not just X, but also Y"
- ❌ "Not only X, but Y"
- ✅ Simplified to direct statements

### 6. Meta Commentary
- ❌ "Spoiler: ..."
- ❌ "Hint: ..."
- ❌ "Let me walk you through..."
- ✅ **Removed entirely**

### 7. Passive Voice
- ❌ "The ball was thrown by John"
- ✅ "John threw the ball"

### 8. And More...
- Vague attributions ("experts say...")
- Promotional phrases ("groundbreaking, renowned")
- Superficial analysis words ("highlighting, underscoring")
- Knowledge cutoffs ("As of my last update...")
- Curly quotes ("" → "")
- Excessive em-dashes

---

## Usage

```
hermes-speaks [text] [options]

Options:
  -f, --file <path>      Read from file
  -o, --output <path>    Write to file (default: stdout)
  -d, --detect           Detect AI patterns (don't remove)
  --score                Show slop scores before/after
  -j, --json             JSON output (for piping)
  --no-color             Disable colors
  -h, --help             Display help

Examples:
  hermes-speaks "Your AI text here"
  hermes-speaks --file input.txt --output output.txt
  cat essay.txt | hermes-speaks > cleaned.txt
  hermes-speaks --detect "Check this text"
```

---

## Programmatic Usage

```javascript
const { transform } = require('hermes-speaks/lib/slop-transform');

const cleaned = transform(`
  It is important to note that we are leveraging 
  cutting-edge AI to unlock unprecedented potential.
`);

console.log(cleaned);
// Output: "We're using AI for new possibilities."
```

---

## Detection Mode (Optional)

Check if text contains AI patterns without removing them:

```bash
hermes-speaks --detect "Your text here"

# Output:
# 🤖 Verdict: LIKELY-AI
# 📊 Score: 87/100
# 🎯 Confidence: high
```

---

## Why HermesSpeaks?

| Feature | HermesSpeaks | Other Tools |
|---------|--------------|-------------|
| **Speed** | Instant (<10ms) | Slow (API calls) |
| **Privacy** | 100% local | Sends text to cloud |
| **Cost** | Free | API fees |
| **Setup** | None | Complex |
| **Focus** | Slop removal | Just detection |

---

## How It Works

```
Input Text
    │
    ├──→ Remove throat-clearing openers
    ├──→ Replace business jargon
    ├──→ Remove empty adverbs
    ├──→ Fix binary contrasts
    ├──→ Convert passive → active voice
    ├──→ Remove meta commentary
    ├──→ Remove vague attributions
    └──→ Clean up spacing
    │
    ▼
Clean, Human Text
```

---

## Contributing

This project is a fork of [Stop Slop Drop Top](https://github.com/tomkabel/stop-slop-drop-top) focused specifically on **text transformation** rather than detection.

---

## License

MIT License - see [LICENSE](LICENSE)

---

## Acknowledgments

- Original patterns from [tomkabel/stop-slop-drop-top](https://github.com/tomkabel/stop-slop-drop-top)
- Built for [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
