# Code Review Report: SKILL Lab Web Application

**Review Date:** March 2025  
**Reviewer:** Senior Engineering Review  
**Scope:** `/web` directory - Next.js React application  
**Lines of Code:** ~2,500+ (TypeScript/React)

---

## Executive Summary

The SKILL Lab application is a well-architected A/B testing tool for comparing AI writing transformations. It demonstrates good separation of concerns with Zustand for state management and a clean provider abstraction pattern for LLM integrations. However, there are several critical security vulnerabilities, performance anti-patterns, and maintainability issues that require immediate attention.

**Overall Grade: C+** (Good architecture, significant security issues)

| Category | Score | Notes |
|----------|-------|-------|
| Security | D | Critical API key exposure, XSS vulnerabilities |
| Performance | C | Missing optimizations, unnecessary re-renders |
| Maintainability | B | Good structure, some code smells |
| Best Practices | C | Mixed adherence to React/TypeScript patterns |
| Accessibility | D | Missing ARIA labels, keyboard nav issues |

---

## 🚨 Critical Issues (Fix Immediately)

### 1. API Keys Stored in localStorage (Security - CRITICAL)

**Location:** `web/lib/store.ts` (lines 89-94, 124-126, 404-411)

**Issue:** API keys for OpenAI, Claude, Gemini, and OpenRouter are stored in localStorage via Zustand's `persist` middleware. This is a critical security vulnerability.

**Impact:**
- API keys are accessible to any JavaScript running on the page (XSS vulnerability)
- Keys persist in plaintext on disk
- Keys are included in persisted state snapshots
- Malicious browser extensions can easily extract them

**Current Code:**
```typescript
// store.ts
apiKeys: {
  openai: '',
  claude: '',
  gemini: '',
  openrouter: '',
},
// ...
setApiKey: (provider, key) => set((state) => ({
  apiKeys: { ...state.apiKeys, [provider]: key },
})),
// ...
partialize: (state) => ({
  // ...
  apiKeys: state.apiKeys,  // CRITICAL: Keys persisted to localStorage!
})
```

**Fixed Code:**
```typescript
// Remove apiKeys from persisted state
partialize: (state) => ({
  experimentHistory: state.experimentHistory,
  provider: state.provider,
  modelId: state.modelId,
  skillA: state.skillA,
  skillB: state.skillB,
  // DO NOT persist: apiKeys
}),

// Store keys in memory only, provide session-only storage option
const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ... other state
      apiKeys: {
        openai: sessionStorage.getItem('apiKey_openai') || '',
        claude: sessionStorage.getItem('apiKey_claude') || '',
        gemini: sessionStorage.getItem('apiKey_gemini') || '',
        openrouter: sessionStorage.getItem('apiKey_openrouter') || '',
      },
      // ...
      setApiKey: (provider, key) => {
        sessionStorage.setItem(`apiKey_${provider}`, key);
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        }));
      },
    }),
    {
      name: 'stop-slop-lab-storage',
      partialize: (state) => ({
        // Never persist API keys
        experimentHistory: state.experimentHistory,
        provider: state.provider,
        modelId: state.modelId,
        skillA: state.skillA,
        skillB: state.skillB,
      }),
    }
  )
);
```

**Additional Recommendations:**
1. Add option to "Remember for this session" vs "Don't remember"
2. Warn users that keys are stored in browser memory
3. Consider using IndexedDB with encryption for optional persistence
4. Add automatic key expiration (clear after X hours)

---

### 2. XSS Vulnerability in URL Loading (Security - CRITICAL)

**Location:** `web/components/TextInput.tsx` (lines 75-94)

**Issue:** The "Load from URL" feature fetches arbitrary URLs and injects the response directly into the textarea without sanitization. HTML tags are stripped with a naive regex, but this is insufficient.

**Current Code:**
```typescript
const res = await fetch(url)
const text = await res.text()
// Strip HTML tags roughly - INSUFFICIENT!
const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
setInputText(stripped.slice(0, 5000))
```

**Impact:**
- JavaScript can still execute (e.g., `<img src=x onerror=alert(1)>`)
- CSS injection possible
- Could load malicious content from attacker-controlled URLs
- No CORS validation, could trigger requests to internal services

**Fixed Code:**
```typescript
import DOMPurify from 'dompurify'; // Add dependency

// ...
const loadFromUrl = async () => {
  const url = prompt('Enter URL to fetch text from:');
  if (!url) return;

  // Validate URL scheme
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      alert('Only HTTP/HTTPS URLs are allowed');
      return;
    }
  } catch {
    alert('Invalid URL');
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/') && !contentType.includes('application/json')) {
      throw new Error('Invalid content type');
    }

    const text = await res.text();
    
    // Properly sanitize HTML
    const sanitized = DOMPurify.sanitize(text, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true 
    });
    
    // Strip to text content only
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    setInputText(plainText.slice(0, 5000));
  } catch (err) {
    console.error('Failed to load URL:', err);
    alert('Failed to fetch URL. Ensure it allows CORS and contains text content.');
  }
};
```

---

### 3. API Keys Sent in Plaintext via Query Parameters (Security - HIGH)

**Location:** `web/lib/llm-providers.ts` (line 347)

**Issue:** Gemini API key is sent as a query parameter in the URL, which means it will appear in:
- Browser history
- Server access logs
- Referrer headers when clicking links

**Current Code:**
```typescript
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
```

**Fixed Code:**
```typescript
// Gemini API key should be in header (X-Goog-Api-Key)
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey, // Use header instead of query param
  },
  // ...
});
```

---

### 4. No Input Validation on Skill Content (Security - MEDIUM)

**Location:** `web/components/SkillPanel.tsx`, `web/lib/store.ts`

**Issue:** No validation on SKILL content length or content. Users could:
- Submit extremely large prompts (DoS vector)
- Include malicious instructions
- Cause token limit errors with no user feedback

**Recommendation:**
```typescript
// Add validation
const MAX_SKILL_LENGTH = 10000;
const MAX_INPUT_LENGTH = 10000;

setSkillAContent: (content) => {
  if (content.length > MAX_SKILL_LENGTH) {
    set({ error: `SKILL content exceeds maximum length of ${MAX_SKILL_LENGTH} characters` });
    return;
  }
  set((state) => ({
    skillA: { ...state.skillA, content },
  }));
}
```

---

## ⚠️ High Priority Issues

### 5. Missing AbortController for API Calls (Performance/Bug)

**Location:** `web/lib/llm-providers.ts` (all provider functions)

**Issue:** API calls cannot be cancelled. If a user switches providers or navigates away during generation, the request continues consuming resources.

**Current Code:**
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  // No signal provided
});
```

**Fixed Code:**
```typescript
// Add abort controller to GenerationOptions
export interface GenerationOptions {
  // ... existing options
  signal?: AbortSignal;
}

// Pass signal to fetch
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify({ /* ... */ }),
  signal: options.signal, // Enable cancellation
});

// In component, cancel on unmount or provider change
useEffect(() => {
  const controller = new AbortController();
  
  generateWithProvider(provider, modelId, {
    // ... options
    signal: controller.signal,
  });
  
  return () => controller.abort();
}, [provider, modelId]);
```

---

### 6. Zustand Store Subscribes to All State Changes (Performance)

**Location:** All component files

**Issue:** Components use `useStore()` which subscribes to ALL state changes, causing unnecessary re-renders.

**Current Code:**
```typescript
// This subscribes to EVERYTHING in the store
const store = useStore()
const { inputText, setInputText } = store
```

**Fixed Code:**
```typescript
// Use selectors to only subscribe to needed state
const inputText = useStore(state => state.inputText)
const setInputText = useStore(state => state.setInputText)

// Or use Zustand's shallow comparison for multiple values
import { shallow } from 'zustand/shallow'

const { skillA, skillB } = useStore(
  state => ({ skillA: state.skillA, skillB: state.skillB }),
  shallow
)
```

---

### 7. Dangerous DOM Manipulation (Bug/Security)

**Location:** `web/components/OutputPanel.tsx` (lines 68-72)

**Issue:** `document.write()` is used to open output in new window, which can:
- Overwrite the current document if window already exists
- Execute arbitrary code if content is malicious

**Current Code:**
```typescript
const handleExpand = () => {
  if (output) {
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(`<html>...</html>`) // DANGEROUS
    }
  }
}
```

**Fixed Code:**
```typescript
const handleExpand = () => {
  if (!output) return;
  
  const blob = new Blob([`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Output ${id.toUpperCase()}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: monospace; white-space: pre-wrap; padding: 2rem; }
        </style>
      </head>
      <body>${escapeHtml(output)}</body>
    </html>
  `], { type: 'text/html' });
  
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

// Helper function
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

---

## 💡 Medium Priority Issues

### 8. No Error Boundaries (Reliability)

**Location:** Application-wide

**Issue:** No React Error Boundaries to catch rendering errors. A single component crash can break the entire app.

**Recommendation:**
```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

// In layout.tsx
<ErrorBoundary>
  {children}
</ErrorBoundary>
```

---

### 9. Missing Loading/Error States for Model Initialization (UX)

**Location:** `web/app/page.tsx` (line 27-29)

**Issue:** `loadModel()` is called in useEffect but errors are not handled or displayed to the user.

**Current Code:**
```typescript
useEffect(() => {
  loadModel() // Errors silently swallowed
}, [loadModel])
```

**Fixed Code:**
```typescript
useEffect(() => {
  loadModel().catch(err => {
    console.error('Failed to load model:', err)
    // Error is already set in store, UI should display it
  })
}, [loadModel])
```

---

### 10. Duplicate Skill Content Logic (Maintainability)

**Location:** `web/lib/store.ts` (lines 183-192, 360-376)

**Issue:** `buildPrompt` function is defined inline in `runExperiment`, and skill setters have nearly identical code.

**Recommendation:** Extract to utility functions:
```typescript
// lib/prompt-utils.ts
export const buildPrompt = (skill: Skill): string => `${skill.content}

## Critical Instructions
1. Output ONLY the rewritten text - no explanations, no notes, no "Here's the rewrite:"
2. Preserve the approximate length of the original (within 20%)
3. Maintain the original's tone (formal/informal, technical/simple)
4. Do not add new information or opinions

## Text to Rewrite:
`;

export const createSkillSetter = (id: 'a' | 'b') => 
  (name: string) => set((state) => {
    const skill = id === 'a' ? state.skillA : state.skillB;
    if (!skill) return state;
    return { [`skill${id.toUpperCase()}`]: { ...skill, name } };
  });
```

---

### 11. No Rate Limiting or Debouncing (Performance)

**Location:** `web/components/ProviderSelector.tsx` (lines 33-39)

**Issue:** Rapid provider switching could trigger multiple expensive model loads.

**Recommendation:**
```typescript
import { useCallback, useRef } from 'react'

const debouncedSetProvider = useCallback(
  debounce((provider: ProviderType) => {
    setProvider(provider)
  }, 300),
  [setProvider]
)
```

---

### 12. Inline Styles in Global CSS (Maintainability)

**Location:** `web/app/globals.css`

**Issue:** Mix of CSS variables and Tailwind arbitrary values creates inconsistency. Some values are hardcoded in components.

**Recommendation:** Standardize on Tailwind config:
```typescript
// tailwind.config.ts
extend: {
  colors: {
    background: '#0f0f0f',
    surface: {
      DEFAULT: '#1a1a1a',
      elevated: '#252525',
    },
    border: '#333333',
    // ...
  }
}
```

---

## 🔧 Low Priority / Code Quality

### 13. Unused Imports and Dead Code

**Location:** Various files

**Issues:**
- `web/lib/webllm.ts` is now dead code (replaced by `llm-providers.ts`)
- `web/lib/prompt-builder.ts` is mostly dead code
- `Settings` icon imported but unused in ProviderSelector

**Action:** Remove or deprecate unused files.

---

### 14. Missing Type Safety in API Responses

**Location:** `web/lib/llm-providers.ts`

**Issue:** API responses use `any` type and lack runtime validation.

**Recommendation:** Use Zod for runtime validation:
```typescript
import { z } from 'zod'

const OpenAIResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.string()
    })
  }))
})

const data = OpenAIResponseSchema.parse(await response.json())
```

---

### 15. Accessibility Issues (A11y)

**Location:** All component files

**Issues:**
- Missing `aria-label` on icon-only buttons
- No focus management in modals
- Color contrast may not meet WCAG AA
- No keyboard navigation for dropdowns

**Quick Fixes:**
```typescript
// Add aria-labels
<button aria-label="Clear input" onClick={...}>
  <Trash2 />
</button>

// Trap focus in modals
import { useFocusTrap } from '@mantine/hooks'

// Ensure contrast ratios
// Primary text: #f5f5f5 on #0f0f0f = 16.8:1 ✓
// Secondary text: #a0a0a0 on #0f0f0f = 7.4:1 ✓
// But accent buttons need verification
```

---

### 16. No Tests (Quality)

**Location:** Project-wide

**Issue:** No unit tests, integration tests, or E2E tests.

**Recommendation:** Add at minimum:
```typescript
// __tests__/llm-providers.test.ts
describe('generateWithProvider', () => {
  it('should throw error for missing API key', async () => {
    await expect(generateWithProvider('openai', 'gpt-4', {
      systemPrompt: 'test',
      userInput: 'test',
      apiKey: '',
    })).rejects.toThrow('API key required')
  })
})
```

---

## 🏗️ Architecture Suggestions

### 17. Consider React Query for API State

**Current:** Manual fetch with Zustand state management  
**Suggested:** Use TanStack Query for:
- Automatic caching
- Background refetching
- Retry logic
- Loading/error state management

### 18. Separate Business Logic from UI

**Current:** Store contains both state and business logic  
**Suggested:** Extract services:
```typescript
// services/experiment-service.ts
export class ExperimentService {
  async runExperiment(config: ExperimentConfig): Promise<ExperimentResult> {
    // Business logic here
  }
}
```

### 19. Add Feature Flags

For gradual rollout of new providers:
```typescript
const FEATURES = {
  WEBLLM: true,
  CLAUDE_API: process.env.NEXT_PUBLIC_ENABLE_CLAUDE === 'true',
  // ...
}
```

---

## 📊 Performance Analysis

### Bundle Size Concerns

- `@mlc-ai/web-llm` is ~100MB of WASM/models (loaded on demand)
- Consider lazy loading the entire WebLLM provider

### Rendering Performance

- Use `React.memo` for OutputPanel, SkillPanel components
- Virtualize history list if it grows large
- Debounce text input if doing live analysis

### Memory Leaks

- WebLLM engine not cleaned up on unmount
- Blob URLs not revoked after export

---

## 🎯 Quick Wins (High Impact, Low Effort)

1. **Remove API keys from persisted state** (30 min)
2. **Add XSS sanitization** (30 min)
3. **Fix Zustand selectors** (1 hour)
4. **Add basic error boundaries** (1 hour)
5. **Add aria-labels** (30 min)

---

## 📋 Action Items

| Priority | Item | Effort | Owner |
|----------|------|--------|-------|
| 🔴 Critical | Fix API key storage | 2h | Security |
| 🔴 Critical | Fix XSS vulnerability | 2h | Security |
| 🟠 High | Add AbortController | 3h | Performance |
| 🟠 High | Fix Zustand selectors | 2h | Performance |
| 🟡 Medium | Add error boundaries | 2h | Reliability |
| 🟡 Medium | Add rate limiting | 1h | UX |
| 🟢 Low | Remove dead code | 1h | Maintenance |
| 🟢 Low | Add tests | 8h | Quality |

---

## 🏆 Strengths

1. **Clean Provider Abstraction** - `llm-providers.ts` has excellent separation
2. **TypeScript Usage** - Good type coverage (could be better with runtime validation)
3. **State Management** - Zustand is well-suited for this use case
4. **Component Structure** - Logical separation of concerns
5. **Design System** - Consistent color palette and spacing
6. **Feature Completeness** - Good MVP feature set

---

## 📚 Resources

- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/preventing-rerenders-with-equality-fn)
- [React Security Best Practices](https://react.dev/reference/react)
- [WebGPU Security](https://gpuweb.github.io/gpuweb/#security)

---

**End of Review**
