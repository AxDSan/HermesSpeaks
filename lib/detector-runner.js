/**
 * AI Detector Automation Runner
 * 
 * Tests text against multiple AI detection services
 * Uses nodriver for stealth browser automation
 * Provides integrated scoring and visual output
 */

const { spawn } = require('child_process');
const path = require('path');
const { localHeuristicCheck, integrateScores } = require('./api');
const { visualOutput, compactOutput } = require('./visual-output');
const cache = require('./cache');

// Path to Python venv and stealth detector
const PYTHON_VENV = path.join(__dirname, '..', '.venv', 'bin', 'python3');
const STEALTH_DETECTOR = path.join(__dirname, '..', 'python', 'stealth_detector.py');

/**
 * Run nodriver-based detection
 */
function runNodriverDetection(text, detectorNames = []) {
  return new Promise((resolve, reject) => {
    const args = [STEALTH_DETECTOR, '--text', text];
    
    for (const d of detectorNames) {
      args.push('--detector', d);
    }

    const proc = spawn(PYTHON_VENV, args, {
      cwd: path.join(__dirname, '..')
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      try {
        const lines = stdout.trim().split('\n');
        let results = {};
        
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            if (lines[i].includes('"detector"')) {
              results = JSON.parse(lines[i]);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (Object.keys(results).length === 0) {
          const resultsMatch = stdout.match(/RESULTS:[\s\n]*({[\s\S]*})/);
          if (resultsMatch) {
            try {
              results = JSON.parse(resultsMatch[1]);
            } catch (e) {}
          }
        }

        resolve(results);
      } catch (error) {
        reject(error);
      }
    });

    proc.on('error', reject);
  });
}

/**
 * Run detection on text
 */
async function runDetection(text, detectorNames = [], options = {}) {
  const { verbose = true, cache: useCache = true, ttl } = options;
  
  const sortedDetectors = [...detectorNames].sort();
  const cacheKey = `${cache.hashText(text)}:${sortedDetectors.join(',')}`;
  
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      if (verbose) {
        console.log(`\n📦 Returning cached result (TTL: ${ttl || 'default'})`);
      }
      return cached;
    }
  }

  const browserDetectors = detectorNames.filter(d => d !== 'heuristic');
  const useHeuristic = detectorNames.length === 0 || detectorNames.includes('heuristic');

  if (verbose) {
    console.log(`\n🔍 Running AI detection on ${text.length} characters...`);
    console.log(`   Detectors: ${detectorNames.length > 0 ? detectorNames.join(', ') : 'all'}\n`);
  }

  const results = {};

  // Run heuristic detector (local, fast)
  if (useHeuristic) {
    if (verbose) console.log('   Testing with heuristic (local)...');
    results.heuristic = localHeuristicCheck(text);
    if (verbose) console.log(`   ✓ heuristic: ${results.heuristic.results.aiPercentage}% AI`);
  }

  // Run nodriver-based detectors
  if (browserDetectors.length > 0) {
    if (verbose) console.log(`   Testing with ${browserDetectors.join(', ')} (nodriver)...`);
    try {
      const nodriverResults = await runNodriverDetection(text, browserDetectors);
      for (const [name, result] of Object.entries(nodriverResults)) {
        results[name] = result;
        if (verbose && result.success) {
          console.log(`   ✓ ${name}: ${result.results?.aiPercentage ?? '?'}% AI`);
        }
      }
    } catch (error) {
      if (verbose) console.log(`   ✗ nodriver error: ${error.message}`);
      for (const d of browserDetectors) {
        results[d] = { detector: d, success: false, error: error.message };
      }
    }
  }

  // Integrate scores from all detectors
  const integrated = integrateScores(results);
  
  if (verbose) {
    console.log(`\n📊 Integrated Score: ${integrated.integratedPercent ?? 'N/A'}% AI (${integrated.confidence}% confidence)`);
  }

  const finalResult = {
    text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    textLength: text.length,
    detectors: results,
    integrated,
    summary: generateSummary(results, integrated),
    errors: Object.entries(results)
      .filter(([_, r]) => !r.success)
      .map(([d, r]) => ({ detector: d, error: r.error }))
  };

  if (useCache) {
    cache.set(cacheKey, finalResult, ttl);
  }

  return finalResult;
}

/**
 * Generate summary with integrated scoring
 */
function generateSummary(results, integrated) {
  let aiCount = 0;
  let humanCount = 0;
  const scores = [];

  for (const [name, result] of Object.entries(results)) {
    if (!result.success) continue;
    
    const r = result.results || {};
    let aiPercent = r.aiPercentage;
    
    if (aiPercent !== undefined && aiPercent !== null) {
      aiPercent = Math.max(0, Math.min(100, aiPercent));
      scores.push({ detector: name, aiPercent });
      if (aiPercent > 50) aiCount++;
      else humanCount++;
    }
  }

  const avgScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + s.aiPercent, 0) / scores.length
    : null;

  return {
    detectorsRun: Object.keys(results).length,
    successful: Object.values(results).filter(r => r.success).length,
    failed: Object.values(results).filter(r => !r.success).length,
    aiDetected: aiCount,
    humanDetected: humanCount,
    averageAIScore: integrated.integratedPercent ?? avgScore,
    confidence: integrated.confidence,
    scores,
    method: integrated.method
  };
}

/**
 * Pretty print results with visual output
 */
function printResults(results) {
  console.log(visualOutput(results));
}

/**
 * Compact output for quick checks
 */
function printCompact(results) {
  console.log(compactOutput(results));
}

/**
 * Quick local check (sync)
 */
function quickCheck(text) {
  return localHeuristicCheck(text);
}

/**
 * Export results as JSON
 */
function exportJSON(results) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    text: results.text,
    textLength: results.textLength,
    integratedScore: results.integrated.integratedPercent,
    confidence: results.integrated.confidence,
    detectors: Object.entries(results.detectors).reduce((acc, [name, r]) => {
      acc[name] = {
        success: r.success,
        aiPercentage: r.results?.aiPercentage,
        error: r.error
      };
      return acc;
    }, {})
  }, null, 2);
}

module.exports = {
  runDetection,
  printResults,
  printCompact,
  quickCheck,
  exportJSON,
  runNodriverDetection,
  integrateScores
};
