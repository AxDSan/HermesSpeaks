# Testing HermesSpeaks

## Pre-flight Checklist

Before releasing, run these tests:

### 1. Install Dependencies

```bash
cd HermesSpeaks
npm install
```

### 2. Run Unit Tests

```bash
# Test slop removal logic
node tests/slop-removal.test.js

# Test heuristic detection (original tests)
node tests/heuristic.test.js
```

Expected: All tests pass with ✅

### 3. Manual CLI Tests

```bash
# Test 1: Basic slop removal
node hermes-speaks.js "It is important to note that we are leveraging AI."

# Expected output: Should show metrics and cleaned text
# Should NOT contain "It is important to note" or "leveraging"

# Test 2: File input/output
echo "Furthermore, utilizing this approach facilitates success." > test-input.txt
node hermes-speaks.js --file test-input.txt --output test-output.txt
cat test-output.txt

# Expected: File should contain "use" not "utilizing"

# Test 3: Piped input
echo "This is really just actually great." | node hermes-speaks.js

# Expected: Should not contain "really", "just", or "actually"

# Test 4: Detection mode (secondary)
node hermes-speaks.js --detect "It is important to note that..."

# Expected: Should show AI score/verdict

# Test 5: With scores
node hermes-speaks.js --score "It is important to note that we leverage AI."

# Expected: Should show before/after scores

# Test 6: JSON output
node hermes-speaks.js --json "Leverage this tool." | python3 -m json.tool

# Expected: Valid JSON with original, cleaned, metrics

# Test 7: Empty input handling
node hermes-speaks.js ""

# Expected: Error message about no text provided

# Test 8: Help
node hermes-speaks.js --help

# Expected: Show usage information
```

### 4. Integration Test

```bash
# Create a sample AI-generated text
cat > sample-ai.txt << 'EOF'
It is important to note that in today's rapidly evolving landscape, 
organizations must leverage cutting-edge technologies to facilitate 
optimal outcomes. Furthermore, it should be noted that utilizing 
AI-driven solutions truly underscores a commitment to innovation.
EOF

# Clean it
node hermes-speaks.js --file sample-ai.txt --output cleaned.txt

# Verify
wc -c sample-ai.txt cleaned.txt  # cleaned should be significantly smaller
grep -c "It is important" cleaned.txt  # should be 0
grep -c "leverage" cleaned.txt  # should be 0
grep -c "truly" cleaned.txt  # should be 0
```

### 5. Edge Cases

```bash
# Very long text
node hermes-speaks.js --file README.md

# Special characters
node hermes-speaks.js "Here's the thing: AI—it's great! 'Revolutionary' they said."

# Multiple paragraphs
echo -e "First paragraph.\n\nSecond paragraph with leverage.\n\nThird." | node hermes-speaks.js

# Mixed quotes (smart quotes)
node hermes-speaks.js '"Smart quotes" should become "straight quotes"'
```

### 6. Performance Check

```bash
# Time a large file
time node hermes-speaks.js --file README.md > /dev/null

# Should complete in < 1 second for files < 100KB
```

## Expected Behavior

### Slop Removal

| Input Pattern | Expected Output |
|---------------|-----------------|
| "It is important to note that..." | Remove entirely |
| "We should leverage..." | "We should use..." |
| "This is really just..." | "This is..." |
| "Not just X, but also Y" | "X and Y" |
| "The ball was thrown by John" | "John threw the ball" |
| "Here's the thing:" | Remove entirely |

### Detection Mode

| Input | Expected Score |
|-------|----------------|
| "It is important to note..." | > 70 (high AI) |
| "I think this is pretty cool." | < 40 (low AI) |
| "wtf lol idk" | < 30 (human) |

## Troubleshooting

### "Cannot find module"

```bash
npm install
```

### "Permission denied"

```bash
chmod +x hermes-speaks.js
```

### "Command not found"

```bash
# Use node explicitly
node hermes-speaks.js "text"

# Or install globally
npm install -g .
hermes-speaks "text"
```

## CI/CD Test Script

```bash
#!/bin/bash
set -e

npm install
node tests/slop-removal.test.js
node tests/heuristic.test.js

# Quick sanity check
output=$(node hermes-speaks.js "Leverage this tool.")
if echo "$output" | grep -q "leverage"; then
  echo "FAIL: Jargon not replaced"
  exit 1
fi

echo "All tests passed!"
```

## Sign-off

Before release, verify:

- [ ] All unit tests pass
- [ ] Manual CLI tests pass
- [ ] Edge cases handled
- [ ] Performance acceptable (< 1s for typical inputs)
- [ ] No error messages in normal operation
- [ ] Help text accurate
- [ ] README examples work
