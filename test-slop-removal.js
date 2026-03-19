#!/usr/bin/env node

/**
 * AI Slop Removal Effectiveness Tester
 * 
 * Workflow:
 * 1. Take AI-generated text
 * 2. Apply "slop removal" transformation
 * 3. Test against multiple AI detectors
 * 4. Report effectiveness with visual feedback
 */

const fs = require('fs');
const { runDetection, printResults, exportJSON } = require('./lib/detector-runner');

let chalk;
try {
  const chalkModule = require('chalk');
  chalk = chalkModule.default || chalkModule;
} catch (e) {
  chalk = {
    cyan: s => s, yellow: s => s, green: s => s,
    red: s => s, bold: s => s, cyan: s => s
  };
}

const args = process.argv.slice(2);
const options = {
  input: null,
  output: null,
  transform: null,
  text: null,
  keepFiles: false,
  verbose: false,
  json: false
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--input' || arg === '-i') {
    options.input = args[++i];
  } else if (arg === '--output' || arg === '-o') {
    options.output = args[++i];
  } else if (arg === '--transform' || arg === '-t') {
    options.transform = args[++i];
  } else if (arg === '--text') {
    options.text = args[++i];
  } else if (arg === '--keep') {
    options.keepFiles = true;
  } else if (arg === '--verbose' || arg === '-v') {
    options.verbose = true;
  } else if (arg === '--json') {
    options.json = true;
  }
}

// Default simple transform
function defaultTransform(text) {
  return text;
}

/**
 * Apply transformation to text
 */
async function applyTransform(text, transformPath) {
  if (!transformPath) {
    console.log('⚠️ No transform provided, testing original text');
    return text;
  }

  console.log(`📝 Applying transform: ${transformPath}`);
  
  try {
    const transform = require(transformPath);
    
    if (typeof transform === 'function') {
      return await transform(text);
    } else if (typeof transform.run === 'function') {
      return await transform.run(text);
    } else if (typeof transform.process === 'function') {
      return await transform.process(text);
    } else if (typeof transform.transform === 'function') {
      return await transform.transform(text);
    } else if (typeof transform.default === 'function') {
      return await transform.default(text);
    } else {
      console.log('⚠️ Transform module does not have a recognized function');
      return text;
    }
  } catch (error) {
    console.log(`⚠️ Could not load transform: ${error.message}`);
    return text;
  }
}

/**
 * Main test workflow
 */
async function main() {
  console.log('\n🧪 AI SLOP REMOVAL EFFECTIVENESS TESTER\n');
  console.log('═'.repeat(60));

  // Load input text
  let originalText;
  
  if (options.text) {
    originalText = options.text;
  } else if (options.input) {
    if (!fs.existsSync(options.input)) {
      console.error(`Error: Input file not found: ${options.input}`);
      process.exit(1);
    }
    originalText = fs.readFileSync(options.input, 'utf-8');
  } else {
    console.error('Error: No input provided. Use --text or --input');
    console.error('Usage: node test-slop-removal.js --text "AI text" --transform ./my-transform.js');
    process.exit(1);
  }

  console.log(`\n📥 Input: ${originalText.length} characters`);
  
  const preview = originalText.substring(0, 150).replace(/\n/g, ' ');
  console.log(`   Preview: "${preview}..."`);

  // Test original text
  console.log('\n' + chalk.cyan('━'.repeat(60)));
  console.log(chalk.cyan.bold('  TESTING ORIGINAL TEXT'));
  console.log(chalk.cyan('━'.repeat(60)));
  
  const originalResults = await runDetection(originalText, ['heuristic'], { verbose: options.verbose });
  printResults(originalResults);

  // Apply transformation
  console.log('\n' + chalk.yellow('━'.repeat(60)));
  console.log(chalk.yellow.bold('  APPLYING TRANSFORMATION'));
  console.log(chalk.yellow('━'.repeat(60)));
  
  const transformedText = await applyTransform(originalText, options.transform);
  
  if (options.output) {
    fs.writeFileSync(options.output, transformedText, 'utf-8');
    console.log(`💾 Transformed text saved to: ${options.output}`);
  }

  if (transformedText === originalText) {
    console.log('⚠️ Text unchanged (no transform applied)');
  } else {
    console.log(`\n📤 Output: ${transformedText.length} characters`);
    const newPreview = transformedText.substring(0, 150).replace(/\n/g, ' ');
    console.log(`   Preview: "${newPreview}..."`);
  }

  // Test transformed text
  console.log('\n' + chalk.green('━'.repeat(60)));
  console.log(chalk.green.bold('  TESTING TRANSFORMED TEXT'));
  console.log(chalk.green('━'.repeat(60)));
  
  const transformedResults = await runDetection(transformedText, ['heuristic'], { verbose: options.verbose });
  printResults(transformedResults);

  // Calculate improvement
  console.log('\n' + '═'.repeat(60));
  console.log(chalk.bold('  📈 EFFECTIVENESS REPORT'));
  console.log('═'.repeat(60));
  
  const origScore = originalResults.integrated.integratedPercent;
  const newScore = transformedResults.integrated.integratedPercent;
  
  if (origScore !== null && newScore !== null) {
    const improvement = origScore - newScore;
    const improvementPct = ((improvement / origScore) * 100).toFixed(1);
    
    console.log(`\n  Original AI Score:  ${chalk.red(origScore + '%')}`);
    console.log(`  Transformed Score:  ${newScore > origScore ? chalk.red : chalk.green(newScore + '%')}`);
    console.log(`  Improvement:        ${improvement > 0 ? chalk.green('↓') : chalk.red('↑')} ${Math.abs(improvement)}%`);
    
    if (newScore < 50 && origScore > 50) {
      console.log(`\n  ✅ SUCCESS! Text now detected as human-written`);
    } else if (newScore < origScore) {
      console.log(`\n  ⚠️  Partial improvement - score reduced by ${Math.abs(improvementPct)}%`);
    } else if (newScore > origScore) {
      console.log(`\n  ❌ Transformation made detection WORSE (+${Math.abs(improvementPct)}%)`);
    }
  } else {
    console.log('⚠️ Could not calculate improvement (insufficient data)');
  }
  
  console.log('\n' + '═'.repeat(60));
  
  // Export JSON if requested
  if (options.json) {
    const jsonOutput = JSON.stringify({
      original: originalResults,
      transformed: transformedResults,
      improvement: {
        originalScore: origScore,
        transformedScore: newScore,
        difference: origScore - newScore
      }
    }, null, 2);
    console.log('\n📦 JSON Output:');
    console.log(jsonOutput);
  }
}

main().catch(console.error);
