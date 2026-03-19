'use client'

import { useStore } from '@/lib/store'
import { Upload, FileText, X, ArrowLeftRight, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useRef } from 'react'

interface SkillPanelProps {
  id: 'a' | 'b'
}

export function SkillPanel({ id }: SkillPanelProps) {
  const store = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const skill = id === 'a' ? store.skillA : store.skillB
  const setName = id === 'a' ? store.setSkillAName : store.setSkillBName
  const setContent = id === 'a' ? store.setSkillAContent : store.setSkillBContent

  if (id === 'b' && !skill) {
    return (
      <button
        onClick={() => store.addSkillB()}
        className="h-full min-h-[300px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 text-text-secondary hover:border-accent hover:text-accent transition-colors cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center">
          <span className="text-2xl">+</span>
        </div>
        <span className="text-sm font-medium">Add SKILL B for comparison</span>
      </button>
    )
  }

  if (!skill) return null

  const isValid = skill.content.length >= 50
  const isTooShort = skill.content.length > 0 && skill.content.length < 200

  return (
    <div
      className={clsx(
        'bg-surface rounded-xl border p-4',
        id === 'a' ? 'border-l-4 border-l-output-a' : 'border-l-4 border-l-output-b',
        !isValid && skill.content.length > 0 ? 'border-red-500/50' : 'border-border'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'px-2 py-0.5 text-xs font-bold rounded',
              id === 'a' ? 'bg-output-a/20 text-output-a' : 'bg-output-b/20 text-output-b'
            )}
          >
            SKILL {id.toUpperCase()}
          </span>
          {id === 'b' && (
            <button
              onClick={() => store.removeSkillB()}
              className="p-1 text-text-secondary hover:text-red-500 transition-colors"
              title="Remove SKILL B"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {id === 'b' && store.skillB && store.skillA && (
          <button
            onClick={() => store.swapSkills()}
            className="p-1 text-text-secondary hover:text-accent transition-colors"
            title="Swap SKILL A and B"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Name Field */}
      <input
        type="text"
        value={skill.name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-accent focus:border-accent mb-3"
        placeholder="Skill name..."
      />

      {/* Content Textarea */}
      <div className="relative">
        <textarea
          value={skill.content}
          onChange={(e) => setContent(e.target.value)}
          className={clsx(
            'w-full h-64 p-3 bg-background border rounded-lg resize-none font-mono text-xs text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-accent focus:border-accent',
            !isValid && skill.content.length > 0 ? 'border-red-500/50' : 'border-border'
          )}
          placeholder="Paste SKILL.md content here or load from file..."
        />

        {isTooShort && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-yellow-500">
            <AlertCircle className="w-3 h-3" />
            Content seems short
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => {
                setContent(e.target?.result as string)
              }
              reader.readAsText(file)
            }
            e.target.value = ''
          }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Load File
        </button>

        <button
          onClick={() => setContent(skill?.content || '')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          Use Default
        </button>

        {skill.content.length > 0 && (
          <span className="ml-auto text-xs text-text-secondary">
            {skill.content.length} chars
          </span>
        )}
      </div>
    </div>
  )
}
