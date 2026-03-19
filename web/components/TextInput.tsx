'use client'

import { useStore } from '@/lib/store'
import { FileText, Link, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function TextInput() {
  const inputText = useStore(state => state.inputText)
  const setInputText = useStore(state => state.setInputText)
  const loadSampleText = useStore(state => state.loadSampleText)
  const [showSamples, setShowSamples] = useState(false)

  const samples = [
    { key: 'ai' as const, label: 'AI-generated', desc: 'Typical AI writing with patterns' },
    { key: 'academic' as const, label: 'Academic', desc: 'Formal scholarly prose' },
    { key: 'marketing' as const, label: 'Marketing', desc: 'Sales copy with hype' },
    { key: 'technical' as const, label: 'Technical', desc: 'Documentation style' },
  ]

  return (
    <section className="bg-surface rounded-xl border border-border p-5">
      <label className="block text-sm font-medium text-text-secondary mb-3">
        Input Text
      </label>

      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to transform... paste an AI-written paragraph to see how different SKILLs rewrite it."
          className="w-full h-48 p-4 bg-background border border-border rounded-lg resize-none focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              document.getElementById('run-button')?.click()
            }
          }}
        />
        <div className="absolute bottom-3 right-3 text-xs text-text-muted">
          {inputText.length} characters
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {/* Load Sample Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" />
              Load Sample
            </button>

            {showSamples && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-surface-elevated border border-border rounded-lg shadow-xl z-40">
                {samples.map((sample) => (
                  <button
                    key={sample.key}
                    onClick={() => {
                      loadSampleText(sample.key)
                      setShowSamples(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="text-sm font-medium text-text-primary">{sample.label}</div>
                    <div className="text-xs text-text-secondary">{sample.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Load from URL */}
          <button
            aria-label="Load text from URL"
            onClick={async () => {
              const url = prompt('Enter URL to fetch text from:')
              if (!url) return

              try {
                const urlObj = new URL(url)
                if (!['http:', 'https:'].includes(urlObj.protocol)) {
                  alert('Only HTTP/HTTPS URLs are allowed')
                  return
                }
              } catch {
                alert('Invalid URL')
                return
              }

              try {
                const res = await fetch(url)
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}`)
                }
                
                const contentType = res.headers.get('content-type') || ''
                if (!contentType.includes('text/') && !contentType.includes('application/json')) {
                  throw new Error('Invalid content type')
                }

                const text = await res.text()
                
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = text
                const plainText = tempDiv.textContent || tempDiv.innerText || ''
                
                setInputText(plainText.slice(0, 5000))
              } catch (err) {
                console.error('Failed to load URL:', err)
                alert('Failed to fetch URL. Ensure it allows CORS and contains text content.')
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-md transition-colors"
          >
            <Link className="w-4 h-4" />
            Load from URL
          </button>

          {/* Clear */}
          {inputText && (
            <button
              aria-label="Clear input"
              onClick={() => setInputText('')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-text-muted">
          <kbd>⌘</kbd>+<kbd>Enter</kbd> to run
        </div>
      </div>
    </section>
  )
}