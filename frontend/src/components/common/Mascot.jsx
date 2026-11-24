/**
 * "Dewy", the Sweety mascot: a friendly drop in a white hoodie. Pure SVG, animated with CSS
 * (bobbing, blinking, waving). `variant="avatar"` crops to the face for use as a profile picture.
 */
export default function Mascot({ size = 160, variant = 'full', wave = true, className = '' }) {
  const avatar = variant === 'avatar';
  return (
    <svg
      viewBox={avatar ? '24 8 112 112' : '0 0 160 200'}
      width={size}
      height={avatar ? size : size * 1.25}
      className={className}
      role="img"
      aria-label="Dewy, the Sweety mascot"
    >
      <defs>
        <linearGradient id="mascot-body" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ff7a59" />
          <stop offset="1" stopColor="#d6361f" />
        </linearGradient>
      </defs>

      {!avatar && <ellipse className="mascot-shadow" cx="80" cy="192" rx="38" ry="6" fill="#0f172a" fillOpacity="0.14" />}

      <g className={avatar ? '' : 'mascot-bob'}>
        {!avatar && (
          <>
            {/* legs and shoes */}
            <rect x="58" y="160" width="14" height="22" rx="7" fill="#d6361f" />
            <rect x="88" y="160" width="14" height="22" rx="7" fill="#d6361f" />
            <ellipse cx="62" cy="186" rx="16" ry="8" fill="#fff" stroke="#eadad5" strokeWidth="2" />
            <ellipse cx="98" cy="186" rx="16" ry="8" fill="#fff" stroke="#eadad5" strokeWidth="2" />

            {/* right arm (resting) */}
            <path d="M118 120 Q134 132 132 152" stroke="#d6361f" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M118 120 Q127 126 129 136" stroke="#fff" strokeWidth="17" strokeLinecap="round" fill="none" />
            <circle cx="132" cy="154" r="9" fill="#e0402a" />

            {/* hoodie */}
            <rect x="38" y="104" width="84" height="64" rx="28" fill="#fff" stroke="#efe1dc" strokeWidth="2" />
            <text x="80" y="154" textAnchor="middle" fontSize="20" fontWeight="800" fill="#ea580c" fontFamily="Inter, sans-serif">
              S
            </text>

            {/* left arm (waving) */}
            <g className={wave ? 'mascot-wave' : ''} style={{ transformOrigin: '44px 120px' }}>
              <path d="M44 120 Q26 112 22 90" stroke="#d6361f" strokeWidth="14" strokeLinecap="round" fill="none" />
              <path d="M44 120 Q34 116 29 106" stroke="#fff" strokeWidth="17" strokeLinecap="round" fill="none" />
              <circle cx="22" cy="86" r="9" fill="#e0402a" />
            </g>
          </>
        )}

        {/* head */}
        <path d="M80 10 C92 30 132 46 132 80 a52 52 0 0 1 -104 0 C28 46 68 30 80 10 Z" fill="url(#mascot-body)" />
        <path d="M44 72 C44 60 52 50 62 44" stroke="#fff" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" fill="none" />
        {!avatar && <path d="M40 106 Q80 132 120 106" stroke="#fff" strokeWidth="12" strokeLinecap="round" fill="none" />}

        {/* face */}
        <g className="mascot-eyes" style={{ transformOrigin: '81px 76px' }}>
          <circle cx="64" cy="76" r="12" fill="#fff" />
          <circle cx="98" cy="76" r="12" fill="#fff" />
          <circle cx="66" cy="78" r="5.5" fill="#3b1d12" />
          <circle cx="100" cy="78" r="5.5" fill="#3b1d12" />
          <circle cx="68" cy="75.5" r="2" fill="#fff" />
          <circle cx="102" cy="75.5" r="2" fill="#fff" />
        </g>
        <ellipse cx="48" cy="94" rx="7" ry="4.5" fill="#ff9d8a" fillOpacity="0.75" />
        <ellipse cx="114" cy="94" rx="7" ry="4.5" fill="#ff9d8a" fillOpacity="0.75" />
        <path d="M68 96 Q81 114 94 96 Z" fill="#7a1d12" />
        <ellipse cx="81" cy="105" rx="6" ry="3" fill="#ff7a8a" />
      </g>
    </svg>
  );
}
