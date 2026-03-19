'use client'

import { useStore } from '@/lib/store'
import { Vote, Trophy, RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'

export function VoteSection() {
  const store = useStore()

  const { outputA, outputB, userVote, isGenerating, skillA, skillB } = store

  const canVote = outputA && (outputB || !skillB)
  const hasOutput = outputA || outputB

  const handleVote = (vote: 'a' | 'b' | 'tie') => {
    store.setUserVote(vote)
  }

  const handleSubmit = () => {
    store.submitExperiment()
  }

  const handleNewExperiment = () => {
    store.clearCurrentExperiment()
  }

  return (
    <section className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Vote className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-text-primary">Vote on Results</h2>
      </div>

      {!hasOutput && !isGenerating && (
        <div className="text-center py-8 text-text-secondary">
          Run an experiment to see results and vote
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-8 text-text-secondary">
          Generating output... Please wait
        </div>
      )}

      {hasOutput && !isGenerating && (
        <>
          {/* Vote Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => handleVote('a')}
              disabled={!outputA}
              className={clsx(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                userVote === 'a'
                  ? 'border-output-a bg-output-a/10 text-output-a'
                  : 'border-border hover:border-output-a/50 text-text-secondary',
                !outputA && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-2xl font-bold">A</span>
              <span className="text-xs text-center">{skillA.name}</span>
              {userVote === 'a' && <span className="text-xs font-medium">Selected</span>}
            </button>

            <button
              onClick={() => handleVote('tie')}
              disabled={!outputA || !outputB}
              className={clsx(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                userVote === 'tie'
                  ? 'border-warning bg-warning/10 text-warning'
                  : 'border-border hover:border-warning/50 text-text-secondary',
                (!outputA || !outputB) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-2xl font-bold">=</span>
              <span className="text-xs text-center">Tie</span>
              {userVote === 'tie' && <span className="text-xs font-medium">Selected</span>}
            </button>

            <button
              onClick={() => handleVote('b')}
              disabled={!outputB}
              className={clsx(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                userVote === 'b'
                  ? 'border-output-b bg-output-b/10 text-output-b'
                  : 'border-border hover:border-output-b/50 text-text-secondary',
                !outputB && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-2xl font-bold">B</span>
              <span className="text-xs text-center">{skillB?.name || 'SKILL B'}</span>
              {userVote === 'b' && <span className="text-xs font-medium">Selected</span>}
            </button>
          </div>

          {/* Submit Button */}
          {userVote ? (
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
              >
                <Trophy className="w-5 h-5" />
                Submit & Save
              </button>
              <button
                onClick={handleNewExperiment}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-border hover:bg-surface-elevated rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                New
              </button>
            </div>
          ) : (
            <div className="text-center text-sm text-text-secondary">
              Select which output you prefer, or mark as a tie
            </div>
          )}
        </>
      )}
    </section>
  )
}
