import { Skill } from '@/types';

export function buildSystemPrompt(skill: Skill): string {
  return `${skill.content}

## Critical Instructions
1. Output ONLY the rewritten text - no explanations, no notes, no "Here's the rewrite:"
2. Preserve the approximate length of the original (within 20%)
3. Maintain the original's tone (formal/informal, technical/simple)
4. Do not add new information or opinions

## Text to Rewrite:
`;
}

export function buildUserMessage(inputText: string): string {
  return inputText;
}

export const SAMPLE_TEXTS = {
  ai: `Furthermore, it is important to note that artificial intelligence has fundamentally transformed the way we approach problem-solving in the modern era. Consequently, organizations must leverage scalable solutions to navigate the complex landscape of digital transformation.

In conclusion, this paper has demonstrated that robust implementation of machine learning algorithms can facilitate seamless integration of data-driven insights. It should be noted that further research in this realm is crucial for optimizing outcomes.`,

  academic: `This study investigates the multifaceted relationship between economic development and environmental sustainability. The research methodology employed involved a comprehensive literature review and quantitative analysis of data collected from various sources over a five-year period.

The findings indicate that there exists a statistically significant correlation between GDP growth and carbon emissions, though this relationship exhibits diminishing returns at higher income levels. Policy implications suggest that sustainable development requires a holistic approach that balances economic growth with environmental considerations.`,

  marketing: `Introducing our revolutionary new product that will transform the way you work! This groundbreaking solution leverages cutting-edge technology to deliver unprecedented results. Join thousands of satisfied customers who have already experienced the difference.

Don't miss out on this incredible opportunity to streamline your workflow and boost productivity. Act now and receive an exclusive discount - limited time only!`,

  technical: `The authentication system shall utilize the OAuth 2.0 protocol with JWT tokens for session management. Upon successful authentication, the server shall issue an access token with a validity period of 3600 seconds and a refresh token with a validity period of 86400 seconds.

Error handling shall follow the RESTful convention wherein HTTP status codes indicate the outcome of the request. Specifically, 4xx codes shall be used for client errors, 5xx for server errors, and 2xx for successful operations.`,
};

export const DEFAULT_SKILL_B_CONTENT = `You are an academic writing assistant focused on formal, scholarly prose.

## Your Task
Transform the text into formal academic writing style while preserving the core meaning.

## Style Guidelines
1. Use precise, formal vocabulary
2. Employ complex sentence structures where appropriate
3. Include appropriate hedging and qualification
4. Use third-person constructions
5. Reference general scholarly consensus when relevant
6. Maintain objectivity and neutrality
7. Use transitional phrases to connect ideas

## Output Format
Output ONLY the rewritten text in academic style. No explanations.`;
