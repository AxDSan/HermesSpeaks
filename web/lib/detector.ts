export interface DetectorResult {
  detector: string;
  url: string;
  success: boolean;
  results: {
    aiPercentage: number;
    humanPercentage: number;
    confidence: number;
    aiScore: number;
    humanScore: number;
  };
  raw: {
    aiScore: number;
    humanScore: number;
    foundPatterns: {
      ai: string[];
      human: string[];
    };
  };
}

interface Pattern {
  pattern: RegExp;
  weight: number;
  label: string;
  category: string;
}

const aiPatterns: Pattern[] = [
  { pattern: /\b(additionally|furthermore|moreover|consequently|therefore|however)\b/gi, weight: 3, label: 'connector-words', category: 'Transitional Connectors' },
  { pattern: /\b(it is important to note|it is worth mentioning|it should be noted)\b/gi, weight: 4, label: 'formal-phrases', category: 'Formal Phrases' },
  { pattern: /\b(in conclusion|to summarize|overall)\b/gi, weight: 2, label: 'summary-phrases', category: 'Summary Phrases' },
  { pattern: /\b(this essay will examine|this paper explores|this study investigates)\b/gi, weight: 3, label: 'academic-phrases', category: 'Academic Phrases' },
  { pattern: /\b(first and foremost|it goes without saying|in today's world)\b/gi, weight: 3, label: 'emphasis-phrases', category: 'Emphasis Phrases' },
  { pattern: /\{[\s\S]*\}/g, weight: 2, label: 'curly-braces', category: 'AI Formatting' },
  { pattern: /\[[\s\S]*\]/g, weight: 2, label: 'square-brackets', category: 'AI Formatting' },
  { pattern: /\b(utilize|leverage|implement|demonstrate|facilitate)\b/gi, weight: 2, label: 'business-jargon', category: 'Business Jargon' },
  { pattern: /\b(navigate|unpack|dive deep|lean into)\b/gi, weight: 2, label: 'corporate-speak', category: 'Corporate Speak' },
  { pattern: /\b(robust|scalable|seamless|streamline)\b/gi, weight: 2, label: 'tech-jargon', category: 'Tech Jargon' },
  { pattern: /\b(crucial|vital|pivotal|paramount)\b/gi, weight: 2, label: 'overstatement', category: 'Overstatements' },
  { pattern: /\b(in the realm of|within the context of|as pertains to)\b/gi, weight: 3, label: 'formal-constructs', category: 'Formal Constructs' },
];

const humanPatterns: Pattern[] = [
  { pattern: /[!]{2,}/g, weight: 3, label: 'repeated-exclamation', category: 'Emotional Exclamation' },
  { pattern: /\b(lol|lmao|omg|wow|gosh|heck)\b/gi, weight: 4, label: 'informal-exclamation', category: 'Informal Exclamations' },
  { pattern: /\([\w\s]+\)/g, weight: 1, label: 'parenthetical', category: 'Parentheticals' },
  { pattern: /\b(I think|I feel|I believe|honestly|personally)\b/gi, weight: 3, label: 'first-person-opinion', category: 'Personal Opinion' },
  { pattern: /\b(gonna|wanna|kinda|sorta|dunno|gonna)\b/gi, weight: 3, label: 'casual-speech', category: 'Casual Speech' },
  { pattern: /\b(that's|doesn't|won't|can't|isn't)\b/gi, weight: 1, label: 'contractions', category: 'Contractions' },
  { pattern: /\b(oh|ah|uh|hmm)\b/gi, weight: 3, label: 'filler-words', category: 'Filler Words' },
  { pattern: /\b(yeah|nope|yep|nah)\b/gi, weight: 3, label: 'casual-affirmation', category: 'Casual Affirmations' },
];

export function localHeuristicCheck(text: string): DetectorResult {
  let aiScore = 0;
  let humanScore = 0;
  const foundPatterns: { ai: string[]; human: string[] } = { ai: [], human: [] };
  const detectedPatterns: Array<{ pattern: string; category: string; text: string }> = [];

  for (const { pattern, weight, label, category } of aiPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      aiScore += matches.length * weight;
      foundPatterns.ai.push(...matches.slice(0, 3));
      matches.slice(0, 3).forEach((m) => {
        detectedPatterns.push({ pattern: label, category, text: m });
      });
    }
  }

  for (const { pattern, weight, label, category } of humanPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      humanScore += matches.length * weight;
      foundPatterns.human.push(...matches.slice(0, 3));
      matches.slice(0, 3).forEach((m) => {
        detectedPatterns.push({ pattern: label, category, text: m });
      });
    }
  }

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (sentences.length > 2) {
    const wordCounts = sentences.map((s) => s.split(/\s+/).length);
    const avgLength = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    const variance = wordCounts.reduce((sum, w) => sum + Math.pow(w - avgLength, 2), 0) / wordCounts.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 3) {
      aiScore += 8;
      detectedPatterns.push({ pattern: 'uniform-sentences', category: 'Rhythm', text: 'Very uniform sentence lengths' });
    } else if (stdDev > 6) {
      humanScore += 3;
    }
  }

  const firstPerson = (text.match(/\b(I|me|my|mine|we|us|our)\b/gi) || []).length;
  if (firstPerson > 0) {
    humanScore += firstPerson * 2;
    if (firstPerson <= 3) {
      detectedPatterns.push({ pattern: 'first-person', category: 'Personal Voice', text: `Found ${firstPerson} first-person references` });
    }
  }

  const hedging = (text.match(/\b(might|may|could|possibly|perhaps|might be|could be)\b/gi) || []).length;
  if (hedging > 2) {
    aiScore += hedging * 1.5;
    detectedPatterns.push({ pattern: 'hedging-language', category: 'Hedging', text: `Found ${hedging} hedging phrases` });
  }

  const contractions = (text.match(/'\w{2,3}/g) || []).length;
  if (contractions > 3) {
    humanScore += contractions;
  }

  const total = aiScore + humanScore;
  const rawPercent = total > 0 ? (aiScore / (aiScore + humanScore)) * 100 : 50;

  const confidence = Math.min(total / 20, 1);
  const aiPercent = Math.round(50 + (rawPercent - 50) * confidence);

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
      humanScore: Math.round(humanScore * 10) / 10,
    },
    raw: {
      aiScore: Math.round(aiScore * 10) / 10,
      humanScore: Math.round(humanScore * 10) / 10,
      foundPatterns,
    },
  };
}

export function getVerdict(aiPercentage: number): { label: string; color: string } {
  if (aiPercentage < 30) {
    return { label: 'Likely Human', color: 'text-green-600' };
  } else if (aiPercentage < 50) {
    return { label: 'Possible Human', color: 'text-yellow-600' };
  } else if (aiPercentage < 70) {
    return { label: 'Possible AI', color: 'text-orange-600' };
  } else {
    return { label: 'Likely AI', color: 'text-red-600' };
  }
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence < 30) return 'Low';
  if (confidence < 60) return 'Medium';
  return 'High';
}
