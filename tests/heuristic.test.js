const { localHeuristicCheck } = require('../lib/api');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const fixturesDir = path.join(__dirname, 'fixtures');

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

console.log('\n=== Heuristic Detection Test Suite ===\n');

runTest('AI text returns high score', () => {
  const aiText = 'Furthermore, it is important to note that utilizing these methodologies facilitates enhanced operational efficiency.';
  const result = localHeuristicCheck(aiText);
  assert(result.results.aiPercentage > 60, `Expected >60, got ${result.results.aiPercentage}`);
});

runTest('Human text returns low score', () => {
  const humanText = 'I honestly think this is pretty dumb, but hey, thats just my opinion. OMG did you see that?! lol';
  const result = localHeuristicCheck(humanText);
  assert(result.results.aiPercentage < 40, `Expected <40, got ${result.results.aiPercentage}`);
});

runTest('Contractions reduce AI score', () => {
  const noContractions = 'It is important to note that implementation facilitates improvements.';
  const withContractions = "It's important to note that implementation doesn't facilitate improvements.";

  const resultNoContract = localHeuristicCheck(noContractions);
  const resultWithContract = localHeuristicCheck(withContractions);

  assert(resultWithContract.results.aiPercentage < resultNoContract.results.aiPercentage,
    `Contractions should reduce AI score. Without: ${resultNoContract.results.aiPercentage}, With: ${resultWithContract.results.aiPercentage}`);
});

runTest('First-person pronouns reduce AI score', () => {
  const noFirstPerson = 'It is important to note that this methodology facilitates improvements.';
  const withFirstPerson = 'I think this methodology is important. We can implement improvements.';

  const resultNoFP = localHeuristicCheck(noFirstPerson);
  const resultWithFP = localHeuristicCheck(withFirstPerson);

  assert(resultWithFP.results.aiPercentage < resultNoFP.results.aiPercentage,
    `First-person should reduce AI score. Without: ${resultNoFP.results.aiPercentage}, With: ${resultWithFP.results.aiPercentage}`);
});

runTest('Uniform sentence lengths increase AI score', () => {
  const variedLengths = 'Short. This is medium length. Here is another sentence with more words than most others would have.';
  const uniformLengths = 'This is a test sentence. This is another test. One more test sentence here.';

  const resultVaried = localHeuristicCheck(variedLengths);
  const resultUniform = localHeuristicCheck(uniformLengths);

  assert(resultUniform.results.aiPercentage > resultVaried.results.aiPercentage,
    `Uniform sentences should score higher. Varied: ${resultVaried.results.aiPercentage}, Uniform: ${resultUniform.results.aiPercentage}`);
});

runTest('Empty or short text returns ~50%', () => {
  const emptyResult = localHeuristicCheck('');
  const shortResult = localHeuristicCheck('Hi');

  assert(emptyResult.results.aiPercentage >= 45 && emptyResult.results.aiPercentage <= 55,
    `Empty text should return ~50, got ${emptyResult.results.aiPercentage}`);
  assert(shortResult.results.aiPercentage >= 45 && shortResult.results.aiPercentage <= 55,
    `Short text should return ~50, got ${shortResult.results.aiPercentage}`);
});

runTest('Hedging language increases AI score', () => {
  const noHedging = 'The solution will work effectively.';
  const withHedging = 'The solution might work possibly. It could be effective perhaps.';

  const resultNoHedge = localHeuristicCheck(noHedging);
  const resultWithHedge = localHeuristicCheck(withHedging);

  assert(resultWithHedge.results.aiPercentage > resultNoHedge.results.aiPercentage,
    `Hedging should increase AI score. Without: ${resultNoHedge.results.aiPercentage}, With: ${resultWithHedge.results.aiPercentage}`);
});

runTest('Business jargon increases AI score', () => {
  const noJargon = 'We should use these methods to get better results.';
  const withJargon = 'We should utilize these methodologies to leverage improved outcomes.';

  const resultNoJargon = localHeuristicCheck(noJargon);
  const resultWithJargon = localHeuristicCheck(withJargon);

  assert(resultWithJargon.results.aiPercentage > resultNoJargon.results.aiPercentage,
    `Business jargon should increase AI score. Without: ${resultNoJargon.results.aiPercentage}, With: ${resultWithJargon.results.aiPercentage}`);
});

runTest('Fixture: AI text file returns high score', () => {
  const aiText = fs.readFileSync(path.join(fixturesDir, 'ai-text.txt'), 'utf-8');
  const result = localHeuristicCheck(aiText);
  assert(result.results.aiPercentage > 60, `Expected >60, got ${result.results.aiPercentage}`);
});

runTest('Fixture: Human text file returns low score', () => {
  const humanText = fs.readFileSync(path.join(fixturesDir, 'human-text.txt'), 'utf-8');
  const result = localHeuristicCheck(humanText);
  assert(result.results.aiPercentage < 40, `Expected <40, got ${result.results.aiPercentage}`);
});

runTest('Fixture: Mixed text returns middle score', () => {
  const mixedText = fs.readFileSync(path.join(fixturesDir, 'mixed-text.txt'), 'utf-8');
  const result = localHeuristicCheck(mixedText);
  assert(result.results.aiPercentage >= 30 && result.results.aiPercentage <= 70,
    `Expected 30-70, got ${result.results.aiPercentage}`);
});

runTest('Result structure is correct', () => {
  const result = localHeuristicCheck('Test text');

  assert(result.detector === 'Heuristic', 'detector should be Heuristic');
  assert(result.success === true, 'success should be true');
  assert(typeof result.results.aiPercentage === 'number', 'aiPercentage should be a number');
  assert(typeof result.results.humanPercentage === 'number', 'humanPercentage should be a number');
  assert(typeof result.results.confidence === 'number', 'confidence should be a number');
  assert(result.results.aiPercentage + result.results.humanPercentage === 100,
    'AI + human percentages should equal 100');
});

runTest('AI and human percentages sum to 100', () => {
  const aiText = 'Furthermore, utilizing these methodologies facilitates operational efficiency.';
  const humanText = 'I honestly think this is pretty dumb. lol';

  const aiResult = localHeuristicCheck(aiText);
  const humanResult = localHeuristicCheck(humanText);

  assert(aiResult.results.aiPercentage + aiResult.results.humanPercentage === 100,
    `AI text: ${aiResult.results.aiPercentage} + ${aiResult.results.humanPercentage} should equal 100`);
  assert(humanResult.results.aiPercentage + humanResult.results.humanPercentage === 100,
    `Human text: ${humanResult.results.aiPercentage} + ${humanResult.results.humanPercentage} should equal 100`);
});

console.log('\n=== Tests Complete ===\n');
