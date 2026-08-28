export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-sm p-6 animate-scaleIn">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
