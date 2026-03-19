'use client'

import { useStore } from '@/lib/store'
import { PROVIDERS, getModelsForProvider, ProviderType } from '@/lib/llm-providers'
import { ChevronDown, Settings, Key, Loader2, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

export function ProviderSelector() {
  const provider = useStore(state => state.provider)
  const modelId = useStore(state => state.modelId)
  const modelStatus = useStore(state => state.modelStatus)
  const apiKeys = useStore(state => state.apiKeys)
  const showApiKeys = useStore(state => state.showApiKeys)
  const setProvider = useStore(state => state.setProvider)
  const setModelId = useStore(state => state.setModelId)
  const setApiKey = useStore(state => state.setApiKey)
  const setShowApiKeys = useStore(state => state.setShowApiKeys)
  const loadModel = useStore(state => state.loadModel)

  const [showDropdown, setShowDropdown] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)

  const currentProvider = PROVIDERS[provider]
  const models = getModelsForProvider(provider)
  const currentModel = models.find(m => m.id === modelId)

  useEffect(() => {
    if (provider === 'webllm') {
      loadModel()
    } else if (apiKeys[provider]) {
      setProvider(provider) // This will reset model to default
    }
  }, [provider, apiKeys])

  const needsApiKey = currentProvider?.requiresApiKey
  const hasApiKey = provider !== 'webllm' && !!apiKeys[provider]
  const isReady = modelStatus === 'ready'
  const isLoading = ['checking', 'downloading', 'loading'].includes(modelStatus)

  const statusColors = {
    idle: 'bg-gray-500',
    checking: 'bg-blue-500 animate-pulse',
    downloading: 'bg-blue-500 animate-pulse',
    loading: 'bg-yellow-500 animate-pulse',
    ready: 'bg-green-500',
    error: 'bg-red-500',
  }

  return (
    <div className="flex items-center gap-2">
      {/* API Key Button */}
      {needsApiKey && (
        <button
          aria-label={hasApiKey ? 'API Key configured' : 'API Key required'}
          onClick={() => setShowApiKeys(!showApiKeys)}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            hasApiKey
              ? 'text-green-500 hover:bg-green-500/10'
              : 'text-yellow-500 hover:bg-yellow-500/10'
          )}
          title={hasApiKey ? 'API Key configured' : 'API Key required'}
        >
          {hasApiKey ? <Key className="w-5 h-5" /> : <Key className="w-5 h-5" />}
        </button>
      )}

      {/* Provider Dropdown */}
      <div className="relative group">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 bg-surface-elevated border border-border rounded-lg hover:border-accent transition-colors"
        >
          <span className="text-lg">{currentProvider?.icon}</span>
          <span className="text-sm text-text-primary">{currentProvider?.name}</span>
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-surface-elevated border border-border rounded-lg shadow-xl z-50">
            <div className="p-2 space-y-1">
              {Object.values(PROVIDERS).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id as ProviderType)
                    setShowDropdown(false)
                  }}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-md transition-colors',
                    provider === p.id
                      ? 'bg-accent/20 text-accent'
                      : 'hover:bg-surface text-text-primary'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-text-secondary">{p.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Model Dropdown */}
      <div className="relative group">
        <button
          onClick={() => setShowModelDropdown(!showModelDropdown)}
          disabled={!hasApiKey && needsApiKey}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 bg-surface-elevated border border-border rounded-lg transition-colors',
            hasApiKey || !needsApiKey
              ? 'hover:border-accent cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
          <span className={clsx('w-2 h-2 rounded-full', statusColors[modelStatus])} />
          <span className="text-sm text-text-primary">{currentModel?.name || modelId}</span>
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        </button>

        {showModelDropdown && (
          <div className="absolute right-0 top-full mt-1 w-72 bg-surface-elevated border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            <div className="p-2 space-y-1">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setModelId(m.id)
                    setShowModelDropdown(false)
                  }}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-md transition-colors',
                    modelId === m.id
                      ? 'bg-accent/20 text-accent'
                      : 'hover:bg-surface text-text-primary'
                  )}
                >
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-text-secondary">{m.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {showApiKeys && (
        <ApiKeyModal
          provider={provider}
          apiKey={apiKeys[provider]}
          onSetKey={(key) => setApiKey(provider, key)}
          onClose={() => setShowApiKeys(false)}
        />
      )}
    </div>
  )
}

interface ApiKeyModalProps {
  provider: ProviderType
  apiKey: string
  onSetKey: (key: string) => void
  onClose: () => void
}

function ApiKeyModal({ provider, apiKey, onSetKey, onClose }: ApiKeyModalProps) {
  const [key, setKey] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const p = PROVIDERS[provider]

  const handleSave = () => {
    onSetKey(key.trim())
    onClose()
  }

  const getPlaceholder = () => {
    switch (provider) {
      case 'openai':
        return 'sk-...'
      case 'claude':
        return 'sk-ant-...'
      case 'gemini':
        return 'AIza...'
      case 'openrouter':
        return 'sk-or-...'
      default:
        return ''
    }
  }

  const getLink = () => {
    switch (provider) {
      case 'openai':
        return 'https://platform.openai.com/api-keys'
      case 'claude':
        return 'https://console.anthropic.com/settings/keys'
      case 'gemini':
        return 'https://aistudio.google.com/app/apikey'
      case 'openrouter':
        return 'https://openrouter.ai/keys'
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{p.icon}</span>
            <h3 className="text-lg font-semibold text-text-primary">Configure {p.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-text-secondary">
            Enter your {p.name} API key to use {p.name} models. Your key is stored locally in your browser and never sent to our servers.
          </p>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-accent focus:border-accent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <a
            href={getLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            Get your {p.name} API key →
          </a>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-background rounded-lg text-sm font-medium transition-colors"
          >
            Save API Key
          </button>
        </div>
      </div>
    </div>
  )
}
