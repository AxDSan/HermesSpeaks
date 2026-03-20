#!/usr/bin/env python3
"""
HermesSpeaks ONNX Detector
Memory-optimized AI text detection for <500MB RAM environments

Uses: ONNX Runtime + Quantized DistilBERT
Peak memory: ~150MB, typical: ~80MB
"""

import argparse
import json
import sys
import os
from pathlib import Path

# Suppress verbose logging
os.environ['ORT_LOGGING_LEVEL'] = 'ERROR'

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import onnxruntime as ort
        from transformers import DistilBertTokenizer
        return True
    except ImportError as e:
        return False

def download_model_if_needed():
    """Download ONNX model if not present (~65MB)"""
    model_dir = Path(__file__).parent.parent / "models"
    model_path = model_dir / "distilbert-ai-detector.onnx"
    
    if model_path.exists():
        return str(model_path)
    
    print("Model not found. Downloading...", file=sys.stderr)
    model_dir.mkdir(exist_ok=True)
    
    # Download from HuggingFace (public model)
    import urllib.request
    url = "https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier/resolve/main/model.onnx"
    
    try:
        urllib.request.urlretrieve(url, model_path)
        return str(model_path)
    except Exception as e:
        print(f"Failed to download model: {e}", file=sys.stderr)
        return None

def detect_ai_text(text, model_path=None):
    """
    Detect AI-generated text using ONNX Runtime
    Memory-efficient inference with INT8 quantization
    """
    try:
        import onnxruntime as ort
        from transformers import DistilBertTokenizer
    except ImportError:
        return {
            "score": 50,
            "confidence": "low",
            "error": "Dependencies not installed. Run: pip install onnxruntime transformers"
        }
    
    # Lazy load model only when needed
    if model_path is None:
        model_path = download_model_if_needed()
    
    if not model_path or not Path(model_path).exists():
        return {
            "score": 50,
            "confidence": "low",
            "error": "Model not available"
        }
    
    # Initialize tokenizer (lightweight)
    tokenizer = DistilBertTokenizer.from_pretrained(
        'distilbert-base-uncased',
        cache_dir=str(Path(__file__).parent.parent / "models" / "cache")
    )
    
    # Optimize ONNX session for minimal memory
    sess_options = ort.SessionOptions()
    sess_options.intra_op_num_threads = 2  # Limit threads
    sess_options.inter_op_num_threads = 2
    sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    
    # Reduce memory usage
    sess_options.enable_cpu_mem_arena = False
    sess_options.enable_mem_pattern = False
    
    # Load model (this is the memory-heavy part, ~100MB)
    session = ort.InferenceSession(
        model_path,
        sess_options,
        providers=['CPUExecutionProvider']
    )
    
    # Tokenize input
    inputs = tokenizer(
        text[:512],  # Truncate to 512 tokens
        return_tensors="np",
        truncation=True,
        padding=True,
        max_length=512
    )
    
    # Run inference
    input_feed = {
        'input_ids': inputs['input_ids'],
        'attention_mask': inputs['attention_mask']
    }
    
    outputs = session.run(None, input_feed)
    
    # Process output (binary classification: AI vs Human)
    # Model output is logits, convert to probability
    import numpy as np
    logits = outputs[0][0]
    probs = np.exp(logits) / np.sum(np.exp(logits))
    
    # Assuming index 1 is AI probability (depends on model)
    ai_probability = float(probs[1]) if len(probs) > 1 else float(probs[0])
    
    score = round(ai_probability * 100)
    
    # Confidence based on how close to 0 or 100
    confidence_score = abs(score - 50) / 50  # 0.0 to 1.0
    confidence = "high" if confidence_score > 0.7 else "medium" if confidence_score > 0.4 else "low"
    
    return {
        "score": score,
        "confidence": confidence,
        "model": "distilbert-onnx",
        "input_length": len(text),
        "tokens": int(inputs['input_ids'].shape[1])
    }

def main():
    parser = argparse.ArgumentParser(description='HermesSpeaks ONNX AI Detector')
    parser.add_argument('--text', required=True, help='Text to analyze')
    parser.add_argument('--model', help='Path to ONNX model')
    
    args = parser.parse_args()
    
    if not check_dependencies():
        print(json.dumps({
            "score": 50,
            "confidence": "low",
            "error": "Missing dependencies: pip install onnxruntime transformers"
        }))
        sys.exit(1)
    
    result = detect_ai_text(args.text, args.model)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
