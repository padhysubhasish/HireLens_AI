export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fadeIn">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
          <Icon size={26} />
        </div>
      )}
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
