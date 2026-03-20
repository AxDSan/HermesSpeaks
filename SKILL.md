---
name: hermes-speaks
description: Remove AI writing patterns ("slop") from text to make it sound human. Use when editing AI-generated content or humanizing prose.
metadata:
  trigger: Editing AI-generated text, removing slop patterns, humanizing content
  author: Hermes Agent (forked from Stop Slop Drop Top by Tom Kristian Abel)
  version: 2.0.0
---

# HermesSpeaks

Remove AI writing patterns from text to make it sound human, natural, and direct.

## Quick Usage

```bash
# Remove slop from text
hermes-speaks "Your AI-generated text here"

# From file
hermes-speaks --file essay.txt --output cleaned.txt

# Detect AI patterns
hermes-speaks --detect "Text to check"
```

## What Gets Removed

### 1. Throat-Clearing Openers
- "Here's the thing..."
- "It is important to note that..."
- "It turns out..."
- ✅ **Removed entirely**

### 2. Business Jargon → Simple Words
- ❌ "leverage" → ✅ "use"
- ❌ "utilize" → ✅ "use"
- ❌ "facilitate" → ✅ "help"
- ❌ "implement" → ✅ "do"

### 3. Empty Adverbs
- ❌ "really, just, literally, honestly, truly"
- ✅ **Removed entirely**

### 4. Formulaic Structures
- ❌ "Not just X, but also Y" → ✅ "X and Y"
- ❌ "Not only X, but Y" → ✅ Direct statement

### 5. Passive Voice
- ❌ "The ball was thrown by John"
- ✅ "John threw the ball"

### 6. Meta Commentary
- ❌ "Spoiler: ..."
- ❌ "Let me walk you through..."
- ✅ **Removed entirely**

### 7. Filler Phrases
- ❌ "At its core..."
- ❌ "In today's world..."
- ❌ "When it comes to..."
- ✅ **Removed entirely**

## Core Principles

1. **Be direct.** Cut the setup. Start with the point.
2. **Use active voice.** Subjects should do things.
3. **Be specific.** Name the thing, don't vaguely gesture at it.
4. **Use simple words.** "Use" beats "utilize" or "leverage."
5. **Trust readers.** Skip softening and hand-holding.
6. **Vary rhythm.** Mix sentence lengths. Two items beat three.
7. **No em-dashes.** Use periods or commas.

## Example Transformations

| AI Slop | Human |
|---------|-------|
| "It is important to note that we are leveraging cutting-edge technology" | "We're using modern technology" |
| "This truly revolutionary approach facilitates optimal outcomes" | "This approach works better" |
| "Furthermore, it should be noted that" | [Remove entirely] |
| "Not just faster, but also more efficient" | "Faster and more efficient" |

## Installation

```bash
git clone https://github.com/AxDSan/HermesSpeaks.git
cd HermesSpeaks
npm install
```

## Programmatic Usage

```javascript
const { transform } = require('hermes-speaks/lib/slop-transform');

const cleaned = transform(`
  It is important to note that we are leveraging 
  cutting-edge technology to facilitate success.
`);

// Result: "We're using modern technology to help success."
```

## Detection Mode

Check if text contains AI patterns without removing them:

```javascript
const { detect } = require('hermes-speaks/lib/ai-detector');

const result = await detect("Your text here");
console.log(result.aggregate.score); // 0-100 AI probability
```

## Memory Optimized

HermesSpeaks runs in <200MB RAM:
- Heuristic detection: ~10MB
- ONNX model (optional): ~150MB peak
- No browser automation
- No API calls

Perfect for Fly.io free tier and resource-constrained environments.

## License

MIT - See LICENSE file
