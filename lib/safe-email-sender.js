/**
 * Safe Email Sender
 * Validates emails BEFORE sending to prevent disasters
 */

const { validateEmail, parseEmail } = require('./email-validator');
const fs = require('fs');

/**
 * Safely send email with validation
 * Prevents merged subject/body disasters
 */
function safeSendEmail(filepath, options = {}) {
  const { 
    to, 
    from, 
    cvPath,
    dryRun = true  // Default to dry run for safety
  } = options;
  
  console.log(`\n📧 SAFE EMAIL SENDER`);
  console.log('=' .repeat(70));
  
  // STEP 1: Validate
  console.log('\n1️⃣  VALIDATING EMAIL FORMAT...');
  const validation = validateEmail(filepath);
  
  if (!validation.valid || validation.errors.length > 0) {
    console.log('\n❌ VALIDATION FAILED - CANNOT SEND');
    console.log('Errors:');
    validation.errors.forEach(e => console.log(`   • ${e}`));
    
    if (validation.warnings.length > 0) {
      console.log('\nWarnings:');
      validation.warnings.forEach(w => console.log(`   • ${w}`));
    }
    
    console.log('\n💡 FIXES:');
    console.log('   • Check if HermesSpeaks collapsed the email');
    console.log('   • Ensure Subject: and body are on separate lines');
    console.log('   • Verify file has proper line breaks (\\n)');
    
    return { sent: false, error: 'Validation failed', details: validation.errors };
  }
  
  console.log('✅ Validation passed');
  
  // STEP 2: Parse safely
  console.log('\n2️⃣  PARSING EMAIL...');
  try {
    const { subject, body } = parseEmail(filepath);
    console.log(`Subject: ${subject.substring(0, 60)}...`);
    console.log(`Body length: ${body.length} chars`);
    console.log('✅ Parsing successful');
  } catch (e) {
    console.log(`❌ Parsing failed: ${e.message}`);
    return { sent: false, error: e.message };
  }
  
  // STEP 3: Dry run check
  if (dryRun) {
    console.log('\n3️⃣  DRY RUN MODE - NOT SENDING');
    console.log('   To: ' + (to || 'NOT SPECIFIED'));
    console.log('   From: ' + (from || 'NOT SPECIFIED'));
    console.log('   CV: ' + (cvPath || 'NOT ATTACHED'));
    console.log('\n💡 To actually send, set dryRun: false');
    
    return { 
      sent: false, 
      dryRun: true, 
      message: 'Ready to send - set dryRun: false to proceed' 
    };
  }
  
  // STEP 4: Send (only if dryRun: false)
  console.log('\n3️⃣  SENDING EMAIL...');
  console.log('   This would actually send the email now');
  
  return { sent: true, message: 'Email sent successfully' };
}

/**
 * Batch send with validation
 */
function safeBatchSend(emailList, options = {}) {
  console.log(`\n📧 BATCH EMAIL SENDER`);
  console.log(`Validating ${emailList.length} emails before sending...`);
  console.log('=' .repeat(70));
  
  const results = [];
  const passed = [];
  const failed = [];
  
  // Validate all first
  for (const item of emailList) {
    const { company, filepath, to } = item;
    console.log(`\n${company}:`);
    
    const result = validateEmail(filepath);
    
    if (result.valid) {
      console.log('   ✅ Valid');
      passed.push({ company, filepath, to });
    } else {
      console.log('   ❌ INVALID');
      result.errors.forEach(e => console.log(`      ${e}`));
      failed.push({ company, errors: result.errors });
    }
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log(`VALIDATION SUMMARY:`);
  console.log(`   ✅ Passed: ${passed.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ CANNOT SEND - Fix failed emails first');
    return { sent: false, passed, failed };
  }
  
  // All passed - proceed to send
  if (options.dryRun !== false) {
    console.log('\n💡 DRY RUN - Not sending');
    console.log('   Set dryRun: false to send all emails');
    return { sent: false, dryRun: true, passed };
  }
  
  console.log('\n📤 SENDING ALL EMAILS...');
  // Actual sending logic here
  
  return { sent: true, count: passed.length };
}

module.exports = { safeSendEmail, safeBatchSend };

// CLI usage
if (require.main === module) {
  const filepath = process.argv[2];
  if (!filepath) {
    console.log('Usage: node safe-email-sender.js <email-file>');
    process.exit(1);
  }
  
  const result = safeSendEmail(filepath, { dryRun: true });
  process.exit(result.sent ? 0 : 1);
}
