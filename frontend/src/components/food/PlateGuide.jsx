import { PLATE } from '../../utils/foodPlan';

// Half plate (left) and two quarters (right), drawn as pie sectors around (100, 100).
const SECTORS = [
  { d: 'M100 100 L100 12 A88 88 0 0 0 100 188 Z', label: { x: 56, y: 104 } },
  { d: 'M100 100 L100 12 A88 88 0 0 1 188 100 Z', label: { x: 144, y: 58 } },
  { d: 'M100 100 L188 100 A88 88 0 0 1 100 188 Z', label: { x: 144, y: 146 } },
];

/** The "plate method": half vegetables, a quarter protein, a quarter whole grains. */
export default function PlateGuide() {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 200 200" className="h-52 w-52 shrink-0 drop-shadow-md" role="img" aria-label="A plate: half non-starchy vegetables, a quarter lean protein, a quarter whole grains.">
        <circle cx="100" cy="100" r="96" fill="#fff" stroke="#e2e8f0" strokeWidth="3" />
        {SECTORS.map((s, i) => (
          <g key={i} className="cal-tile" style={{ animationDelay: `${i * 160}ms`, transformOrigin: '100px 100px' }}>
            <path d={s.d} fill={PLATE[i].color} fillOpacity="0.85" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
            <text x={s.label.x} y={s.label.y} textAnchor="middle" fontSize="28">
              {PLATE[i].emoji}
            </text>
          </g>
        ))}
      </svg>
      <ul className="w-full space-y-2.5">
        {PLATE.map((p) => (
          <li key={p.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: p.color }} aria-hidden />
            <span className="flex-1 text-sm font-medium text-slate-800">{p.label}</span>
            <span className="text-xs font-semibold text-slate-500">{p.share}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
