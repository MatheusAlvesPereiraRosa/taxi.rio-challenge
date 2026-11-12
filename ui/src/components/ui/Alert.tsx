import { CheckCircle2, XCircle } from 'lucide-react';

export function Alert({ text, tone = 'error' }: { text: string; tone?: 'error' | 'success' }) {
  return <div role="alert" className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${tone === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
    {tone === 'error' ? <XCircle size={18} className="mt-0.5 shrink-0"/> : <CheckCircle2 size={18} className="mt-0.5 shrink-0"/>}
    <span>{text}</span>
  </div>;
}
