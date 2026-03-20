#!/usr/bin/env node
/**
 * HermesSpeaks CLI
 * Lightweight AI text detection for <500MB RAM environments
 * 
 * Usage:
 *   node hermes-speaks.js "Your text here"
 *   node hermes-speaks.js --file document.txt
 *   node hermes-speaks.js --heuristic-only "Quick check"
 */

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const { detect } = require('./lib/ai-detector');

const program = new Command();

program
  .name('hermes-speaks')
  .description('HermesSpeaks - Lightweight AI text detection (<500MB RAM)')
  .version('2.0.0');

program
  .argument('[text]', 'Text to analyze for AI patterns')
  .option('-f, --file <path>', 'Read text from file')
  .option('--heuristic-only', 'Use heuristic detection only (faster, lower memory)')
  .option('-j, --json', 'Output results as JSON')
  .option('-c, --compact', 'Compact single-line output')
  .action(async (textArg, options) => {
    try {
      // Get text from args or file
      let text = textArg;
      if (options.file) {
        if (!fs.existsSync(options.file)) {
          console.error(chalk.red(`❌ File not found: ${options.file}`));
          process.exit(1);
        }
        text = fs.readFileSync(options.file, 'utf-8');
      }
      
      if (!text) {
        console.error(chalk.yellow('⚠️  No text provided'));
        program.help();
      }
      
      // Truncate if too long
      const originalLength = text.length;
      if (text.length > 5000) {
        text = text.substring(0, 5000);
        console.log(chalk.dim(`⚠️  Text truncated from ${originalLength} to 5000 chars`));
      }
      
      // Run detection
      const results = await detect(text, { 
        heuristicOnly: options.heuristicOnly 
      });
      
      // Output
      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else if (options.compact) {
        const { score, verdict, confidence } = results.aggregate;
        const icon = verdict === 'likely-ai' ? '🤖' : verdict === 'likely-human' ? '👤' : '❓';
        console.log(`${icon} ${score}% ${verdict} (${confidence}) [${results.metadata.processingTime}ms]`);
      } else {
        printResults(results);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

function printResults(results) {
  const { score, verdict, confidence, methodsUsed } = results.aggregate;
  
  console.log();
  console.log(chalk.bold('╔════════════════════════════════════════╗'));
  console.log(chalk.bold('║      ') + chalk.cyan('HermesSpeaks') + chalk.bold(' - AI Detection      ║'));
  console.log(chalk.bold('╚════════════════════════════════════════╝'));
  console.log();
  
  // Verdict
  const verdictColor = verdict === 'likely-ai' ? chalk.red :
                       verdict === 'likely-human' ? chalk.green : chalk.yellow;
  const verdictIcon = verdict === 'likely-ai' ? '🤖' :
                      verdict === 'likely-human' ? '👤' : '❓';
  
  console.log(`  ${verdictIcon} Verdict: ${verdictColor.bold(verdict.toUpperCase())}`);
  console.log(`  📊 Score: ${score}/100`);
  console.log(`  🎯 Confidence: ${confidence}`);
  console.log();
  
  // Methods used
  console.log(chalk.dim('  Methods used:'));
  for (const method of results.methods) {
    const status = method.error ? chalk.red('❌') : chalk.green('✓');
    const score = method.error ? 'N/A' : `${method.score}%`;
    console.log(`    ${status} ${method.name}: ${score}`);
    if (method.error) {
      console.log(chalk.dim(`      ${method.error}`));
    }
  }
  console.log();
  
  // Metadata
  console.log(chalk.dim('  Metadata:'));
  console.log(`    Text length: ${results.metadata.textLength} chars`);
  console.log(`    Word count: ${results.metadata.wordCount}`);
  console.log(`    Processing time: ${results.metadata.processingTime}ms`);
  console.log();
  
  // Memory estimate
  const memEstimate = methodsUsed.includes('onnx-distilbert') ? '~150MB' : '~10MB';
  console.log(chalk.dim(`  💾 Memory used: ${memEstimate}`));
  console.log();
}

program.parse();
