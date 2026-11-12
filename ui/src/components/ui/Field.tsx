interface Props { label: string; value: string | number; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean; min?: string; step?: string; minLength?: number; }

export function Field({ label, value, onChange, type = 'text', placeholder, required = true, min, step, minLength }: Props) {
  return <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    <input type={type} required={required} value={value} min={min} step={step} minLength={minLength} placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400"/>
  </label>;
}
