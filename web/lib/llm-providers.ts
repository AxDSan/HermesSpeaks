'use client'

// ============================================================================
// LLM Provider Types
// ============================================================================

export type ProviderType = 'webllm' | 'openai' | 'claude' | 'gemini' | 'openrouter';

export type ModelStatus = 'idle' | 'checking' | 'downloading' | 'loading' | 'ready' | 'error';

export interface ProviderConfig {
  id: ProviderType;
  name: string;
  description: string;
  requiresApiKey: boolean;
  supportsStreaming: boolean;
  icon: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  maxTokens: number;
}

export interface GenerationOptions {
  systemPrompt: string;
  userInput: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  signal?: AbortSignal;
  onProgress?: (status: ModelStatus, progress: number, message: string) => void;
  onChunk?: (chunk: string) => void;
}

// ============================================================================
// Provider Definitions
// ============================================================================

export const PROVIDERS: Record<ProviderType, ProviderConfig> = {
  webllm: {
    id: 'webllm',
    name: 'WebLLM (Local)',
    description: 'Runs locally in browser - no API key needed',
    requiresApiKey: false,
    supportsStreaming: false,
    icon: '💻',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini, o3-mini, etc.',
    requiresApiKey: true,
    supportsStreaming: true,
    icon: '🤖',
  },
  claude: {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus, etc.',
    requiresApiKey: true,
    supportsStreaming: true,
    icon: '🧠',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini 2.0 Flash, Gemini 1.5 Pro, etc.',
    requiresApiKey: true,
    supportsStreaming: true,
    icon: '✨',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified access to 100+ models',
    requiresApiKey: true,
    supportsStreaming: true,
    icon: '🌐',
  },
};

// ============================================================================
// Model Options by Provider
// ============================================================================

export const MODELS: Record<string, ModelOption[]> = {
  webllm: [
    { id: 'Qwen2-1.5B-Instruct', name: 'Qwen 2 1.5B', provider: 'webllm', description: 'Fast, good quality', maxTokens: 2048 },
    { id: 'Phi-3-mini', name: 'Phi-3 Mini', provider: 'webllm', description: 'Better quality, larger', maxTokens: 2048 },
    { id: 'Llama-3.2-1B', name: 'Llama 3.2 1B', provider: 'webllm', description: 'Good quality', maxTokens: 2048 },
    { id: 'SmolLM2-1.7B', name: 'SmolLM 2 1.7B', provider: 'webllm', description: 'Fastest, lower quality', maxTokens: 2048 },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Most capable, slower', maxTokens: 128000 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Fast, cost effective', maxTokens: 128000 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', description: 'Fast with vision', maxTokens: 128000 },
    { id: 'o3-mini', name: 'o3 Mini', provider: 'openai', description: 'Reasoning model', maxTokens: 65536 },
  ],
  claude: [
    { id: 'claude-opus-4-5', name: 'Claude Opus 4', provider: 'claude', description: 'Most capable', maxTokens: 200000 },
    { id: 'claude-3-5-sonnet-6', name: 'Claude 3.5 Sonnet', provider: 'claude', description: 'Best balance', maxTokens: 200000 },
    { id: 'claude-3-5-haiku-3', name: 'Claude 3.5 Haiku', provider: 'claude', description: 'Fastest, lowest cost', maxTokens: 200000 },
  ],
  gemini: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', description: 'Fast and capable', maxTokens: 1000000 },
    { id: 'gemini-2.0-flash-thinking', name: 'Gemini 2.0 Flash Thinking', provider: 'gemini', description: 'With extended thinking', maxTokens: 64000 },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', description: 'Long context', maxTokens: 2000000 },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', description: 'Fast and efficient', maxTokens: 1000000 },
  ],
  openrouter: [
    { id: 'openai/gpt-4o', name: 'GPT-4o (via OpenRouter)', provider: 'openrouter', description: 'OpenAI best model', maxTokens: 128000 },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (via OpenRouter)', provider: 'openrouter', description: 'Anthropic best balance', maxTokens: 200000 },
    { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash (via OpenRouter)', provider: 'openrouter', description: 'Google fast model', maxTokens: 1000000 },
    { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'openrouter', description: 'Large open model', maxTokens: 8000 },
  ],
};

export const ALL_MODELS = Object.values(MODELS).flat();

// ============================================================================
// WebGPU Detection
// ============================================================================

export async function checkWebGPUSupport(): Promise<{ supported: boolean; message: string }> {
  if (typeof navigator === 'undefined') {
    return { supported: false, message: 'Browser environment required' };
  }

  try {
    // Check for WebGPU in navigator
    const webgpu = (navigator as any).gpu;
    if (!webgpu) {
      return { supported: false, message: 'WebGPU not available. Try Chrome/Edge with hardware acceleration enabled.' };
    }

    // Try to request an adapter
    const adapter = await webgpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) {
      return { supported: false, message: 'WebGPU adapter not available. Your device may not support GPU acceleration.' };
    }

    return { supported: true, message: 'WebGPU supported' };
  } catch (error) {
    return { 
      supported: false, 
      message: `WebGPU error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// ============================================================================
// WebLLM Provider
// ============================================================================

let webllmEngine: any = null;
let webllmModelId: string = '';

async function loadWebLLM(
  modelId: string,
  onProgress: (status: ModelStatus, progress: number, message: string) => void
): Promise<void> {
  onProgress('checking', 0, 'Checking WebGPU support...');
  
  const gpuCheck = await checkWebGPUSupport();
  if (!gpuCheck.supported) {
    throw new Error(gpuCheck.message);
  }

  onProgress('downloading', 0, 'Starting model download...');

  try {
    const webllmModule = await import('@mlc-ai/web-llm');
    
    webllmEngine = await webllmModule.CreateMLCEngine(modelId, {
      initProgressCallback: (progress: any) => {
        const pct = Math.round(progress.progress * 100);
        const text = progress.text || 'Loading...';
        
        if (pct < 100) {
          onProgress('downloading', pct, `Downloading: ${text}`);
        } else {
          onProgress('loading', pct, 'Initializing model...');
        }
      },
    });

    webllmModelId = modelId;
    onProgress('ready', 100, 'Ready');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load model';
    onProgress('error', 0, message);
    throw error;
  }
}

async function generateWebLLM(
  systemPrompt: string,
  userInput: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!webllmEngine) {
    throw new Error('WebLLM model not loaded');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInput },
  ];

  const completion = await webllmEngine.chat.completions.create({
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });

  const response = completion.choices[0].message.content;
  
  if (onChunk) {
    onChunk(response);
  }
  
  return response;
}

function unloadWebLLM(): void {
  if (webllmEngine) {
    webllmEngine.terminate();
    webllmEngine = null;
    webllmModelId = '';
  }
}

function isWebLLMLoaded(): boolean {
  return webllmEngine !== null;
}

// ============================================================================
// OpenAI Provider
// ============================================================================

async function generateOpenAI(
  systemPrompt: string,
  userInput: string,
  apiKey: string,
  modelId: string,
  signal?: AbortSignal,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInput },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  if (onChunk) {
    onChunk(content);
  }
  
  return content;
}

// ============================================================================
// Claude Provider
// ============================================================================

async function generateClaude(
  systemPrompt: string,
  userInput: string,
  apiKey: string,
  modelId: string,
  signal?: AbortSignal,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const messages = [
    { role: 'user', content: userInput },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      system: systemPrompt,
      max_tokens: 2048,
      temperature: 0.7,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
    throw new Error(error.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';
  
  if (onChunk) {
    onChunk(content);
  }
  
  return content;
}

// ============================================================================
// Gemini Provider
// ============================================================================

async function generateGemini(
  systemPrompt: string,
  userInput: string,
  apiKey: string,
  modelId: string,
  signal?: AbortSignal,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const contents = [{
    role: 'user',
    parts: [{ text: userInput }],
  }];

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  if (onChunk) {
    onChunk(content);
  }
  
  return content;
}

// ============================================================================
// OpenRouter Provider
// ============================================================================

async function generateOpenRouter(
  systemPrompt: string,
  userInput: string,
  apiKey: string,
  modelId: string,
  signal?: AbortSignal,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInput },
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://skill-lab.vercel.app',
      'X-OpenRouter-Title': 'SKILL Lab',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
    throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  if (onChunk) {
    onChunk(content);
  }
  
  return content;
}

// ============================================================================
// Unified Generate Function
// ============================================================================

export async function generateWithProvider(
  provider: ProviderType,
  modelId: string,
  options: GenerationOptions
): Promise<string> {
  const { systemPrompt, userInput, apiKey, signal, onChunk, onProgress } = options;

  if (provider === 'webllm') {
    if (!isWebLLMLoaded() || webllmModelId !== modelId) {
      await loadWebLLM(modelId, (status, progress, message) => {
        onProgress?.(status, progress, message);
      });
    }
    return generateWebLLM(systemPrompt, userInput, onChunk);
  }

  if (!apiKey) {
    throw new Error(`API key required for ${PROVIDERS[provider].name}`);
  }

  switch (provider) {
    case 'openai':
      return generateOpenAI(systemPrompt, userInput, apiKey, modelId, signal, onChunk);
    case 'claude':
      return generateClaude(systemPrompt, userInput, apiKey, modelId, signal, onChunk);
    case 'gemini':
      return generateGemini(systemPrompt, userInput, apiKey, modelId, signal, onChunk);
    case 'openrouter':
      return generateOpenRouter(systemPrompt, userInput, apiKey, modelId, signal, onChunk);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function unloadProvider(provider: ProviderType): void {
  if (provider === 'webllm') {
    unloadWebLLM();
  }
}

export function isProviderLoaded(provider: ProviderType): boolean {
  if (provider === 'webllm') {
    return isWebLLMLoaded();
  }
  // API-based providers are always "loaded" when you have an API key
  return true;
}

// ============================================================================
// Model Selection Helpers
// ============================================================================

export function getModelsForProvider(provider: ProviderType): ModelOption[] {
  return MODELS[provider] || [];
}

export function getDefaultModelForProvider(provider: ProviderType): string {
  const models = getModelsForProvider(provider);
  return models[0]?.id || '';
}

export function getProviderForModel(modelId: string): ProviderType | null {
  for (const [provider, models] of Object.entries(MODELS)) {
    if (models.some(m => m.id === modelId)) {
      return provider as ProviderType;
    }
  }
  return null;
}
