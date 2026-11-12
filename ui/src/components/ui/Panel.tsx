import type { ReactNode } from 'react';

export function Panel({ title, detail, children, action }: { title: string; detail?: string; children: ReactNode; action?: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div><h2 className="font-semibold text-slate-900">{title}</h2>{detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}</div>{action}
    </header>
    <div className="p-5 sm:p-6">{children}</div>
  </section>;
}
