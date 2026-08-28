import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff, ShieldCheck, Zap, Target } from 'lucide-react'
import { authService } from '../services/endpoints'
import { extractErrorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Logo from '../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authService.login(form)
      login(data)
      showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid email or password'))
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setForm({ email: 'demo@example.com', password: 'Demo@12345' })
    setError('')
    setLoading(true)
    try {
      const data = await authService.login({ email: 'demo@example.com', password: 'Demo@12345' })
      login(data)
      showToast('Logged in with the demo account')
      navigate('/dashboard')
    } catch (err) {
      setError(extractErrorMessage(err, 'Demo login failed. Is DEMO_MODE enabled on the backend?'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-6">Log in to continue screening candidates.</p>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
          <input
            type="email"
            required
            className="input"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="input pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Sign In
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-400">or</span>
        </div>
      </div>

      <button onClick={handleDemoLogin} disabled={loading} className="btn-secondary w-full">
        Try the Demo Account
      </button>

      <p className="text-sm text-gray-500 text-center mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-600 font-medium hover:underline">
          Create Account
        </Link>
      </p>
    </AuthShell>
  )
}

function AuthShell({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Decorative panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-navy-gradient relative overflow-hidden flex-col justify-between p-10 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #608bfa 0%, transparent 45%), radial-gradient(circle at 80% 70%, #3b66f5 0%, transparent 40%)',
          }}
        />
        <div className="relative">
          <Logo size="lg" dark />
        </div>
        <div className="relative">
          <h2 className="text-2xl font-bold leading-snug mb-3">
            Screen candidates faster.<br />Hire with confidence.
          </h2>
          <p className="text-sm text-white/60 max-w-sm leading-relaxed">
            HireLens AI compares every resume against your job requirements — skills, experience, and fit —
            so your team focuses on the candidates who matter most.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-8">
            <Feature icon={Zap} label="Instant AI analysis" />
            <Feature icon={Target} label="Evidence-based scoring" />
            <Feature icon={ShieldCheck} label="Secure by design" />
          </div>
        </div>
        <div />
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-gray-100 p-8 animate-slideUp">
          {children}
        </div>
      </div>
    </div>
  )
}

function Feature({ icon: Icon, label }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <Icon size={16} className="text-brand-300 mb-2" />
      <p className="text-[11px] leading-snug text-white/70">{label}</p>
    </div>
  )
}
