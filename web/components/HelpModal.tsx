'use client'

import { useStore } from '@/lib/store'
import { PROVIDERS } from '@/lib/llm-providers'
import { X, ExternalLink } from 'lucide-react'

export function HelpModal() {
  const store = useStore()
  const { showHelp, setShowHelp } = store

  if (!showHelp) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowHelp(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-surface border border-border rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">SKILL Lab Help</h2>
          <button
            onClick={() => setShowHelp(false)}
            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Quick Start */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">Quick Start</h3>
            <ol className="space-y-2 text-sm text-text-secondary">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Enter or paste text you want to transform in the input area</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Configure SKILL A (and optionally SKILL B) with your writing rules</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Click "Run A/B Test" to generate transformed outputs</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Vote on which output you prefer and save to history</span>
              </li>
            </ol>
          </div>

          {/* What is SKILL */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">What is a SKILL?</h3>
            <p className="text-sm text-text-secondary">
              A SKILL is a set of writing instructions that guide the AI on how to transform text.
              Think of it as a "writing philosophy" — different SKILLs produce different writing styles.
              Compare two SKILLs to see which produces better results for your use case.
            </p>
          </div>

          {/* Providers */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">Available Providers</h3>
            <div className="space-y-2">
              {Object.values(PROVIDERS).map((p) => (
                <div key={p.id} className="flex items-start gap-3 p-3 bg-surface-elevated rounded-lg">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <div className="font-medium text-text-primary">{p.name}</div>
                    <div className="text-xs text-text-secondary">{p.description}</div>
                    {p.requiresApiKey && (
                      <div className="text-xs text-yellow-500 mt-1">API key required</div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 p-3 bg-surface-elevated rounded-lg border border-output-a/30">
                <span className="text-2xl">💻</span>
                <div>
                  <div className="font-medium text-text-primary">WebLLM (Local)</div>
                  <div className="text-xs text-text-secondary">
                    Runs entirely in your browser. No data sent anywhere. Requires WebGPU support.
                    First use will download the model (~1GB).
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">Privacy</h3>
            <p className="text-sm text-text-secondary">
              <strong>API Providers:</strong> Your text is sent to the respective API provider (OpenAI, Anthropic, Google, or OpenRouter) for processing.
            <br /><br />
            <strong>WebLLM:</strong> All processing happens locally in your browser using WebLLM.
            No data is sent to external servers.
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-text-secondary">Run experiment</span>
                <kbd className="px-2 py-1 bg-surface-elevated rounded text-xs">⌘ + Enter</kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-secondary">Vote A</span>
                <kbd className="px-2 py-1 bg-surface-elevated rounded text-xs">1</kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-secondary">Vote B</span>
                <kbd className="px-2 py-1 bg-surface-elevated rounded text-xs">2</kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-secondary">Vote Tie</span>
                <kbd className="px-2 py-1 bg-surface-elevated rounded text-xs">3</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
