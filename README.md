# vynl

Sua coleção de discos de vinil dentro de um quarto 3D explorável em primeira pessoa, com estética de jogo de PlayStation 2: low-poly, texturas suaves, luz aconchegante e uma cidade pela janela que passa por manhã, tarde, pôr do sol e noite.

## Rodar

Requer Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Outros comandos:

```bash
npm run typecheck  # TypeScript
npm run lint       # oxlint
npm run build      # typecheck + build de produção em dist/
npm run preview    # serve o build
```

## Discogs (cadastro de álbuns)

As estantes começam vazias. Para adicionar um disco, aponte para um espaço livre na prateleira (ou use o **+**) e digite o nome do álbum: o app busca no **Discogs** e, ao escolher um resultado, o disco já vai para a estante com **capa**, **ano**, **faixas** e **valor estimado**. Os detalhes do disco mostram só isso: capa, nome, ano, faixas e valor.

**Capas originais:** o app baixa a capa do Discogs; se o servidor de imagens do Discogs não liberar o download (necessário para mostrar a capa no 3D), busca a mesma capa no **Cover Art Archive** (MusicBrainz), que é gratuito e não precisa de chave. Discos antigos sem capa local são corrigidos automaticamente ao abrir o app.

**Mover um disco:** abra o disco → ícone ⇄ → clique num espaço vazio da estante (Esc cancela).

**Valor estimado:** usa a sugestão de preço do Discogs para VG+ (`/marketplace/price_suggestions`, só funciona se a sua conta tiver o perfil de vendedor configurado) e, se não houver, o menor preço anunciado no Marketplace em reais (`/marketplace/stats`). Dá para atualizar pelo ícone ao lado do valor.

1. Gere um token pessoal (grátis) em https://www.discogs.com/settings/developers → *Generate new token*.
2. Cole no próprio formulário (na primeira vez) ou em **Configurações → Discogs**.

O token fica salvo só no seu navegador (IndexedDB). A busca precisa rodar via `npm run dev` / `npm run preview`; a página publicada no Claude bloqueia acesso a sites externos.

## Spotify (música de verdade)

Com **Spotify Premium**, o disco que está na radiola toca de verdade: o vynl vira um aparelho do Spotify (Web Playback SDK), busca o álbum e toca do começo. A barra de baixo mostra a faixa, o progresso (dá para arrastar) e tem voltar, pausar, avançar e volume.

1. Em https://developer.spotify.com/dashboard → *Create app*.
2. *Redirect URI*: `http://127.0.0.1:5173/callback.html`; marque **Web API** e **Web Playback SDK**.
3. Copie o **Client ID** → vynl → Configurações → Spotify → cole → *Entrar com o Spotify*.

O servidor de desenvolvimento escuta em 127.0.0.1 (exigência do Spotify para o retorno do login); a página de retorno devolve para `localhost`, onde ficam os seus dados.

## Controles

| Ação | Primeira pessoa | Navegação simples |
|---|---|---|
| Andar | WASD | WASD / ↑ ↓ |
| Olhar | mouse (o cursor fica preso) | arrastar com o mouse |
| Girar | ← → / Q | ← → / Q / E |
| Interagir | **E** ou clique (mira no centro) | clique no objeto |
| Soltar o mouse / fechar painel | Esc | Esc |

O modo de navegação é escolhido na tela de entrada e pode ser trocado nas configurações.

**No quarto:**
- **Disco na estante:** abre a capa e os detalhes (colocar na radiola, editar, mover, remover).
- **Espaço vazio na estante:** cadastra um disco exatamente naquela posição.
- **Radiola:** toca ou pausa o disco atual (a rotação é só visual, veja abaixo).
- **Expositor:** abre o disco que está tocando.
- **Abajur:** acende e apaga.
- **Poltrona:** senta de frente para a janela.

Três ícones discretos no canto inferior esquerdo abrem a **coleção** (busca e totais), o **cadastro** e as **configurações** (sensibilidade, velocidade, qualidade gráfica, pausar ou ajustar o ciclo do dia, escolher a hora, remover os discos de demonstração).

## Decisões técnicas

- **Stack:** React + TypeScript + Vite, Three.js com React Three Fiber e drei, Zustand, Tailwind v4, IndexedDB (`idb`) e Lucide.
- **Discos:** cada estante desenha suas 150 posições com **um único `InstancedMesh`**, e a capa de cada disco vem de um atlas de textura por estante (`coverAtlas.ts`, 150 capas de 64 px), ou seja, 4 draw calls para os 600 discos. A seleção não faz raycast nos discos: ela usa uma caixa invisível por fileira e calcula a posição pelo ponto atingido. O raycast só testa cerca de 20 objetos interativos registrados e roda a cada 2 quadros.
- **Sem re-render durante o movimento:** câmera, ciclo do dia, rotação do disco e luzes são atualizados por refs dentro de `useFrame`. O tempo do dia vive em um objeto mutável (`timeState`), fora do React.
- **Iluminação barata:** luz hemisférica, uma direcional (o sol pela janela) e no máximo duas luzes pontuais (teto e abajur). Não há sombras em tempo real. A luz da janela no piso é um quadrado aditivo ("luz falsa").
- **Cidade:** céu feito com um shader simples (gradiente, sol, estrelas). Os prédios são 3 `InstancedMesh`, um por faixa de altura, com mapa emissivo de janelas que acendem à noite.
- **Texturas procedurais** pequenas (64–256 px) geradas em canvas. Não há assets pesados para baixar.
- **Qualidade reduzida:** a resolução cai para 0,75×, o antialias e as luzes pontuais são desligados e a cidade fica menor. O `PerformanceMonitor` também reduz a resolução sozinho quando o FPS cai.
- **Dados:** `src/data/database.ts` expõe uma interface `Repository`. Para trocar por sincronização ou backend no futuro, basta escrever outra implementação. Capas enviadas são redimensionadas para 512 px (JPEG) e salvas no próprio registro.
- **Visual PS2** (padrão, desligável): a cena é renderizada em ~540 linhas e ampliada sem suavização, as texturas usam filtro *nearest*, e um pontilhado de Bayer 4×4 + linhas sutis imitam a saída de vídeo do console. A persiana projeta faixas de luz falsa no piso e na parede, e a noite puxa para o roxo/azul.
- **Discogs:** `src/data/discogs.ts` (busca com debounce e cancelamento, importação do release, download da capa para data URL quando o CORS permite).
- **Áudio:** **não implementado de propósito.** A radiola tem os estados parado e reproduzindo e anima o disco, mas não toca som. O campo `audioSource` no modelo já está reservado para quando houver um arquivo ou fonte legítima.

## Pôsteres

Coloque as imagens de referência em `public/posters/`. Os nomes esperados estão em [`public/posters/LEIA-ME.md`](public/posters/LEIA-ME.md). Sem as imagens, aparece uma arte abstrata original no lugar.

## Estrutura

```
src/
  app/        App.tsx
  scene/      Experience (Canvas), Room, Lighting (+ ciclo), CityView, CameraController,
              InteractionSystem, layout (medidas e colisões), timeOfDay, textures
  furniture/  VinylShelf, Decor, Cabinet, RecordPlayer, RecordDisplay, Lamp, Armchair, Posters
  records/    RecordModel, RecordDetails, RecordForm, coverArt
  ui/         Hud, InteractionHint, Intro, SettingsPanel, CollectionPanel, PanelShell, Toast
  data/       database (IndexedDB), seed (demo)
  store/      useAppStore (Zustand)
```
