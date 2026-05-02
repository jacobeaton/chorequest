import { CHARACTERS } from '../../config/characters'

// Each Lumin has 3 evolution stages (0, 1, 2).
// We draw them inline as SVG React components keyed by id + stage.

const luminShapes = {
  // ─── PYRO (Fire) ──────────────────────────────────────────────────────────
  pyro_0: ({ p }) => (
    <g>
      <ellipse cx="50" cy="62" rx="22" ry="10" fill={p.primary} opacity="0.3" />
      <circle cx="50" cy="48" r="22" fill={p.primary} />
      <ellipse cx="42" cy="36" rx="6" ry="10" fill={p.secondary} opacity="0.8" transform="rotate(-15 42 36)" />
      <ellipse cx="50" cy="32" rx="5" ry="9" fill={p.accent} opacity="0.9" />
      <ellipse cx="58" cy="36" rx="6" ry="10" fill={p.secondary} opacity="0.8" transform="rotate(15 58 36)" />
      <circle cx="43" cy="50" r="4" fill="white" />
      <circle cx="57" cy="50" r="4" fill="white" />
      <circle cx="44" cy="51" r="2.5" fill="#1a1a1a" />
      <circle cx="58" cy="51" r="2.5" fill="#1a1a1a" />
      <path d="M44 57 Q50 62 56 57" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  pyro_1: ({ p }) => (
    <g>
      <ellipse cx="50" cy="70" rx="26" ry="10" fill={p.primary} opacity="0.3" />
      <ellipse cx="50" cy="52" rx="26" ry="28" fill={p.primary} />
      <ellipse cx="38" cy="30" rx="8" ry="16" fill={p.secondary} opacity="0.85" transform="rotate(-20 38 30)" />
      <ellipse cx="50" cy="24" rx="7" ry="14" fill={p.accent} />
      <ellipse cx="62" cy="30" rx="8" ry="16" fill={p.secondary} opacity="0.85" transform="rotate(20 62 30)" />
      <ellipse cx="30" cy="50" rx="5" ry="9" fill={p.secondary} opacity="0.7" transform="rotate(-30 30 50)" />
      <ellipse cx="70" cy="50" rx="5" ry="9" fill={p.secondary} opacity="0.7" transform="rotate(30 70 50)" />
      <circle cx="42" cy="55" r="5" fill="white" />
      <circle cx="58" cy="55" r="5" fill="white" />
      <circle cx="43" cy="56" r="3" fill="#1a1a1a" />
      <circle cx="59" cy="56" r="3" fill="#1a1a1a" />
      <circle cx="44" cy="55" r="1" fill="white" />
      <circle cx="60" cy="55" r="1" fill="white" />
      <path d="M44 63 Q50 69 56 63" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="46" r="6" fill={p.accent} opacity="0.5" />
    </g>
  ),
  pyro_2: ({ p }) => (
    <g>
      <ellipse cx="50" cy="76" rx="30" ry="10" fill={p.primary} opacity="0.25" />
      <ellipse cx="50" cy="54" rx="28" ry="30" fill={p.primary} />
      <ellipse cx="32" cy="26" rx="10" ry="22" fill={p.secondary} opacity="0.9" transform="rotate(-25 32 26)" />
      <ellipse cx="50" cy="18" rx="9" ry="18" fill={p.accent} />
      <ellipse cx="68" cy="26" rx="10" ry="22" fill={p.secondary} opacity="0.9" transform="rotate(25 68 26)" />
      <ellipse cx="20" cy="48" rx="6" ry="14" fill={p.secondary} opacity="0.75" transform="rotate(-35 20 48)" />
      <ellipse cx="80" cy="48" rx="6" ry="14" fill={p.secondary} opacity="0.75" transform="rotate(35 80 48)" />
      <circle cx="41" cy="57" r="6" fill="white" />
      <circle cx="59" cy="57" r="6" fill="white" />
      <circle cx="42" cy="58" r="3.5" fill="#1a1a1a" />
      <circle cx="60" cy="58" r="3.5" fill="#1a1a1a" />
      <circle cx="43" cy="57" r="1.5" fill="white" />
      <circle cx="61" cy="57" r="1.5" fill="white" />
      <path d="M43 66 Q50 73 57 66" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="46" r="10" fill={p.accent} opacity="0.35" />
      <circle cx="50" cy="46" r="5" fill={p.accent} opacity="0.6" />
      {[0,60,120,180,240,300].map(a => (
        <line key={a} x1="50" y1="46"
          x2={50 + 18 * Math.cos(a * Math.PI / 180)}
          y2={46 + 18 * Math.sin(a * Math.PI / 180)}
          stroke={p.accent} strokeWidth="2" opacity="0.5" />
      ))}
    </g>
  ),

  // ─── GLACIE (Ice) ─────────────────────────────────────────────────────────
  glacie_0: ({ p }) => (
    <g>
      <ellipse cx="50" cy="62" rx="22" ry="8" fill={p.primary} opacity="0.25" />
      <ellipse cx="50" cy="48" rx="20" ry="22" fill={p.primary} />
      <polygon points="50,20 54,32 50,28 46,32" fill={p.accent} />
      <polygon points="50,20 58,26 54,28 60,30" fill={p.accent} opacity="0.7" />
      <polygon points="50,20 42,26 46,28 40,30" fill={p.accent} opacity="0.7" />
      <circle cx="43" cy="48" r="4" fill="white" />
      <circle cx="57" cy="48" r="4" fill="white" />
      <circle cx="43.5" cy="48.5" r="2.5" fill="#1a1a1a" />
      <circle cx="57.5" cy="48.5" r="2.5" fill="#1a1a1a" />
      <path d="M44 56 Q50 60 56 56" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  glacie_1: ({ p }) => (
    <g>
      <ellipse cx="50" cy="70" rx="26" ry="9" fill={p.primary} opacity="0.25" />
      <ellipse cx="50" cy="53" rx="24" ry="26" fill={p.primary} />
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <line key={i} x1="50" y1="24"
          x2={50 + 14 * Math.cos(a * Math.PI / 180)}
          y2={24 + 14 * Math.sin(a * Math.PI / 180)}
          stroke={p.accent} strokeWidth="2.5" strokeLinecap="round" />
      ))}
      <circle cx="50" cy="24" r="4" fill={p.accent} />
      <ellipse cx="34" cy="56" rx="5" ry="8" fill={p.secondary} opacity="0.6" transform="rotate(-20 34 56)" />
      <ellipse cx="66" cy="56" rx="5" ry="8" fill={p.secondary} opacity="0.6" transform="rotate(20 66 56)" />
      <circle cx="42" cy="55" r="5" fill="white" />
      <circle cx="58" cy="55" r="5" fill="white" />
      <circle cx="42.5" cy="55.5" r="3" fill="#1a1a1a" />
      <circle cx="58.5" cy="55.5" r="3" fill="#1a1a1a" />
      <circle cx="43" cy="55" r="1" fill="white" />
      <circle cx="59" cy="55" r="1" fill="white" />
      <path d="M44 63 Q50 67 56 63" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  glacie_2: ({ p }) => (
    <g>
      <ellipse cx="50" cy="76" rx="30" ry="10" fill={p.primary} opacity="0.2" />
      <ellipse cx="50" cy="56" rx="28" ry="28" fill={p.primary} />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => (
        <line key={i} x1="50" y1="20"
          x2={50 + 16 * Math.cos(a * Math.PI / 180)}
          y2={20 + 16 * Math.sin(a * Math.PI / 180)}
          stroke={p.accent} strokeWidth="3" strokeLinecap="round" opacity={i % 2 === 0 ? 1 : 0.5} />
      ))}
      <circle cx="50" cy="20" r="5" fill={p.accent} />
      <ellipse cx="28" cy="58" rx="6" ry="11" fill={p.secondary} opacity="0.7" transform="rotate(-25 28 58)" />
      <ellipse cx="72" cy="58" rx="6" ry="11" fill={p.secondary} opacity="0.7" transform="rotate(25 72 58)" />
      <circle cx="41" cy="58" r="6" fill="white" />
      <circle cx="59" cy="58" r="6" fill="white" />
      <circle cx="41.5" cy="58.5" r="3.5" fill="#1a1a1a" />
      <circle cx="59.5" cy="58.5" r="3.5" fill="#1a1a1a" />
      <circle cx="42" cy="58" r="1.5" fill="white" />
      <circle cx="60" cy="58" r="1.5" fill="white" />
      <path d="M43 67 Q50 72 57 67" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {[0,60,120,180,240,300].map((a, i) => (
        <circle key={i} cx={50 + 36 * Math.cos(a * Math.PI / 180)} cy={56 + 36 * Math.sin(a * Math.PI / 180)} r="3" fill={p.accent} opacity="0.6" />
      ))}
    </g>
  ),

  // ─── ZAPPY (Lightning) ────────────────────────────────────────────────────
  zappy_0: ({ p }) => (
    <g>
      <ellipse cx="50" cy="62" rx="20" ry="8" fill={p.primary} opacity="0.3" />
      <ellipse cx="50" cy="48" rx="20" ry="22" fill={p.primary} />
      <polygon points="44,22 40,36 48,34 44,48" fill={p.accent} />
      <polygon points="56,22 60,36 52,34 56,48" fill={p.accent} />
      <circle cx="43" cy="50" r="4" fill="white" />
      <circle cx="57" cy="50" r="4" fill="white" />
      <circle cx="43.5" cy="50.5" r="2.5" fill="#1a1a1a" />
      <circle cx="57.5" cy="50.5" r="2.5" fill="#1a1a1a" />
      <path d="M43 58 Q50 64 57 58" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  zappy_1: ({ p }) => (
    <g>
      <ellipse cx="50" cy="70" rx="25" ry="9" fill={p.primary} opacity="0.3" />
      <ellipse cx="50" cy="53" rx="24" ry="26" fill={p.primary} />
      <polygon points="40,20 34,38 44,35 38,55" fill={p.accent} opacity="0.9" />
      <polygon points="60,20 66,38 56,35 62,55" fill={p.accent} opacity="0.9" />
      <polygon points="50,16 47,26 53,26" fill={p.secondary} />
      <ellipse cx="28" cy="53" rx="5" ry="8" fill={p.secondary} opacity="0.6" transform="rotate(-15 28 53)" />
      <ellipse cx="72" cy="53" rx="5" ry="8" fill={p.secondary} opacity="0.6" transform="rotate(15 72 53)" />
      <circle cx="42" cy="55" r="5" fill="white" />
      <circle cx="58" cy="55" r="5" fill="white" />
      <circle cx="42.5" cy="55.5" r="3" fill="#1a1a1a" />
      <circle cx="58.5" cy="55.5" r="3" fill="#1a1a1a" />
      <circle cx="43" cy="55" r="1" fill="white" />
      <circle cx="59" cy="55" r="1" fill="white" />
      <path d="M43 63 Q50 69 57 63" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  zappy_2: ({ p }) => (
    <g>
      <ellipse cx="50" cy="76" rx="28" ry="10" fill={p.primary} opacity="0.25" />
      <ellipse cx="50" cy="56" rx="27" ry="28" fill={p.primary} />
      <polygon points="36,16 28,40 42,36 34,62" fill={p.accent} opacity="0.95" />
      <polygon points="64,16 72,40 58,36 66,62" fill={p.accent} opacity="0.95" />
      <polygon points="50,10 46,24 54,24" fill={p.secondary} />
      <polygon points="50,10 44,20 56,20" fill={p.accent} opacity="0.8" />
      <ellipse cx="22" cy="55" rx="6" ry="12" fill={p.secondary} opacity="0.7" transform="rotate(-20 22 55)" />
      <ellipse cx="78" cy="55" rx="6" ry="12" fill={p.secondary} opacity="0.7" transform="rotate(20 78 55)" />
      <circle cx="41" cy="58" r="6" fill="white" />
      <circle cx="59" cy="58" r="6" fill="white" />
      <circle cx="41.5" cy="58.5" r="3.5" fill="#1a1a1a" />
      <circle cx="59.5" cy="58.5" r="3.5" fill="#1a1a1a" />
      <circle cx="42" cy="58" r="1.5" fill="white" />
      <circle cx="60" cy="58" r="1.5" fill="white" />
      <path d="M42 67 Q50 74 58 67" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
      {[...Array(6)].map((_, i) => (
        <circle key={i} cx={50 + 38 * Math.cos(i * 60 * Math.PI / 180)} cy={56 + 38 * Math.sin(i * 60 * Math.PI / 180)} r="2.5" fill={p.accent} opacity="0.7" />
      ))}
    </g>
  ),
}

// Generic fallback for characters without unique SVGs yet
const genericLumin = (stage, p) => {
  const sizes = [22, 26, 30]
  const r = sizes[stage]
  return (
    <g>
      <ellipse cx="50" cy={62 + stage * 6} rx={r} ry="9" fill={p.primary} opacity="0.25" />
      <circle cx="50" cy={50 - stage * 2} r={r} fill={p.primary} />
      {stage >= 1 && <circle cx="50" cy={50 - stage * 2} r={r * 0.6} fill={p.secondary} opacity="0.5" />}
      {stage >= 2 && (
        <>
          {[0,60,120,180,240,300].map(a => (
            <circle key={a} cx={50 + (r+8) * Math.cos(a * Math.PI/180)} cy={(50 - stage*2) + (r+8) * Math.sin(a * Math.PI/180)} r="3" fill={p.accent} opacity="0.7" />
          ))}
        </>
      )}
      <circle cx="43" cy={50 - stage * 2} r={4 + stage} fill="white" />
      <circle cx="57" cy={50 - stage * 2} r={4 + stage} fill="white" />
      <circle cx={43.5} cy={50.5 - stage * 2} r={2.5 + stage * 0.5} fill="#1a1a1a" />
      <circle cx={57.5} cy={50.5 - stage * 2} r={2.5 + stage * 0.5} fill="#1a1a1a" />
      <path d={`M${44} ${57 - stage * 2} Q50 ${63 - stage * 2} ${56} ${57 - stage * 2}`} stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  )
}

export default function LuminSVG({ characterId, stage = 0, size = 100, animate = true, happiness = 80 }) {
  const char = CHARACTERS[characterId]
  if (!char) return null
  const p = char.palette
  const key = `${characterId}_${stage}`
  const Shape = luminShapes[key]

  const happinessExpression = happiness < 50
    ? 'M44 57 Q50 54 56 57'
    : happiness >= 80
    ? 'M44 57 Q50 62 56 57'
    : 'M44 57 Q50 59 56 57'

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={animate ? 'animate-bob' : ''}
      style={{ filter: `drop-shadow(0 4px 12px ${p.glow}88)` }}
    >
      {Shape
        ? <Shape p={p} happiness={happiness} happinessPath={happinessExpression} />
        : genericLumin(stage, p)
      }
    </svg>
  )
}
