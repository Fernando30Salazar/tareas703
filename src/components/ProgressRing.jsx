export default function ProgressRing({ percentage = 0, size = 84, stroke = 8 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E4E6EA" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#0E7C66"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-lg font-semibold text-ink">{percentage}%</span>
      </div>
    </div>
  )
}
