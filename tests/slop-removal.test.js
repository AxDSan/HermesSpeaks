#!/usr/bin/env node
/**
 * HermesSpeaks - Slop Removal Test Suite
 * Run with: node tests/slop-removal.test.js
 */

const { transform } = require('../lib/slop-transform');
const assert = require('assert');

function runTest(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.log(`✗ ${name}`);
    console.log(`  ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n=== HermesSpeaks Slop Removal Test Suite ===\n');

// Basic transformation tests
runTest('Removes throat-clearing openers', () => {
  const input = "Here's the thing: this technology is great.";
  const result = transform(input);
  assert(!result.toLowerCase().includes("here's the thing"), 
    `Expected opener removed, got: ${result}`);
});

runTest('Replaces jargon with simple words', () => {
  const input = "We should leverage this tool.";
  const result = transform(input);
  assert(result.includes('use') && !result.includes('leverage'), 
    `Expected "use", got: ${result}`);
});

runTest('Removes empty adverbs', () => {
  const input = "This is really just actually great.";
  const result = transform(input);
  assert(!result.includes('really') && !result.includes('just') && !result.includes('actually'), 
    `Expected adverbs removed, got: ${result}`);
});

runTest('Fixes passive voice', () => {
  // Note: Full verb conjugation requires NLP library
  // This test checks that passive pattern is transformed
  const input = "The ball was thrown by John.";
  const result = transform(input);
  // Should contain John and ball, not "was thrown by"
  assert(result.includes('John') && result.includes('ball') && !result.includes('was thrown by'), 
    `Expected passive converted, got: ${result}`);
});

runTest('Removes filler phrases', () => {
  const input = "At its core, this is important.";
  const result = transform(input);
  assert(!result.toLowerCase().includes('at its core'), 
    `Expected filler removed, got: ${result}`);
});

runTest('Handles empty input', () => {
  const result = transform('');
  assert(result === '', `Expected empty string, got: ${result}`);
});

runTest('Handles null/undefined', () => {
  const result1 = transform(null);
  const result2 = transform(undefined);
  assert(result1 === null && result2 === undefined, 
    `Expected null/undefined passthrough`);
});

// Full pipeline tests
runTest('Complex AI text becomes human', () => {
  const input = `It is important to note that we are leveraging cutting-edge 
    technology to facilitate optimal outcomes. Furthermore, it should be noted 
    that this truly revolutionary approach underscores our commitment.`;
  
  const result = transform(input);
  
  // Should be shorter (at least 10% reduction)
  assert(result.length < input.length * 0.9, 
    `Expected significant reduction, original: ${input.length}, result: ${result.length}`);
  
  // Should not contain slop patterns
  assert(!result.includes('It is important to note'), 
    `Still contains throat-clearing`);
  assert(!result.includes('leverag'), 
    `Still contains jargon`);
  assert(!result.includes('truly'), 
    `Still contains empty adverbs`);
});

runTest('Preserves meaning while simplifying', () => {
  const input = "We need to leverage AI to facilitate improvements.";
  const result = transform(input);
  
  assert(result.toLowerCase().includes('ai'), 
    `Lost key term "AI" in: ${result}`);
  assert(result.toLowerCase().includes('improve') || result.toLowerCase().includes('better'), 
    `Lost concept of improvement in: ${result}`);
});

console.log('\n' + (process.exitCode ? '❌ Some tests failed' : '✅ All tests passed') + '\n');
