---
name: stop-slop
description: Remove AI writing patterns from prose. Use when drafting, editing, or reviewing text to eliminate predictable AI tells.
metadata:
  trigger: Writing prose, editing drafts, reviewing content for AI patterns
  author: Tom Kristian Abel (tomabel.ee) Github: @tomkabel
---

# Stop Slop

Eliminate predictable AI writing patterns from prose.

## Multi-Step Workflow

When the user provides text for editing, follow this flow:

### Step 1: Ask the User

Present two options:

1. **Refactored Smoother Version** — "Provide a refactored, smoother version that preserves my argumentation and tone, and only improves flow, clarity, and structure without changing my language style." [[1]]

2. **AI Indicators/Slop Removal** — Remove all AI writing patterns, tells, and indicators from the text. Apply the rules in this guide to eliminate predictable AI patterns and create humanized prose.

### Step 2: Process Based on Choice

- If the user selects **Option 1**: Use the refactoring prompt to enhance/modify their input while preserving their voice
- If the user selects **Option 2**: Apply the full skill rules to remove all AI indicators and slop patterns

---

**References**

[[1]] Prompt written by Dr Arnis Paršovs

## Core Rules

1. **Cut filler phrases.** Remove throat-clearing openers, emphasis crutches, and all adverbs. See [references/phrases.md](references/phrases.md).

2. **Break formulaic structures.** Avoid binary contrasts, negative listings, dramatic fragmentation, rhetorical setups, false agency. See [references/structures.md](references/structures.md).

3. **Use active voice.** Every sentence needs a human subject doing something. No passive constructions. No inanimate objects performing human actions ("the complaint becomes a fix").

4. **Be specific.** No vague declaratives ("The reasons are structural"). Name the specific thing. No lazy extremes ("every," "always," "never") doing vague work.

5. **Put the reader in the room.** No narrator-from-a-distance voice. "You" beats "People." Specifics beat abstractions.

6. **Vary rhythm.** Mix sentence lengths. Two items beat three. End paragraphs differently. No em dashes.

7. **Trust readers.** State facts directly. Skip softening, justification, hand-holding.

8. **Cut quotables.** If it sounds like a pull-quote, rewrite it.

## AI Pattern Encyclopedia

A practical reference cataloging specific linguistic markers from LLM detection research that make text sound AI-generated.

### 1. Lexical AI-Isms (avoid these specific phrases)

These are overused, pretentious, or inappropriate for natural prose:

| Avoid | Why | Alternative |
|-------|-----|-------------|
| "delve into" | Academic/formal filler | "examine," "look at," "explore" |
| "tapestry of" | Over-literary attempt | Be specific about what you mean |
| "ever-evolving landscape" | Corporate speak | "changing," "developing" |
| "in the realm of" | Pretentious abstraction | Name the specific field/area |
| "it is imperative that" | Over-formal | "must," "need to," "should" |
| "utilize" | Unnecessary Latinism | Use "use" |
| "leverage" | Corporate speak | "use," "harness," "exploit" |

### 2. Overused Connectives (reduce these)

These transition words appear too frequently in AI text:

- **Addition signals**: Moreover, Furthermore, Additionally, In addition — use sparingly
- **Ending signals**: In conclusion, To summarize, Overall — avoid formulaic endings
- **Emphasis signals**: First and foremost, It goes without saying — drop the theatrical setup

**Better approach**: Let transitions emerge naturally from content. Often no transition word is needed.

### 3. Pronoun Patterns to Fix

AI tends toward impersonal, distant prose:

| Problem | Fix |
|---------|-----|
| Excessive "they/their/theirs" without specific referents | Use names, "people," or specific groups |
| Lack of first-person voice | Add "I think," "I feel," "I believe" |
| No direct reader engagement | Use "you" to address readers directly |

Personal voice signals human authorship. "In my experience..." beats "It is generally observed..."

### 4. Syntactic Red Flags

AI produces structurally uniform text:

- **Uniform sentence length** — Add variance. Mix 5-word sentences with 25-word sentences.
- **No burstiness** — Humans write in bursts: short punchy, then longer flowing. Mimic this.
- **Low Type-Token Ratio (TTR)** — Repetitive vocabulary signals AI. Use synonyms naturally, but don't force them.

**Test**: Read aloud. Does it sound like a metronome? Vary it.

### 5. Discourse Markers

Overuse of certain markers signals AI:

| Avoid | When to Use |
|-------|-------------|
| Excessive hedging ("might," "could," "perhaps") without genuine uncertainty | Only when you're actually uncertain |
| "It is important to note" | Usually unnecessary — just state the thing |
| "It is worth mentioning" | Cut the throat-clearing |

**Human move**: Admit "I don't know." Uncertainty is authentic.

### 6. Pragmatic (RLHF Alignment) Tells

AI training optimizes for helpfulness, creating distinctive patterns:

- **Politeness overdrive**: Excessive "Thank you," "Please," "I appreciate your patience" — dial back
- **Unearned positivity**: "remarkable," "outstanding," "exceptional" used for mundane things — use sparingly
- **Lack of negative emotions**: Include appropriate frustration, disappointment, skepticism. Not everything is "fascinating."
- **"As an AI" disclaimers**: Never needed in prose

Humans complain, get annoyed, express doubt. Include these appropriately.

### 7. Given-New Rigidity

AI tends to follow a predictable information structure: start with known info, then deliver new. This creates monotonous prose.

- **Vary information structure**: Sometimes lead with the new, then provide context
- **Mix sentence openings**: Not every sentence should start with the subject
- **Break the "first this, then that" pattern**: Humans circle back, digress, connect non-linearly

---

**Using this encyclopedia**: When editing, scan for these patterns. Each category is a checklist. Cross-reference with Core Rules and the 24 AI Patterns for comprehensive revision.

## The 24 AI Patterns

These are the 24 most common tells that signal AI-generated or AI-influenced writing:

| # | Pattern | Description |
|---|---------|-------------|
| 1 | Inflated Symbolism | Overemphasizing importance with grand words ("pivotal," "crucial," "key role") |
| 2 | Promotional Language | Travel-guide style adjectives ("boasts," "vibrant," "nestled") |
| 3 | Superficial -ing Analyses | -ing words that add nothing ("highlighting," "underscoring") |
| 4 | Vague Attributions | Unnamed sources ("experts argue," "industry reports") |
| 5 | Em Dash Overuse | Excessive use of — |
| 6 | Rule of Three | Formulaic "X, Y, and Z" structures |
| 7 | AI Vocabulary | Words like "delve," "tapestry," "intricate," "testament" |
| 8 | Negative Parallelisms | "not just X, but also Y" constructions |
| 9 | False Ranges | "ranging from economics to philosophy" with unrelated items |
| 10 | Elegant Variation | Forced awkward synonyms to avoid repetition |
| 11 | Copula Avoidance | "serves as" instead of "is" |
| 12 | Passive Voice Overuse | "was been" constructions |
| 13 | Overly Complex Sentences | Sentences over 40 words |
| 14 | Redundant Adjectives | "true facts," "future prospects" |
| 15 | Clichéd Metaphors | "tip of the iceberg," "drop in the ocean" |
| 16 | Excessive Hedging | Too much "might," "could," "perhaps" |
| 17 | Formulaic Transitions | "first and foremost," "in conclusion" |
| 18 | Overly Formal Tone | "kindly," "please be advised" |
| 19 | Lack of First-Person Perspective | No "I" or "we" |
| 20 | Absence of Uncertainty | "undoubtedly," "irrefutable" |
| 21 | Predictable Rhythm | Uniform sentence lengths |
| 22 | Over-Polished Syntax | Too perfect, no fragments |
| 23 | Generic Examples | "for example, the..." |
| 24 | Statistical Artifacts | Fake-looking percentages |

## Soul Elements

What you inject to make text feel human instead of AI-generated:

- **Strong opinions and personal takes** - "I think," "Honestly," "The thing is..."
- **First-person perspectives throughout** - Use "I" and "we" freely
- **Variable rhythm** - Mix short punchy sentences with longer, flowing ones
- **Linguistic markers of human error**:
  - Occasional sentence fragments ("And it worked?")
  - Colloquial interjections ("well," "you know," "I mean")
  - Minor grammatical slips used intentionally for effect
  - Comma splices for conversational flow
  - Conversational asides ("speaking of which...")
- **Acknowledgment of complexity** - "it's complicated," "I'm not sure"
- **Natural repetition** - Don't force synonyms; repetition is fine
- **Direct statements** - Instead of elaborate setups, just say it

## Forbidden Vocabulary

Words to avoid unless in a specific technical context:

- **Avoid entirely**: delve, tapestry, landscape, intricate, pivotal, crucial, underscore, testament, vibrant
- **Use sparingly**: bolster, garner, interplay, meticulous, showcase
- **Rewrite these patterns**:
  - "stands as" → "is"
  - "serves as" → "is"
  - "marks the" → "is"
  - "represents a shift" → "shifts" or "changed"

## Quick Checks

Before delivering prose:

- Any adverbs? Kill them.
- Any passive voice? Find the actor, make them the subject.
- Inanimate thing doing a human verb ("the decision emerges")? Name the person.
- Sentence starts with a Wh- word? Restructure it.
- Any "here's what/this/that" throat-clearing? Cut to the point.
- Any "not X, it's Y" contrasts? State Y directly.
- Three consecutive sentences match length? Break one.
- Paragraph ends with punchy one-liner? Vary it.
- Em-dash anywhere? Remove it.
- Vague declarative ("The implications are significant")? Name the specific implication.
- Narrator-from-a-distance ("Nobody designed this")? Put the reader in the scene.
- Meta-joiners ("The rest of this essay...")? Delete. Let the essay move.
- Any "ranging from X to Y" where items aren't related? Fix.
- Any forced synonym to avoid repeating a word? Use the original.
- Any overly confident language ("undoubtedly")? Add doubt.
- Any cliché metaphors? Cut or update.
- Any long sentences (>40 words)? Break them.

## Scoring

Rate 1-10 on each dimension:

| Dimension | Question |
|-----------|----------|
| Directness | Statements or announcements? |
| Rhythm | Varied or metronomic? |
| Trust | Respects reader intelligence? |
| Authenticity | Sounds human? |
| Density | Anything cuttable? |

Below 35/50: revise.

**Note on Soul Elements**: Think of Soul Elements as the inverse score. High AI pattern density = low Soul Elements. When revising, aim to add Soul Elements back in—not just remove patterns, but inject humanity.

## Examples

See [references/examples.md](references/examples.md) for before/after transformations.

## References

- [references/wikipedia-signs.md](references/wikipedia-signs.md) - Wikipedia's "Signs of AI writing" guide
- [references/phrases.md](references/phrases.md) - Filler phrases to remove
- [references/structures.md](references/structures.md) - Formulaic structures to break
- All 24 patterns from this guide are documented across the reference files

## License

MIT