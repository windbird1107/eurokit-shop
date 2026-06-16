// 팀/리그 이름 → 색상 매핑
const COLORS: Record<string, { bg: string; text: string }> = {
  // 클럽
  'Manchester United':     { bg: '#DA291C', text: '#fff' },
  'Manchester City':       { bg: '#6CABDD', text: '#fff' },
  'Arsenal':               { bg: '#EF0107', text: '#fff' },
  'Liverpool':             { bg: '#C8102E', text: '#fff' },
  'Chelsea':               { bg: '#034694', text: '#fff' },
  'Real Madrid':           { bg: '#FEBE10', text: '#000' },
  'FC Barcelona':          { bg: '#A50044', text: '#FECA00' },
  'Bayern Munich':         { bg: '#DC052D', text: '#fff' },
  'Borussia Dortmund':     { bg: '#FDE100', text: '#000' },
  'Juventus':              { bg: '#1a1a1a', text: '#fff' },
  'AC Milan':              { bg: '#FB0114', text: '#1a1a1a' },
  'Inter Milan':           { bg: '#003DA5', text: '#fff' },
  'Paris Saint-Germain':   { bg: '#011E62', text: '#DA291C' },
  // 리그
  'Premier League':        { bg: '#3D185F', text: '#fff' },
  'La Liga':               { bg: '#FF4B44', text: '#fff' },
  'Bundesliga':            { bg: '#D3010C', text: '#fff' },
  'Serie A':               { bg: '#0A4EA2', text: '#fff' },
  'Ligue 1':               { bg: '#091C3E', text: '#fff' },
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(w => !['FC', 'AC', 'F.C.', 'de', 'the', 'of'].includes(w))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function TeamBadge({ name, size = 'md', className = '' }: Props) {
  const color = COLORS[name] ?? { bg: '#333', text: '#fff' }
  const initials = getInitials(name)

  const sizeClass = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-16 h-16 text-xl',
  }[size]

  return (
    <div
      className={`${sizeClass} ${className} rounded-full flex items-center justify-center font-black flex-shrink-0`}
      style={{ background: color.bg, color: color.text }}
    >
      {initials}
    </div>
  )
}
