/**
 * Writing Style Validators & Sanitizers
 * Different validation rules for different writing formats
 */

const fs = require('fs');

// ============================================
// EMAIL VALIDATOR (existing, enhanced)
// ============================================
function validateEmail(content) {
  const errors = [];
  const warnings = [];
  
  // Structure checks
  if (!content.includes('\n')) {
    errors.push('CRITICAL: No line breaks - content collapsed');
  }
  
  const lines = content.split('\n');
  const subjectLine = lines.find(l => l.startsWith('Subject:'));
  
  if (!subjectLine) {
    errors.push('CRITICAL: Missing Subject: line');
  } else {
    const subject = subjectLine.replace('Subject:', '').trim();
    if (subject.length > 150) errors.push(`Subject too long (${subject.length} chars)`);
    if (subject.includes('Dear ') || subject.includes('Hello ')) {
      errors.push('Subject contains greeting - merged with body');
    }
  }
  
  // Email-specific
  const hasGreeting = lines.some(l => /^(Dear|Hello|Hi|Greetings)\s/i.test(l));
  const hasClosing = lines.some(l => /(Best|Regards|Sincerely|Thanks|Thank you)/i.test(l));
  const hasSignature = lines.some(l => l.includes('@') && l.includes('.'));
  
  if (!hasGreeting) warnings.push('No greeting found');
  if (!hasClosing) warnings.push('No closing found');
  if (!hasSignature) warnings.push('No email signature');
  
  return { type: 'email', valid: errors.length === 0, errors, warnings };
}

// ============================================
// PROSE VALIDATOR (articles, blogs, essays)
// ============================================
function validateProse(content) {
  const errors = [];
  const warnings = [];
  const stats = {};
  
  // Paragraph structure
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  stats.paragraphCount = paragraphs.length;
  
  if (paragraphs.length < 3) {
    warnings.push('Very short - only ' + paragraphs.length + ' paragraphs');
  }
  
  // Sentence length variety
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const avgLength = sentences.reduce((a, s) => a + s.length, 0) / sentences.length;
  stats.avgSentenceLength = Math.round(avgLength);
  
  if (avgLength > 150) {
    warnings.push('Sentences very long (avg ' + Math.round(avgLength) + ' chars)');
  }
  if (avgLength < 40) {
    warnings.push('Sentences very short (avg ' + Math.round(avgLength) + ' chars)');
  }
  
  // Check for wall of text (no paragraph breaks)
  if (!content.includes('\n\n') && content.length > 500) {
    errors.push('Wall of text - no paragraph breaks');
  }
  
  // Transition words
  const transitions = ['however', 'therefore', 'furthermore', 'meanwhile', 'additionally'];
  const foundTransitions = transitions.filter(t => content.toLowerCase().includes(t));
  stats.transitions = foundTransitions;
  
  // Overused words
  const overused = ['very', 'really', 'just', 'actually', 'basically'];
  overused.forEach(word => {
    const count = (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    if (count > 3) warnings.push(`Overused "${word}" (${count} times)`);
  });
  
  return { type: 'prose', valid: errors.length === 0, errors, warnings, stats };
}

// ============================================
// POETRY VALIDATOR
// ============================================
function validatePoem(content) {
  const errors = [];
  const warnings = [];
  const stats = {};
  
  const lines = content.split('\n').filter(l => l.trim());
  stats.lineCount = lines.length;
  
  if (lines.length < 4) {
    errors.push('Too short for poem (min 4 lines)');
  }
  if (lines.length > 100) {
    warnings.push('Very long poem (' + lines.length + ' lines)');
  }
  
  // Line length consistency (poems usually have rhythmic structure)
  const lengths = lines.map(l => l.length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - avgLength, 2), 0) / lengths.length;
  
  stats.avgLineLength = Math.round(avgLength);
  stats.lengthVariance = Math.round(variance);
  
  // Check for prose disguised as poem (all lines similar length = paragraph)
  if (variance < 10 && lines.length > 10) {
    warnings.push('Lines very uniform - may be prose, not poetry');
  }
  
  // Stanza breaks (double newlines)
  const stanzas = content.split('\n\n').filter(s => s.trim());
  stats.stanzaCount = stanzas.length;
  
  // Check for punctuation at line ends
  const linesWithEndPunct = lines.filter(l => /[.!?;,]$/.test(l.trim())).length;
  stats.linesWithEndPunctuation = linesWithEndPunct;
  
  return { type: 'poetry', valid: errors.length === 0, errors, warnings, stats };
}

// ============================================
// PROFESSIONAL/TECHNICAL WRITING
// ============================================
function validateProfessional(content) {
  const errors = [];
  const warnings = [];
  const stats = {};
  
  // Check for contractions (avoid in formal writing)
  const contractions = content.match(/\w+'\w+/g) || [];
  if (contractions.length > 0) {
    warnings.push(`Contractions found (${contractions.length}): ${contractions.slice(0, 3).join(', ')}`);
  }
  
  // Check for passive voice indicators
  const passiveIndicators = ['was', 'were', 'been', 'being', 'is', 'are'];
  let passiveCount = 0;
  passiveIndicators.forEach(word => {
    const matches = content.toLowerCase().match(new RegExp(`\\b${word}\\s+\\w+ed\\b`, 'g')) || [];
    passiveCount += matches.length;
  });
  stats.passiveVoiceInstances = passiveCount;
  if (passiveCount > 5) warnings.push(`High passive voice usage (${passiveCount})`);
  
  // Check for jargon/redundant phrases
  const redundancies = [
    'advance planning', 'end result', 'free gift', 'past history',
    'future plans', 'unexpected surprise', 'basic fundamentals'
  ];
  redundancies.forEach(phrase => {
    if (content.toLowerCase().includes(phrase)) {
      warnings.push(`Redundant phrase: "${phrase}"`);
    }
  });
  
  // Paragraph length (professional = shorter paragraphs)
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const longParagraphs = paragraphs.filter(p => p.length > 300).length;
  if (longParagraphs > 0) {
    warnings.push(`${longParagraphs} paragraphs very long (>300 chars)`);
  }
  
  // Check structure
  const hasHeaders = /^#+\s/.test(content) || /^\w+:$/m.test(content);
  if (!hasHeaders && content.length > 1000) {
    warnings.push('Long document without headers/sections');
  }
  
  return { type: 'professional', valid: errors.length === 0, errors, warnings, stats };
}

// ============================================
// NOVEL/CREATIVE FICTION
// ============================================
function validateNovel(content) {
  const errors = [];
  const warnings = [];
  const stats = {};
  
  // Length checks
  const wordCount = content.split(/\s+/).length;
  stats.wordCount = wordCount;
  
  if (wordCount < 50000) {
    warnings.push(`Short for novel (${wordCount.toLocaleString()} words)`);
  }
  if (wordCount > 150000) {
    warnings.push(`Very long novel (${wordCount.toLocaleString()} words)`);
  }
  
  // Chapter structure
  const chapters = content.match(/^(Chapter|CHAPTER|\d+\.)\s*\d+/m);
  if (!chapters) {
    warnings.push('No clear chapter structure detected');
  }
  
  // Dialogue check (should have quotes)
  const dialogueQuotes = (content.match(/"[^"]+"/g) || []).length;
  const dialogueSingles = (content.match(/'[^']+'/g) || []).length;
  stats.estimatedDialogueInstances = dialogueQuotes + dialogueSingles;
  
  if (stats.estimatedDialogueInstances < 10) {
    warnings.push('Very little dialogue detected');
  }
  
  // Scene breaks
  const sceneBreaks = (content.match(/^(\*{3,}|-{3,}|#{3,})$/m) || []).length;
  stats.sceneBreaks = sceneBreaks;
  
  // Character consistency (simplistic check)
  const names = content.match(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g) || [];
  const uniqueNames = [...new Set(names)].slice(0, 10);
  stats.potentialCharacterNames = uniqueNames;
  
  return { type: 'novel', valid: errors.length === 0, errors, warnings, stats };
}

// ============================================
// MAIN VALIDATOR ROUTER
// ============================================
function validate(content, type = 'auto') {
  // Auto-detect if not specified
  if (type === 'auto') {
    if (content.includes('Subject:')) return validateEmail(content);
    if (content.includes('Chapter ') || content.length > 40000) return validateNovel(content);
    if (content.split('\n').length > content.length / 50) return validatePoem(content);
    if (/\b(Dear|Hello|Hi|Greetings)\b/i.test(content) && /\b(Best|Sincerely|Thanks)\b/i.test(content)) {
      return validateEmail(content);
    }
    return validateProse(content);
  }
  
  switch (type) {
    case 'email': return validateEmail(content);
    case 'prose': return validateProse(content);
    case 'poetry': return validatePoem(content);
    case 'poem': return validatePoem(content);
    case 'professional': return validateProfessional(content);
    case 'technical': return validateProfessional(content);
    case 'novel': return validateNovel(content);
    case 'fiction': return validateNovel(content);
    default: return validateProse(content);
  }
}

// ============================================
// SANITIZERS (auto-fix common issues)
// ============================================

function sanitizeEmail(content) {
  // Fix merged subject/body
  if (content.includes('Subject:') && !content.includes('\n\n')) {
    // Try to split at first sentence ending
    const match = content.match(/^(Subject:[^\.]+\.)(.+)/s);
    if (match) {
      return match[1] + '\n\n' + match[2].trim();
    }
  }
  return content;
}

function sanitizeProse(content) {
  // Add paragraph breaks if wall of text
  if (!content.includes('\n\n') && content.length > 500) {
    // Split at sentence boundaries after ~200 chars
    return content.replace(/([.!?]+\s+)(?=[A-Z])/g, '$1\n\n');
  }
  return content;
}

function sanitizePoem(content) {
  // Normalize stanza breaks
  return content.replace(/\n{3,}/g, '\n\n');
}

// ============================================
// CLI INTERFACE
// ============================================
function validateFile(filepath, type = 'auto') {
  const content = fs.readFileSync(filepath, 'utf-8');
  const result = validate(content, type);
  
  console.log(`\n🔍 VALIDATING: ${filepath}`);
  console.log(`Type: ${result.type.toUpperCase()}`);
  console.log('='.repeat(60));
  
  if (result.stats) {
    console.log('\n📊 Stats:');
    Object.entries(result.stats).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        console.log(`   ${k}: ${v.length > 0 ? v.slice(0, 5).join(', ') + (v.length > 5 ? '...' : '') : 'none'}`);
      } else {
        console.log(`   ${k}: ${v}`);
      }
    });
  }
  
  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach(e => console.log(`   • ${e}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    result.warnings.forEach(w => console.log(`   • ${w}`));
  }
  
  if (result.valid && result.errors.length === 0) {
    console.log('\n✅ VALID');
  }
  
  console.log('='.repeat(60));
  return result;
}

// Export
module.exports = {
  validate,
  validateEmail,
  validateProse,
  validatePoem,
  validateProfessional,
  validateNovel,
  sanitizeEmail,
  sanitizeProse,
  sanitizePoem,
  validateFile
};

// CLI
if (require.main === module) {
  const filepath = process.argv[2];
  const type = process.argv[3] || 'auto';
  
  if (!filepath) {
    console.log('Usage: node writing-validators.js <file> [type]');
    console.log('Types: email, prose, poetry, professional, novel, auto');
    process.exit(1);
  }
  
  validateFile(filepath, type);
}
