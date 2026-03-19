'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Header } from '@/components/Header'
import { TextInput } from '@/components/TextInput'
import { SkillPanel } from '@/components/SkillPanel'
import { OutputPanel } from '@/components/OutputPanel'
import { VoteSection } from '@/components/VoteSection'
import { HistoryPanel } from '@/components/HistoryPanel'
import { HelpModal } from '@/components/HelpModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Play, Loader2, AlertCircle } from 'lucide-react'

export default function Home() {
  const inputText = useStore(state => state.inputText)
  const skillA = useStore(state => state.skillA)
  const skillB = useStore(state => state.skillB)
  const isGenerating = useStore(state => state.isGenerating)
  const error = useStore(state => state.error)
  const outputA = useStore(state => state.outputA)
  const outputB = useStore(state => state.outputB)
  const loadModel = useStore(state => state.loadModel)
  const runExperiment = useStore(state => state.runExperiment)
  const clearError = useStore(state => state.clearError)

  useEffect(() => {
    loadModel()
  }, [loadModel])

  const canRun = inputText.trim().length > 0 && skillA.content.trim().length > 0 && !isGenerating

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background bg-noise">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-danger/10 border border-danger/20 rounded-lg animate-fade-in">
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
              <div className="flex-1 text-sm text-danger">{error}</div>
              <button
                onClick={clearError}
                className="text-sm text-danger hover:text-danger/80 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <ErrorBoundary>
            <TextInput />
          </ErrorBoundary>

          <section>
            <h2 className="text-sm font-medium text-text-secondary mb-4 uppercase tracking-wider">
              SKILL Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ErrorBoundary>
                <SkillPanel id="a" />
              </ErrorBoundary>
              <ErrorBoundary>
                <SkillPanel id="b" />
              </ErrorBoundary>
            </div>
          </section>

          <div className="flex items-center justify-center py-6">
            <button
              id="run-button"
              aria-label="Run A/B test"
              onClick={runExperiment}
              disabled={!canRun}
              className="group flex items-center gap-3 px-10 py-4 bg-accent hover:bg-accent-hover disabled:bg-surface-elevated disabled:text-text-muted text-background font-medium text-lg rounded-lg transition-all duration-300 disabled:cursor-not-allowed hover:shadow-glow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Run A/B Test</span>
                </>
              )}
            </button>
          </div>

          {(outputA || outputB || isGenerating) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <ErrorBoundary>
                <OutputPanel id="a" />
              </ErrorBoundary>
              <ErrorBoundary>
                <OutputPanel id="b" />
              </ErrorBoundary>
            </section>
          )}

          {(outputA || outputB || isGenerating) && (
            <ErrorBoundary>
              <VoteSection />
            </ErrorBoundary>
          )}

          <ErrorBoundary>
            <HistoryPanel />
          </ErrorBoundary>
        </main>

        <HelpModal />

        <footer className="border-t border-border mt-16">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <p className="font-serif text-lg text-text-secondary">SKILL Lab</p>
            <p className="text-xs text-text-muted mt-2">In-browser AI writing analysis. No data leaves your device.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}