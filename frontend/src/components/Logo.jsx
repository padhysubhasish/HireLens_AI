import { Sparkles } from 'lucide-react'

export default function Logo({ size = 'md', dark = false }) {
  const dims = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 16 : 18

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dims} rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow shrink-0`}>
        <Sparkles size={iconSize} className="text-white" />
      </div>
      <div className="leading-none">
        <p className={`font-extrabold tracking-tight ${dark ? 'text-white' : 'text-gray-900'} ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
          HireLens <span className="text-brand-500">AI</span>
        </p>
        <p className={`text-[11px] mt-1 ${dark ? 'text-white/50' : 'text-gray-400'}`}>Smarter Screening. Better Hiring.</p>
      </div>
    </div>
  )
}
