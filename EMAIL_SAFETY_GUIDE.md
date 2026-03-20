# Email Safety Guide - Preventing Send Disasters

## The Problem

HermesSpeaks `transform()` removes line breaks as part of "cleaning spacing." When you run a structured email (with Subject, greeting, body) through it, **everything collapses into one line**.

**Bad Output:**
```
Subject: Application Dear Team, I'm writing... Thanks, Name
```

**Result:** Entire email becomes the subject line. You look unprofessional.

---

## The Solution

### NEW TOOLS AVAILABLE:

#### 1. `lib/email-validator.js` - Validates before sending

```bash
# Check email format
node lib/email-validator.js /path/to/email.txt

# Output shows:
# ✅ Valid - safe to send
# ❌ INVALID - CRITICAL ERRORS (CANNOT SEND)
```

**Checks:**
- Line breaks exist
- Subject < 150 chars
- Subject doesn't contain "Dear" or "Thanks"
- Body is present
- Has greeting and closing

#### 2. `lib/safe-email-sender.js` - Safe batch sending

```javascript
const { safeBatchSend } = require('./lib/safe-email-sender');

const emails = [
  { company: 'Company', filepath: 'email.txt', to: 'email@company.com' }
];

// Validates ALL first, only sends if all pass
safeBatchSend(emails, { dryRun: false });
```

**Features:**
- Validates all emails first
- Won't send if ANY fail validation
- Dry run mode by default
- Shows exactly what's wrong

---

## Correct Workflow

### Option A: Don't Use HermesSpeaks on Structured Emails

**GOOD - Skip HermesSpeaks:**
```javascript
// Write email manually
const email = `
Subject: Position Application - Name

Dear Team,

Body here...

Thanks,
Name
`;
// Send directly - no transform
```

### Option B: Use HermesSpeaks on Body Only

```javascript
// Extract parts first
const subject = "Subject line here";  // Don't transform
const body = hermesSpeaksTransform(bodyText);  // Transform just the body

// Combine
const email = `Subject: ${subject}\n\n${body}`;
```

### Option C: Validate After Any Transformation

```bash
# 1. Transform (if needed)
hermes-speaks --file input.txt --output output.txt

# 2. VALIDATE
node lib/email-validator.js output.txt

# 3. Only if ✅ VALID, then send
```

---

## Testing the Fix

**Test 1 - Broken Email (catches error):**
```bash
node lib/email-validator.js /tmp/email_loancrate_clean.txt
# Output: ❌ CRITICAL ERRORS (CANNOT SEND)
```

**Test 2 - Good Email (passes):**
```bash
node lib/email-validator.js /tmp/test_proper_email.txt  
# Output: ✅ Email format VALID
```

---

## What Went Wrong (The Original Disaster)

```javascript
// MY BAD CODE:
const content = fs.readFileSync(filepath, 'utf-8');
const lines = content.split('\n');  // HermesSpeaks collapsed to 1 line
const subject = lines[0];           // Everything became subject
const body = lines[2:];             // Empty
```

**What I Should Have Done:**
```javascript
// SAFE CODE:
const { parseEmail } = require('./lib/email-validator');
const { subject, body } = parseEmail(filepath);
// Throws error if merged, catches disaster before send
```

---

## Prevention Checklist

Before sending ANY batch emails:

- [ ] Run `email-validator.js` on each file
- [ ] All must show "✅ VALID"
- [ ] Use `safeBatchSend()` with `dryRun: true` first
- [ ] Review the dry run output
- [ ] Only then set `dryRun: false`

---

## Quick Reference

| Tool | Purpose | Usage |
|------|---------|-------|
| `email-validator.js` | Check single email | `node email-validator.js file.txt` |
| `safe-email-sender.js` | Batch send safely | `safeBatchSend(list, options)` |
| `--dry-run` | Test without sending | Always use first |

**Never send emails without validation again.**
