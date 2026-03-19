# Wikipedia: Signs of AI Writing

Source: https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing

This document catalogs AI writing patterns identified by Wikipedia editors for detection and transformation.

## Key Insight

AI tends to:
- Puff up importance with generic significance language
- Use promotional/travel-guide style language
- Add vague attributions to unnamed sources
- Use formulaic structures like "not just X, but also Y"
- Over-emphasize significance, legacy, trends

---

## Content/Significance Patterns (Puffery)

AI over-emphasizes importance with generic significance language.

### Significance Verbs
- "stands as"
- "serves as"
- "is a testament to"
- "is a reminder of"

### Importance Adjectives
- "vital role"
- "significant role"
- "crucial role"
- "pivotal role"
- "key role"

### Significance Phrases
- "underscores its importance"
- "highlights its importance"
- "reflects broader trends"
- "symbolizing its ongoing"
- "contributing to the"
- "setting the stage for"
- "marking the"
- "shaping the"
- "represents a shift"
- "key turning point"
- "evolving landscape"
- "focal point"
- "indelible mark"
- "deeply rooted"

**Detection weight**: 2-3

---

## Promotional/Travel-Guide Language

AI uses marketing language that sounds like tourism brochures.

### Property Adjectives
- "boasts a" (e.g., "boasts a rich history")
- "vibrant"
- "rich" (as in "rich cultural heritage")
- "profound"

### Action Verbs
- "enhancing"
- "showcasing"
- "exemplifies"

### Tourism Clichés
- "commitment to excellence"
- "natural beauty"
- "nestled"
- "in the heart of"
- "groundbreaking"
- "renowned"
- "featuring"
- "diverse array"

**Detection weight**: 2-3

---

## Superficial Analyses (Vague -ing Words)

AI adds -ing words that don't add actual content.

### Connecting -ing Words
- "highlighting"
- "underscoring"
- "emphasizing"
- "ensuring"
- "reflecting"
- "symbolizing"
- "contributing to"
- "cultivating"
- "fostering"
- "encompassing"

### Vague Noun Phrases
- "valuable insights"
- "align with"
- "resonate with"

**Detection weight**: 2

---

## Vague Attributions

AI cites unnamed or generic sources.

### Generic Source References
- "industry reports"
- "observers have cited"
- "experts argue"
- "some critics argue"
- "several sources"
- "such as" (before exhaustive lists without specific citations)

**Detection weight**: 2-3

---

## Negative Parallelisms

Formulaic contrast structures that AI uses repeatedly.

### Not Just/But Also
- "not just X, but also Y"
- "not only X but Y"

### Not X, But Y
- "not X, but Y"
- "not X, it's Y"

**Detection weight**: 3

---

## Style Patterns

### Em-dashes
AI overuses em-dashes for emphasis.

**Detection weight**: 1 (per occurrence)

### Curly Quotation Marks
AI sometimes uses fancy quotation marks:
- """ (left/right double quotation)
- '' (left/right single quotation)
- „ (double low-9 quotation mark)

**Detection weight**: 2

### Title Case Overuse
AI applies title case in unexpected places within sentences.

**Detection weight**: 2

---

## Copulative Avoidance

AI sometimes avoids copulas (is/are/was/were), resulting in unusually low usage.

### Detection
- Normal copula ratio: ~5-8% of words
- Suspicious ratio: <3% in texts over 50 words

**Detection weight**: 4 (additive score)

---

## Transformation Rules

### Remove Promotional Phrases
Replace or remove all promotional/tourism language with neutral alternatives.

### Fix Negative Parallelisms
- "not just X, but also Y" → "X and Y"
- "not X, but Y" → "Y"

### Remove Vague Attributions
Remove or replace with specific attributions when available.

### Remove Superficial -ing Words
Strip connecting -ing words that add no semantic value.

### Fix Em-dashes
Replace em-dashes with commas or periods.

### Remove Curly Quotes
Convert to straight quotation marks.

---

## AI Vocabulary Words (Post-2022)

AI models trained on large datasets post-2022 show distinctive vocabulary patterns not common in pre-AI text.

### Era-Based Vocabulary

#### 2023-2024 Peak Usage
- **delve** (especially sentence start: "Delve into...")
- **bolstered**
- **garner**
- **interplay**
- **intricate** / **intricacies**

#### 2024-2025 Peak Usage
- **meticulous** / **meticulously**
- **tapestry** (as abstract noun)
- **testament**
- **showcase**

**Detection weight**: 2-3

---

## Copulative Avoidance Patterns

AI avoids direct copulas (is/are) by using elaborate verb phrases.

### Common Replacements for "is/are"
- "serves as a"
- "stands as"
- "marks the"
- "represents a"
- "features a"
- "offers a"

**Detection weight**: 2-3

---

## Outline-Like Conclusions

AI generates formulaic challenge/legacy sections following essay templates.

### Challenge Section Patterns
- "Despite its [positive adjective], faces challenges"
- "Despite these challenges"
- "Future prospects"
- "Challenges and legacy"

**Detection weight**: 3-4

---

## Collaborative Communication (AI-to-User Language)

AI addresses the reader directly with conversational phrases.

### Common Patterns
- "I hope this helps"
- "Of course"
- "Certainly,"
- "Would you like"
- "Let me know"
- "Here is a"

**Detection weight**: 3-4

---

## Knowledge-Cutoff Disclaimers

AI reveals its training limitations with disclaimers about knowledge freshness.

### Common Disclaimers
- "as of my knowledge cutoff"
- "based on available information"
- "while specific details are limited"
- "not widely documented"
- "my knowledge is not exhaustive"

**Detection weight**: 4

---

## Emoji Detection

Emoji usage in text often indicates AI generation (especially in formal contexts).

### Detected Ranges
- Miscellaneous symbols: U+1F300-U+1F9FF
- Misc symbols: U+2600-U+26FF
- Dingbats: U+2700-U+27BF

**Detection weight**: 3-4

---

## Rule of Three

AI uses triple-listing patterns more frequently than human writers.

### Patterns
- "X, Y, and Z" (list format)
- "first, second, third"
- "one, two, three"

**Detection weight**: 2-3

---

## Transformation Rules (Expanded)

### Remove Collaborative Communication
Strip AI-to-user language like "I hope this helps" and "Of course".

### Remove Knowledge-Cutoff Disclaimers
Remove phrases that reveal AI training limitations.

### Fix Outline Conclusions
Simplify "Despite X, Y faces challenges" structures.

### Remove AI Vocabulary
Strip distinctive post-2022 AI vocabulary words.

### Remove Emojis
Strip emoji characters from text.

### Fix Rule of Three
Reduce formulaic triple-listing patterns.