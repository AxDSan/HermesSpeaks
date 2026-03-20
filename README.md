# HermesSpeaks 🤖👤

> **Lightweight AI text detection optimized for <500MB RAM**
> 
> Built for [Hermes Agent](https://github.com/NousResearch/hermes-agent) • Runs on Fly.io free tier • No API keys required

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Memory](https://img.shields.io/badge/RAM-<500MB-blue?style=flat-square)](OPTIMIZATION.md)
[![Hermes](https://img.shields.io/badge/Built%20for-Hermes-purple?style=flat-square)](https://github.com/NousResearch/hermes-agent)

---

## What is HermesSpeaks?

HermesSpeaks is a **lightweight, self-hosted AI text detector** designed specifically for Hermes Agent and resource-constrained environments.

### Key Features

| Feature | Description |
|---------|-------------|
| **🪶 Lightweight** | ~150MB RAM (vs 1-2GB for alternatives) |
| **⚡ Fast** | <500ms inference (vs 5-10s for browser-based) |
| **🔒 Private** | Runs locally, no data sent to external APIs |
| **💰 Free** | No API keys, no usage limits |
| **🐳 Deployable** | Ready for Fly.io, Railway, VPS |

---

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/AxDSan/HermesSpeaks.git
cd HermesSpeaks
./setup.sh
```

### 2. Detect AI Text

```bash
# Full detection (ML + heuristic)
node hermes-speaks.js "Your text here"

# Fast heuristic only (10MB RAM)
node hermes-speaks.js --heuristic-only "Quick check"

# From file
node hermes-speaks.js --file document.txt

# JSON output for automation
node hermes-speaks.js --json "Your text"
```

### Example Output

```
╔════════════════════════════════════════╗
║      HermesSpeaks - AI Detection      ║
╚════════════════════════════════════════╝

  🤖 Verdict: LIKELY-AI
  📊 Score: 87/100
  🎯 Confidence: high

  Methods used:
    ✓ onnx-distilbert: 92%
    ✓ heuristic: 82%

  Metadata:
    Text length: 1250 chars
    Word count: 200
    Processing time: 342ms

  💾 Memory used: ~150MB
```

---

## How It Works

### Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Input Text     │────▶│  Preprocessor    │
└─────────────────┘     └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │  ONNX    │  │ Heuristic│  │ Entropy  │
            │DistilBERT│  │ Patterns │  │ Analysis │
            │  ~65MB   │  │   ~0MB   │  │   ~0MB   │
            └────┬─────┘  └────┬─────┘  └────┬─────┘
                 │             │             │
                 └─────────────┼─────────────┘
                               ▼
                    ┌──────────────────┐
                    │  Score Fusion    │
                    │  (weighted avg)  │
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │  Verdict         │
                    │  (AI/Human/?)    │
                    └──────────────────┘
```

### Detection Methods

1. **ONNX DistilBERT** (primary, ~85% accuracy)
   - Quantized INT8 model: 65MB
   - ONNX Runtime inference: 50MB overhead
   - Peak: ~150MB during inference

2. **Heuristic Engine** (fallback, ~75% accuracy)
   - 50+ AI writing patterns
   - Entropy-based statistical analysis
   - Zero memory overhead

See [OPTIMIZATION.md](OPTIMIZATION.md) for detailed memory analysis.

---

## Deployment

### Fly.io (Recommended)

```bash
# Deploy to free tier
fly launch --name hermes-speaks

# Set memory limit
fly scale memory 512
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN ./setup.sh
EXPOSE 3000
CMD ["node", "hermes-speaks.js"]
```

### VPS / Railway

```bash
# Any Linux server with Node 16+ and Python 3.8+
git clone https://github.com/AxDSan/HermesSpeaks.git
cd HermesSpeaks
./setup.sh
```

---

## Comparison

| Tool | RAM | Speed | Accuracy | Cost | Setup |
|------|-----|-------|----------|------|-------|
| **HermesSpeaks** | **150MB** | **<500ms** | **85%** | **Free** | **Simple** |
| GPTZero API | N/A | 1-2s | 90% | $$$ | API key |
| Original "Stop Slop" | 1-2GB | 5-10s | 90% | Free | Complex |
| GLTR | 500MB | 2s | 80% | Free | Moderate |

---

## Configuration

### Environment Variables

```bash
# Use heuristic only (lowest memory)
HERMES_HEURISTIC_ONLY=true

# Model path (optional)
HERMES_MODEL_PATH=/path/to/model.onnx

# Verbose logging
HERMES_DEBUG=true
```

### Options

```bash
node hermes-speaks.js [text] [options]

Options:
  -f, --file <path>      Read from file
  --heuristic-only       Use fast heuristic only
  -j, --json             JSON output
  -c, --compact          Single-line output
  -h, --help             Display help
```

---

## API Usage

```javascript
const { detect } = require('./lib/ai-detector');

async function checkText(text) {
  const result = await detect(text);
  console.log(result.aggregate.score);  // 0-100
  console.log(result.aggregate.verdict); // 'likely-ai' | 'uncertain' | 'likely-human'
}
```

---

## Contributing

This project is a fork of [Stop Slop Drop Top](https://github.com/tomkabel/stop-slop-drop-top) optimized for Hermes Agent and low-memory environments.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License - see [LICENSE](LICENSE)

---

## Acknowledgments

- Original concept by [tomkabel/stop-slop-drop-top](https://github.com/tomkabel/stop-slop-drop-top)
- Built for [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- DistilBERT model from [HuggingFace](https://huggingface.co/distilbert-base-uncased)
