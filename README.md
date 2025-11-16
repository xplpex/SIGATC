# SIGATC — Sistema Inteligente de Gestão e Alerta de Tempo Crítico

## Descrição
O SIGATC é uma aplicação web voltada ao monitoramento e comunicação de riscos climáticos urbanos para Goiânia/GO. Ele combina dados meteorológicos, zonas de risco georreferenciadas e uma interface moderna para informar rapidamente condições atuais, previsão de curto prazo e áreas com maior probabilidade de alagamentos.

A aplicação foi redesenhada com foco em precisão de localização (GPS), UX moderna com animações suaves, visualização de camadas (zonas vermelho/amarelo/verde) com tooltips interativas, previsão paginada/por swipe, e conformidade com WCAG 2.1 AA.

## Requisitos do Sistema
- Node.js >= 18
- npm >= 9
- Navegador moderno (Chrome, Edge, Firefox) com suporte ao Geolocation API
- Sistema operacional: Windows, macOS ou Linux

## Dependências Principais
- React 18, React DOM
- Redux Toolkit e React-Redux
- Leaflet (mapa interativo)
- styled-components (tema e estilos)
- react-icons (ícones)
- Vite (dev server e build)
- Vitest e Testing Library (testes)

## Instalação e Configuração
1. Clonar o repositório:
   - `git clone https://github.com/xplpex/SIGATC.git`
   - `cd SIGATC/sigatc-react`
2. Instalar dependências:
   - `npm install`
3. Executar em desenvolvimento:
   - `npm run dev`
   - Abrir `http://localhost:5173/`
4. Rodar testes:
   - `npm test`
5. Gerar build de produção:
   - `npm run build`

## Exemplos de Uso
- Atualizar condições: clicar em `Atualizar` para simular atualização das métricas (temperatura, precipitação, umidade, vento) e do nível de risco.
- Minha localização: clicar em `Minha localização` para obter GPS e verificar se o usuário está dentro de zonas mapeadas; exibe alerta com coordenadas e nível de risco.
- Camadas de risco: usar checkboxes em `Camadas de Risco` para mostrar/ocultar zonas vermelha/amarela/verde no mapa.
- Previsão 24h: navegar com setas de teclado (esquerda/direita) ou botões `← Anterior` e `Próxima →`. Cards exibem ícone, temperatura, precipitação e mini-badge de risco.
- Acessibilidade: usar o link de pulo para conteúdo (`🎯 Ir para conteúdo principal`), foco com alto contraste, e suporte a `prefers-reduced-motion`.

## Licença
- MIT License (proposta para uso e distribuição). Caso exista política institucional específica, substituir conforme diretrizes do órgão.

## Contribuição
- Pull Requests são bem-vindos. Manter padrões de acessibilidade (WCAG 2.1 AA), testes unitários (Vitest + Testing Library) e consistência de design (tokens em `src/theme.js`).
- Recomenda-se abrir Issues com descrição detalhada, passos para reproduzir e evidências visuais (screenshots, vídeos).

## Estrutura de Arquivos
Raiz do projeto:
- `sigatc-react/` — aplicação React (principal)
  - `src/App.jsx` — UI principal: mapa, painéis, controles e previsão
  - `src/main.jsx` — bootstrap React + Redux + ThemeProvider
  - `src/store.js` — configuração Redux Toolkit (slices `weather`, `ui`, `sync`)
  - `src/theme.js` — tokens de design (cores, raios, sombras)
  - `src/styles.css` — utilitários e mini-badges
  - `src/__tests__/` — testes de UI e store
  - `index.html` — HTML base Vite
  - `package.json` — scripts, dependências
- `docs/visual-updates.md` — resumo das atualizações visuais
- `index.html`, `app.js`, `styles.css`, `sw.js` — artefatos legados (PoC)
- `SIGATC_PoC_dataset.csv`, `Climagyn.xlsx` — dados demonstrativos

## Funções Principais e Lógica
- `App.jsx`:
  - `MapView` — inicializa Leaflet, cria camadas de zonas (vermelho/amarelo/verde) com tooltips; lê visibilidade das camadas do estado `ui.zoneLayers`; atualiza `ui.trafficIndex` conforme risco atual.
  - `Controls` — `Atualizar` simula variação de métricas; `Minha localização` usa Geolocation para verificar distância do usuário às zonas e exibir alerta com o risco.
  - `Dashboard` — exibe ícones e métricas atuais com badge de risco e semáforo (`trafficIndex`).
  - `Forecast` — paginação de 24h com navegação por teclado (setas) e botões; cards mostram ícone, temperatura, precipitação e nível de risco.
  - `ZoneControls` — permite alternar visibilidade das camadas (checkboxes com `aria-label` e alta acessibilidade).
- `store.js`:
  - `weatherSlice` — estado de condições atuais e previsão; ações `setCurrent`, `addForecastChunk`, `setForecast`.
  - `uiSlice` — estado de UI: `trafficIndex` e `zoneLayers`; ações `setTrafficIndex`, `setZoneLayers`.
  - `syncSlice` — estado de sincronização (demonstrativo).
- `theme.js` e `createGlobalStyle` — expõem variáveis CSS (cores, raios, sombras) utilizadas por todos os componentes e pelo Leaflet.

## Fluxo de Execução
1. `main.jsx` renderiza `App` dentro de `Provider` (Redux) e `ThemeProvider`.
2. `App` define estilos globais (variáveis CSS), carrega previsão em chunks e renderiza layout com três áreas: controles/painéis, mapa, previsão.
3. `MapView` monta o mapa, cria camadas por nível de risco e aplica tooltips; responde à alteração de `zoneLayers` para adicionar/remover grupos.
4. `Controls` gerencia atualização de métricas e verificação de GPS (alertas); o risco atual atualiza o semáforo no `Dashboard`.
5. `Forecast` fornece navegação por páginas e teclas; conteúdo é acessível e responsivo.

## Configurações Importantes e Variáveis de Ambiente
- Variáveis CSS (tokens) definidas em `App.jsx` via `createGlobalStyle`:
  - `--bg`, `--panel-bg`, `--border`, `--text`, `--focus`
  - `--risk-red`, `--risk-yellow`, `--risk-green` (e suas variantes de stroke)
  - `--radius-*`, `--shadow-*`
- Não há variáveis de ambiente obrigatórias para executar a aplicação. (Integrações futuras podem adicionar chaves/URLs.)

## Padrões de Commit e Versionamento
- Usar títulos concisos (até 50 caracteres), corpo explicativo, e referência a issues quando aplicável.
- Manter mensagens em português claro e objetivo.
- Ex.:
  - Título: `Adicionar README detalhado do SIGATC`
  - Corpo: explica conteúdo, instruções, arquitetura e pontos de acesso.

## Suporte e Contato
- Abra uma Issue no GitHub com detalhes e evidências.
- Contribuidores: equipe de desenvolvimento SIGATC e parceiros.