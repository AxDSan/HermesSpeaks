'use client'

import { useStore } from '@/lib/store'
import { ProviderSelector } from './ProviderSelector'
import { HelpCircle, Trash2, Sparkles } from 'lucide-react'

export function Header() {
  const setShowHelp = useStore(state => state.setShowHelp)
  const clearCurrentExperiment = useStore(state => state.clearCurrentExperiment)

  return (
    <header className="bg-surface/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-medium text-text-primary tracking-tight">SKILL Lab</h1>
              <p className="text-xs text-text-secondary -mt-0.5">A/B Writing Style Tester</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Provider & Model Selector */}
          <ProviderSelector />

          {/* Clear Button */}
          <button
            aria-label="Clear current experiment"
            onClick={clearCurrentExperiment}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-all duration-200"
            title="Clear current experiment"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Help Button */}
          <button
            aria-label="Show help"
            onClick={() => setShowHelp(true)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-all duration-200"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}