import { useEffect, useState } from 'react'
import { Cpu, ShieldCheck, ToggleLeft, ToggleRight, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { systemService } from '../services/endpoints'
import Skeleton from '../components/Skeleton'

export default function Settings() {
  const { user } = useAuth()
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    systemService
      .health()
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your account and view AI configuration.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Full Name</label>
              <p className="text-sm text-gray-900 mt-1">{user?.name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</label>
              <p className="text-sm text-gray-900 mt-1">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Cpu size={16} />
            </div>
            <h2 className="font-semibold text-gray-900">AI Configuration</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : health ? (
            <div className="space-y-3">
              <ConfigRow label="AI Provider" value={<span className="capitalize">{health.ai_provider}</span>} />
              <ConfigRow
                label="Demo Mode"
                value={
                  health.demo_mode ? (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <ToggleRight size={16} /> Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <ToggleLeft size={16} /> Disabled
                    </span>
                  )
                }
              />
              <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3.5 py-3 mt-2">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                AI provider credentials and model configuration are managed securely through the server
                environment and are never exposed to the browser.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3.5 py-3">
              <Info size={14} className="shrink-0 mt-0.5" />
              AI provider configuration is managed securely through the server environment.
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h2 className="font-semibold text-gray-900 mb-2">About HireLens AI</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          HireLens AI screens resumes against job descriptions using an AI-driven, evidence-based scoring
          methodology. Category weights: Technical Skills 40%, Experience 25%, AI/LLM Experience 20%, Preferred
          Requirements 15%.
        </p>
      </div>
    </div>
  )
}

function ConfigRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
