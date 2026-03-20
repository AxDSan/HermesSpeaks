/**
 * Email Validator & Formatter
 * Prevents disasters like merged subject/body
 */

const fs = require('fs');

/**
 * Validates and sanitizes email before sending
 * Catches formatting disasters before they go out
 */
function validateEmail(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const errors = [];
  const warnings = [];
  
  // Check 1: Must have line breaks
  if (!content.includes('\n')) {
    errors.push('CRITICAL: No line breaks found - email may be collapsed');
  }
  
  const lines = content.split('\n');
  
  // Check 2: Must have Subject: line
  const subjectLine = lines.find(l => l.startsWith('Subject:'));
  if (!subjectLine) {
    errors.push('CRITICAL: Missing Subject: line');
  } else {
    const subject = subjectLine.replace('Subject:', '').trim();
    
    // Check 3: Subject reasonable length
    if (subject.length > 150) {
      errors.push(`CRITICAL: Subject too long (${subject.length} chars) - merged with body?`);
    }
    if (subject.length > 100) {
      warnings.push(`WARNING: Subject long (${subject.length} chars)`);
    }
    if (subject.length < 10) {
      warnings.push('WARNING: Subject very short');
    }
    
    // Check 4: Subject doesn't contain body text indicators
    if (subject.includes('Dear ') || subject.includes('Hello ') || subject.includes('Hi ')) {
      errors.push('CRITICAL: Subject contains greeting - merged with body!');
    }
    if (subject.includes('Best regards') || subject.includes('Thank you') || subject.includes('Thanks')) {
      errors.push('CRITICAL: Subject contains closing - merged with body!');
    }
  }
  
  // Check 5: Has body content (not just subject)
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  if (nonEmptyLines.length < 3) {
    errors.push('CRITICAL: Email body too short or missing');
  }
  
  // Check 6: Has greeting
  const hasGreeting = lines.some(l => 
    l.includes('Dear ') || l.includes('Hello ') || l.includes('Hi ')
  );
  if (!hasGreeting) {
    warnings.push('WARNING: No greeting found (Dear/Hello/Hi)');
  }
  
  // Check 7: Has closing
  const hasClosing = lines.some(l => 
    l.includes('Best regards') || 
    l.includes('Thank you') || 
    l.includes('Thanks') ||
    l.includes('Sincerely')
  );
  if (!hasClosing) {
    warnings.push('WARNING: No closing found');
  }
  
  // Check 8: Has signature with email
  const hasEmail = lines.some(l => l.includes('@') && l.includes('.'));
  if (!hasEmail) {
    warnings.push('WARNING: No email address in signature');
  }
  
  // Check 9: Total length reasonable
  if (content.length < 200) {
    warnings.push('WARNING: Email very short');
  }
  if (content.length > 5000) {
    warnings.push('WARNING: Email very long');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    subject: subjectLine ? subjectLine.replace('Subject:', '').trim() : 'NOT FOUND',
    lineCount: lines.length,
    charCount: content.length
  };
}

/**
 * Safely parses email into subject and body
 * Handles collapsed emails gracefully
 */
function parseEmail(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // Try to find Subject: line
  const subjectMatch = content.match(/^Subject:\s*(.+?)(?=\n\n|\nDear|\nHello|$)/mi);
  
  if (!subjectMatch) {
    throw new Error('Could not find Subject: line');
  }
  
  const subject = subjectMatch[1].trim();
  
  // Extract body (everything after subject line + blank line)
  const subjectIndex = content.indexOf(subjectMatch[0]);
  const afterSubject = content.slice(subjectIndex + subjectMatch[0].length);
  
  // Remove leading whitespace/newlines
  const body = afterSubject.replace(/^\s+/, '');
  
  // Validate extracted parts
  if (subject.length > 200) {
    throw new Error(`Subject too long (${subject.length} chars) - likely merged with body`);
  }
  
  if (body.length < 50) {
    throw new Error('Body too short or missing');
  }
  
  return { subject, body };
}

/**
 * Main validation runner
 * Use this before sending ANY email
 */
function validateBeforeSend(filepath) {
  console.log(`\n🔍 Validating: ${filepath}`);
  console.log('=' .repeat(60));
  
  const result = validateEmail(filepath);
  
  console.log(`Subject: ${result.subject.substring(0, 80)}...`);
  console.log(`Lines: ${result.lineCount} | Chars: ${result.charCount}`);
  console.log('');
  
  if (result.errors.length > 0) {
    console.log('❌ CRITICAL ERRORS (CANNOT SEND):');
    result.errors.forEach(e => console.log(`   ${e}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    result.warnings.forEach(w => console.log(`   ${w}`));
  }
  
  if (result.valid && result.errors.length === 0) {
    console.log('✅ Email format VALID');
  }
  
  console.log('=' .repeat(60));
  
  return result;
}

// CLI usage
if (require.main === module) {
  const filepath = process.argv[2];
  if (!filepath) {
    console.log('Usage: node email-validator.js <email-file>');
    process.exit(1);
  }
  
  const result = validateBeforeSend(filepath);
  process.exit(result.valid ? 0 : 1);
}

module.exports = { validateEmail, parseEmail, validateBeforeSend };
