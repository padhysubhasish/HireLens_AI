import { useRef, useState } from 'react'
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react'

const MAX_MB = 10

export default function ResumeDropzone({ file, onFileSelected, onRemove }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  function validateAndSet(selected) {
    setError('')
    if (!selected) return
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      return
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_MB} MB.`)
      return
    }
    onFileSelected(selected)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    validateAndSet(e.dataTransfer.files?.[0])
  }

  if (file) {
    return (
      <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 flex items-center gap-3 animate-scaleIn">
        <div className="h-11 w-11 rounded-xl bg-white text-brand-600 flex items-center justify-center shrink-0 shadow-card">
          <FileText size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-1.5">
            {file.name}
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
          </p>
          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze</p>
        </div>
        <button onClick={onRemove} className="text-gray-400 hover:text-red-600 transition-colors shrink-0">
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center transition-all duration-200 ${
          dragOver
            ? 'border-brand-500 bg-brand-50/60 scale-[1.01]'
            : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
        }`}
      >
        <div
          className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 ${
            dragOver ? 'bg-brand-600 text-white scale-110' : 'bg-brand-50 text-brand-600'
          }`}
        >
          <UploadCloud size={22} />
        </div>
        <p className="text-sm font-medium text-gray-700">Drop your resume here</p>
        <p className="text-xs text-gray-400 mt-1">or click to browse from your computer</p>
        <p className="text-xs text-gray-400 mt-2">PDF · Maximum 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
