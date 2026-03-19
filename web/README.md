# Stop Slop Drop Top - Web App

Web interface for AI text detection using local heuristic analysis.

## Quick Start

```bash
# Install dependencies
cd web
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment to Vercel

1. Push this project to GitHub
2. Import project in Vercel dashboard
3. Vercel auto-detects Next.js and deploys

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Features

- **Local Heuristic Detection**: Pattern-based AI detection (no external APIs)
- **Real-time Analysis**: Instant results as you type
- **History**: Recent analyses saved to localStorage
- **Sample Texts**: Test with known AI/human text samples

## Detection Patterns

The detector identifies:

### AI Patterns (increases AI score)
- Transitional connectors (furthermore, moreover, consequently)
- Formal phrases (it is important to note)
- Business jargon (leverage, navigate, unpack)
- Academic constructs
- Hedging language

### Human Patterns (increases human score)
- Informal exclamations (lol, wow, gosh)
- First-person opinion phrases
- Casual speech (gonna, wanna, kinda)
- Contractions
- Parentheticals

## Limitations

This is the **client-side only** version with heuristic detection. It does NOT include:
- GPTZero (requires browser automation)
- ZeroGPT (requires browser automation)
- Winston AI (requires API)
- Originality.ai (requires API)

For full detection with external services, use the CLI version.
