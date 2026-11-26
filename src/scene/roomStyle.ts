/** Opções de personalização do quarto (tons pastel para a parede, tons de madeira para o piso). */
export const WALL_COLORS = [
  { id: 'off', name: 'Off-white', hex: '#ffffff' },
  { id: 'rosa', name: 'Rosa', hex: '#f7d9d6' },
  { id: 'pessego', name: 'Pêssego', hex: '#f8dfc6' },
  { id: 'baunilha', name: 'Baunilha', hex: '#f6ecc8' },
  { id: 'menta', name: 'Menta', hex: '#d6ecd9' },
  { id: 'salvia', name: 'Sálvia', hex: '#dce4cc' },
  { id: 'ceu', name: 'Céu', hex: '#d4e3f3' },
  { id: 'lavanda', name: 'Lavanda', hex: '#e3daf1' },
] as const

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
