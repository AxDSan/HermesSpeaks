/**
 * Eye-Candy Rich Visual Output for AI Detection
 * Provides beautiful graphical feedback for detection results
 * 
 * Box width: 60 chars
 * ╔════════════════════════════════════════════════════════════╗ = 62 chars (2 + 58 + 2)
 * │ content                                                       │
 * ╚════════════════════════════════════════════════════════════╝
 */

const WIDTH = 60;
const INNER_WIDTH = WIDTH - 2;

// Handle chalk v5 ESM import
let chalk;
try {
  const chalkModule = require('chalk');
  chalk = chalkModule.default || chalkModule;
} catch (e) {
  chalk = {
    bold: s => `\x1b[1m${s}\x1b[0m`,
    cyan: s => `\x1b[36m${s}\x1b[0m`,
    green: s => `\x1b[32m${s}\x1b[0m`,
    yellow: s => `\x1b[33m${s}\x1b[0m`,
    red: s => `\x1b[31m${s}\x1b[0m`,
    gray: s => `\x1b[90m${s}\x1b[0m`,
    white: s => `\x1b[37m${s}\x1b[0m`,
  };
}

const CHARS = {
  tl: '╔', tm: '═', tr: '╗',
  ml: '║', mr: '║',
  bl: '╚', bm: '═', br: '╝',
  hz: '─',
  full: '█', empty: '░',
  spark: ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
};

// Helper: create box line with optional header
function boxLine(content = '', padRight = true) {
  const padding = padRight ? ' '.repeat(Math.max(0, INNER_WIDTH - content.length)) : '';
  return chalk.gray(CHARS.ml) + content + padding + chalk.gray(CHARS.mr);
}

// Helper: create box header
function boxHeader(title) {
  const totalWidth = INNER_WIDTH;
  const titleLen = title.length;
  const leftPad = Math.floor((totalWidth - titleLen) / 2);
  const rightPad = totalWidth - titleLen - leftPad;
  
  return chalk.gray(CHARS.ml) + ' '.repeat(leftPad) + chalk.white.bold(title) + ' '.repeat(rightPad) + chalk.gray(CHARS.mr);
}

// Helper: create full box with header
function fullBox(title, lines) {
  const output = [];
  output.push(chalk.gray(CHARS.tl) + CHARS.tm.repeat(INNER_WIDTH) + chalk.gray(CHARS.tr));
  output.push(boxHeader(title));
  output.push(chalk.gray(CHARS.ml) + CHARS.bm.repeat(INNER_WIDTH) + chalk.gray(CHARS.mr));
  
  for (const line of lines) {
    if (typeof line === 'string') {
      output.push(boxLine(line));
    } else if (line === null) {
      output.push(boxLine(''));
    }
  }
  
  output.push(chalk.gray(CHARS.bl) + CHARS.bm.repeat(INNER_WIDTH) + chalk.gray(CHARS.br));
  return output;
}

function getState(aiPercent) {
  if (aiPercent === null || aiPercent === undefined) return 'uncertain';
  if (aiPercent <= 20) return 'human';
  if (aiPercent <= 40) return 'likelyHuman';
  if (aiPercent <= 60) return 'uncertain';
  if (aiPercent <= 80) return 'likelyAI';
  return 'ai';
}

function gradientBar(percent, width = 20) {
  if (percent === null) return CHARS.empty.repeat(width);
  
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  
  let bar = '';
  for (let i = 0; i < filled; i++) {
    const ratio = i / width;
    if (ratio < 0.33) bar += chalk.green(CHARS.full);
    else if (ratio < 0.66) bar += chalk.yellow(CHARS.full);
    else bar += chalk.red(CHARS.full);
  }
  
  bar += chalk.gray(CHARS.empty.repeat(empty));
  return bar;
}

function sparkline(data, width = 30) {
  if (!data || data.length === 0) return '';
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  let result = '';
  for (const val of data) {
    const idx = Math.floor(((val - min) / range) * (CHARS.spark.length - 1));
    result += CHARS.spark[Math.max(0, Math.min(idx, CHARS.spark.length - 1))];
  }
  
  return result;
}

function visualOutput(results) {
  const { detectors, summary, integrated, text, textLength } = results;
  
  const avgScore = integrated?.integratedPercent ?? summary.averageAIScore;
  const confidence = integrated?.confidence ?? 0;
  const state = getState(avgScore);
  
  const lines = [];

  // HEADER
  lines.push('');
  lines.push(chalk.cyan.bold(CHARS.tl + CHARS.tm.repeat(28) + '🤖 AI CONTENT DETECTION REPORT' + CHARS.tm.repeat(28) + CHARS.tr));

  // TEXT PREVIEW
  const preview = textLength > 60 ? text.substring(0, 57) + '...' : text;
  lines.push(boxLine(chalk.gray('Text: ') + chalk.white(`"${preview}"`), false));

  // MAIN SCORE BOX
  const scoreBar = gradientBar(avgScore, 35);
  const scoreText = `${avgScore ?? '?'}% AI`;
  
  const scoreLines = [
    null,
    '  ' + scoreBar + '  ' + chalk.bold.white(scoreText),
    null,
    '  Confidence: ' + confidence + '%',
  ];
  
  lines.push('');
  lines.push(...fullBox('OVERALL ASSESSMENT', scoreLines));

  // VERDICT
  let verdict = '';
  if (avgScore !== null) {
    if (avgScore > 80) verdict = '🔴 HIGH AI DETECTION';
    else if (avgScore > 60) verdict = '🟠 MODERATE AI';
    else if (avgScore > 40) verdict = '🟡 SOME AI PATTERNS';
    else if (avgScore > 20) verdict = '🟢 LIKELY HUMAN';
    else verdict = '✅ APPEARS HUMAN';
  } else {
    verdict = '❓ UNKNOWN';
  }
  
  lines.push('');
  lines.push(chalk.gray(CHARS.tl) + CHARS.tm.repeat(INNER_WIDTH) + chalk.gray(CHARS.tr));
  lines.push(boxLine(chalk.bold.white(verdict)));
  lines.push(chalk.gray(CHARS.bl) + CHARS.bm.repeat(INNER_WIDTH) + chalk.gray(CHARS.br));

  // DETECTOR BREAKDOWN
  const detectorLines = [];
  const allDetectors = ['heuristic', 'gptzero', 'zerogpt', 'winston', 'originality'];
  
  for (const name of allDetectors) {
    const result = detectors[name];
    if (result?.success) {
      const r = result.results || {};
      const pct = r.aiPercentage;
      const bar = gradientBar(pct, 30);
      const icon = pct !== null ? (pct > 50 ? '🔴' : '🟢') : '⚪';
      const pctStr = pct !== null ? `${pct}%` : 'N/A';
      
      detectorLines.push(`  ${icon} ${name.padEnd(12)} ${bar} ${pctStr}`);
    } else if (result) {
      detectorLines.push(`  ❌ ${name.padEnd(12)} ${chalk.red('FAILED')}`);
    }
  }
  
  if (detectorLines.length > 0) {
    lines.push('');
    lines.push(...fullBox('DETECTOR BREAKDOWN', detectorLines));
  }

  // SPARKLINE (if multiple detectors)
  if (summary.scores.length > 1) {
    const data = summary.scores.map(s => s.aiPercent);
    const spark = sparkline(data, 40);
    const sparkLines = [
      null,
      '  ' + chalk.cyan(spark),
      '  ' + chalk.green('Human ←') + chalk.gray(CHARS.hz.repeat(34)) + chalk.red('→ AI'),
    ];
    lines.push('');
    lines.push(...fullBox('DETECTION TREND', sparkLines));
  }

  // SUMMARY STATS
  const statsLines = [
    `  Detectors: ${summary.successful}/${summary.detectorsRun} successful`,
  ];
  
  if (summary.scores.length > 0) {
    const minScore = Math.min(...summary.scores.map(s => s.aiPercent));
    const maxScore = Math.max(...summary.scores.map(s => s.aiPercent));
    statsLines.push(`  Range: ${minScore}% - ${maxScore}%`);
  }
  
  statsLines.push(`  Method: ${summary.method || 'Weighted average'}`);
  
  lines.push('');
  lines.push(...fullBox('SUMMARY', statsLines));

  // RECOMMENDATION
  let recommendation = '';
  if (avgScore !== null) {
    if (avgScore > 80) recommendation = '🔴 HIGH AI likelihood - consider revising';
    else if (avgScore > 60) recommendation = '🟠 Moderate AI detected - review flagged sections';
    else if (avgScore > 40) recommendation = '🟡 Some AI patterns - human review advised';
    else if (avgScore > 20) recommendation = '🟢 Mostly human-written';
    else recommendation = '✅ Appears human-written';
  }
  
  if (recommendation) {
    lines.push('');
    lines.push(chalk.gray(CHARS.tl) + CHARS.tm.repeat(INNER_WIDTH) + chalk.gray(CHARS.tr));
    lines.push(boxLine(chalk.bold.white('RECOMMENDATION')));
    lines.push(chalk.gray(CHARS.ml) + CHARS.bm.repeat(INNER_WIDTH) + chalk.gray(CHARS.mr));
    lines.push(boxLine(recommendation));
    lines.push(chalk.gray(CHARS.bl) + CHARS.bm.repeat(INNER_WIDTH) + chalk.gray(CHARS.br));
  }

  lines.push('');
  lines.push(chalk.gray(CHARS.hz.repeat(WIDTH)));
  lines.push('');

  return lines.join('\n');
}

function compactOutput(results) {
  const avgScore = results.integrated?.integratedPercent ?? results.summary.averageAIScore;
  const bar = gradientBar(avgScore, 20);
  const icon = avgScore > 50 ? '🔴' : '🟢';
  
  return `${icon} ${bar} ${avgScore ?? '?'}% AI (${results.summary.successful}/${results.summary.detectorsRun})`;
}

module.exports = {
  visualOutput,
  compactOutput,
  gradientBar,
  getState,
  colors: {},
  CHARS
};
