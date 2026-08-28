import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { authService } from '../services/endpoints'
import { extractErrorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Logo from '../components/Logo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Register() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.confirm_password !== form.password) errs.confirm_password = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setLoading(true)
    try {
      const data = await authService.register(form)
      login(data)
      showToast('Account created — welcome to HireLens AI!')
      navigate('/dashboard')
    } catch (err) {
      setApiError(extractErrorMessage(err, 'Could not create account'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-brand-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-gray-100 p-8 animate-slideUp">
        <div className="mb-8">
          <Logo size="lg" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Start screening candidates in minutes.</p>

        {apiError && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 animate-fadeIn">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Full Name" error={errors.name}>
            <input
              className="input"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <input
              className="input"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="At least 8 characters"
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
          </Field>
          <Field label="Confirm Password" error={errors.confirm_password}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Re-enter your password"
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            />
          </Field>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
