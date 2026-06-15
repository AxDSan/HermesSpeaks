#!/usr/bin/env node
/**
 * HermesSpeaks CLI
 * Remove AI slop patterns from text to make it sound human
 * 
 * Usage:
 *   hermes-speaks "Your AI-generated text here"
 *   hermes-speaks --file document.txt --output cleaned.txt
 *   hermes-speaks --detect "Check if this is AI"
 *   echo "text" | hermes-speaks
 */

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const { transform } = require('./lib/slop-transform');
const { detect } = require('./lib/ai-detector');

const program = new Command();

program
  .name('hermes-speaks')
  .description('HermesSpeaks - Remove AI slop from text (make it human)')
  .version('2.0.0');

program
  .argument('[text]', 'Text to de-slop')
  .option('-f, --file <path>', 'Read text from file')
  .option('-o, --output <path>', 'Write output to file (default: stdout)')
  .option('-d, --detect', 'Detect AI patterns instead of removing them')
  .option('--heuristic-only', 'Skip ONNX detection, use heuristic only (fast)')
  .option('--score', 'Show slop score before and after')
  .option('-j, --json', 'Output as JSON (for piping)')
  .option('--no-color', 'Disable colored output')
  .action(async (textArg, options) => {
    try {
      const useColor = options.color !== false;
      const c = {
        title: useColor ? chalk.bold.cyan : (x) => x,
        input: useColor ? chalk.gray : (x) => x,
        output: useColor ? chalk.white : (x) => x,
        stats: useColor ? chalk.yellow : (x) => x,
        success: useColor ? chalk.green : (x) => x,
        dim: useColor ? chalk.dim : (x) => x
      };

      // Get input text
      let text = textArg;
      
      // Check for piped input
      if (!text && !options.file && !process.stdin.isTTY) {
        const chunks = [];
        for await (const chunk of process.stdin) {
          chunks.push(chunk);
        }
        text = Buffer.concat(chunks).toString('utf-8');
      }
      
      // Or read from file
      if (!text && options.file) {
        if (!fs.existsSync(options.file)) {
          console.error(c.title('❌ File not found:'), options.file);
          process.exit(1);
        }
        text = fs.readFileSync(options.file, 'utf-8');
      }
      
      if (!text || !text.trim()) {
        console.error(c.title('⚠️  No text provided'));
        console.error(c.dim('Usage: hermes-speaks "text to clean"'));
        console.error(c.dim('       hermes-speaks --file input.txt'));
        console.error(c.dim('       echo "text" | hermes-speaks'));
        process.exit(1);
      }
      
      // Detection mode (secondary feature)
      if (options.detect) {
        const results = await detect(text, { heuristicOnly: options.heuristicOnly });
        
        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
          return;
        }
        
        printDetectionResults(results, c);
        return;
      }
      
      // MAIN FEATURE: Remove slop
      const originalLength = text.length;
      const wordCount = text.split(/\s+/).length;
      
      // Transform the text
      const cleaned = transform(text);
      const cleanedLength = cleaned.length;
      
      // Calculate metrics
      const reduction = ((originalLength - cleanedLength) / originalLength * 100).toFixed(1);
      const wordsRemoved = wordCount - cleaned.split(/\s+/).length;
      
      // Optional: Get slop score
      let beforeScore = null;
      let afterScore = null;
      
      if (options.score) {
        const beforeResult = await detect(text, { heuristicOnly: true });
        const afterResult = await detect(cleaned, { heuristicOnly: true });
        beforeScore = beforeResult.methods[0]?.score || 0;
        afterScore = afterResult.methods[0]?.score || 0;
      }
      
      // JSON output mode
      if (options.json) {
        const output = {
          original: text,
          cleaned: cleaned,
          metrics: {
            originalLength,
            cleanedLength,
            reduction: parseFloat(reduction),
            wordsRemoved
          },
          scores: options.score ? { before: beforeScore, after: afterScore } : undefined
        };
        console.log(JSON.stringify(output, null, 2));
        return;
      }
      
      // Standard output mode
      if (!options.output) {
        // Print stats header
        console.log();
        console.log(c.title('╔════════════════════════════════════════╗'));
        console.log(c.title('║     ') + c.success('HermesSpeaks') + c.title(' - Slop Remover     ║'));
        console.log(c.title('╚════════════════════════════════════════╝'));
        console.log();
        
        if (options.score) {
          console.log(c.stats('  📊 Slop Scores:'));
          console.log(`     Before: ${beforeScore}/100 ${getScoreEmoji(beforeScore)}`);
          console.log(`     After:  ${afterScore}/100 ${getScoreEmoji(afterScore)}`);
          console.log();
        }
        
        console.log(c.stats('  📈 Metrics:'));
        console.log(`     Original: ${originalLength.toLocaleString()} chars (${wordCount.toLocaleString()} words)`);
        console.log(`     Cleaned:  ${cleanedLength.toLocaleString()} chars (${(wordCount - wordsRemoved).toLocaleString()} words)`);
        console.log(`     Removed:  ${reduction}% bloat (${wordsRemoved} words)`);
        console.log();
        
        console.log(c.title('  ✨ Cleaned Text:'));
        console.log(c.dim('  ' + '─'.repeat(40)));
        console.log(c.output(cleaned));
        console.log(c.dim('  ' + '─'.repeat(40)));
        console.log();
        
      } else {
        // Write to file
        fs.writeFileSync(options.output, cleaned, 'utf-8');
        console.log(c.success(`✅ Cleaned text written to: ${options.output}`));
        console.log(c.stats(`   Reduced by ${reduction}% (${wordsRemoved} words removed)`));
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

function getScoreEmoji(score) {
  if (score > 70) return '🤖 (very AI)';
  if (score > 40) return '❓ (maybe AI)';
  return '👤 (human-like)';
}

function printDetectionResults(results, c) {
  const { score, verdict, confidence } = results.aggregate;
  
  console.log();
  console.log(c.title('╔════════════════════════════════════════╗'));
  console.log(c.title('║     ') + c.success('HermesSpeaks') + c.title(' - AI Detection     ║'));
  console.log(c.title('╚════════════════════════════════════════╝'));
  console.log();
  
  const verdictColor = verdict === 'likely-ai' ? chalk.red : 
                       verdict === 'likely-human' ? chalk.green : chalk.yellow;
  const verdictIcon = verdict === 'likely-ai' ? '🤖' :
                      verdict === 'likely-human' ? '👤' : '❓';
  
  console.log(`  ${verdictIcon} Verdict: ${verdictColor.bold(verdict.toUpperCase())}`);
  console.log(`  📊 Score: ${score}/100`);
  console.log(`  🎯 Confidence: ${confidence}`);
  console.log();
  
  console.log(c.dim('  Run without --detect to remove AI slop patterns'));
  console.log();
}

program.parse();
