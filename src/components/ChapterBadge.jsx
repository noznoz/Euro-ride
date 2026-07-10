// Bar-and-shield chapter badge, drawn inline so it scales crisply anywhere.
export default function ChapterBadge({ width = 190 }) {
  return (
    <svg width={width} viewBox="0 0 240 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jeddah Chapter — Europe Ride 2026">
      {/* shield */}
      <path
        d="M120 8 L188 30 L188 100 C188 140 158 168 120 182 C82 168 52 140 52 100 L52 30 Z"
        fill="#FF6A00" stroke="#fff" strokeWidth="5"
      />
      <path
        d="M120 8 L188 30 L188 100 C188 140 158 168 120 182 C82 168 52 140 52 100 L52 30 Z"
        fill="none" stroke="#000" strokeWidth="1.5" opacity="0.4"
      />
      {/* top text */}
      <text x="120" y="52" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold" fontSize="19" fill="#0a0a0a" letterSpacing="2">EUROPE</text>
      {/* bar */}
      <rect x="12" y="72" width="216" height="46" rx="4" fill="#0f0f0f" stroke="#fff" strokeWidth="5" />
      <text x="120" y="103" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold" fontSize="26" fill="#fff" letterSpacing="1.5">JEDDAH</text>
      {/* bottom text */}
      <text x="120" y="145" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold" fontSize="17" fill="#0a0a0a" letterSpacing="2.5">CHAPTER</text>
      <text x="120" y="168" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold" fontSize="15" fill="#0a0a0a" letterSpacing="3">2026</text>
    </svg>
  )
}
