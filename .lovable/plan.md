# BrOS — Sistema Operacional Web IA-nativo

## Visão geral
SPA React + TypeScript em TanStack Start que simula um "desktop OS" no navegador, com Window Manager funcional, Dock, apps de IA reais (chamadas HTTP a provedores configuráveis), PWA instalável e identidade visual brasileira (verde/azul/amarelo em chave tech minimalista, glassmorphism dark-first).

## Stack
- React 19 + TS (TanStack Start já configurado)
- Tailwind v4 + design tokens em `src/styles.css` (oklch, glass, sombras, gradientes BR)
- Context API + hooks para Shell, WindowManager, AIConfig
- `localStorage` para providers/agents/preferências
- PWA: manifest + service worker simples (cache-first assets)
- `framer-motion` para transições de janelas

## Estrutura de pastas
```
src/
  routes/
    __root.tsx        # shell HTML + manifest/SW + meta PWA
    index.tsx         # monta <BrOS />
  os/
    BrOS.tsx          # shell raiz (Desktop + Dock + StatusBar + WindowLayer)
    components/
      Desktop.tsx
      Dock.tsx
      StatusBar.tsx
      Window.tsx          # drag/resize/min/max/focus
      NotificationToast.tsx
      MobileAppSwitcher.tsx
    context/
      ShellContext.tsx        # tema, breakpoint, notificações
      WindowManagerContext.tsx
      AIConfigContext.tsx     # providers + agents + seleção por app
    hooks/
      useBreakpoint.ts
      useDrag.ts
      useResize.ts
    ai/
      engine.ts          # callAI({providerId, model, messages, ...})
      types.ts
    registry/
      apps.ts            # AppRegistry tipado
  apps/
    text-ai/TextAI.tsx
    code-ai/CodeAI.tsx
    vision-ai/VisionAI.tsx
    data-ai/DataAI.tsx
    agent-os/AgentOS.tsx
    terminal-ai/TerminalAI.tsx
    settings/AISettings.tsx
  pwa/
    register-sw.ts
public/
  manifest.webmanifest
  sw.js
  icons/...
```

## Design system (src/styles.css)
- Dark-first. Tokens em oklch:
  - `--br-green` ~ oklch(0.68 0.17 150)
  - `--br-blue`  ~ oklch(0.62 0.15 240)
  - `--br-yellow`~ oklch(0.85 0.16 95)
  - Background: oklch(0.18 0.02 250) com gradiente sutil
  - `--glass-bg`, `--glass-border`, `--shadow-window`
- Wallpaper: gradiente verde→azul com noise sutil + blobs
- Fonte: Inter via `<link>` no `__root.tsx` head
- Variantes shadcn (botões: `glass`, `dock`) usando tokens; nada de cores hardcoded em className

## Window Manager
Estado: `windows: WindowState[]`, `focusId`, `nextZ`. Ações: `openApp(appId)`, `close(id)`, `minimize`, `maximize/restore`, `focus`, `move`, `resize`.
- `Window.tsx` posicionado absolute com transform; drag via mouse no header; resize via handles (cantos+bordas) com mouse events globais.
- Mobile (<768px): WindowManager renderiza `MobileAppSwitcher` — uma app por vez em fullscreen + bottom-nav Dock; sem drag/resize.
- Tablet: permitido multi-janela mas Dock inferior.

## AI Engine
`callAI(providerId, { model, messages, temperature, maxTokens, signal })`:
- Lê provider de `AIConfigContext` → monta URL `${baseUrl}/chat/completions` (formato OpenAI-compatible padrão; Groq/OpenAI/etc).
- Headers: `Authorization: Bearer <apiKey>` ou `x-api-key` conforme authType.
- Body OpenAI chat-completions.
- Erros: 429 → mensagem "limite atingido"; 401/403 → "verifique chave"; rede → "falha de conexão". Retorna `{ ok, text?, error? }`.
- Sem backend próprio; sem rate limit interno.

## AI Config
- `providers: Provider[]` (id, name, baseUrl, authType, apiKey, models[], defaultModel)
- `agents: Agent[]` (id, name, description, providerId, model, systemPrompt, temperature)
- `appSelection: Record<appId, {providerId, model}>`
- Persistência em `localStorage` key `bros.aiconfig.v1`
- Seed: provider exemplo Groq vazio + alerta de onboarding quando nenhum provider tem apiKey

## Apps (todos os 6 com lógica real)
- **TextAI**: textarea + toolbar (Resumir/Revisar/Traduzir/Escrever) → chama IA com prompt template + texto; histórico em estado local.
- **CodeAI**: textarea monospace + ações (Gerar/Explicar/Refatorar) + painel de saída com `<pre>`.
- **VisionAI**: prompt → chama IA texto pedindo descrição/conceito (fallback claro: "geração de imagem requer provider compatível"); galeria persistida em localStorage. Estrutura pronta para endpoint de imagem.
- **DataAI**: textarea CSV → parser simples → tabela + pergunta livre → IA recebe CSV+pergunta.
- **AgentOS**: CRUD de agentes + chat por agente usando `systemPrompt` + provider/model do agente.
- **TerminalAI**: prompt-line → IA responde como "terminal explicativo".
- **AISettings**: CRUD providers + escolha global de defaults.

## PWA
- `public/manifest.webmanifest`: name BrOS, short_name BrOS, display standalone, theme/bg dark, ícones 192/512 (gerados).
- `public/sw.js`: install precache de `/`, ativação, fetch cache-first para mesma origem assets hashed; NetworkFirst para navegações.
- Registro via `src/pwa/register-sw.ts` com guards: só registra se `import.meta.env.PROD` e hostname não for preview/iframe/lovableproject. Suporta `?sw=off`.
- Links em `__root.tsx` head: manifest, theme-color, apple-touch-icon.

## Responsividade
- `useBreakpoint()` → 'mobile' | 'tablet' | 'desktop' (matchMedia).
- Desktop: Dock lateral esquerda + StatusBar topo + janelas livres.
- Tablet: Dock inferior + janelas livres.
- Mobile: bottom-nav + MobileAppSwitcher (uma app fullscreen).

## Onboarding
Ao montar, se nenhum provider tem apiKey, abrir AISettings automaticamente + toast amigável.

## Detalhes técnicos
- Rotas: apenas `/` (SPA-like). `__root.tsx` adiciona `<link rel="manifest">`, `<meta name="theme-color">`, registra SW via efeito no `RootComponent`.
- Sem server functions (tudo client-side; chaves de API ficam no localStorage do usuário por design — é o modelo BYOK típico).
- Comentários nos pontos de extensão: `apps.ts`, `engine.ts`, `WindowManagerContext.tsx`.

## Fora de escopo desta primeira entrega
- Geração real de imagens (estrutura pronta, requer endpoint específico do provider configurado pelo usuário).
- Gráficos visuais em DataAI (resposta textual + sugestão).
- Gestos touch avançados.
- Sincronização cross-device.

Depois da sua aprovação, implemento tudo de uma vez.
