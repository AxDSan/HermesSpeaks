'use client'

import { useStore } from '@/lib/store'
import { Copy, Check, ExternalLink, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useState } from 'react'

interface OutputPanelProps {
  id: 'a' | 'b'
}

export function OutputPanel({ id }: OutputPanelProps) {
  const store = useStore()
  const [copied, setCopied] = useState(false)

  const output = id === 'a' ? store.outputA : store.outputB
  const stats = id === 'a' ? store.outputAStats : store.outputBStats
  const skill = id === 'a' ? store.skillA : store.skillB
  const isGenerating = store.isGenerating && store.generatingFor === id

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExpand = () => {
    if (output) {
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(`<html><head><title>Output ${id.toUpperCase()}</title></head><body style="font-family: monospace; white-space: pre-wrap; padding: 2rem;">${output}</body></html>`)
      }
    }
  }

  if (!output && !isGenerating) {
    return (
      <div
        className={clsx(
          'bg-surface rounded-xl border border-border border-l-4 h-full min-h-[300px] flex items-center justify-center',
          id === 'a' ? 'border-l-output-a' : 'border-l-output-b'
        )}
      >
        <div className="text-center text-text-secondary">
          <div className="text-4xl mb-2 opacity-30">{id === 'a' ? 'A' : 'B'}</div>
          <div className="text-sm">Output will appear here</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'bg-surface rounded-xl border border-border overflow-hidden',
        id === 'a' ? 'border-l-4 border-l-output-a' : 'border-l-4 border-l-output-b'
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'px-2 py-0.5 text-xs font-bold rounded',
              id === 'a' ? 'bg-output-a/20 text-output-a' : 'bg-output-b/20 text-output-b'
            )}
          >
            OUTPUT {id.toUpperCase()}
          </span>
          <span className="text-sm text-text-secondary">
            {skill?.name || 'Unknown'}
          </span>
        </div>

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-accent">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating...
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
        {isGenerating && !output ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-4 bg-surface-elevated rounded animate-pulse"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm text-text-primary">
            {output || ''}
          </pre>
        )}
      </div>

      {/* Footer */}
      {stats && (
        <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <div>
            {stats.chars} chars • {stats.timeMs}ms
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-1 px-2 py-1 hover:bg-surface-elevated rounded transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleExpand}
              disabled={!output}
              className="flex items-center gap-1 px-2 py-1 hover:bg-surface-elevated rounded transition-colors disabled:opacity-50"
            >
              <ExternalLink className="w-3 h-3" />
              Expand
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
