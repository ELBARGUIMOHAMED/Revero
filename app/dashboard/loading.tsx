export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
            <div className="h-3 w-24 rounded bg-slate-700" />
            <div className="mt-4 h-8 w-28 rounded bg-slate-700" />
            <div className="mt-4 h-3 w-16 rounded bg-slate-700" />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
        <div className="h-5 w-40 rounded bg-slate-700" />
        <div className="mt-6 grid h-48 grid-cols-6 items-end gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-full rounded bg-slate-700" />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
        <div className="h-5 w-36 rounded bg-slate-700" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-12 rounded-xl bg-slate-700" />
          ))}
        </div>
      </section>
    </div>
  );
}
