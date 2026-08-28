import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, Wand2, FileUp, ClipboardList } from 'lucide-react'
import ResumeDropzone from '../components/ResumeDropzone'
import AnalyzingOverlay from '../components/AnalyzingOverlay'
import { resumeService, screeningService, samplesService } from '../services/endpoints'
import { extractErrorMessage } from '../services/api'
import { useToast } from '../context/ToastContext'

const MAX_JD_CHARS = 20000

export default function NewScreening() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [activeStage, setActiveStage] = useState(0)
  const [error, setError] = useState('')
  const [loadingSample, setLoadingSample] = useState(false)

  const stageTimer = useRef(null)

  useEffect(() => () => clearInterval(stageTimer.current), [])

  async function handleLoadSample() {
    setLoadingSample(true)
    setError('')
    try {
      const [jd, resumeBlob] = await Promise.all([
        samplesService.jobDescription(),
        fetch(samplesService.resumeUrl()).then((r) => r.blob()),
      ])
      setJobDescription(jd)
      const sampleFile = new File([resumeBlob], 'sample_resume.pdf', { type: 'application/pdf' })
      setFile(sampleFile)
      showToast('Sample resume and job description loaded')
    } catch (err) {
      setError('Could not load sample data.')
    } finally {
      setLoadingSample(false)
    }
  }

  async function handleAnalyze() {
    setError('')
    if (!file) {
      setError('Please upload a resume PDF first.')
      return
    }
    if (jobDescription.trim().length < 20) {
      setError('Please paste a complete job description (at least 20 characters).')
      return
    }

    setAnalyzing(true)
    setActiveStage(0)

    try {
      const resume = await resumeService.upload(file)
      setActiveStage(1)

      // Advance through the remaining stages while the AI analysis request
      // is actually in flight - this reflects the real request lifecycle,
      // not a fabricated progress percentage.
      let stage = 1
      stageTimer.current = setInterval(() => {
        stage = Math.min(stage + 1, 4)
        setActiveStage(stage)
      }, 900)

      const screening = await screeningService.create({
        resume_id: resume.id,
        job_description: jobDescription,
      })

      clearInterval(stageTimer.current)
      setActiveStage(5)
      await new Promise((r) => setTimeout(r, 400))

      navigate(`/screenings/${screening.id}`)
    } catch (err) {
      clearInterval(stageTimer.current)
      setAnalyzing(false)
      setError(extractErrorMessage(err, 'Analysis failed. Please try again.'))
    }
  }

  const jdCount = jobDescription.length
  const jdReady = jobDescription.trim().length >= 20

  return (
    <div>
      {analyzing && <AnalyzingOverlay activeStage={activeStage} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find your next great hire</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Upload a candidate resume and add the job description. HireLens AI will evaluate skills, experience,
            and overall fit.
          </p>
        </div>
        <button onClick={handleLoadSample} disabled={loadingSample} className="btn-secondary flex items-center gap-2 shrink-0">
          <Wand2 size={16} />
          {loadingSample ? 'Loading…' : 'Load Sample Data'}
        </button>
      </div>

      {error && (
        <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-fadeIn">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5 animate-slideUp">
          <div className="flex items-center gap-2 mb-4">
            <StepBadge step={1} done={!!file} />
            <div className="flex items-center gap-2">
              <FileUp size={16} className="text-brand-600" />
              <h2 className="font-semibold text-gray-900">Upload Resume</h2>
            </div>
          </div>
          <ResumeDropzone file={file} onFileSelected={setFile} onRemove={() => setFile(null)} />
        </div>

        <div className="card p-5 flex flex-col animate-slideUp" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <StepBadge step={2} done={jdReady} />
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-brand-600" />
                <h2 className="font-semibold text-gray-900">Job Description</h2>
              </div>
            </div>
            {jobDescription && (
              <button
                onClick={() => setJobDescription('')}
                className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-3 ml-8">Tell the AI what you're looking for.</p>
          <textarea
            className="input flex-1 min-h-[220px] resize-none"
            placeholder="Paste the complete job description here..."
            maxLength={MAX_JD_CHARS}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-2 text-right">
            {jdCount} / {MAX_JD_CHARS} characters
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary flex items-center gap-2 px-6 py-3 text-sm">
          <Sparkles size={18} />
          Analyze Candidate
        </button>
      </div>
    </div>
  )
}

function StepBadge({ step, done }) {
  return (
    <div
      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
      }`}
    >
      {step}
    </div>
  )
}
