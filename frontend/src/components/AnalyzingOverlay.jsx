import { Check, Loader2, Sparkles } from 'lucide-react'

const STAGES = [
  'Resume uploaded',
  'Extracting resume text',
  'Understanding job requirements',
  'Comparing skills and experience',
  'Generating recommendation',
]

export default function AnalyzingOverlay({ activeStage }) {
  const progress = Math.min(100, Math.round((activeStage / STAGES.length) * 100))

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-scaleIn">
        <div className="h-12 w-12 rounded-2xl bg-brand-gradient text-white flex items-center justify-center mx-auto mb-5 shadow-glow">
          <Sparkles size={22} className="animate-pulse" />
        </div>
        <h3 className="text-center font-semibold text-gray-900 mb-1">AI is analyzing your candidate</h3>
        <p className="text-center text-xs text-gray-500 mb-6">
          We're comparing the resume against your job requirements.
        </p>

        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mb-6">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const done = i < activeStage
            const active = i === activeStage
            return (
              <div key={stage} className="flex items-center gap-3">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-200 ${
                    done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : active
                      ? 'border-brand-500 text-brand-600'
                      : 'border-gray-200 text-gray-300'
                  }`}
                >
                  {done ? <Check size={14} /> : active ? <Loader2 size={14} className="animate-spin" /> : null}
                </div>
                <span className={`text-sm ${done || active ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {stage}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
