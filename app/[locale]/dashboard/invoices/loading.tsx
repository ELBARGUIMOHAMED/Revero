export default function InvoicesLoading() {
  return (
    <section className="animate-pulse rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-7 w-28 rounded bg-slate-700" />
        <div className="h-9 w-28 rounded-xl bg-slate-700" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-12 rounded-xl bg-slate-700" />
        ))}
      </div>
    </section>
  );
}
