/** Ícones em pixel art (grade 11×11), no estilo dos menus do PS2. */
const ICONS = {
  // discos na estante
  library: [
    '...........',
    '.##.##.###.',
    '.##.##.###.',
    '.##.##.###.',
    '.##.##.###.',
    '.##.##.###.',
    '.##.##.###.',
    '.##.##.###.',
    '.##.##.###.',
    '###########',
    '...........',
  ],
  heart: [
    '...........',
    '..##...##..',
    '.####.####.',
    '###########',
    '###########',
    '###########',
    '.#########.',
    '..#######..',
    '...#####...',
    '....###....',
    '.....#.....',
  ],
  settings: [
    '...........',
    '.#.........',
    '.#####.....',
    '.#.........',
    '...........',
    '.......#...',
    '.#######...',
    '.......#...',
    '...........',
    '....#......',
    '.#######...',
  ],
  gear: [
    '.....#.....',
    '..#.###.#..',
    '.#########.',
    '..##...##..',
    '.##.....##.',
    '###.....###',
    '.##.....##.',
    '..##...##..',
    '.#########.',
    '..#.###.#..',
    '.....#.....',
  ],
} as const

export type PixelIconName = keyof typeof ICONS

export function PixelIcon({ name, size = 18 }: { name: PixelIconName; size?: number }) {
  const rows = ICONS[name]
  return (
    <svg width={size} height={size} viewBox="0 0 11 11" shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
      )}
    </svg>
  )
}
