import Icon from './Icon.jsx'

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-full flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-brand-600/30 blur-3xl animate-floaty" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-neon-pink/20 blur-3xl animate-floaty" style={{ animationDelay: '1.2s' }} />
      <div className="relative w-full max-w-sm glass rounded-3xl p-8 shadow-neon animate-popin">
        <div className="flex justify-center mb-3">
          <span className="w-12 h-12 rounded-2xl flex items-center justify-center animate-glow" style={{ background: 'linear-gradient(120deg,#9333ea,#ec4899)', boxShadow: '0 0 24px rgba(168,85,247,0.7)' }}>
            <Icon name="play" size={26} className="text-white" />
          </span>
        </div>
        <h1 className="font-display text-2xl font-black text-center bg-gradient-to-r from-brand-300 via-neon-pink to-brand-400 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && <p className="text-center text-brand-200/60 text-sm mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}

export function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-brand-200/60">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-ink-800/70 rounded-xl px-3 py-2.5 outline-none border border-brand-500/20 focus:border-brand-500 focus:shadow-neon-sm transition"
      />
    </label>
  )
}
