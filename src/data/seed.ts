import { SPINE_PALETTE, newId, type Condition, type VinylRecord } from '../records/RecordModel'

/**
 * Discos de DEMONSTRAÇÃO. Artistas e álbuns fictícios, marcados com isDemo.
 * Podem ser removidos de uma vez nas configurações.
 */
const ARTISTS = [
  'Os Lunáticos do Bairro', 'Maré Baixa', 'Quarteto Neblina', 'Lia Sombra', 'Trio Avenida',
  'Banda do Terraço', 'Céu de Cobre', 'Os Anéis de Saturno', 'Rádio Vapor', 'Noite Elétrica',
  'Coral da Garoa', 'Vitrola Azul',
]
const TITLES = [
  'Janela Acesa', 'Lado B da Lua', 'Domingo Lento', 'Fita Gasta', 'Cidade de Vidro', 'Agulha & Poeira',
  'Prisma Doméstico', 'Sinal Fraco', 'Quarto 304', 'Último Bonde', 'Estática', 'Verão de 1979',
  'Ondas Curtas', 'Sala de Espera', 'Luz de Abajur', 'Rotação 33', 'Asfalto Molhado', 'Varanda',
  'Horizonte Pastel', 'Madrugada FM', 'Eco no Corredor', 'Lâmpada Fria', 'Poltrona Verde', 'Prédio em Frente',
]
const LABELS = ['Selo Garoa', 'Discos Vapor', 'Fonográfica Lua', 'Estúdio Terraço']
const EDITIONS = ['Prensagem original', 'Reedição 180 g', 'Edição colorida', 'Primeira prensagem BR', 'Gatefold']
const CONDS: Condition[] = ['NM', 'VG+', 'VG', 'M', 'G+']

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

export function createDemoRecords(): VinylRecord[] {
  const rand = rng(42)
  const pick = <T,>(a: readonly T[]) => a[Math.floor(rand() * a.length)]
  const out: VinylRecord[] = []
  const now = Date.now()
  // Preenche parcialmente cada fileira para a coleção parecer viva, deixando espaço livre.
  for (let shelf = 0; shelf < 4; shelf++) {
    for (let row = 0; row < 3; row++) {
      const count = 6 + Math.floor(rand() * 10)
      for (let slot = 0; slot < count; slot++) {
        const paid = Math.round(60 + rand() * 260)
        out.push({
          id: newId(),
          title: pick(TITLES),
          artist: pick(ARTISTS),
          year: 1966 + Math.floor(rand() * 58),
          label: pick(LABELS),
          edition: pick(EDITIONS),
          condition: pick(CONDS),
          pricePaid: paid,
          estimatedValue: Math.round(paid * (0.8 + rand() * 1.2)),
          notes: 'Disco de demonstração — fictício.',
          spineColor: pick(SPINE_PALETTE),
          location: { shelf, row, slot },
          isDemo: true,
          createdAt: now,
          updatedAt: now,
        })
      }
    }
  }
  return out
}
