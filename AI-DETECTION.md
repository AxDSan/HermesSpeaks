# AI Detection Automation

This module provides tools to test text against AI detection services using **nodriver** (stealth browser automation), with **integrated scoring** and **rich visual output**.

## Setup

### Python Environment

```bash
cd /path/to/stop-slop-drop-top
python3 -m venv .venv
source .venv/bin/activate

# Install nodriver (stealth browser)
pip install nodriver==0.47.0
pip install fastmcp pydantic python-dotenv
```

### Node.js Dependencies

```bash
npm install
```

## Quick Start

### Check with local heuristic (no browser needed)

```bash
# Quick check using local pattern detection
node detect-ai.js --detector heuristic "Your text here"

# Using file
node detect-ai.js --detector heuristic --file samples/ai-text.txt

# Compact output
node detect-ai.js --compact --file samples/ai-text.txt
```

### Check with stealth browser (nodriver)

```bash
# Single detector
node detect-ai.js --detector gptzero "Your text"

# Multiple detectors
node detect-ai.js --detectors gptzero,zerogpt,winston,originality "text"
```

## Usage Examples

### CLI Usage

```bash
# Basic check with heuristic
node detect-ai.js "This is a sample text to check"

# Using specific detector
node detect-ai.js --detector gptzero --file essay.txt

# Multiple detectors
node detect-ai.js --detectors gptzero,zerogpt --file samples/ai-text.txt

# Compact output (single line)
node detect-ai.js --compact --file samples/ai-text.txt

# JSON output
node detect-ai.js --json --file samples/ai-text.txt

# Batch processing
node detect-ai.js --batch ./samples/
```

### Programmatic Usage

```javascript
const { runDetection, printResults, quickCheck, exportJSON } = require('./lib/detector-runner');

// Quick local check (synchronous)
const result = quickCheck('Your text here');
console.log('AI %:', result.results.aiPercentage);

// Full detection with integrated scoring
async function check() {
  const results = await runDetection('Your text', ['heuristic', 'gptzero']);
  printResults(results);
  
  // Get integrated score
  console.log('Integrated:', results.integrated.integratedPercent);
  console.log('Confidence:', results.integrated.confidence);
}
check();

// Export as JSON
console.log(exportJSON(results));
```

## Visual Output

The tool provides rich visual feedback including:

- **Progress bar** with gradient coloring (green → yellow → red)
- **Detector breakdown** showing scores from each detector
- **Sparkline chart** for detection trends
- **Confidence indicator**
- **Recommendation** based on score

### Sample Output

```
 ╔══════════════════════════════════════════════════════════╗ 
 ║           🤖 AI CONTENT DETECTION REPORT               ║ 
 ╚══════════════════════════════════════════════════════════╝ 

Text Preview:
  "Artificial intelligence has fundamentally transformed..."
  Length: 704 characters

┌─────────────────────────────────────────────────────┐
│  OVERALL ASSESSMENT                            │
├─────────────────────────────────────────────────────┤
│  ████████████████████████░░░░░░  80% AI            │
│  Confidence: 32%                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│    🟠 MODERATE AI DETECTED                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  DETECTOR BREAKDOWN                              │
├─────────────────────────────────────────────────────┤
│  🔴 heuristic      ████████████████████░░░░░ 80%          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  RECOMMENDATION                                   │
├─────────────────────────────────────────────────────┤
│  🟠 Moderate AI indicators detected.               │
└─────────────────────────────────────────────────────┘
```

## Integrated Scoring

The system combines results from multiple detectors using weighted averaging:

```javascript
const { integrateScores } = require('./lib/api');

const result = integrateScores({
  heuristic: { results: { aiPercentage: 73 } },
  gptzero: { results: { aiPercentage: 85 } },
  zerogpt: { results: { aiPercentage: 65 } }
}, {
  heuristic: 0.2,
  gptzero: 0.3,
  zerogpt: 0.25,
  // ... weights normalized
});

// Returns: { integratedPercent: 75, confidence: 85, ... }
```

## Available Detectors

| Detector | Type | Description |
|----------|------|-------------|
| `heuristic` | Local | Pattern-based check (fast, no browser) |
| `gptzero` | nodriver | GPTZero.me stealth browser |
| `zerogpt` | nodriver | ZeroGPT.com stealth browser |
| `winston` | nodriver | Winston AI stealth browser |
| `originality` | nodriver | Originality.ai stealth browser |

## Testing Slop Removal

```bash
# Test transformation effectiveness
node test-slop-removal.js --text "AI text..." --transform ./my-transform.js

# Test with input file
node test-slop-removal.js --input samples/ai-text.txt --transform ./humanizer.js

# JSON output
node test-slop-removal.js --input samples/ai-text.txt --transform ./humanizer.js --json
```

## Direct Python Usage

```bash
# Using nodriver directly
source .venv/bin/activate
python python/stealth_detector.py --text "Your text" --detector gptzero

# Multiple detectors
python python/stealth_detector.py --text "text" --detector gptzero --detector zerogpt
```

## How It Works

1. **Heuristic detector** (local) - Pattern matching without browser
2. **nodriver detectors** - Stealth browser automation that bypasses bot detection
3. **Integrated scoring** - Weighted average of all detector results

nodriver (via stealth-browser-mcp):
- Successor to undetected-chromedriver
- No webdriver/Selenium dependency
- Automatic profile cleanup
- Bot detection evasion

## Notes

- nodriver requires Chrome/Chromium browser installed
- Browser-based detectors may be slower but more accurate
- Version 0.47.0 recommended (latest has encoding issues)
- Use `--compact` for CI/CD integration
- Use `--json` for programmatic output
