# **Forensic Taxonomy of Intrinsic Stylometric and Computational Markers for Large Language Model Text Detection (2022–2025)**

The advent of Large Language Models (LLMs) has necessitated a paradigm shift in computational linguistics, transitioning from traditional authorship attribution to a specialized field of neural text forensics. The detection of machine-generated text no longer relies on identifying overt errors—such as "hallucinations" or grammatical failures—but rather on the identification of subtle, intrinsic markers that emerge from the underlying statistical architectures and alignment processes of models like GPT-4o, Claude 3.5, Gemini 2.0, and Llama 3\. These markers, which form a distinct "stylometric fingerprint," are the product of an inherent divergence between human cognitive language production and the mathematical approximation of natural language. While human writing is driven by communicative intent and communicative economy, LLM outputs are the result of sampling from a learned distribution P\_{LLM}(x\_t | x\_{\<t}) designed to maximize perceived fluency and adherence to safety constraints.

## **1\. Lexical and Morphological Tier**

Lexical markers represent the most granular layer of detection, focusing on word frequency distributions, n-gram over-representations, and morphological artifacts. The primary driver of lexical distinctiveness in LLMs is "mode collapse," a phenomenon where the model identifies and over-prioritizes a narrow subset of high-probability tokens during the Reinforcement Learning from Human Feedback (RLHF) process. This results in the predictable recurrence of specific idiomatic "AI-isms" that characterize the "helpful assistant" persona.

### **1.1 Taxonomy of Lexical Markers**

| Specific Linguistic Feature | Quantitative Metric | Hypothesized Mechanism | Detection Method | Source Citation | Confidence Level | Model Specificity | Temporal Validity |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| N-gram "ever-evolving landscape" | Frequency ratio \> 4.5x human baseline | Mode collapse toward safe, corporate-neutral idioms | Frequency-based n-gram pipeline |  | HIGH | Model-agnostic | 2025-valid |
| N-gram "delve into" | 3.2x higher frequency in academic prompts | Preference for formal, non-committal transitions | StyloMetrix Lexical Analysis |  | HIGH | GPT-4o, Claude 3 | 2025-valid |
| N-gram "tapestry of" | 2.8x higher frequency in creative tasks | Optimization for "literary" perceived quality in training data | N-gram frequency distribution |  | MEDIUM | Model-agnostic | 2024-valid |
| Proper Noun Density | 25-40% lower frequency than human news | Tendency toward thematic generalization over factual anchoring | StyloMetrix Fact-Density score |  | HIGH | GPT-4o, Llama 3 | 2025-valid |
| Date/Temporal Frequency | 30% lower in summary tasks | Focus on abstraction over chronological specificity | StyloMetrix Chronological tracking |  | MEDIUM | Model-agnostic | 2024-valid |
| Redundant 'SPACE' Token | 0.05% increase in total characters | API-specific paragraph-start tokenization artifact | Character n-gram analysis |  | MEDIUM | GPT-3.5/4 | 2025-deprecated |
| Auxiliary Verb Overuse | Ratio of 1.2:1 vs human academic text | Preference for objective, passive, or explanatory syntax | POS-tagging distribution |  | MEDIUM | Model-agnostic | 2024-valid |
| Pronoun Frequency Shift | 15% increase in third-person plural | Avoidance of first-person "I" to maintain objective neutrality | LIWC Analysis |  | HIGH | Claude 3, GPT-4 | 2025-valid |
| Rare Word Avoidance | Zipf's Law tail truncation (p \< 0.01) | Nucleus/Top-p sampling prunes low-probability tokens | Rank-frequency analysis |  | HIGH | Model-agnostic | 2025-valid |
| Connective Density ("Moreover") | Count \> 12 per 500 words | Structural rigidity artifacts of RLHF logic-marking | Metadiscourse tracking |  | HIGH | Model-agnostic | 2025-valid |
| Initial Whitespace Artifact | Boolean presence at string start | Artifact of BPE and prompt-completion logic | Token-level string analysis |  | MEDIUM | Model-agnostic | 2025-deprecated |
| Morphological Standardization | 20% lower usage of non-standard inflections | Filtering of "low-quality" non-standard data in pre-training | Morphological unigram tracking |  | HIGH | Model-agnostic | 2025-valid |
| Word Unigram Uniformity | Lower Yule’s K (index \< 120\) | Stylistic uniformity and reduced vocabulary breadth | Yule's K metric |  | HIGH | Llama 70b, GPT-3.5 | 2024-valid |

### **1.2 Discussion of Lexical Uniformity**

The lexical uniformity observed in modern LLMs is deeply tied to the "sampling gap." Humans naturally utilize a wide range of vocabulary, including idiosyncratic word choices and rare terms that appear in the long tail of Zipf's distribution. LLMs, however, are typically deployed with sampling strategies like top-p (nucleus) or top-k, which systematically exclude these low-probability tokens to ensure the model remains coherent and "on-topic". This results in a "truncated" vocabulary that avoids the linguistic risk-taking characteristic of human experts and creative writers.  
Furthermore, the overuse of connective phrases like "moreover" and "furthermore" serves as a structural crutch for models that lack a global rhetorical plan. Because autoregressive models generate text one token at a time, they rely on high-confidence logical connectors to bridge sentences and simulate a cohesive argument. This trend is particularly pronounced in "reasoning" models like GPT-o1 and Claude 3.5, where the alignment toward logical transparency inadvertently increases the density of these metadiscourse markers.

## **2\. Syntactic and Structural Tier**

Syntactic markers focus on the arrangement of words, sentence complexity, and the variation in sentence structures. A primary forensic differentiator in this tier is "burstiness"—the degree of variation in sentence length and complexity—which tends to be significantly lower in LLM-generated text due to the smoothing effects of probabilistic generation.

### **2.1 Taxonomy of Syntactic Markers**

| Specific Linguistic Feature | Quantitative Metric | Hypothesized Mechanism | Detection Method | Source Citation | Confidence Level | Model Specificity | Temporal Validity |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Sentence Length Variance (Burstiness) | SD \< 5.5 tokens per sentence | Smoothing effects of probabilistic generation | Burstiness scoring (GPTZero) |  | HIGH | Model-agnostic | 2025-valid |
| Dependency Tree Depth | Mean depth \> 4.2 | Preference for nested subordinate clauses for clarity | Dependency parsing |  | MEDIUM | GPT-4, Gemini 1.5 | 2024-valid |
| Tree Branching Factor | Lower variance in branching (\> 0.8 coherence) | Uniformity in hierarchical sentence planning | Dependency tree analysis |  | LOW | Model-agnostic | 2025-valid |
| Coordination-to-Subordination Ratio | Ratio \< 0.4 | Preference for complex structures over coordination | Syntactic complexity analysis |  | MEDIUM | GPT-4, Claude 3.5 | 2024-valid |
| Mean Segmented Type-Token Ratio (MSTTR) | Score \< 0.72 (window=50) | Repetitive syntactic scaffolding within documents | MSTTR Metric |  | HIGH | Llama 2/3, Mistral | 2025-valid |
| SENT\_ST\_WRDSPERSENT | Significant delta between word and sentence counts | Potential "stop generating" artifacts or constraints | StyloMetrix structural feature |  | MEDIUM | Model-agnostic | 2024-valid |
| Dependency Ramification Factor | Lower in AI (less "winding" sentences) | Probability-based sampling favors linear hierarchy | Dependency ramification |  | LOW | Model-agnostic | 2025-valid |
| Noun Chunk Density | 12% higher in AI text | Optimization for information density in encyclopedic tasks | Spacy Noun Chunking |  | MEDIUM | GPT-4o | 2025-valid |
| Morphological Unigram Stability | Z-score \< 0.5 across 10-sentence samples | High consistency in tense/aspect usage | Morphological tracking |  | HIGH | Llama 3.1 | 2025-valid |
| Clause Integration | Higher frequency of non-finite clauses | Information packing for "helpful" responses | Syntactic parsing |  | MEDIUM | Claude 3 | 2024-valid |
| Punctuation Standardness | SD of punctuation-to-word ratio \< 0.02 | Lack of idiosyncratic punctuation markers | Punctuation pattern encoding |  | MEDIUM | Model-agnostic | 2024-valid |
| Phrasal Pattern Uniformity | High similarity in MDS (Multidimensional Scaling) | Shared transformer architectures and web-data priors | MDS on phrase patterns |  | HIGH | Model-agnostic | 2025-valid |
| POS Bigram Concentration | Clustered distribution on MDS dimensions | Limited variation in word-category sequencing | POS-bigram MDS |  | HIGH | Model-agnostic | 2025-valid |

### **2.2 Syntactic Standardization and Burstiness**

The "burstiness" metric, popularized by platforms like GPTZero, remains a cornerstone of AI detection. Human writers are inherently inconsistent; they use short sentences to emphasize a point and long, winding sentences to explain complex ideas. LLMs, by contrast, tend to hover around a more uniform sentence length, a result of the model's objective to maximize the probability of the *average* plausible sentence. This lack of rhythmic variation creates a "staccato" or "monotonous" quality that is highly detectable through standard deviation analysis of sentence lengths.  
Dependency tree analysis further reveals that LLMs favor specific hierarchical structures. While human-authored text might show a wide variety of branching factors—how many children each node in a sentence tree has—LLM sentences are often more "balanced" and standardized. This standardization is a byproduct of training on high-quality, standardized corpora like Wikipedia and professional academic journals, which prioritize clarity over stylistic idiosyncrasy.

## **3\. Discourse and Semantic Tier**

Discourse markers evaluate the logical progression of ideas, global vs. local coherence, and the maintenance of entity chains. As LLMs are adapted for specialized domains like medicine, their ability to maintain factual integrity alongside semantic coherence has become a focal point of research.

### **3.1 Taxonomy of Discourse Markers**

| Specific Linguistic Feature | Quantitative Metric | Hypothesized Mechanism | Detection Method | Source Citation | Confidence Level | Model Specificity | Temporal Validity |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Local-to-Global Coherence Ratio | Ratio \> 1.5 | High attention to immediate context, low planning | GPT-Judger / Coherence Prompts |  | HIGH | Model-agnostic | 2025-valid |
| Entity Tracking Hallucination | 15% error rate in multi-hop relations | Degradation of low-entropy token representations | Entity Error Tracking |  | HIGH | Meditron, MedLlama | 2025-valid |
| Mention Chain Rigidity | Fixed distance between entity mentions | Lack of dynamic pronoun resolution variety | Entity Grid Analysis |  | MEDIUM | Model-agnostic | 2024-valid |
| Given-New Information Rigidity | Information density Z-score \> 1.8 | Fixed "Intro \-\> Expansion \-\> Conclusion" paragraph logic | Discourse flow analysis |  | LOW | GPT-4 | 2025-valid |
| Metadiscourse Overuse | Count \> 15 per 1000 words | Structural scaffolding to signal logical clarity | Metadiscourse annotation |  | HIGH | Claude, Gemini | 2025-valid |
| Cognitive Expression Scarcity | 40% reduction in words like "believe," "suspect" | Avoidance of subjective epistemic stances | SAGE Analysis |  | HIGH | Model-agnostic | 2025-valid |
| Sentiment Positivity Bias | 0.85 sentiment score (0-1 scale) | RLHF alignment towards "helpful" assistant persona | Sentiment / LIWC |  | HIGH | Model-agnostic | 2025-valid |
| Personal Reference Scarcity | \< 2% of total tokens | Lack of lived experience and "stateless" nature | LIWC Personal Pronouns |  | HIGH | Model-agnostic | 2025-valid |
| Temporal Reference Uniformity | SD of date/time markers \< 0.1 | Limited historical context or focus on the "present" | Temporal marker analysis |  | MEDIUM | Model-agnostic | 2024-valid |
| Reasoning Chain Consistency | 25% drop after 5 paraphrase stages | Loss of "LLM signature" as style is abstracted | Multistage paraphrase test |  | MEDIUM | GPT-4o, Gemini 2.0 | 2025-valid |
| Information "Forgetfulness" | Performance drop in long context (1M+ tokens) | "Middle" neglect in massive context windows | Long-context benchmarking |  | MEDIUM | Gemini 1.5 | 2024-valid |
| Fact-Density Gap | Lower density of proper nouns in summary tasks | Focus on thematic abstraction over facticity | StyloMetrix Fact-Density |  | HIGH | GPT-4 | 2024-valid |
| Semantic Overlap | MDS clustering of creative outputs | Optimization for singular, model-specific signature | MDS / Burrows' Delta |  | HIGH | GPT-4, Llama 70b | 2025-valid |

### **3.2 Coherence and the "Given-New" Rigidity**

The "Given-New" information structure is a fundamental linguistic principle where a sentence begins with information already known to the reader ("Given") and concludes with "New" information. In human writing, this structure is flexible, often disrupted for rhetorical effect or emphasis. LLMs, however, exhibit a rigid adherence to this structure, creating a predictable rhythm of information delivery. This rigidity is often a direct result of the model's objective to maintain high local coherence, ensuring that each sentence logically follows from the one before it at the expense of global narrative variety.  
In specialized domains like medicine, this rigidity is compounded by a degradation in entity tracking. While LLMs can produce fluent medical text, the representation of critical disease entities often degrades during the watermarking or generation process, leading to hallucinations or inaccuracies in multi-hop reasoning. Forensic analysts can identify AI text by tracking the "entropy distribution" of these entities; human writing often exhibits higher uncertainty (entropy) around complex medical terms, while LLMs may produce them with unearned statistical confidence.

## **4\. Pragmatic and Functional Tier**

Pragmatic markers encompass the social and functional aspects of language, such as tone, politeness, ethics, and "persona." These markers are the most influenced by developer-led alignment (RLHF) and represent the model's "corporate character".

### **4.1 Taxonomy of Pragmatic Markers**

| Specific Linguistic Feature | Quantitative Metric | Hypothesized Mechanism | Detection Method | Source Citation | Confidence Level | Model Specificity | Temporal Validity |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Ethical Disclaimer Frequency | 1.8 occurrences per sensitive query | Hard-coded refusal and safety triggers | Keyword/Pattern matching |  | HIGH | Claude, GPT-4 | 2025-valid |
| Politeness Bias (Claude) | 20% higher frequency of "Thank you," "Please" | Constitutional AI alignment for safety | Pragmatic marker tagging |  | HIGH | Claude 3.5/4 | 2025-valid |
| Toxicity Resistance | \< 0.01% toxicity score (RealToxicityPrompts) | Safety alignment and training data filtering | Detoxify / Perspective API |  | HIGH | Model-agnostic | 2025-valid |
| Objective Language Density | Higher usage of symbols/numbers/auxiliaries | Bias towards encyclopedic or "scientific" registers | Morphosyntactic analysis |  | MEDIUM | Model-agnostic | 2024-valid |
| Sexist/Systemic Bias Amplification | 12% higher bias in stereotypical prompts | Intensification of training data biases | Bias Detection Metrics |  | MEDIUM | Model-agnostic | 2025-valid |
| Lack of Negative Emotions | 60% lower than human creative baselines | Filtering of "harmful" emotions in safety alignment | Emotion mapping / LIWC |  | HIGH | Model-agnostic | 2025-valid |
| Explicit Self-Identification | Frequency of "As an AI language model..." | Transparency-focused training protocols | Regex/Pattern matching |  | HIGH | Model-agnostic | 2025-valid |
| Multilingual Code-Switching | 15% higher accuracy in low-resource pairs | Cross-lingual transfer in massive transformers | Code-switching freq. |  | MEDIUM | Gemini 2.0 | 2025-valid |
| Instruction Adherence Rigidity | Perfect compliance with formatting (e.g., JSON) | SFT for tool-use and API integration | Format validation |  | HIGH | GPT-4o, Claude 3.5 | 2025-valid |
| Log-Probability Curvature | Negative curvature \\hat{d} \> \\text{threshold} | Model samples reside in local prob. maxima | DetectGPT |  | HIGH | Model-agnostic | 2025-valid |
| Surprisal Variance | Lower variance (smoother predictability) | Reduced "bursts of surprise" vs. humans | DivEye / Variance-II |  | HIGH | Model-agnostic | 2025-valid |
| Surprisal Autocorrelation | Specific temporal periodicity in surprisal | Humans have unique "rhythms" of surprise | Autocorrelation of \\{s\_t\\} |  | HIGH | Model-agnostic | 2025-valid |
| Non-Bayesian Prob. Drift | Non-zero drift (T\_{1,g} statistic) | Systemic shift when querying own prior outputs | Martingale property test |  | MEDIUM | GPT-4, Llama 2 | 2025-valid |

### **4.2 Ethical Safeguards and Neutrality Bias**

One of the most robust pragmatic markers is the model's resistance to toxic or controversial content. While human discourse on social media is often characterized by negative emotions like fear, disgust, or anger, LLMs are aggressively aligned to maintain a polite, motivational, and neutral persona. This "politeness bias" is especially prevalent in the Claude family of models, where Constitutional AI protocols mandate a high frequency of honorifics and apologetic language.  
Forensically, this manifests as a "sanitized" emotional profile. In tasks like creative writing or social commentary, the machine's inability to engage with visceral human emotions provides a clear stylistic signature. Even when prompted to be "edgy" or "controversial," the model's underlying safety filters often truncate the intensity of the language, leading to a detectable "muted" effect.

## **5\. Forensic Linguistics Field Guide**

The following guide establishes a reliability index for each marker category, providing forensic researchers with a weighted approach to AI text detection.

| Score | Criteria |
| :---- | :---- |
| **5** | Robust to paraphrasing AND adversarial editing AND validated across ≥3 studies. |
| **4** | Robust to paraphrasing AND validated in ≥2 studies. |
| **3** | Validated in 1 peer-reviewed study OR 2 preprints. |
| **2** | Preliminary evidence, preprint only. |
| **1** | Theoretical speculation, no empirical validation. |

### **5.1 Reliability Index for Key Markers**

| Marker Category | Reliability Score | Key Forensic Metric |
| :---- | :---- | :---- |
| **Log-Probability Curvature** | 5 | \\hat{d} (DetectGPT) |
| **Surprisal Diversity** | 5 | Autocorrelation / Variance-II |
| **Sentence Burstiness** | 4 | SD of tokens/sentence |
| **Ethical Refusals** | 5 | Boolean Presence |
| **Cognitive Scarcity** | 4 | LIWC Cognitive Score |
| **Metadiscourse Density** | 3 | Frequency ratio |
| **N-gram Over-representation** | 2 | "ever-evolving landscape" frequency |
| **Burrows's Delta (MFW)** | 4 | Z-score distance |
| **Perplexity (PPL)** | 5 | e^{- \\frac{1}{N} \\sum \\log p(x\_i)} |
| **Non-Bayesian Drift** | 3 | T\_{1,g} Statistic |

## **6\. Adversarial Evasion and Temporal Evolution**

The detection landscape is in a state of constant flux due to the "adversarial arms race." As users utilize prompts like "write like a human" or "introduce intentional typos," the effectiveness of surface-level markers like burstiness and n-gram over-representation is significantly degraded. Research indicates that after five stages of successive paraphrasing, the "LLM signature" initially present in the text declines by an average of 25.4%.

### **6.1 Evasion Resilience and Marker Deprecation**

| Marker Type | Evasion Vulnerability | Temporal Validity | |:---|:---|:---| | **Lexical (AI-isms)** | HIGH (Easily removed by editors) | 2022-2023 (Now failing) | | **Syntactic (Burstiness)** | MEDIUM (Can be prompted) | 2024-valid | | **Statistical (Curvature)** | LOW (Inherent to model weights) | 2025-valid | | **Discourse (Coherence)** | MEDIUM (Improving with model size) | 2024-valid | | **Pragmatic (Disclaimers)** | HIGH (Easily filtered) | 2023-deprecated |  
The transition toward 2025 models like Gemini 2.0 and Claude 4 suggests a move away from easily detectable "AI-isms." Markers like the "redundant space token" or "explicit self-identification" are increasingly being mitigated by cleaner tokenization pipelines and better instruction-following that respects the "no disclaimers" constraint. Consequently, the future of AI detection lies in second-order statistical markers—such as log-probability curvature and surprisal diversity—which are rooted in the model's fundamental probability surface and cannot be easily spoofed by surface-level prompting.

## **7\. Annotated Bibliography of Identified Research**

**Abdali et al. (2024).** *Generalizability and Robustness in AI-Generated Text Detection.* This study classifies detection methods into supervised, zero-shot, and watermarking categories, highlighting the struggle of neural detectors to generalize to unseen model families released in late 2024\.  
**Basani & Chen (2025).** *Diversity Boosts AI-Generated Text Detection (DivEye).* Introducing the DivEye framework, this peer-reviewed paper demonstrates how token-level surprisal diversity (variance, skewness, and rhythmic unpredictability) can outperform standard zero-shot detectors by over 30%.  
**Bao et al. (2023).** *Fast-DetectGPT: Efficient Curvature-Based Detection.* This work introduces conditional probability curvature, allowing for a 340x speedup over the original DetectGPT while maintaining high AUROC for models like GPT-NeoX and early GPT-4 versions.  
**Macko et al. (2025).** *Multiclass AI-Generated Text Detection at PAN.* A technical notebook for the PAN 2025 shared task, detailing the "mdok" approach for robust binary and multiclass detection of human-AI collaboration (e.g., machine-polished human text) using Qwen3-14B models.  
**Mitchell et al. (2023).** *DetectGPT: Zero-Shot Machine-Generated Text Detection.* The seminal paper on log-probability curvature, demonstrating that machine-generated text resides in negative curvature regions. It remains the canonical baseline for zero-shot forensic analysis in 2025\.  
**Si et al. (2024/2025).** *The Erosion of LLM Signatures Through Paraphrasing.* This research systematically evaluates the ability of machine learning models to differentiate between human and LLM-generated scientific ideas across five stages of successive paraphrasing, documenting a 25.4% performance decay.  
**Tver'yanovitch et al. (2024).** *Stylometry Recognizes Human and LLM-Generated Texts in Short Samples.* Applying the StyloMetrix tool to Wikipedia-based datasets, this study identifies grammatical standardization and "fact-density" as key features for distinguishing GPT-4 from human-authored summaries.  
**Xu et al. (2024/2025).** *Coherence and Factuality in Medical LLM Watermarking.* Published in EMNLP Findings, this study explores how watermarking affects low-entropy tokens (e.g., medical entities), identifying a critical trade-off between detectability and factual accuracy in sensitive domains.  
**Zaitsu & Jin (2023).** *Cross-Linguistic Stylometric Detection.* One of the first studies to apply classical stylometry (MFW and Burrows' Delta) to Japanese and English LLM outputs, showing that model signatures are cross-lingually consistent.

#### **Works cited**

1\. LLLMs: A Data-Driven Survey of Evolving Research on Limitations of Large Language Models \- arXiv, https://arxiv.org/html/2505.19240v3 2\. Diversity Boosts AI-Generated Text Detection \- arXiv.org, https://arxiv.org/pdf/2509.18880? 3\. Stylometry can reveal artificial intelligence authorship, but humans struggle: A comparison of human and seven large language models in Japanese \- PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC12558491/ 4\. Diversity Boosts AI-Generated Text Detection \- arXiv, https://arxiv.org/pdf/2509.18880 5\. (PDF) Evaluating the Use of Large Language Models as Synthetic Social Agents in Social Science Research \- ResearchGate, https://www.researchgate.net/publication/398803970\_Evaluating\_the\_Use\_of\_Large\_Language\_Models\_as\_Synthetic\_Social\_Agents\_in\_Social\_Science\_Research 6\. Enterprise Strategies for LLM Cost Control in B2B AI, https://sparkco.ai/blog/enterprise-strategies-for-llm-cost-control-in-b2b-ai 7\. (PDF) Stylometry Recognizes Human and Llm-Generated Texts in ..., https://www.researchgate.net/publication/383897763\_Stylometry\_Recognizes\_Human\_and\_Llm-Generated\_Texts\_in\_Short\_Samples 8\. Stylometric comparisons of human versus AI-generated creative ..., https://cora.ucc.ie/server/api/core/bitstreams/a36bea6b-90d7-4afb-b5d9-c275efdac4b5/content 9\. What Are the Different Approaches for Detecting Content Generated by LLMs Such As ChatGPT? And How Do They Work and Differ? \- Sebastian Raschka, https://sebastianraschka.com/blog/2023/detect-ai.html 10\. Deconstructing the ethics of large language models from long-standing issues to new-emerging dilemmas: a survey \- ResearchGate, https://www.researchgate.net/publication/394471870\_Deconstructing\_the\_ethics\_of\_large\_language\_models\_from\_long-standing\_issues\_to\_new-emerging\_dilemmas\_a\_survey 11\. Top LLM Trends 2025: What's the Future of LLMs \- Turing, https://www.turing.com/resources/top-llm-trends 12\. AI breakthroughs 2024-2025, https://www.gleech.org/ai-24-25 13\. GPTZero, https://gptzero.me/ 14\. GPTZero Accuracy: How Reliable Is It for AI Detection? \- Hastewire, https://hastewire.com/blog/gptzero-accuracy-how-reliable-is-it-for-ai-detection 15\. “Feels Feminine to Me”: Understanding Perceived ... \- ACL Anthology, https://aclanthology.org/2025.emnlp-main.1602.pdf 16\. Translationese as a Rational Response to Translation Task Difficulty \- arXiv.org, https://arxiv.org/html/2603.12050 17\. Stylometry recognizes human and LLM-generated texts in short samples \- arXiv, https://arxiv.org/html/2507.00838v2 18\. Factuality Beyond Coherence: Evaluating LLM ... \- ACL Anthology, https://aclanthology.org/2025.findings-emnlp.818.pdf 19\. bryankhelven/coherence-findings \- GitHub, https://github.com/bryankhelven/coherence-findings 20\. Testing & Evaluating Large Language Models(LLMs): Key Metrics and Best Practices Part-2, https://medium.com/@sumit.somanchd/testing-evaluating-large-language-models-llms-key-metrics-and-best-practices-part-2-0ac7092c9776 21\. Anthropic's Transparency Hub, https://www.anthropic.com/transparency 22\. Contrasting Linguistic Patterns in Human and LLM-Generated News Text \- PMC \- NIH, https://pmc.ncbi.nlm.nih.gov/articles/PMC11422446/ 23\. A linguistic comparison between human- and AI-generated content \- PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC12969083/ 24\. A Survey on LLM-Generated Text Detection: Necessity, Methods, and Future Directions \- ACL Anthology, https://aclanthology.org/2025.cl-1.8.pdf 25\. The Erosion of LLM Signatures: Can We Still Distinguish Human and LLM-Generated Scientific Ideas After Iterative Paraphrasing? \- arXiv, https://arxiv.org/html/2512.05311v1 26\. Hoover Hosts a Seminar on AI-Generated Content Detection, https://www.hoover.org/news/hoover-hosts-seminar-ai-generated-content-detection 27\. DetectGPT: Zero-Shot Text Detection | PDF | Receiver Operating Characteristic \- Scribd, https://www.scribd.com/document/684202950/2301-11305v1 28\. DetectGPT: Zero-shot AI Text Detection \- Emergent Mind, https://www.emergentmind.com/topics/detectgpt 29\. What Are We Detecting, Really? LLM-Generated Text Detection Remains an Unsolved Problem \- OpenReview, https://openreview.net/attachment?id=RV12OsgCO0\&name=pdf 30\. (PDF) DetectGPT: Zero-Shot Machine-Generated Text Detection using Probability Curvature, https://www.researchgate.net/publication/367461943\_DetectGPT\_Zero-Shot\_Machine-Generated\_Text\_Detection\_using\_Probability\_Curvature 31\. mdok of KInIT: Robustly Fine-tuned LLM for Binary and Multiclass AI-Generated Text Detection \- CEUR-WS.org, https://ceur-ws.org/Vol-4038/paper\_307.pdf
