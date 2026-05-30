# Pekim.web — Brief de implementação: Mapa "Mural de Cortiça" (seção em Memórias)

> Documento para o Claude Code. Descreve a feature de mapa de viagens, a estética
> "quadro de cortiça", a estrutura de dados no Supabase e o approach de rotas.
> Stack atual: **React 19 + Vite + Supabase**, estilos **inline**, paleta central em `src/theme.js`.

---

## 1. Objetivo

Adicionar uma aba **"Mapa"** dentro da página **Memórias** (`src/pages/MemoriesPage.jsx`).
A aba mostra um **mapa-múndi real e navegável** (zoom do mundo até a rua) com a estética
de um **mural de cortiça emoldurado**: moldura de madeira, superfície de cortiça,
**alfinetes 3D** nos lugares visitados e **polaroids presas** como decoração.

Ao tocar num alfinete, abre um painel com: fotos (2–4), data, nota e a **rota da viagem**
(traçado que segue as estradas reais, da origem até o destino, passando pelas paradas).

A área coberta é o **mundo todo** (requisito), embora hoje os lugares estejam no Sul do Brasil
(Foz do Iguaçu, Gramado, Canela, Nova Petrópolis).

---

## 2. Bibliotecas a adicionar

```bash
npm install leaflet react-leaflet
```

- **leaflet** + **react-leaflet**: mapa base navegável. Marcadores customizados via `L.divIcon`
  (permite usar SVG de alfinete como pin).
- **Rota seguindo estradas**: NÃO usar `leaflet-routing-machine` com o servidor público de
  demonstração do OSRM (instável, proibido em produção). Usar **OpenRouteService (ORS)**:
  - Camada gratuita generosa, mas exige **chave de API** (cadastro em openrouteservice.org).
  - Guardar a chave em `.env` como `VITE_ORS_API_KEY` (NUNCA commitar a chave).
  - Endpoint Directions retorna GeoJSON; desenhar com `L.geoJSON` ou `<GeoJSON/>` do react-leaflet.
- Alternativa se não quiser depender de serviço externo de routing: ver Seção 6 (modo manual com waypoints).

### Tiles (o "desenho" do mapa)
O estilo visual do mapa vem dos **tiles**. Para combinar com o tema escuro/terroso:
- Opção sem chave: **CARTO dark_all** (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) —
  gratuito, atribuição obrigatória. Bom ponto de partida.
- Opção artística (sépia/vintage, requer cadastro): Stadia Maps / Thunderforest.
- A estética de "quadro" vem MAIS da moldura + cortiça + overlay de textura por CIMA do mapa
  do que do tile em si. Ver Seção 4.

---

## 3. Estrutura de dados (Supabase)

Criar tabela nova `lugares`. Sugestão de schema:

```sql
create table lugares (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,          -- "Foz do Iguaçu"
  lat           double precision not null,
  lng           double precision not null,
  data_inicio   date,                   -- início da viagem
  data_fim      date,                   -- fim (opcional)
  nota          text,                   -- textinho/memória
  fotos         jsonb default '[]',     -- array de URLs (Supabase Storage)
  rota          jsonb default '[]',     -- waypoints da viagem (ver abaixo)
  modo          text default 'driving', -- 'driving' | 'flight' | 'walking'
  autor         text,                   -- campo de autor JÁ EXISTE no padrão do projeto
  created_at    timestamptz default now()
);
```

### Formato de `rota` (jsonb)
Lista ordenada de paradas da viagem. Cada ponto:
```json
[
  { "nome": "Novo Hamburgo", "lat": -29.6783, "lng": -51.1306, "tipo": "partida", "nota": "saída 6h" },
  { "nome": "Lages",         "lat": -27.8159, "lng": -50.3261, "tipo": "parada",  "nota": "café" },
  { "nome": "Cascavel",      "lat": -24.9573, "lng": -53.4595, "tipo": "parada",  "nota": "almoço" },
  { "nome": "Foz do Iguaçu", "lat": -25.5469, "lng": -54.5882, "tipo": "chegada", "nota": "fim de tarde" }
]
```

### Fotos
Subir para **Supabase Storage** (bucket `lugares` por ex.), guardar as URLs públicas no array `fotos`.
Manter 2–4 por lugar (requisito do dono do projeto).

---

## 4. Estética "quadro de cortiça" (a parte visual)

Toda a paleta já está em `src/theme.js` (terracota `#c4826a`, dourado `#d4a574`, fundo `#0e0c0a`, etc).
A composição em camadas, de fora pra dentro:

1. **Moldura de madeira** — `border` grosso (~14px) com `border-image`/gradiente diagonal
   marrom (`#8a6238 → #2e1d0f`), `box-shadow` interno pra dar relevo, e um pseudo-elemento
   `::before` com `repeating-linear-gradient` em `mix-blend-mode: overlay` simulando veios.
2. **Cortiça** — fundo `#b5793f` + múltiplos `radial-gradient` pequenos (pontinhos escuros)
   em `background-size` variado + overlay SVG `feTurbulence` em `mix-blend-mode: multiply`.
   `box-shadow: inset` pra escurecer as bordas.
3. **Mapa real (Leaflet)** — container ocupando o centro, levemente rotacionado (`transform: rotate(-0.6deg)`)
   pra parecer "fixado torto". **Importante**: a rotação no container pode atrapalhar gestos do Leaflet —
   preferir rotação só na MOLDURA/borda, deixando o mapa reto, OU testar bem o drag/zoom com rotação.
4. **Overlay de textura/vinheta** sobre o mapa (`pointer-events: none !important`) pra dar ar envelhecido —
   um `radial-gradient` escuro nas bordas + grain sutil. NUNCA capturar cliques (ver Seção 5).
5. **Alfinetes** — `L.divIcon` com SVG: haste + cabeça com `radialGradient` (brilho no canto)
   + `drop-shadow`. Ativo em dourado, demais em vermelho/terracota.
6. **Polaroids decorativas** — `position: absolute` na borda da cortiça (NÃO presas a coordenadas
   do mapa, senão somem ao arrastar). Washi tape = retângulo translúcido; tachinha = círculo com gradiente.

Há um protótipo visual de referência (screenshot) que o dono aprovou: moldura de madeira,
cortiça texturizada, mapa fixado torto, alfinete dourado ativo + vermelhos, 2 polaroids presas.

---

## 5. Pontos de atenção (críticos)

- **Interatividade vs. decoração**: o mapa Leaflet precisa continuar **arrastável e com zoom**.
  Todas as camadas decorativas POR CIMA do mapa (overlay de textura, vinheta, polaroids que
  invadam a área do mapa) devem ter `pointer-events: none`. A moldura/cortiça nas bordas pode
  capturar eventos normalmente (não sobrepõe o mapa).
- **Rotação do container do mapa**: rotacionar o `.leaflet-container` quebra a relação entre
  pixel e coordenada (cliques caem no lugar errado, drag fica estranho). Recomendo manter o
  mapa **reto** e dar o "ar torto" só na moldura, OU usar uma leve rotação apenas visual num
  wrapper externo sabendo que pode afetar precisão. Testar antes de assumir.
- **Alfinetes próximos** (Gramado/Canela/Nova Petrópolis ficam colados): como agora é mapa real
  com zoom, isso resolve sozinho — ao dar zoom na serra os pins se separam. Considerar
  `leaflet.markercluster` se virar muita densidade (provavelmente desnecessário no começo).
- **Polaroids presas a coordenadas somem ao arrastar** — por isso são decoração fixa na borda.
  Se quiser miniatura de foto NO ponto do lugar, fazer como parte do `divIcon` do alfinete.
- **Chave ORS no `.env`**: `VITE_ORS_API_KEY`. Adicionar `.env` ao `.gitignore` (conferir se já está).
  A chave fica exposta no client (é VITE_) — usar uma chave com restrição de domínio/uso.
- **Custo/limites**: ORS free tem limite diário de requisições. Como as rotas são poucas e
  fixas, **cachear o GeoJSON da rota** no próprio registro `lugares.rota_geojson` (jsonb) após
  calcular uma vez evita rechamar o serviço a cada abertura. Recomendado.

---

## 6. Rota da viagem — como traçar seguindo as estradas

Fluxo recomendado:

1. Para cada lugar, pegar os waypoints do campo `rota` (partida → paradas → chegada).
2. Chamar **OpenRouteService Directions** com esses waypoints e o `modo`:
   - `driving-car` para viagens de carro (segue as BRs/RSs reais).
   - Para **avião** (`modo: 'flight'`): NÃO usar routing de estrada — desenhar uma
     **linha reta/geodésica** entre origem e destino (`L.polyline` com `dashArray`), opcionalmente
     curvada. Routing de carro não faz sentido para voos.
3. Receber o GeoJSON da rota e desenhá-lo com estilo: linha **terracota `#c4826a`**,
   `dashArray: '5 5'`, leve `drop-shadow`. Pins menores nas paradas intermediárias.
4. **Cachear** o GeoJSON retornado em `lugares.rota_geojson` pra não recalcular sempre.

### Sobre "a rota exata que viajamos"
- Se a viagem seguiu o caminho normal de estrada → o routing automático já traça certo.
- Se houve desvio/estrada cênica específica → adicionar **waypoints intermediários** extras no
  campo `rota` para "forçar" a linha pelo trajeto real. Quanto mais pontos, mais fiel.
- Modo totalmente manual (sem ORS): guardar a própria polilinha desenhada à mão como lista de
  coordenadas em `rota_geojson` e só renderizar — útil se não quiser depender de serviço externo.

---

## 7. Estrutura de arquivos sugerida

```
src/
  pages/MemoriesPage.jsx        # adicionar sistema de abas: "Linha do tempo" | "Mapa"
  components/map/
    CorkMap.jsx                 # moldura + cortiça + <MapContainer> + overlays
    PinIcon.js                  # gera o L.divIcon do alfinete (SVG, cor por estado)
    PlacePanel.jsx              # painel que abre ao clicar: fotos, data, nota, rota, avatares
    TravelRoute.jsx             # busca/cacheia ORS e desenha o GeoJSON da rota
    PinnedPolaroid.jsx          # polaroid decorativa (tape/tack) — reutiliza estética da Home
  lib/
    routing.js                  # wrapper do OpenRouteService (fetch + cache no Supabase)
  theme.js                      # JÁ EXISTE — usar os tokens daqui, não hardcodar cor
```

- Seguir o padrão do projeto: **estilos inline** + tokens de `theme.js`, sem CSS framework.
- Importar o CSS do Leaflet uma vez (`import "leaflet/dist/leaflet.css"`).
- Avatares estilo Spotify (P/K) reaproveitam o componente de avatar (a ser criado na fase de avatares);
  no painel do mapa, mostrar quem registrou via o campo `autor`.

---

## 8. Ordem de implementação sugerida

1. **Aba Mapa em Memórias** com `<MapContainer>` básico + tiles CARTO dark. Confirmar que arrasta/zoom.
2. **Moldura + cortiça + overlays** por cima, garantindo `pointer-events` corretos (mapa ainda navegável).
3. **Tabela `lugares`** no Supabase + seed com os 4 lugares reais (coordenadas acima na Seção 3).
4. **Alfinetes** via `divIcon` lendo de `lugares`. Clique → abre `PlacePanel`.
5. **PlacePanel**: fotos (polaroids), data, nota, avatares.
6. **Rota**: integrar ORS, desenhar GeoJSON, cachear. Tratar `modo: flight` como linha reta.
7. **Polaroids decorativas** na borda + refinos de textura/sombra.

## 9. Variáveis de ambiente (.env)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ORS_API_KEY=...      # OpenRouteService (rota seguindo estradas)
```
Conferir que `.env` está no `.gitignore`.

---

### Resumo do que pedir ao Claude Code
"Implemente a aba Mapa na página Memórias seguindo este brief: mapa Leaflet (react-leaflet) com
tiles dark, dentro de uma composição visual de quadro de cortiça com moldura de madeira; alfinetes
SVG via divIcon lidos da tabela Supabase `lugares`; clique abre painel com fotos/data/nota/rota;
rota traçada via OpenRouteService seguindo as estradas (linha reta para modo avião), com cache do
GeoJSON. Usar estilos inline + tokens de theme.js. Atenção a pointer-events para o mapa seguir
navegável sob as camadas decorativas."
```
