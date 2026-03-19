#!/usr/bin/env node

/**
 * AI Detection CLI Tool
 * 
 * Usage:
 *   node detect-ai.js "Your text here to check"
 *   node detect-ai.js --file path/to/text.txt
 *   node detect-ai.js --detector gptzero "text to check"
 *   node detect-ai.js --batch path/to/texts/
 */

const fs = require('fs');
const path = require('path');
const { Command, Option } = require('commander');
const { runDetection, printResults, printCompact, exportJSON, quickCheck } = require('./lib/detector-runner');

const VALID_DETECTORS = ['heuristic', 'gptzero', 'zerogpt', 'winston', 'originality'];

const program = new Command();

program
  .name('detect-ai')
  .description('AI Detection CLI Tool - Test text against multiple AI detectors')
  .version('1.0.0')
  .addOption(new Option('-d, --detector <name>', 'Use specific detector (can be repeated)')
    .argParser((value, previous) => {
      if (!previous) return [value.toLowerCase()];
      return [...previous, value.toLowerCase()];
    }))
  .addOption(new Option('-D, --detectors <list>', 'Comma-separated list of detectors')
    .argParser((value) => value.split(',').map(d => d.trim().toLowerCase())))
  .option('-f, --file <path>', 'Read text from file')
  .option('-b, --batch <path>', 'Process batch of text files')
  .option('-c, --compact', 'Compact output (single line)')
  .option('-j, --json', 'Output as JSON')
  .argument('[text]', 'Text to check for AI generation')
  .action((text, options) => {
    if (text) options.text = text;
  });

program.parse();

const options = program.opts();

let detectors = [...(options.detector || []), ...(options.detectors || [])];
detectors = [...new Set(detectors)];
const invalidDetectors = detectors.filter(d => !VALID_DETECTORS.includes(d));
if (invalidDetectors.length > 0) {
  console.error(`Error: Invalid detector(s): ${invalidDetectors.join(', ')}`);
  console.error(`Valid detectors: ${VALID_DETECTORS.join(', ')}`);
  process.exit(1);
}

// Get text to check
async function getText() {
  if (options.text) return options.text;
  
  if (options.file) {
    if (!fs.existsSync(options.file)) {
      console.error(`Error: File not found: ${options.file}`);
      process.exit(1);
    }
    return fs.readFileSync(options.file, 'utf-8');
  }
  
  return null;
}

// Batch process files
async function processBatch() {
  if (!options.batch) return false;
  
  const batchDir = options.batch;
  if (!fs.existsSync(batchDir)) {
    console.error(`Error: Batch directory not found: ${batchDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(batchDir).filter(f => 
    f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.text')
  );

  if (files.length === 0) {
    console.log('No text files found in batch directory');
    return true;
  }

  console.log(`\n📁 Processing batch: ${files.length} files\n`);

  for (const file of files) {
    const filePath = path.join(batchDir, file);
    const text = fs.readFileSync(filePath, 'utf-8');
    
    console.log(chalk.cyan('\n' + '='.repeat(60)));
    console.log(chalk.cyan(`📄 File: ${file}`));
    console.log(chalk.cyan('='.repeat(60)));
    
    const results = await runDetection(text, detectors, { verbose: false });
    
    if (options.json) {
      console.log(exportJSON(results));
    } else if (options.compact) {
      printCompact(results);
    } else {
      printResults(results);
    }
  }

  return true;
}

// Main execution
async function main() {
  // Handle batch mode
  if (await processBatch()) return;

  // Get text
  const text = await getText();
  
  if (!text) {
    console.error('Error: No text provided. Use --help for usage information.');
    console.error('\nExample: node detect-ai.js "Your text to check"');
    process.exit(1);
  }

  // Run detection
  const results = await runDetection(text, detectors);

  // Output results
  if (options.json) {
    console.log(exportJSON(results));
  } else if (options.compact) {
    printCompact(results);
  } else {
    printResults(results);
  }
}

main().catch(console.error);
