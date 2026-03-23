import {useTranslations} from 'next-intl';

type Point = {
  month: string;
  total: number;
};

type Props = {
  points: Point[];
};

export default function RevenueChart({ points }: Props) {
  const t = useTranslations('DashboardChart');
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const normalized = points.length === 6 ? points : labels.map((month, index) => ({month, total: points[index]?.total || 0}));
  const maxValue = Math.max(...normalized.map((point) => point.total), 1);
  const minValue = Math.min(...normalized.map((point) => point.total), 0);
  const range = Math.max(maxValue - minValue, 1);

  const width = 100;
  const height = 56;
  const stepX = width / (normalized.length - 1 || 1);

  const pointsData = normalized.map((point, index) => {
    const x = index * stepX;
    const ratio = (point.total - minValue) / range;
    const y = height - ratio * height;
    return {...point, x, y};
  });

  const linePoints = pointsData.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
  const areaPath = [
    `M 0 ${height}`,
    ...pointsData.map((point, index) => `${index === 0 ? 'L' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`),
    `L ${width} ${height}`,
    'Z',
  ].join(' ');

  const latest = pointsData[pointsData.length - 1];
  const previous = pointsData[pointsData.length - 2] || latest;
  const delta = latest.total - previous.total;
  const trend = `${delta >= 0 ? '+' : '-'}${Math.abs(Math.round(delta))}%`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{t('title')}</h2>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('range')}</p>
          <p className={`text-xs font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{trend}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="relative h-56 w-full">
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-44 w-full">
            {[0, 1, 2, 3].map((line) => {
              const y = (height / 3) * line;
              return <line key={line} x1="0" y1={y} x2={width} y2={y} stroke="#e2e8f0" strokeWidth="0.35" />;
            })}
            <path d={areaPath} fill="url(#revenueAreaGradient)" />
            <polyline points={linePoints} fill="none" stroke="#2563eb" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
            {pointsData.map((point) => (
              <circle key={point.month} cx={point.x} cy={point.y} r="1.3" fill="#2563eb" />
            ))}
            <defs>
              <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.06" />
              </linearGradient>
            </defs>
          </svg>

          <div className="mt-2 grid grid-cols-6 gap-2">
            {pointsData.map((point) => (
              <div key={point.month} className="text-center">
                <p className="text-xs font-semibold text-slate-700">{point.month}</p>
                <p className="text-[11px] text-slate-500">{Math.round(point.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
