#!/usr/bin/env node
/**
 * HermesSpeaks - Lightweight AI Text Detector
 * Optimized for <500MB RAM (Fly.io compatible)
 * 
 * Uses: ONNX Runtime + DistilBERT + Heuristics
 * Memory footprint: ~150MB peak, ~50MB idle
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Enhanced heuristic patterns (zero RAM overhead)
const AI_PATTERNS = {
  // High-confidence markers (weight 5)
  strong: [
    /\b(additionally|furthermore|moreover|consequently|therefore|however|nevertheless)\b/gi,
    /\b(it is important to note that|it is worth mentioning that|it should be noted that)\b/gi,
    /\b(this essay will examine|this paper explores|this study investigates)\b/gi,
    /\b(first and foremost|it goes without saying that|in today's world|in the modern era)\b/gi,
    /\b(delve|crucial|paramount|significant|underscores|highlights|testament to)\b/gi,
    /\b(stands as|serves as|is a reminder|is a testament)\b/gi,
  ],
  // Medium markers (weight 3)
  medium: [
    /\b(in conclusion|to summarize|overall|all in all)\b/gi,
    /\b(utilize|leverage|implement|demonstrate|facilitate|optimize|enhance)\b/gi,
    /\b(not only.*but also|not just.*but also)\b/gi,
    /\b(groundbreaking|renowned|vibrant|rich tapestry|natural beauty)\b/gi,
    /\b(clearly|obviously|certainly|undoubtedly|definitely)\b/gi,
  ],
  // Weak markers (weight 1)
  weak: [
    /—/g, // em-dashes
    /[""„]/g, // curly quotes
    /\b(highlighting|underscoring|emphasizing|ensuring|reflecting)\b/gi,
    /\b(experts argue|critics say|observers note|industry reports)\b/gi,
  ]
};

/**
 * Calculate perplexity proxy using character n-gram entropy
 * Lower entropy = more predictable = likely AI
 * Fast, no ML model needed
 */
function calculateEntropy(text) {
  if (text.length < 100) return 0.5; // Too short to analyze
  
  const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, '');
  const words = cleanText.split(/\s+/).filter(w => w.length > 2);
  
  if (words.length < 10) return 0.5;
  
  // Character bigram frequencies
  const bigrams = {};
  let total = 0;
  
  for (const word of words) {
    for (let i = 0; i < word.length - 1; i++) {
      const bigram = word.slice(i, i + 2);
      bigrams[bigram] = (bigrams[bigram] || 0) + 1;
      total++;
    }
  }
  
  // Shannon entropy
  let entropy = 0;
  for (const count of Object.values(bigrams)) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  
  // Normalize: typical English ~3.5-4.5, AI tends to be more predictable
  const normalized = Math.min(1, Math.max(0, (4.5 - entropy) / 2));
  return normalized;
}

/**
 * Pattern-based heuristic detection
 * Zero ML overhead, instant results
 */
function heuristicDetect(text) {
  const words = text.split(/\s+/).length;
  if (words < 20) return { score: 0, confidence: 'low', reason: 'text too short' };
  
  let score = 0;
  let matches = [];
  
  // Strong patterns (5 points each)
  for (const pattern of AI_PATTERNS.strong) {
    const count = (text.match(pattern) || []).length;
    if (count > 0) {
      score += Math.min(count * 5, 20); // Cap at 20
      matches.push({ pattern: pattern.source.slice(0, 40), count, weight: 5 });
    }
  }
  
  // Medium patterns (3 points each)
  for (const pattern of AI_PATTERNS.medium) {
    const count = (text.match(pattern) || []).length;
    if (count > 0) {
      score += Math.min(count * 3, 15); // Cap at 15
      matches.push({ pattern: pattern.source.slice(0, 40), count, weight: 3 });
    }
  }
  
  // Weak patterns (1 point each)
  for (const pattern of AI_PATTERNS.weak) {
    const count = (text.match(pattern) || []).length;
    if (count > 0) {
      score += Math.min(count * 1, 10); // Cap at 10
      matches.push({ pattern: pattern.source.slice(0, 40), count, weight: 1 });
    }
  }
  
  // Entropy check
  const entropy = calculateEntropy(text);
  score += entropy * 20; // Max 20 points from entropy
  
  // Normalize to 0-100
  const normalizedScore = Math.min(100, score);
  
  // Confidence based on text length and match diversity
  const confidence = words > 200 && matches.length > 3 ? 'high' : 
                     words > 100 && matches.length > 1 ? 'medium' : 'low';
  
  return {
    score: Math.round(normalizedScore),
    confidence,
    entropy: Math.round(entropy * 100),
    patternMatches: matches.length,
    details: matches.slice(0, 5) // Top 5 matches
  };
}

/**
 * Check if Python ONNX detector is available
 */
function checkOnnxAvailable() {
  const onnxPath = path.join(__dirname, '..', 'python', 'onnx_detector.py');
  return fs.existsSync(onnxPath);
}

/**
 * Run ONNX model detection (Python subprocess)
 * Loads model on-demand, unloads after inference
 */
async function onnxDetect(text) {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, '..', '.venv', 'bin', 'python3');
    const scriptPath = path.join(__dirname, '..', 'python', 'onnx_detector.py');
    
    // Use system python if venv doesn't exist
    const python = fs.existsSync(pythonPath) ? pythonPath : 'python3';
    
    const proc = spawn(python, [scriptPath, '--text', text.substring(0, 2000)]);
    
    let output = '';
    let error = '';
    
    proc.stdout.on('data', (data) => output += data);
    proc.stderr.on('data', (data) => error += data);
    
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ONNX detection failed: ${error}`));
        return;
      }
      
      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (e) {
        reject(new Error(`Failed to parse ONNX output: ${e.message}`));
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      proc.kill();
      reject(new Error('ONNX detection timeout'));
    }, 30000);
  });
}

/**
 * Main detection function - combines multiple methods
 */
async function detect(text, options = {}) {
  const startTime = Date.now();
  const results = {
    methods: [],
    aggregate: {},
    metadata: {
      textLength: text.length,
      wordCount: text.split(/\s+/).length,
      processingTime: 0
    }
  };
  
  // Always run heuristic (fast, no RAM)
  const heuristic = heuristicDetect(text);
  results.methods.push({
    name: 'heuristic',
    score: heuristic.score,
    confidence: heuristic.confidence,
    details: heuristic
  });
  
  // Try ONNX if available and text is long enough
  if (checkOnnxAvailable() && text.length > 100 && !options.heuristicOnly) {
    try {
      const onnx = await onnxDetect(text);
      results.methods.push({
        name: 'onnx-distilbert',
        score: onnx.score,
        confidence: onnx.confidence,
        details: onnx
      });
    } catch (e) {
      results.methods.push({
        name: 'onnx-distilbert',
        error: e.message,
        score: heuristic.score // Fallback
      });
    }
  }
  
  // Calculate aggregate score
  const validMethods = results.methods.filter(m => !m.error);
  const weights = { 'onnx-distilbert': 0.7, 'heuristic': 0.3 };
  
  let totalWeight = 0;
  let weightedScore = 0;
  
  for (const method of validMethods) {
    const weight = weights[method.name] || 0.5;
    weightedScore += method.score * weight;
    totalWeight += weight;
  }
  
  results.aggregate = {
    score: Math.round(weightedScore / totalWeight),
    confidence: validMethods.some(m => m.confidence === 'high') ? 'high' :
                validMethods.some(m => m.confidence === 'medium') ? 'medium' : 'low',
    verdict: weightedScore > 70 ? 'likely-ai' : weightedScore > 40 ? 'uncertain' : 'likely-human',
    methodsUsed: validMethods.map(m => m.name)
  };
  
  results.metadata.processingTime = Date.now() - startTime;
  
  return results;
}

module.exports = { detect, heuristicDetect, onnxDetect, checkOnnxAvailable };

// CLI usage
if (require.main === module) {
  const text = process.argv.slice(2).join(' ') || 
               'This essay will examine the crucial aspects of modern technology.';
  
  detect(text).then(result => {
    console.log(JSON.stringify(result, null, 2));
  }).catch(console.error);
}
