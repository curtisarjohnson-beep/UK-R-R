// Small inline illustrations keep the prototype local, crisp and lightweight.
export function Foliage({ className = '' }: { className?: string }) {
  return <svg className={`organic-foliage ${className}`} viewBox="0 0 180 250" aria-hidden="true" focusable="false">
    <path d="M87 240C107 177 54 107 108 14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <g fill="currentColor">
      <path d="M91 204C36 210 16 179 13 153C56 146 86 165 91 204Z" />
      <path d="M94 177C141 179 167 149 163 119C119 123 97 143 94 177Z" />
      <path d="M85 144C42 146 21 120 24 94C60 91 86 112 85 144Z" />
      <path d="M88 110C127 112 153 85 150 58C115 63 92 82 88 110Z" />
      <path d="M95 76C65 68 57 44 66 21C94 31 105 50 95 76Z" />
      <path d="M108 34C105 9 123 0 141 2C143 23 127 37 108 34Z" />
    </g>
    <g stroke="#f4f0e6" strokeWidth="1.5" fill="none" opacity=".35"><path d="m25 164 57 31m17-28 48-36M36 106l45 31m11-37 46-30" /></g>
  </svg>
}

export function OrganicWave({ className = '' }: { className?: string }) {
  return <svg className={`organic-wave ${className}`} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M0 42C160 105 310 0 520 33S820 106 1040 45S1300 8 1440 40V90H0Z" fill="currentColor" />
  </svg>
}
