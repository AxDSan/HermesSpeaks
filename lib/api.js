/**
 * Local Heuristic AI Detection + Score Integration
 * Combines pattern-based detection with external detector results
 */

const https = require('https');
const http = require('http');

/**
 * Make HTTP request with promises
 */
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) req.write(options.body);
    req.end();
  });
}

/**
 * Pattern-based local heuristic detection
 */
function localHeuristicCheck(text) {
  // AI pattern indicators
  const aiPatterns = [
    // Transitional phrases
    { pattern: /\b(additionally|furthermore|moreover|consequently|therefore|however)\b/gi, weight: 3 },
    { pattern: /\b(it is important to note|it is worth mentioning|it should be noted)\b/gi, weight: 4 },
    { pattern: /\b(in conclusion|to summarize|overall)\b/gi, weight: 2 },
    { pattern: /\b(this essay will examine|this paper explores|this study investigates)\b/gi, weight: 3 },
    { pattern: /\b(first and foremost|it goes without saying|in today's world)\b/gi, weight: 3 },
    
    // Template artifacts
    { pattern: /\{[\s\S]*\}/g, weight: 2 },
    { pattern: /\[[\s\S]*\]/g, weight: 2 },
    
    // Jargon/Business speak
    { pattern: /\b(utilize|leverage|implement|demonstrate|facilitate)\b/gi, weight: 2 },
    
    // === WIKIPEDIA SIGNS OF AI WRITING ===
    
    // Content/Significance puffery (overemphasizing importance)
    { pattern: /\b(stands as|serves as|is a testament|is a reminder)\b/gi, weight: 3 },
    { pattern: /\b(vital|significant|crucial|pivotal|key role)\b/gi, weight: 2 },
    { pattern: /\b(underscores|highlights) (its )?importance\b/gi, weight: 3 },
    { pattern: /\b(reflects broader|symbolizing its ongoing)\b/gi, weight: 3 },
    { pattern: /\b(contributing to the|setting the stage for)\b/gi, weight: 2 },
    { pattern: /\b(marking|shaping) the\b/gi, weight: 2 },
    { pattern: /\b(represents a shift)\b/gi, weight: 3 },
    { pattern: /\b(key turning point|evolving landscape|focal point)\b/gi, weight: 3 },
    { pattern: /\b(indelible mark|deeply rooted)\b/gi, weight: 3 },
    
    // Promotional/Travel-guide language
    { pattern: /\b(boasts a|vibrant|rich |profound)\b/gi, weight: 3 },
    { pattern: /\b(enhancing|showcasing|exemplifies)\b/gi, weight: 2 },
    { pattern: /\b(commitment to|natural beauty|nestled)\b/gi, weight: 3 },
    { pattern: /\b(in the heart of|groundbreaking|renowned)\b/gi, weight: 3 },
    { pattern: /\b(featuring|diverse array)\b/gi, weight: 2 },
    
    // Superficial analyses (-ing words that add nothing)
    { pattern: /\b(highlighting|underscoring|emphasizing)\b/gi, weight: 2 },
    { pattern: /\b(ensuring|reflecting|symbolizing)\b/gi, weight: 2 },
    { pattern: /\b(contributing to|cultivating|fostering)\b/gi, weight: 2 },
    { pattern: /\b(encompassing|valuable insights)\b/gi, weight: 2 },
    { pattern: /\b(align with|resonate with)\b/gi, weight: 2 },
    
    // Vague attributions (unnamed sources)
    { pattern: /\b(industry reports|observers have cited)\b/gi, weight: 3 },
    { pattern: /\b(experts argue|some critics argue)\b/gi, weight: 3 },
    { pattern: /\b(several sources|such as\b(?! [\w\s]+[,;:]\s*[\w\s]+$))/.source, weight: 2 },
    
    // Negative parallelisms (formulaic contrast structures)
    { pattern: /\bnot just\s+\w+,\s*but also\s+\w+/gi, weight: 3 },
    { pattern: /\b(not only\s+\w+\s+but\b|not\s+\w+,\s*but\s+\w+)/gi, weight: 3 },
    
    // Em-dashes (overuse)
    { pattern: /—/g, weight: 1 },
    
    // Curly quotation marks
    { pattern: /[""„]/g, weight: 2 },
    
    // Style: Title case in unexpected places
    { pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b/g, weight: 2 },

    // === WIKIPEDIA SIGNS - AI VOCABULARY (post-2022) ===
    
    // High-frequency AI vocabulary words (especially sentence start)
    { pattern: /\bDelve\b/gi, weight: 3 },
    { pattern: /\b(delve into|delve into the)\b/gi, weight: 2 },
    { pattern: /\bbolstered\b/gi, weight: 3 },
    { pattern: /\bgarner\b/gi, weight: 3 },
    { pattern: /\binterplay\b/gi, weight: 3 },
    { pattern: /\bintricate\b/gi, weight: 2 },
    { pattern: /\bintricacies\b/gi, weight: 3 },
    { pattern: /\bmeticulous\b/gi, weight: 3 },
    { pattern: /\bmeticulously\b/gi, weight: 3 },
    { pattern: /\btapestry\b/gi, weight: 4 },
    { pattern: /\btestament\b/gi, weight: 3 },
    { pattern: /\bshowcase\b/gi, weight: 2 },
    
    // === WIKIPEDIA SIGNS - COPULATIVE AVOIDANCE PATTERNS ===
    { pattern: /\bserves as a\b/gi, weight: 3 },
    { pattern: /\bstands as\b/gi, weight: 3 },
    { pattern: /\bmarks the\b/gi, weight: 3 },
    { pattern: /\brepresents a\b/gi, weight: 2 },
    { pattern: /\bfeatures a\b/gi, weight: 3 },
    { pattern: /\boffers a\b/gi, weight: 3 },
    
    // === WIKIPEDIA SIGNS - OUTLINE-LIKE CONCLUSIONS ===
    { pattern: /Despite its [\w\s]+, (faces challenges|encountered challenges|has faced challenges)/gi, weight: 4 },
    { pattern: /Despite these challenges/gi, weight: 3 },
    { pattern: /\bFuture prospects\b/gi, weight: 3 },
    { pattern: /\bChallenges and legacy\b/gi, weight: 4 },
    
    // === WIKIPEDIA SIGNS - COLLABORATIVE COMMUNICATION (AI-to-user) ===
    { pattern: /\bI hope this helps\b/gi, weight: 4 },
    { pattern: /\bOf course\b/gi, weight: 3 },
    { pattern: /\bCertainly,\b/gi, weight: 2 },
    { pattern: /\bWould you like\b/gi, weight: 3 },
    { pattern: /\bLet me know\b/gi, weight: 3 },
    { pattern: /\bHere is a\b/gi, weight: 3 },
    { pattern: /\bhere is the\b/gi, weight: 2 },
    
    // === WIKIPEDIA SIGNS - KNOWLEDGE CUTOFF DISCLAIMERS ===
    { pattern: /\bas of my knowledge cutoff\b/gi, weight: 4 },
    { pattern: /\bbased on available information\b/gi, weight: 4 },
    { pattern: /\bwhile specific details are limited\b/gi, weight: 4 },
    { pattern: /\bnot widely documented\b/gi, weight: 4 },
    { pattern: /\b截至我的知识截止日期\b/gi, weight: 4 },
    { pattern: /\b截至我最后的\b/gi, weight: 4 },
    
    // === WIKIPEDIA SIGNS - EMOJI DETECTION ===
    { pattern: /[\u{1F300}-\u{1F9FF}]/gu, weight: 4 },
    { pattern: /[\u{2600}-\u{26FF}]/gu, weight: 3 },
    { pattern: /[\u{2700}-\u{27BF}]/gu, weight: 3 },
    
    // === WIKIPEDIA SIGNS - RULE OF THREE ===
    { pattern: /\b(\w+), \w+, and \w+/gi, weight: 2 },
    { pattern: /\bfirst[\s,]+second[\s,]+third/gi, weight: 3 },
    { pattern: /\bone[\s,]+two[\s,]+three/gi, weight: 3 },

    // === ADDITIONAL AI PATTERNS FROM SYSTEM PROMPT ===

    // False Ranges - items that aren't actually on a spectrum
    { pattern: /\b(ranging from|range from|varies from)\s+[\w\s]+,\s*\w+\s+to\s+[\w\s]+/gi, weight: 3 },

    // Elegant Variation - forced awkward synonyms
    { pattern: /\b(furthermore|additionally),?\s*(likewise|similarly|conversely)\b/gi, weight: 2 },
    { pattern: /\b(the\s+\w+ing)\s+(?:also|likewise)\b/gi, weight: 2 },

    // Passive Voice Overuse
    { pattern: /\b(was|were|been|being|is|are)\s+\w+ed\b/gi, weight: 1 },
    { pattern: /\b(has been|was being|were being)\s+\w+/gi, weight: 2 },

    // Clichéd Metaphors
    { pattern: /\b(tip of the iceberg|drop in the ocean|neck of the woods|bread and butter|safe bet|wheels turn)\b/gi, weight: 3 },
    { pattern: /\b(play devil's advocate|hang in the balance|mix bag)\b/gi, weight: 3 },

    // Overly Formal Tone
    { pattern: /\b(kindly|pray|prithee|pray tell)\b/gi, weight: 3 },
    { pattern: /\b(it is advised|it is recommended|it is suggested)\b/gi, weight: 2 },
    { pattern: /\b(please be advised|please note that)\b/gi, weight: 3 },

    // Absence of Uncertainty - AI rarely admits it doesn't know
    { pattern: /\b(absolute certainty|undoubtedly|irrefutable|incontrovertible)\b/gi, weight: 3 },
    { pattern: /\b(it is beyond doubt|there is no doubt)\b/gi, weight: 3 },

    // Statistical Artifacts - potential hallucinated stats
    { pattern: /\b(\d+(\.\d+)?%)\s+(of|percentage|rate|increase|decline)/gi, weight: 1 },
    { pattern: /\b(studies show|research indicates|evidence suggests)\b/gi, weight: 2 },

    // Generic Examples
    { pattern: /\b(for example|for instance)\s+(?:the|a|an)\s+\w+\s+\w+\s+(?:like|such as)/gi, weight: 2 },
    { pattern: /\b(such as|like)\s+(?:the\s+)?(\w+\s+){1,2}(and|or)\s+/gi, weight: 2 },

    // Redundant Adjectives
    { pattern: /\b(true\s+facts|actual\s+reality|future\s+prospects|past\s+history)\b/gi, weight: 3 },
    { pattern: /\b(important\s+vital|crucial\s+essential|basic\s+fundamental)\b/gi, weight: 3 },

    // NEW: Taxonomy-based markers - LEXICAL PATTERNS
    
    // Academic/formal AI phrases
    { pattern: /\b(delve into|tapestry of|ever-evolving landscape|in the realm of|it is imperative that)\b/gi, weight: 4 },
    
    // Connective overuse (>12 per 500 words indicates AI)
    { pattern: /\b(Moreover|Furthermore|Additionally|In addition)\b/gi, weight: 3 },
    
    // NEW: Taxonomy-based markers - DISCOURSE MARKERS
    
    // Cognitive absence - lack of personal opinion markers
    { pattern: /\b(I believe|I think|I feel|I suspect|I doubt|I reckon)\b/gi, weight: -2 },
    
    // Epistemic hedging - excessive without genuine uncertainty
    { pattern: /\b(might be|could be|possibly|perhaps|may be)\b/gi, weight: 2 },
    
    // Ethical disclaimers
    { pattern: /\b(As an AI|I must note|It is important to note that)\b/gi, weight: 5 },
    
    // NEW: Taxonomy-based markers - PRAGMATIC MARKERS
    
    // Politeness overdrive
    { pattern: /\b(Thank you|Please|I appreciate your|I'd be happy to)\b/gi, weight: 4 },
    
    // Excessive positivity
    { pattern: /\b(remarkable|outstanding|exceptional)\b/gi, weight: 3 },
  ];

  // Human pattern indicators
  const humanPatterns = [
    { pattern: /[!]{2,}/g, weight: 3 },
    { pattern: /\b(lol|lmao|omg|wow|gosh|heck)\b/gi, weight: 4 },
    { pattern: /\([\w\s]+\)/g, weight: 1 },
    { pattern: /\b(I think|I feel|I believe|honestly|personally)\b/gi, weight: 3 },
    { pattern: /\b(gonna|wanna|kinda|sorta|dunno|gonna)\b/gi, weight: 3 },
    { pattern: /\b(that's|doesn't|won't|can't|isn't)\b/gi, weight: 1 },

    // NEW: Taxonomy-based markers - HUMAN PATTERNS
    
    // Second-person presence (engages reader)
    { pattern: /\b(you|your)\b/gi, weight: 2 },
    
    // Emotional expression
    { pattern: /\b(frustrating|annoying|disappointed|love|hate)\b/gi, weight: 4 },
    
    // Hedging for genuine uncertainty
    { pattern: /\b(I don't know|I'm not sure)\b/gi, weight: 3 },
    
    // Informal markers
    { pattern: /\b(tbh|TBH)\b/gi, weight: 5 },
  ];

  let aiScore = 0;
  let humanScore = 0;
  const foundPatterns = { ai: [], human: [] };

  // Check AI patterns
  for (const { pattern, weight } of aiPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      aiScore += matches.length * weight;
      foundPatterns.ai.push(...matches.slice(0, 3));
    }
  }

  // Check human patterns
  for (const { pattern, weight } of humanPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      // Handle negative weights (cognitive absence markers - they add to human score when ABSENT)
      if (weight < 0) {
        humanScore += Math.abs(weight);
      } else {
        humanScore += matches.length * weight;
      }
      foundPatterns.human.push(...matches.slice(0, 3));
    }
  }

  // Sentence structure analysis
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length > 2) {
    const wordCounts = sentences.map(s => s.split(/\s+/).length);
    const avgLength = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    const variance = wordCounts.reduce((sum, w) => sum + Math.pow(w - avgLength, 2), 0) / wordCounts.length;
    const stdDev = Math.sqrt(variance);
    
    // Very uniform sentence lengths = more robotic
    if (stdDev < 3) aiScore += 8;
    else if (stdDev > 6) humanScore += 3;
  }

  // Overly Complex Sentences - very long sentences (>40 words) - check all sentences
  if (sentences.length > 0) {
    const wordCounts = sentences.map(s => s.split(/\s+/).length);
    const longSentences = wordCounts.filter(w => w > 40).length;
    if (longSentences > 0) {
      aiScore += longSentences * 2;
    }
  }

  // Em-dashes (already covered in patterns above)
  
  // Copulative avoidance check (AI sometimes avoids "is/are")
  const words = text.split(/\s+/);
  const copulaCount = (text.match(/\b(is|are|was|were|be|been|being)\b/gi) || []).length;
  const copulaRatio = copulaCount / Math.max(words.length, 1);
  // Normal copula ratio is around 5-8% - unusually low suggests AI
  if (copulaRatio < 0.03 && words.length > 50) {
    aiScore += 4;
  }
  
  // First-person presence (more human)
  const firstPerson = (text.match(/\b(I|me|my|mine|we|us|our)\b/gi) || []).length;
  if (firstPerson > 0) humanScore += firstPerson * 2;

  // Hedging language (more AI)
  const hedging = (text.match(/\b(might|may|could|possibly|perhaps|might be|could be)\b/gi) || []).length;
  if (hedging > 2) aiScore += hedging * 1.5;

  // Contractions (more human)
  const contractions = (text.match(/'\w{2,3}/g) || []).length;
  if (contractions > 3) humanScore += contractions;
  
  // NEW: Taxonomy-based scoring - Proper noun density
  const properNounPattern = /\b[A-Z][a-z]+\b/g;
  const properNounMatches = text.match(properNounPattern) || [];
  let properNounDensity = properNounMatches.length / Math.max(words.length, 1);
  // Lower proper noun density indicates AI (AI generates fewer named entities)
  if (properNounDensity < 0.03 && words.length > 50) {
    aiScore += 3;
  } else if (properNounDensity > 0.06) {
    humanScore += 2;
  }
  
  // NEW: Taxonomy-based scoring - Third-person vs First-person pronoun ratio
  let thirdPerson = (text.match(/\b(they|their|theirs)\b/gi) || []).length;
  let firstPersonAll = (text.match(/\b(I|me|my|mine|we|us|our)\b/gi) || []).length;
  let pronounRatio = thirdPerson / Math.max(firstPersonAll, 1);
  if (firstPersonAll > 0) {
    // High third-person to first-person ratio indicates AI
    if (pronounRatio > 3) aiScore += 4;
  }
  
  // NEW: Taxonomy-based scoring - Type-Token Ratio (TTR) for lexical diversity
  function calculateTTR(wordArray) {
    const uniqueWords = new Set(wordArray.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
    return uniqueWords.size / Math.max(wordArray.length, 1);
  }
  
  if (words.length >= 50) {
    // Check TTR in 50-word windows
    const windowSize = 50;
    let lowTTRCount = 0;
    for (let i = 0; i <= words.length - windowSize; i += windowSize) {
      const window = words.slice(i, i + windowSize);
      const ttr = calculateTTR(window);
      if (ttr < 0.72) lowTTRCount++;
    }
    // Multiple low TTR windows indicate AI (repetitive vocabulary)
    if (lowTTRCount > 1) aiScore += 5;
  }
  
  // NEW: Taxonomy-based scoring - Metadiscourse density (connectives per 500 words)
  const connectivePattern = /\b(Moreover|Furthermore|Additionally|In addition|furthermore|moreover|additionally)\b/gi;
  const connectives = (text.match(connectivePattern) || []).length;
  let connectiveDensity = (connectives / Math.max(words.length, 1)) * 500;
  if (connectiveDensity > 12) aiScore += 4;
  
  // NEW: Taxonomy-based scoring - Sentiment analysis for positivity bias
  const positiveWords = (text.match(/\b(remarkable|outstanding|exceptional|excellent|wonderful|fantastic|brilliant|extraordinary)\b/gi) || []).length;
  const negativeWords = (text.match(/\b(terrible|horrible|awful|dreadful|poor|failure|disappointing|frustrating)\b/gi) || []).length;
  let positivityRatio = positiveWords / Math.max(positiveWords + negativeWords, 1);
  // High positivity ratio without negative words suggests AI
  if (positivityRatio > 0.8 && positiveWords > 2) aiScore += 3;
  
  // NEW: Taxonomy-based scoring - Given-New rigidity (formulaic paragraph structure)
  const paragraphCount = text.split(/\n\n+/).filter(p => p.trim().length > 50).length;
  if (paragraphCount > 0) {
    const sentencesPerParagraph = sentences.length / paragraphCount;
    // Very uniform sentences per paragraph suggests formulaic AI writing
    if (sentencesPerParagraph >= 2 && sentencesPerParagraph <= 4) aiScore += 2;
  }

  // Calculate percentage with adjustments
  const total = aiScore + humanScore;
  const rawPercent = total > 0 ? (aiScore / (aiScore + humanScore)) * 100 : 50;
  
  // Bias toward 50% if no clear signals
  const confidence = Math.min(total / 20, 1);
  const aiPercent = Math.round(50 + (rawPercent - 50) * confidence);

  // Clamp to 0-100
  const finalPercent = Math.max(0, Math.min(100, aiPercent));

  return {
    detector: 'Heuristic',
    url: 'Local analysis',
    success: true,
    results: {
      aiPercentage: finalPercent,
      humanPercentage: 100 - finalPercent,
      confidence: Math.round(confidence * 100),
      aiScore: Math.round(aiScore * 10) / 10,
      humanScore: Math.round(humanScore * 10) / 10
    },
    raw: { 
      aiScore: Math.round(aiScore * 10) / 10, 
      humanScore: Math.round(humanScore * 10) / 10,
      foundPatterns,
      taxonomyMetrics: {
        properNounDensity: Math.round(properNounDensity * 1000) / 1000,
        pronounRatio: Math.round((thirdPerson / Math.max(firstPersonAll, 1)) * 100) / 100,
        connectiveDensity: Math.round(connectiveDensity * 10) / 10,
        positivityRatio: Math.round(positivityRatio * 100) / 100
      }
    }
  };
}

/**
 * Integrate external detector results with local heuristic
 * Creates a weighted composite score
 */
function integrateScores(detectorResults, weights = {}) {
  const scores = [];
  
  // Default weights
  const defaultWeights = {
    heuristic: 0.2,
    gptzero: 0.25,
    zerogpt: 0.2,
    winston: 0.175,
    originality: 0.175
  };
  
  const w = { ...defaultWeights, ...weights };
  
  for (const [name, result] of Object.entries(detectorResults)) {
    if (!result.success) continue;
    
    const r = result.results || {};
    const aiPct = r.aiPercentage;
    
    if (aiPct !== undefined && aiPct !== null) {
      const weight = w[name] || 0;
      scores.push({ name, aiPercent: aiPct, weight });
    }
  }
  
  if (scores.length === 0) {
    return { 
      integratedPercent: null, 
      confidence: 0,
      scores,
      method: 'No valid scores'
    };
  }
  
  // Weighted average
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = scores.reduce((sum, s) => sum + (s.aiPercent * s.weight), 0);
  const integratedPercent = Math.round(weightedSum / totalWeight);
  
  // Confidence based on number of detectors and agreement
  const agreement = scores.length > 1 
    ? 1 - (Math.max(...scores.map(s => s.aiPercent)) - Math.min(...scores.map(s => s.aiPercent))) / 100
    : 0.5;
  const confidence = Math.round(((scores.length / 5) * 0.6 + agreement * 0.4) * 100);
  
  return {
    integratedPercent,
    confidence,
    scores,
    method: `Weighted average of ${scores.length} detectors`
  };
}

module.exports = {
  request,
  localHeuristicCheck,
  integrateScores
};
