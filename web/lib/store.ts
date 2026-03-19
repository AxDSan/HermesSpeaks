'use client'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Skill, Experiment, DEFAULT_SKILL_CONTENT } from '@/types';
import { 
  ProviderType, 
  ModelStatus,
  generateWithProvider,
  unloadProvider,
  getModelsForProvider,
  getDefaultModelForProvider,
  PROVIDERS 
} from './llm-providers';

function getSessionApiKey(provider: ProviderType): string {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem(`apiKey_${provider}`) || '';
  } catch {
    return '';
  }
}

function setSessionApiKey(provider: ProviderType, key: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (key) {
      sessionStorage.setItem(`apiKey_${provider}`, key);
    } else {
      sessionStorage.removeItem(`apiKey_${provider}`);
    }
  } catch {
    // sessionStorage not available
  }
}

interface AppState {
  // Provider & Model
  provider: ProviderType;
  modelId: string;
  modelStatus: ModelStatus;
  modelProgress: number;
  modelProgressText: string;
  
  // API Keys (stored in session storage, not persisted)
  apiKeys: {
    webllm: string;
    openai: string;
    claude: string;
    gemini: string;
    openrouter: string;
  };
  
  // Experiment State
  inputText: string;
  skillA: Skill;
  skillB: Skill | null;
  isGenerating: boolean;
  generatingFor: 'a' | 'b' | null;
  outputA: string | null;
  outputB: string | null;
  outputAStats: { chars: number; timeMs: number } | null;
  outputBStats: { chars: number; timeMs: number } | null;
  userVote: 'a' | 'b' | 'tie' | null;
  experimentHistory: Experiment[];
  showHelp: boolean;
  showApiKeys: boolean;
  error: string | null;

  // Actions
  setProvider: (provider: ProviderType) => void;
  setModelId: (modelId: string) => void;
  setApiKey: (provider: ProviderType, key: string) => void;
  loadModel: () => Promise<void>;
  runExperiment: () => Promise<void>;
  setUserVote: (vote: 'a' | 'b' | 'tie' | null) => void;
  submitExperiment: () => void;
  clearCurrentExperiment: () => void;
  setShowHelp: (show: boolean) => void;
  setShowApiKeys: (show: boolean) => void;
  clearError: () => void;
  exportHistory: (format: 'json' | 'csv') => void;
  clearHistory: () => void;
  loadSampleText: (sample: 'ai' | 'academic' | 'marketing' | 'technical') => void;
  setInputText: (text: string) => void;
  setSkillAName: (name: string) => void;
  setSkillAContent: (content: string) => void;
  setSkillBName: (name: string) => void;
  setSkillBContent: (content: string) => void;
  addSkillB: () => void;
  removeSkillB: () => void;
  swapSkills: () => void;
}

const initialSkillA: Skill = {
  id: 'a',
  name: 'Humanize (Remove AI Patterns)',
  content: DEFAULT_SKILL_CONTENT,
  source: 'default',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      provider: 'openai',
      modelId: 'gpt-4o-mini',
      modelStatus: 'idle',
      modelProgress: 0,
      modelProgressText: '',
      apiKeys: {
        webllm: '',
        openai: getSessionApiKey('openai'),
        claude: getSessionApiKey('claude'),
        gemini: getSessionApiKey('gemini'),
        openrouter: getSessionApiKey('openrouter'),
      },
      inputText: '',
      skillA: initialSkillA,
      skillB: null,
      isGenerating: false,
      generatingFor: null,
      outputA: null,
      outputB: null,
      outputAStats: null,
      outputBStats: null,
      userVote: null,
      experimentHistory: [],
      showHelp: false,
      showApiKeys: false,
      error: null,

      setProvider: (provider) => {
        const defaultModel = getDefaultModelForProvider(provider);
        set({ 
          provider, 
          modelId: defaultModel,
          modelStatus: 'idle' as ModelStatus,
          modelProgress: 0,
          modelProgressText: '',
        });
        unloadProvider(provider);
      },

      setModelId: (modelId) => set({ modelId }),

      setApiKey: (provider, key) => {
        setSessionApiKey(provider, key);
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        }));
      },

      loadModel: async () => {
        const { provider, modelId, apiKeys } = get();
        
        if (provider === 'webllm') {
          set({ modelStatus: 'downloading', modelProgress: 0, modelProgressText: 'Starting...' });
          
          try {
            await generateWithProvider(provider, modelId, {
              systemPrompt: 'You are a helpful assistant.',
              userInput: 'Hello',
              onProgress: (status, progress, message) => {
                set({ modelStatus: status, modelProgress: progress, modelProgressText: message });
              },
            });
          } catch (error) {
            set({ 
              modelStatus: 'error', 
              error: error instanceof Error ? error.message : 'Failed to load model' 
            });
          }
        } else {
          // For API providers, just validate the key exists
          if (!apiKeys[provider]) {
            set({ 
              modelStatus: 'error', 
              modelProgressText: `API key required for ${PROVIDERS[provider].name}` 
            });
          } else {
            set({ modelStatus: 'ready', modelProgress: 100, modelProgressText: 'Ready' });
          }
        }
      },

      runExperiment: async () => {
        const { inputText, skillA, skillB, provider, modelId, apiKeys } = get();

        if (!inputText.trim()) {
          set({ error: 'Please enter text to transform' });
          return;
        }

        if (!skillA.content.trim()) {
          set({ error: 'SKILL A content is empty' });
          return;
        }

        // Check API key for non-webllm providers
        if (provider !== 'webllm' && !apiKeys[provider]) {
          set({ error: `API key required for ${PROVIDERS[provider].name}. Click the settings icon to add your key.` });
          return;
        }

        set({ isGenerating: true, error: null, outputA: '', outputB: '', userVote: null });

        // Build prompts
        const buildPrompt = (skill: Skill) => `${skill.content}

## Critical Instructions
1. Output ONLY the rewritten text - no explanations, no notes, no "Here's the rewrite:"
2. Preserve the approximate length of the original (within 20%)
3. Maintain the original's tone (formal/informal, technical/simple)
4. Do not add new information or opinions

## Text to Rewrite:
`;

        // Generate Output A
        const startTimeA = Date.now();
        set({ generatingFor: 'a' });

        try {
          const outputA = await generateWithProvider(provider, modelId, {
            systemPrompt: buildPrompt(skillA),
            userInput: inputText,
            apiKey: apiKeys[provider],
            onProgress: (status, progress, message) => {
              set({ modelStatus: status, modelProgress: progress, modelProgressText: message });
            },
          });

          set({
            outputA,
            outputAStats: {
              chars: outputA.length,
              timeMs: Date.now() - startTimeA,
            },
          });
        } catch (error) {
          set({
            outputA: `Error: ${error instanceof Error ? error.message : 'Generation failed'}`,
            outputAStats: { chars: 0, timeMs: 0 },
          });
        }

        // Generate Output B if SKILL B exists
        const { skillB: currentSkillB } = get();
        if (currentSkillB && currentSkillB.content.trim()) {
          const startTimeB = Date.now();
          set({ generatingFor: 'b' });

          try {
            const outputB = await generateWithProvider(provider, modelId, {
              systemPrompt: buildPrompt(currentSkillB),
              userInput: inputText,
              apiKey: apiKeys[provider],
            });

            set({
              outputB,
              outputBStats: {
                chars: outputB.length,
                timeMs: Date.now() - startTimeB,
              },
            });
          } catch (error) {
            set({
              outputB: `Error: ${error instanceof Error ? error.message : 'Generation failed'}`,
              outputBStats: { chars: 0, timeMs: 0 },
            });
          }
        }

        set({ isGenerating: false, generatingFor: null });
      },

      setUserVote: (vote) => set({ userVote: vote }),

      submitExperiment: () => {
        const state = get();
        const experiment: Experiment = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          inputText: state.inputText,
          skillA: state.skillA,
          skillB: state.skillB,
          outputA: state.outputA || '',
          outputB: state.outputB,
          outputAStats: state.outputAStats || { chars: 0, timeMs: 0 },
          outputBStats: state.outputBStats,
          votes: { a: 0, b: 0, tie: 0 },
          winner: null,
          modelUsed: `${state.provider}:${state.modelId}`,
          userVote: state.userVote || undefined,
        };

        if (state.userVote) {
          experiment.votes[state.userVote] = 1;
          experiment.winner = state.userVote === 'tie' ? 'tie' : state.userVote;
        }

        set((state) => ({
          experimentHistory: [experiment, ...state.experimentHistory].slice(0, 100),
          inputText: '',
          outputA: null,
          outputB: null,
          outputAStats: null,
          outputBStats: null,
          userVote: null,
        }));
      },

      clearCurrentExperiment: () => set({
        inputText: '',
        outputA: null,
        outputB: null,
        outputAStats: null,
        outputBStats: null,
        userVote: null,
        error: null,
      }),

      setShowHelp: (show) => set({ showHelp: show }),
      setShowApiKeys: (show) => set({ showApiKeys: show }),
      clearError: () => set({ error: null }),

      exportHistory: (format) => {
        const { experimentHistory } = get();
        
        if (format === 'json') {
          const blob = new Blob([JSON.stringify(experimentHistory, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `skill-lab-experiments-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const headers = ['id', 'timestamp', 'skillA', 'skillB', 'winner', 'model', 'inputText', 'outputA', 'outputB'];
          const rows = experimentHistory.map((exp) => [
            exp.id,
            new Date(exp.timestamp).toISOString(),
            exp.skillA.name,
            exp.skillB?.name || '',
            exp.winner || '',
            exp.modelUsed,
            exp.inputText.replace(/"/g, '""'),
            (exp.outputA || '').replace(/"/g, '""'),
            (exp.outputB || '').replace(/"/g, '""'),
          ]);
          const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `skill-lab-experiments-${Date.now()}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }
      },

      clearHistory: () => set({ experimentHistory: [] }),

      loadSampleText: (sampleKey) => {
        const samples: Record<string, string> = {
          ai: `Furthermore, it is important to note that artificial intelligence has fundamentally transformed the way we approach problem-solving in the modern era. Consequently, organizations must leverage scalable solutions to navigate the complex landscape of digital transformation.

In conclusion, this paper has demonstrated that robust implementation of machine learning algorithms can facilitate seamless integration of data-driven insights. It should be noted that further research in this realm is crucial for optimizing outcomes.`,
          academic: `This study investigates the multifaceted relationship between economic development and environmental sustainability. The research methodology employed involved a comprehensive literature review and quantitative analysis of data collected from various sources over a five-year period.

The findings indicate that there exists a statistically significant correlation between GDP growth and carbon emissions, though this relationship exhibits diminishing returns at higher income levels. Policy implications suggest that sustainable development requires a holistic approach that balances economic growth with environmental considerations.`,
          marketing: `Introducing our revolutionary new product that will transform the way you work! This groundbreaking solution leverages cutting-edge technology to deliver unprecedented results. Join thousands of satisfied customers who have already experienced the difference.

Don't miss out on this incredible opportunity to streamline your workflow and boost productivity. Act now and receive an exclusive discount - limited time only!`,
          technical: `The authentication system shall utilize the OAuth 2.0 protocol with JWT tokens for session management. Upon successful authentication, the server shall issue an access token with a validity period of 3600 seconds and a refresh token with a validity period of 86400 seconds.

Error handling shall follow the RESTful convention wherein HTTP status codes indicate the outcome of the request. Specifically, 4xx codes shall be used for client errors, 5xx for server errors, and 2xx for successful operations.`,
        };
        set({ inputText: samples[sampleKey] || '' });
      },

      setInputText: (text) => set({ inputText: text }),

      setSkillAName: (name) => set((state) => ({
        skillA: { ...state.skillA, name },
      })),

      setSkillAContent: (content) => set((state) => ({
        skillA: { ...state.skillA, content },
      })),

      setSkillBName: (name) => set((state) => {
        if (!state.skillB) return state;
        return { skillB: { ...state.skillB, name } };
      }),

      setSkillBContent: (content) => set((state) => {
        if (!state.skillB) return state;
        return { skillB: { ...state.skillB, content } };
      }),

      addSkillB: () => set({
        skillB: {
          id: 'b',
          name: 'SKILL B',
          content: '',
          source: 'manual',
        },
      }),

      removeSkillB: () => set({
        skillB: null,
        outputB: null,
        outputBStats: null,
      }),

      swapSkills: () => set((state) => ({
        skillA: state.skillB || state.skillA,
        skillB: state.skillB ? state.skillA : null,
        outputA: state.outputB,
        outputB: state.outputA,
        outputAStats: state.outputBStats,
        outputBStats: state.outputAStats,
      })),
    }),
    {
      name: 'stop-slop-lab-storage',
      partialize: (state) => ({
        experimentHistory: state.experimentHistory,
        provider: state.provider,
        modelId: state.modelId,
        skillA: state.skillA,
        skillB: state.skillB,
      }),
    }
  )
);
