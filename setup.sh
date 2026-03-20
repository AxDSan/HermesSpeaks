#!/bin/bash
# HermesSpeaks Setup Script
# Optimized for <500MB RAM environments (Fly.io compatible)

set -e

echo "🚀 Setting up HermesSpeaks (lightweight AI detector)"
echo "==================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the HermesSpeaks directory"
    exit 1
fi

# Install Node dependencies (lightweight)
echo "📦 Installing Node.js dependencies..."
npm install --production

# Setup Python virtual environment
echo "🐍 Setting up Python environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate

# Install minimal Python dependencies
echo "⬇️  Installing lightweight Python packages..."
pip install --no-cache-dir -q \
    onnxruntime==1.16.3 \
    transformers==4.35.2 \
    numpy==1.24.3 \
    scikit-learn==1.3.2

# Download model (~65MB)
echo "🤖 Downloading AI detection model..."
python3 << 'EOF'
import urllib.request
import os
from pathlib import Path

model_dir = Path("models")
model_dir.mkdir(exist_ok=True)
model_path = model_dir / "distilbert-ai-detector.onnx"

if not model_path.exists():
    print("  Downloading DistilBERT model (~65MB)...")
    # Using a public HuggingFace model converted to ONNX
    url = "https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier/resolve/main/model.onnx"
    try:
        urllib.request.urlretrieve(url, model_path)
        print("  ✓ Model downloaded")
    except Exception as e:
        print(f"  ⚠️  Could not download model: {e}")
        print("  Will use heuristic detection only")
else:
    print("  ✓ Model already exists")
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "Memory footprint:"
echo "  - Heuristic only: ~10MB"
echo "  - With ONNX model: ~150MB peak"
echo ""
echo "Quick test:"
echo "  node lib/ai-detector.js 'Your text here'"
echo ""
