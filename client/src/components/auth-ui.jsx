export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900/80 backdrop-blur rounded-2xl p-8 ring-1 ring-white/10 shadow-2xl">
        <h1 className="text-2xl font-bold text-center text-brand-500">{title}</h1>
        {subtitle && <p className="text-center text-zinc-400 text-sm mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}

export function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-xs text-zinc-400">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
      />
    </label>
  )
}
