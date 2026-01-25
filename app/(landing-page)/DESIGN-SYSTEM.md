# Aluminify Landing Page - Design System

Este documento define o sistema de design completo extraído da landing page do Aluminify.

---

## 1. Tipografia

### Famílias de Fontes

| Token | Fonte | Uso |
|-------|-------|-----|
| `font-display` | Plus Jakarta Sans | Títulos, logos, headings |
| `font-sans` | Inter | Corpo de texto, parágrafos |
| `font-mono` | Monospace padrão | Código, preços, badges técnicos |

### Escala Tipográfica

| Classe | Tamanho Mobile | Tamanho Desktop | Uso |
|--------|----------------|-----------------|-----|
| Hero H1 | `text-5xl` (3rem) | `text-7xl` (4.5rem) | Título principal |
| Section H2 | `text-3xl` (1.875rem) | `text-4xl` (2.25rem) | Títulos de seção |
| Card H3 | `text-xl` (1.25rem) | `text-2xl` (1.5rem) | Títulos de cards |
| Body | `text-lg` (1.125rem) | `text-xl` (1.25rem) | Texto de destaque |
| Small | `text-sm` (0.875rem) | `text-sm` (0.875rem) | Labels, links nav |
| XSmall | `text-xs` (0.75rem) | `text-xs` (0.75rem) | Badges, captions |

### Pesos

| Peso | Valor | Uso |
|------|-------|-----|
| Bold | 700 | Títulos, CTAs |
| Semibold | 600 | Subtítulos, labels |
| Medium | 500 | Links, navegação |
| Regular | 400 | Corpo de texto |

### Line Heights

- Títulos: `tracking-tight` (-0.025em)
- Corpo: `leading-relaxed` (1.625)

---

## 2. Paleta de Cores

### Cores Semânticas - Light Mode

| Token | Valor Hex | HSL | Uso |
|-------|-----------|-----|-----|
| `primary` | `#111827` | gray-900 | Botões, textos principais |
| `primary-hover` | `#374151` | gray-700 | Estados hover |
| `background-light` | `#F9FAFB` | gray-50 | Fundo da página |
| `surface-light` | `#FFFFFF` | white | Cards, modais |
| `border-light` | `#E5E7EB` | gray-200 | Bordas, divisores |
| `text-main-light` | `#111827` | gray-900 | Texto principal |
| `text-muted-light` | `#6B7280` | gray-500 | Texto secundário |

### Cores Semânticas - Dark Mode

| Token | Valor Hex | HSL | Uso |
|-------|-----------|-----|-----|
| `primary` | `#111827` | gray-900 | Mantém consistência |
| `background-dark` | `#0F172A` | slate-900 | Fundo da página |
| `surface-dark` | `#1E293B` | slate-800 | Cards, modais |
| `border-dark` | `#334155` | slate-700 | Bordas, divisores |
| `text-main-dark` | `#F8FAFC` | slate-50 | Texto principal |
| `text-muted-dark` | `#94A3B8` | slate-400 | Texto secundário |

### Cores de Status

| Token | Valor | Uso |
|-------|-------|-----|
| `green-500` | `#22c55e` | Sucesso, status online |
| `blue-500` | `#3b82f6` | Informação, links, highlights |
| `red-400` | `#f87171` | Erro, alerta |
| `yellow-400` | `#facc15` | Aviso |
| `purple-500` | `#a855f7` | Destaque especial |

---

## 3. Espaçamento

### Sistema de Espaçamento (8px base)

| Token | Valor | Tailwind | Uso |
|-------|-------|----------|-----|
| `space-1` | 4px | `1` | Gaps mínimos |
| `space-2` | 8px | `2` | Padding interno pequeno |
| `space-3` | 12px | `3` | Gaps em listas |
| `space-4` | 16px | `4` | Padding padrão |
| `space-6` | 24px | `6` | Gaps de seção |
| `space-8` | 32px | `8` | Padding de cards |
| `space-12` | 48px | `12` | Gaps entre seções |
| `space-16` | 64px | `16` | Padding vertical seções |
| `space-20` | 80px | `20` | Padding seções grandes |
| `space-24` | 96px | `24` | Padding seções hero |

### Padding de Página (Responsivo)

```
Mobile:  px-4 (16px)
Tablet:  sm:px-6 (24px)
Desktop: lg:px-8 (32px)
```

### Max Width Container

```
max-w-7xl = 1280px (container principal)
max-w-5xl = 1024px (conteúdo focado)
max-w-4xl = 896px (texto/manifesto)
max-w-2xl = 672px (parágrafos)
```

### Padding Vertical de Seções

| Seção | Mobile | Desktop |
|-------|--------|---------|
| Hero | `pt-24 pb-16` | `lg:pt-32 lg:pb-24` |
| Seções normais | `py-20` | `py-24` |
| Seções com borda | `py-24` | `py-24` |

---

## 4. Componentes

### Navegação (Nav)

```css
/* Estrutura */
height: 64px (h-16)
position: sticky top-0
z-index: 50
background: white/80 com backdrop-blur-md
border-bottom: 1px solid border-light/80

/* Logo */
icon: 32x32px, rounded-lg, bg-primary
font: font-display font-bold text-lg tracking-tight

/* Links */
font-size: text-sm
font-weight: font-medium
color: text-muted-light
hover: text-primary
transition: colors

/* CTA Button */
padding: px-4 py-2
border-radius: rounded-lg
font: text-sm font-medium
shadow: shadow-sm shadow-gray-300
```

### Botões

#### Primary Button

```css
background: bg-primary (#111827)
hover: bg-primary-hover (#374151)
color: text-white
padding: px-8 py-3.5
border-radius: rounded-lg
font: font-medium
shadow: shadow-lg shadow-gray-200
transition: all
```

#### Secondary/Outline Button

```css
background: bg-white
border: border border-border-light
color: text-text-main-light
padding: px-8 py-3.5
border-radius: rounded-lg
font: font-medium
hover: bg-gray-50
transition: all
```

### Cards

```css
background: bg-white (light) / bg-surface-dark (dark)
border: border border-border-light
border-radius: rounded-2xl
padding: p-6 ou p-8
shadow: shadow-sm
hover: hover:border-{color}-200 (opcional)
transition: colors
```

### Badges/Pills

```css
/* Status Badge */
display: inline-flex items-center gap-2
padding: px-3 py-1
border-radius: rounded-full
background: bg-gray-100 (light) / bg-gray-800 (dark)
border: border border-gray-200 (light) / border-gray-700 (dark)
font: text-xs font-medium

/* Indicator Dot */
size: h-2 w-2
border-radius: rounded-full
background: bg-green-500 (online) / bg-purple-500 (special)
```

### Tabelas

```css
/* Container */
border-radius: rounded-xl
border: border border-border-light
overflow: hidden
shadow: shadow-sm

/* Header */
background: bg-gray-50 (light) / bg-gray-900/50 (dark)
font: text-sm font-bold uppercase tracking-wider
color: text-muted
padding: py-4 px-6

/* Rows */
divider: divide-y divide-border-light
hover: hover:bg-gray-50
transition: colors
cursor: pointer (se clicável)

/* Highlighted Row */
background: bg-blue-50/30
border: border-2 border-blue-500
transform: scale-[1.01]
```

---

## 5. Efeitos e Animações

### Transições

```css
/* Padrão */
transition-colors duration-200

/* Elementos interativos */
transition-all

/* Transform */
transition-transform duration-300
```

### Hover Effects

```css
/* Scale */
group-hover:scale-110 (ícones)
group-hover:scale-105 (cards menores)

/* Translate */
group-hover:translate-x-1 (setas, indicadores)
group-hover:translate-y-4 (reveal)

/* Opacity */
hover:opacity-70 (links underlined)
```

### Background Effects

```css
/* Grid Pattern */
background-image: linear-gradient(to right, #E5E7EB 1px, transparent 1px),
                  linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)
background-size: 40px 40px
opacity: 0.3-0.4

/* Mask Gradient */
mask-image: linear-gradient(to bottom, transparent, 10%, white, 90%, transparent)

/* Blur Glow */
.absolute.-inset-1.blur.opacity-30-40
```

### Backdrop

```css
backdrop-blur-md /* Navegação */
```

---

## 6. Responsividade

### Breakpoints

| Nome | Valor | Uso |
|------|-------|-----|
| `sm` | 640px | Ajustes mobile/tablet |
| `md` | 768px | Tablet/Desktop |
| `lg` | 1024px | Desktop |

### Grid Layouts

```css
/* Features Grid */
grid-cols-1 md:grid-cols-3 gap-12

/* Pricing Grid */
grid-cols-1 md:grid-cols-2 gap-8

/* Bento Grid */
grid-cols-1 md:grid-cols-3 gap-6
md:col-span-2 md:row-span-2 (item grande)
```

### Visibilidade

```css
hidden md:block /* Desktop only */
block md:hidden /* Mobile only */
hidden sm:block /* Tablet+ */
```

---

## 7. Ícones

### Material Icons Outlined

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
```

### Uso

```html
<span class="material-icons-outlined text-sm">arrow_forward</span>
```

### Ícones Principais

- `arrow_forward` - CTAs
- `verified_user` - Segurança
- `branding_watermark` - Branding
- `psychology` - IA
- `check` - Lista de features
- `dashboard` - Navegação
- `play_circle` - Vídeos
- `style` - Flashcards
- `calendar_today` - Agenda
- `lock` - Segurança/URL

---

## 8. Inconsistências Identificadas

### Entre index.html e landing-page.tsx

| Aspecto | index.html | landing-page.tsx | Recomendação |
|---------|------------|------------------|--------------|
| Cores gray/zinc | `gray-*` | `zinc-*` | Padronizar para `zinc-*` |
| Border opacity | `/60` | `/80` | Padronizar para `/80` |
| Hero heading | Gradient text | Solid primary | Usar gradient para consistência |
| Hero section padding | `pt-24 pb-20` | `pt-24 pb-16` | Padronizar `pb-20` |
| Browser mockup | Código editor | Dashboard mockup | Manter versões diferentes |
| CTA text | "Começar Agora (Cloud)" | "Começar Agora" | Simplificar |
| Features section | 3 features | 3 features (diferentes) | OK, contextos diferentes |
| Pricing table | Valores diferentes | Valores diferentes | Sincronizar dados |

### Problemas de UI/UX

1. **Links .html no componente React**: O `landing-page.tsx` usa links como `/login.html`, `/signup.html` que não funcionam em Next.js
2. **Navegação inconsistente**: Alguns links são `<Link>` outros são `<a>`
3. **Falta de focus states**: Botões não têm `focus:ring` definido
4. **Acessibilidade**: Falta `aria-label` em alguns botões de ícone

---

## 9. Recomendações de Padronização

### Tokens CSS a Criar

```css
:root {
  /* Spacing */
  --space-section-y: 6rem; /* py-24 */
  --space-section-y-sm: 5rem; /* py-20 */
  --space-container-x: 2rem; /* px-8 */

  /* Components */
  --nav-height: 4rem; /* h-16 */
  --card-radius: 1rem; /* rounded-2xl */
  --button-radius: 0.5rem; /* rounded-lg */

  /* Effects */
  --backdrop-blur: blur(12px);
  --shadow-card: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-button: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### Classes Utilitárias

```css
.section-padding {
  @apply py-20 lg:py-24;
}

.container-padding {
  @apply px-4 sm:px-6 lg:px-8;
}

.button-primary {
  @apply bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-lg font-medium transition-all shadow-lg shadow-zinc-200 dark:shadow-none;
}

.button-secondary {
  @apply bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main-light dark:text-text-main-dark px-8 py-3.5 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all;
}
```

---

## 10. Compatibilidade Next.js

### Arquivos HTML Estáticos

Os arquivos `.html` na pasta `(landing-page)` **não são servidos automaticamente** pelo Next.js. Opções:

1. **Converter para páginas React** (Recomendado)
   - Criar `page.tsx` em cada subpasta
   - Usar o mesmo design system

2. **Servir como arquivos estáticos**
   - Mover para `/public/landing/`
   - Acessar via `/landing/features.html`

3. **Usar rewrites no next.config.ts**
   ```js
   async rewrites() {
     return [
       { source: '/features', destination: '/landing/features.html' },
     ]
   }
   ```

### Estrutura Recomendada

```
app/(landing-page)/
├── page.tsx              # Home (usando LandingPage component)
├── components/
│   ├── landing-page.tsx
│   ├── nav.tsx
│   ├── hero.tsx
│   ├── features.tsx
│   ├── pricing-table.tsx
│   └── footer.tsx
├── manifesto/
│   └── page.tsx
├── pricing/
│   └── page.tsx
├── features/
│   └── page.tsx          # Converter de HTML
├── docs/
│   └── page.tsx          # Converter de HTML
└── ...
```

---

*Documento gerado em: 2026-01-25*
*Versão: 1.0*
