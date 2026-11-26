/** Opções de personalização do quarto (tons pastel para a parede, tons de madeira para o piso). */
/** Tons de parede em famílias de 4 (do mais claro ao mais profundo). */
export const WALL_FAMILIES = [
  {
    name: 'Neutros',
    colors: [
      { id: 'off', name: 'Off-white', hex: '#ffffff' },
      { id: 'cinza-claro', name: 'Cinza claro', hex: '#e2e1de' },
      { id: 'greige', name: 'Greige', hex: '#d6cfc4' },
      { id: 'cinza', name: 'Cinza', hex: '#b4b4b4' },
    ],
  },
  {
    name: 'Rosas',
    colors: [
      { id: 'rosa', name: 'Rosa claro', hex: '#f7d9d6' },
      { id: 'rosa-chiclete', name: 'Rosa chiclete', hex: '#f2c0c6' },
      { id: 'rose', name: 'Rosé antigo', hex: '#d9a6a8' },
      { id: 'vinho', name: 'Vinho suave', hex: '#a87078' },
    ],
  },
  {
    name: 'Terrosos',
    colors: [
      { id: 'pessego', name: 'Pêssego', hex: '#f8dfc6' },
      { id: 'damasco', name: 'Damasco', hex: '#f2c6a0' },
      { id: 'terracota', name: 'Terracota', hex: '#d99a78' },
      { id: 'canela', name: 'Canela', hex: '#b07a5a' },
    ],
  },
  {
    name: 'Amarelos',
    colors: [
      { id: 'baunilha', name: 'Baunilha', hex: '#f6ecc8' },
      { id: 'manteiga', name: 'Manteiga', hex: '#f3e0a0' },
      { id: 'mostarda', name: 'Mostarda', hex: '#dcbc6a' },
      { id: 'ocre', name: 'Ocre', hex: '#b8944a' },
    ],
  },
  {
    name: 'Verdes',
    colors: [
      { id: 'menta', name: 'Verde claro', hex: '#d6ecd9' },
      { id: 'salvia', name: 'Sálvia', hex: '#c2d4b4' },
      { id: 'verde-medio', name: 'Verde médio', hex: '#9cb894' },
      { id: 'verde-escuro', name: 'Verde escuro', hex: '#5e7a5c' },
    ],
  },
  {
    name: 'Azuis',
    colors: [
      { id: 'ceu', name: 'Céu', hex: '#d4e3f3' },
      { id: 'azul-po', name: 'Azul pó', hex: '#b8cde0' },
      { id: 'azul-medio', name: 'Azul médio', hex: '#8ea8c8' },
      { id: 'azul-noite', name: 'Azul noite', hex: '#4e6488' },
    ],
  },
  {
    name: 'Lilases',
    colors: [
      { id: 'lavanda', name: 'Lavanda', hex: '#e3daf1' },
      { id: 'lilas', name: 'Lilás', hex: '#cfc0e6' },
      { id: 'ametista', name: 'Ametista', hex: '#a894c8' },
      { id: 'uva', name: 'Uva', hex: '#76608e' },
    ],
  },
] as const

export interface Swatch {
  id: string
  name: string
  hex: string
}

export const WALL_COLORS: Swatch[] = WALL_FAMILIES.flatMap((f) => [...f.colors] as Swatch[])

// Multiplica a textura de tábuas: o padrão de madeira se mantém, muda só o tom.
export const FLOOR_COLORS = [
  { id: 'natural', name: 'Natural', hex: '#ffffff' },
  { id: 'mel', name: 'Mel', hex: '#ffe2b0' },
  { id: 'nogueira', name: 'Nogueira', hex: '#b48a70' },
  { id: 'escura', name: 'Escura', hex: '#7a6050' },
  { id: 'cinza', name: 'Acinzentada', hex: '#c9c3bd' },
  { id: 'cereja', name: 'Cereja', hex: '#e0a088' },
] as const

export const wallHex = (id: string) => (WALL_COLORS.find((c) => c.id === id) ?? WALL_COLORS[0]).hex
export const floorHex = (id: string) => (FLOOR_COLORS.find((c) => c.id === id) ?? FLOOR_COLORS[0]).hex
