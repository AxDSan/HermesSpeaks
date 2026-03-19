/**
 * Slop Transform Module
 * 
 * Removes AI writing patterns from prose following rules from:
 * - references/phrases.md
 * - references/structures.md
 * - SKILL.md
 */

const THROAT_CLEARING_OPENERS = [
  "here's the thing",
  "here's what ",
  "here's this ",
  "here's that ",
  "here's why ",
  "the uncomfortable truth",
  "it turns out",
  "the real ",
  "let me be clear",
  "the truth is",
  "i'll say it again",
  "i'm going to be honest",
  "can we talk about",
  "here's what i find interesting",
  "here's the problem though"
];

const EMPHASIS_CRUNCHES = [
  "full stop",
  "period.",
  "let that sink in",
  "this matters because",
  "make no mistake",
  "here's why that matters"
];

const FILLER_PHRASES = [
  "at its core",
  "in today's",
  "it's worth noting",
  "at the end of the day",
  "when it comes to",
  "in a world where",
  "the reality is"
];

const EMPTY_ADVERBS = [
  "really",
  "just",
  "literally",
  "genuinely",
  "honestly",
  "simply",
  "actually",
  "deeply",
  "truly",
  "fundamentally",
  "inherently",
  "inevitably",
  "interestingly",
  "importantly",
  "crucially"
];

const JARGON_REPLACEMENTS = {
  "navigate": "handle",
  "unpack": "explain",
  "lean into": "accept",
  "leverage": "use",
  "utilize": "use",
  "facilitate": "help",
  "implement": "do",
  "demonstrate": "show",
  "landscape": "field",
  "game-changer": "significant",
  "game changer": "significant",
  "double down": "commit",
  "deep dive": "analysis",
  "take a step back": "reconsider",
  "moving forward": "next",
  "circle back": "return",
  "on the same page": "agreed"
};

const META_COMMENTARY = [
  "hint:",
  "plot twist:",
  "spoiler:",
  "you already know this, but",
  "but that's another post",
  "dressed up as",
  "the rest of this essay",
  "let me walk you through",
  "in this section, we'll",
  "as we'll see",
  "i want to explore"
];

const PERFORMATIVE_EMPHASIS = [
  "creeps in",
  "i promise",
  "they exist, i promise"
];

const VAGUE_DECLARATIVES = [
  "the reasons are structural",
  "the implications are significant",
  "this is the deepest problem",
  "the stakes are high",
  "the consequences are real"
];

// === WIKIPEDIA SIGNS OF AI WRITING - Transformation rules ===

const PROMOTIONAL_PHRASES = [
  "stands as",
  "serves as",
  "is a testament",
  "is a reminder",
  "boasts a",
  "vibrant",
  "rich ",
  "profound",
  "enhancing",
  "showcasing",
  "exemplifies",
  "commitment to",
  "natural beauty",
  "nestled",
  "in the heart of",
  "renowned",
  "featuring",
  "diverse array",
  "key role",
  "vital ",
  "significant ",
  "crucial ",
  "pivotal "
];

const VAGUE_ATTRIBUTION_PHRASES = [
  "industry reports",
  "observers have cited",
  "experts argue",
  "some critics argue",
  "several sources"
];

const SUPERFICIAL_ANALYSIS_PHRASES = [
  "highlighting",
  "underscoring",
  "emphasizing",
  "ensuring",
  "reflecting",
  "symbolizing",
  "contributing to",
  "cultivating",
  "fostering",
  "encompassing",
  "valuable insights",
  "align with",
  "resonate with"
];

// === WIKIPEDIA SIGNS - NEW AI PATTERN LISTS ===

const COLLABORATIVE_COMMUNICATION = [
  "i hope this helps",
  "of course",
  "certainly",
  "would you like",
  "let me know",
  "here is a",
  "here's a",
  "here is the",
  "here's the",
  "i'm happy to",
  "feel free to",
  "let me know if",
  "you might want to",
  "you may want to"
];

const KNOWLEDGE_CUTOFF_PHRASES = [
  "as of my knowledge cutoff",
  "based on available information",
  "while specific details are limited",
  "not widely documented",
  "my knowledge is not exhaustive",
  "information may be limited",
  "specific details are scarce",
  "exact figures are not available"
];

const AI_VOCABULARY = [
  "delve",
  "bolstered",
  "garner",
  "interplay",
  "intricate",
  "intricacies",
  "meticulous",
  "meticulously",
  "tapestry",
  "testament",
  "showcase"
];

const OUTLINE_CONCLUSION_PATTERNS = [
  "despite its",
  "despite these challenges",
  "future prospects",
  "challenges and legacy",
  "looking ahead",
  "in the years to come"
];

function removeThroatClearing(text) {
  let result = text;
  
  for (const phrase of THROAT_CLEARING_OPENERS) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/^[:,\s]+/gm, '');
  
  return result;
}

function removeEmphasisCrutches(text) {
  let result = text;
  
  for (const phrase of EMPHASIS_CRUNCHES) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\.\s*\./g, '.');
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

function replaceJargon(text) {
  let result = text;
  
  for (const [jargon, replacement] of Object.entries(JARGON_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${jargon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, replacement);
  }
  
  return result;
}

function removeAdverbs(text) {
  let result = text;
  
  for (const adverb of EMPTY_ADVERBS) {
    const regex = new RegExp(`\\b${adverb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\b(\w+ly)\b/gi, (match, word) => {
    if (word.toLowerCase() === 'apply' || word.toLowerCase() === 'supply' || 
        word.toLowerCase() === 'rely' || word.toLowerCase() === 'supply' ||
        word.toLowerCase() === 'reply' || word.toLowerCase() === 'comply' ||
        word.toLowerCase() === 'deny' || word.toLowerCase() === 'ally' ||
        word.toLowerCase() === 'multiply' || word.toLowerCase() === 'qualify' ||
        word.toLowerCase() === 'modify' || word.toLowerCase() === 'classify' ||
        word.toLowerCase() === 'identify' || word.toLowerCase() === 'verify' ||
        word.toLowerCase() === 'justify' || word.toLowerCase() === 'certify' ||
        word.toLowerCase() === 'testify' || word.toLowerCase() === 'nullify' ||
        word.toLowerCase() === 'solidify' || word.toLowerCase() === 'specify' ||
        word.toLowerCase() === 'intensify' || word.toLowerCase() === 'rectify') {
      return word;
    }
    return '';
  });
  
  for (const phrase of FILLER_PHRASES) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

function fixBinaryContrasts(text) {
  let result = text;
  
  result = result.replace(/Not because [\w\s]+[.?!]\s*Because\s+/gi, 'Because ');
  result = result.replace(/Not because [\w\s]+[,\s]but because\s+/gi, 'Because ');
  
  result = result.replace(/The answer isn't [\w\s]+[.?!]\s*It's\s+(\w+)/gi, 'The answer is $1');
  result = result.replace(/The answer is not [\w\s]+[.?!]\s*It is\s+(\w+)/gi, 'The answer is $1');
  
  result = result.replace(/\[[\w\s]+\] isn't the problem[.?!]\s*\[[\w\s]+\] is/gi, '');
  result = result.replace(/\[[\w\s]+\] is not the problem[.?!]\s*\[[\w\s]+\] is/gi, '');
  
  result = result.replace(/It feels like [\w\s]+[.?!]\s*It's actually\s+(\w+)/gi, 'It is $1');
  result = result.replace(/It feels like [\w\s]+[.?!]\s*It's\s+(\w+)/gi, 'It is $1');
  
  result = result.replace(/The question isn't [\w\s]+[.?!]\s*It's\s+(\w+)/gi, 'The question is $1');
  result = result.replace(/The question is not [\w\s]+[.?!]\s*It is\s+(\w+)/gi, 'The question is $1');
  
  result = result.replace(/Not\s+([\w\s]+)[.?!]\s*But\s+([\w\s]+)/gi, '$2');
  result = result.replace(/not\s+([\w\s]+)[,\s]*it's\s+([\w\s]+)/gi, '$2');
  result = result.replace(/isn't\s+([\w\s]+)[,\s]*it's\s+([\w\s]+)/gi, 'is $2');
  
  result = result.replace(/It's not this[.?!]\s*It's that/gi, 'that');
  result = result.replace(/It's not this[.?!]\s*It is that/gi, 'that');
  
  result = result.replace(/not just\s+([\w\s]+)\s+but also\s+([\w\s]+)/gi, '$1 and $2');
  
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

function fixNegativeListing(text) {
  let result = text;
  
  result = result.replace(/Not a\s+([\w\s]+)[.?!]\s*Not a\s+([\w\s]+)[.?!]\s*A\s+(\w+)/gi, 'A $3');
  result = result.replace(/It wasn't\s+([\w\s]+)[.?!]\s*It wasn't\s+([\w\s]+)[.?!]\s*It was\s+(\w+)/gi, 'It was $3');
  
  return result;
}

function fixPassiveVoice(text) {
  let result = text;
  
  const passivePatterns = [
    { pattern: /was created/gi, replacement: 'was created' },
    { pattern: /were created/gi, replacement: 'were created' },
    { pattern: /is believed/gi, replacement: 'is believed' },
    { pattern: /are believed/gi, replacement: 'are believed' },
    { pattern: /was believed/gi, replacement: 'was believed' },
    { pattern: /were believed/gi, replacement: 'were believed' },
    { pattern: /mistakes were made/gi, replacement: 'mistakes were made' },
    { pattern: /the decision was reached/gi, replacement: 'the decision was reached' },
    { pattern: /is being/gi, replacement: 'is being' },
    { pattern: /was being/gi, replacement: 'was being' },
    { pattern: /has been/gi, replacement: 'has been' },
    { pattern: /had been/gi, replacement: 'had been' },
    { pattern: /will be/gi, replacement: 'will be' }
  ];
  
  for (const { pattern, replacement } of passivePatterns) {
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement + ' [PASSIVE]');
    }
  }
  
  return result;
}

function fixFalseAgency(text) {
  let result = text;
  
  const falseAgencyPatterns = [
    { pattern: /the complaint becomes (\w+)/gi, replacement: 'someone fixes the complaint' },
    { pattern: /a complaint becomes (\w+)/gi, replacement: 'someone fixes the complaint' },
    { pattern: /the decision emerges/gi, replacement: 'someone decides' },
    { pattern: /the culture shifts/gi, replacement: 'people change' },
    { pattern: /the conversation moves toward/gi, replacement: 'someone steers the conversation' },
    { pattern: /the data tells us/gi, replacement: 'the data shows' },
    { pattern: /the market rewards/gi, replacement: 'buyers pay for' },
    { pattern: /a bet lives or dies/gi, replacement: 'a project succeeds or fails' },
    { pattern: /the problem emerges/gi, replacement: 'the problem appears' },
    { pattern: /the solution emerges/gi, replacement: 'the solution appears' },
    { pattern: /the idea takes hold/gi, replacement: 'the idea gains acceptance' }
  ];
  
  for (const { pattern, replacement } of falseAgencyPatterns) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

function removeMetaCommentary(text) {
  let result = text;
  
  for (const phrase of META_COMMENTARY) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, '');
  }
  
  return result;
}

function removePerformativeEmphasis(text) {
  let result = text;
  
  for (const phrase of PERFORMATIVE_EMPHASIS) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, '');
  }
  
  return result;
}

function fixVagueDeclaratives(text) {
  let result = text;
  
  for (const phrase of VAGUE_DECLARATIVES) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

function fixRhetoricalSetups(text) {
  let result = text;
  
  result = result.replace(/What if\s+\[?rebuild\]?\?/gi, '');
  result = result.replace(/Here's what I mean:/gi, '');
  result = result.replace(/Think about it:/gi, '');
  result = result.replace(/And that's okay\./gi, '');
  
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

function fixDramaticFragmentation(text) {
  let result = text;
  
  result = result.replace(/\. That's it\. That's the (\w+)\./gi, '.');
  result = result.replace(/This unlocks something\. (\w+)\./gi, '$1.');
  
  result = result.replace(/\.\s+\. And\s+/gi, '. ');
  
  return result;
}

function fixSentenceStarters(text) {
  let result = text;
  
  const lines = result.split('\n');
  const processedLines = lines.map(line => {
    let trimmed = line.trim();
    
    if (trimmed.startsWith('Look,') || trimmed.startsWith('So,')) {
      trimmed = trimmed.replace(/^(Look,|So,)\s*/, '');
    }
    
    return trimmed;
  });
  
  result = processedLines.join('\n');
  
  return result;
}

function fixEmDashes(text) {
  let result = text;
  
  result = result.replace(/—/g, ',');
  result = result.replace(/--/g, ',');
  result = result.replace(/(?<!\w)-(?!\w)/g, ',');
  
  return result;
}

function fixLazyExtremes(text) {
  let result = text;
  
  result = result.replace(/\b(everyone|everybody|nobody|no one)\b/gi, (match) => {
    if (match.toLowerCase().startsWith('every')) {
      return 'many people';
    }
    return 'some people';
  });
  
  result = result.replace(/\b(always|never)\b/gi, (match) => {
    if (match.toLowerCase() === 'always') {
      return 'often';
    }
    return 'rarely';
  });
  
  return result;
}

// === Wikipedia Signs of AI Writing transformations ===

function removePromotionalPhrases(text) {
  let result = text;
  
  for (const phrase of PROMOTIONAL_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function removeVagueAttributions(text) {
  let result = text;
  
  for (const phrase of VAGUE_ATTRIBUTION_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escaped}[,:\s]*(that\s+)?`, 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function removeSuperficialAnalyses(text) {
  let result = text;
  
  for (const phrase of SUPERFICIAL_ANALYSIS_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function fixNegativeParallelisms(text) {
  let result = text;
  
  result = result.replace(/\bnot just\s+([^,]+?)\s*,?\s*but also\s+(\w+)/gi, '$1 and $2');
  result = result.replace(/\bnot only\s+(\w+)\s+but\s+also\s+(\w+)/gi, '$1 and $2');
  result = result.replace(/\bnot\s+(\w+),\s*but\s+(\w+)/gi, '$2');
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function removeCurlyQuotes(text) {
  let result = text;
  
  result = result.replace(/[""„]/g, '"');
  result = result.replace(/['']/g, "'");
  
  return result;
}

// === NEW TRANSFORMATION FUNCTIONS ===

function removeCollaborativeCommunication(text) {
  let result = text;
  
  for (const phrase of COLLABORATIVE_COMMUNICATION) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}[,.]?`, 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function removeKnowledgeCutoffDisclaimers(text) {
  let result = text;
  
  for (const phrase of KNOWLEDGE_CUTOFF_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escaped}[,.]?`, 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\([^\)]*knowledge[^\)]*cutoff[^\)]*\)/gi, '');
  result = result.replace(/\([^\)]*as of [^\)]+\)/gi, '');
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function fixOutlineConclusions(text) {
  let result = text;
  
  result = result.replace(/Despite its [\w\s]+, (it )?(faces challenges|encountered challenges|has faced challenges)[,.]?/gi, '.');
  result = result.replace(/Despite these challenges[,.]?/gi, '.');
  result = result.replace(/\bFuture prospects[:\s]*/gi, '');
  result = result.replace(/\bChallenges and legacy[:\s]*/gi, '');
  result = result.replace(/\bLooking ahead[:\s]*/gi, '');
  result = result.replace(/\bIn the years to come[:\s]*/gi, '');
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function removeAIVocabulary(text) {
  let result = text;
  
  for (const word of AI_VOCABULARY) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, '');
  }
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function removeEmojis(text) {
  let result = text;
  
  result = result.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  result = result.replace(/[\u{2600}-\u{26FF}]/gu, '');
  result = result.replace(/[\u{2700}-\u{27BF}]/gu, '');
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function fixRuleOfThree(text) {
  let result = text;
  
  result = result.replace(/\b(\w+), (\w+), and (\w+)/gi, '$1, $2, $3');
  
  result = result.replace(/\bfirst[\s,]+second[\s,]+third/gi, 'multiple');
  result = result.replace(/\bone[\s,]+two[\s,]+three/gi, 'several');
  
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function cleanUpSpacing(text) {
  let result = text;
  
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/[ \t]+/g, ' ');
  result = result.replace(/\s*\.\s*/g, '. ');
  result = result.replace(/\s*,\s*/g, ', ');
  result = result.replace(/\s*!\s*/g, '! ');
  result = result.replace(/\s*\?\s*/g, '? ');
  
  result = result.replace(/^\s+|\s+$/gm, '');
  result = result.trim();
  
  return result;
}

/**
 * Main transform function
 * Applies all slop removal rules to text
 * @param {string} text - The text to transform
 * @returns {string} - Transformed text
 */
function transform(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  let result = text;
  
  result = removeThroatClearing(result);
  result = removeEmphasisCrutches(result);
  result = replaceJargon(result);
  result = fixBinaryContrasts(result);  // Run before removeAdverbs to preserve "not just...but also"
  result = fixNegativeListing(result);
  result = fixNegativeParallelisms(result);
  result = removeAdverbs(result);
  result = fixPassiveVoice(result);
  result = fixFalseAgency(result);
  result = removeMetaCommentary(result);
  result = removePerformativeEmphasis(result);
  result = fixVagueDeclaratives(result);
  result = fixRhetoricalSetups(result);
  result = fixDramaticFragmentation(result);
  result = fixSentenceStarters(result);
  result = fixEmDashes(result);
  result = removePromotionalPhrases(result);
  result = removeVagueAttributions(result);
  result = removeSuperficialAnalyses(result);
  result = removeCurlyQuotes(result);
  result = fixLazyExtremes(result);
  result = removeCollaborativeCommunication(result);
  result = removeKnowledgeCutoffDisclaimers(result);
  result = fixOutlineConclusions(result);
  result = removeAIVocabulary(result);
  result = removeEmojis(result);
  result = fixRuleOfThree(result);
  result = cleanUpSpacing(result);
  
  return result;
}

module.exports = {
  transform,
  removeThroatClearing,
  removeEmphasisCrutches,
  replaceJargon,
  removeAdverbs,
  fixBinaryContrasts,
  fixNegativeListing,
  fixNegativeParallelisms,
  fixPassiveVoice,
  fixFalseAgency,
  removeMetaCommentary,
  removePerformativeEmphasis,
  fixVagueDeclaratives,
  fixRhetoricalSetups,
  fixDramaticFragmentation,
  fixSentenceStarters,
  fixEmDashes,
  fixLazyExtremes,
  cleanUpSpacing,
  removePromotionalPhrases,
  removeVagueAttributions,
  removeSuperficialAnalyses,
  removeCurlyQuotes,
  removeCollaborativeCommunication,
  removeKnowledgeCutoffDisclaimers,
  fixOutlineConclusions,
  removeAIVocabulary,
  removeEmojis,
  fixRuleOfThree
};
