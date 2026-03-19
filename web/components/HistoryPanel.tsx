'use client'

import { useStore } from '@/lib/store'
import { History, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'
import { useState } from 'react'

export function HistoryPanel() {
  const store = useStore()
  const [isExpanded, setIsExpanded] = useState(false)

  const { experimentHistory, exportHistory, clearHistory } = store

  if (experimentHistory.length === 0) {
    return null
  }

  return (
    <section className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-elevated transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">
            History ({experimentHistory.length})
          </h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border">
          {/* Actions */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-border">
            <span className="text-xs text-text-secondary">
              {experimentHistory.length} experiments
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportHistory('json')}
                className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                <Download className="w-3 h-3" />
                JSON
              </button>
              <button
                onClick={() => exportHistory('csv')}
                className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all history?')) clearHistory()
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {experimentHistory.map((exp, idx) => (
              <div
                key={exp.id}
                className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-elevated transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-text-secondary">#{experimentHistory.length - idx}</span>
                      <span className="text-sm font-medium text-text-primary truncate">
                        {exp.skillA.name} vs {exp.skillB?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary truncate">
                      {exp.inputText.slice(0, 60)}...
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exp.winner && (
                      <span
                        className={clsx(
                          'px-2 py-0.5 text-xs font-medium rounded',
                          exp.winner === 'a'
                            ? 'bg-output-a/20 text-output-a'
                            : exp.winner === 'b'
                            ? 'bg-output-b/20 text-output-b'
                            : 'bg-warning/20 text-warning'
                        )}
                      >
                        {exp.winner === 'tie' ? 'Tie' : exp.winner.toUpperCase()} wins
                      </span>
                    )}
                    <span className="text-xs text-text-secondary">
                      {new Date(exp.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
