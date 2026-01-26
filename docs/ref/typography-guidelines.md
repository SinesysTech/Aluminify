# Typography Guidelines

Guia de padronização tipográfica para manter consistência visual em toda a aplicação.

---

## Contextos Tipográficos

O Design System define **duas escalas tipográficas** diferentes:

| Contexto | Escala | Uso |
|----------|--------|-----|
| **Landing Pages** | Grande (text-4xl+) | Hero, marketing, páginas públicas |
| **Área Logada (App)** | Compacta (text-2xl max) | Dashboard, gestão, formulários |

Este documento foca na **Área Logada**.

---

## Hierarquia Tipográfica - Área Logada

### Escala Visual

```
┌─────────────────────────────────────────────────────────────┐
│  [Sidebar Trigger] │ Breadcrumb              │ [Actions]   │ ← Header (h=56px)
├────────────────────┼────────────────────────────────────────┤
│                    │                                        │
│  Sidebar           │  PAGE TITLE (H1)                       │ ← .page-title
│  - Menu Item       │  Descrição da página                   │ ← .page-subtitle
│  - Menu Item       │                                        │
│                    │  ┌─ SECTION TITLE (H2) ───────────────┐│ ← .section-title
│                    │  │                                    ││
│                    │  │  ┌─ Card ─────────────────────────┐││
│                    │  │  │ CARD TITLE (H3)                │││ ← .card-title
│                    │  │  │ Conteúdo do card               │││
│                    │  │  └────────────────────────────────┘││
│                    │  │                                    ││
│                    │  └────────────────────────────────────┘│
│                    │                                        │
└────────────────────┴────────────────────────────────────────┘
```

### Classes Utilitárias (globals.css)

#### Hierarquia de Página

| Nível | Classe | Especificações | Tamanho |
|-------|--------|----------------|---------|
| H1 | `.page-title` | `text-2xl font-bold tracking-tight text-foreground` | 24px |
| H1 (desc) | `.page-subtitle` | `text-sm text-muted-foreground` | 14px |
| H2 | `.section-title` | `text-lg font-semibold text-foreground` | 18px |
| H2 (desc) | `.section-subtitle` | `text-sm text-muted-foreground` | 14px |
| H3 | `.card-title` | `text-base font-semibold text-foreground` | 16px |
| Empty | `.empty-state-title` | `text-lg font-semibold text-foreground` | 18px |

#### Hierarquia de Widgets/Dashboard

| Uso | Classe | Especificações | Tamanho |
|-----|--------|----------------|---------|
| Título de gráfico | `.widget-title` | `text-base md:text-lg font-semibold text-foreground` | 16-18px |
| Label de métrica | `.metric-label` | `text-sm font-medium text-muted-foreground` | 14px |
| Valor de métrica | `.metric-value` | `text-2xl font-bold tracking-tight text-foreground` | 24px |

### Hierarquia Interna de Cards (Dashboard)

Para títulos dentro de cards de métricas/gráficos no dashboard:

| Elemento | Classe Utilitária | Equivalente | Exemplo |
|----------|-------------------|-------------|---------|
| Label de métrica | `.metric-label` | `text-sm font-medium text-muted-foreground` | "Tempo de Estudo" |
| Valor de métrica | `.metric-value` | `text-2xl font-bold tracking-tight text-foreground` | "4h 32min" |
| Subtexto | - | `text-xs text-muted-foreground` | "vs. semana anterior" |

### Hierarquia de Gráficos/Seções Internas

| Elemento | Classe Utilitária | Equivalente | Uso |
|----------|-------------------|-------------|-----|
| Título de widget | `.widget-title` | `text-base md:text-lg font-semibold text-foreground` | Títulos de gráficos |
| Legenda/Label | - | `text-sm text-muted-foreground` | Rótulos de eixos |
| Valores destacados | - | `text-xl font-bold` | Números em destaque |

---

## Sidebar - Hierarquia

| Elemento | Classes | Tamanho |
|----------|---------|---------|
| Logo/Nome da org | `text-sm font-semibold` | 14px |
| Group Label | `text-xs font-medium text-sidebar-foreground/70` | 12px |
| Menu Item | `text-sm` | 14px |
| Menu Item (ativo) | `text-sm font-medium` | 14px |
| Submenu Item | `text-sm` | 14px |

---

## Espaçamento Padrão

### Container Principal (dashboard-layout.tsx)

```tsx
// Padding do conteúdo principal
className="p-4 md:px-8 md:py-6 pb-20 md:pb-8"
```

### Espaçamento entre Elementos

| Contexto | Classes | Valor |
|----------|---------|-------|
| Page title → content | `mb-6` ou `mb-8` | 24-32px |
| Section title → content | `mb-4` | 16px |
| Card padding | `p-4` ou `p-6` | 16-24px |
| Grid gap (cards) | `gap-4` ou `gap-6` | 16-24px |
| Entre seções | `mb-8` | 32px |

## Quando Usar Cada Classe

### `.page-title` (H1)

Use para o título principal de cada página. **Deve haver apenas um por página.**

```tsx
<h1 className="page-title">Alunos</h1>
```

### `.page-subtitle`

Use para a descrição que acompanha o título principal da página.

```tsx
<p className="page-subtitle">Gerencie matrículas, progresso e status financeiro.</p>
```

### `.section-title` (H2)

Use para títulos de seções dentro de uma página.

```tsx
<h2 className="section-title mb-4">Empresas</h2>
```

### `.section-subtitle`

Use para descrições de seções.

```tsx
<p className="section-subtitle">Gerencie todas as empresas do sistema</p>
```

### `.card-title` (H3)

Use para títulos dentro de cards.

```tsx
<h3 className="card-title">Configurações</h3>
```

### `.empty-state-title`

Use para títulos em estados vazios (quando não há dados).

```tsx
<h3 className="empty-state-title mb-2">Base de alunos vazia</h3>
```

---

## Anti-Patterns (NÃO USAR)

Estes padrões **NÃO devem ser usados** na área logada:

```tsx
// ❌ ERRADO - Escala de landing page na área logada
<h1 className="text-3xl font-bold tracking-tight">Transações</h1>
<h1 className="text-4xl font-bold">Título</h1>

// ❌ ERRADO - Cores hardcoded
<h1 className="text-2xl font-bold text-zinc-900">Título</h1>
<p className="text-[#71717A]">Descrição</p>

// ❌ ERRADO - Mistura de padrões
<h1 className="text-xl md:text-2xl font-bold">TobIAs</h1>

// ✅ CORRETO - Use as classes utilitárias
<h1 className="page-title">Título</h1>
<p className="page-subtitle">Descrição</p>
```

---

## Componentes Padronizados

Para maior consistência, utilize os componentes de `@/components/ui/data-page`:

### DataPageHeader

Header padrão para páginas de dados com título, descrição e ações.

```tsx
import { DataPageHeader } from '@/components/ui/data-page'

<DataPageHeader
  title="Alunos"
  description="Gerencie matrículas, progresso e status financeiro."
  actions={<Button>Novo Aluno</Button>}
/>
```

### DataPageEmptyState

Estado vazio padronizado para páginas sem dados.

```tsx
import { DataPageEmptyState } from '@/components/ui/data-page'
import { UserPlus } from 'lucide-react'

<DataPageEmptyState
  icon={UserPlus}
  title="Base de alunos vazia"
  description="Adicione alunos manualmente ou importe em massa."
  actions={<Button>Adicionar Aluno</Button>}
/>
```

---

## Páginas Padronizadas

As seguintes páginas foram atualizadas para usar classes utilitárias:

| Página | Classe Aplicada |
|--------|-----------------|
| `agendamentos/page.tsx` | `.page-title`, `.page-subtitle` |
| `transacoes/page.tsx` | `.page-title`, `.page-subtitle` |
| `transacoes/[id]/page.tsx` | `.page-title`, `.page-subtitle` |
| `foco/components/focus-header.tsx` | `.page-title`, `.page-subtitle` |
| `tobias/page.tsx` | `.page-title`, `.page-subtitle` |
| `sala-de-estudos/client.tsx` | `.page-title`, `.page-subtitle` |
| `usuario/.../user-edit-form.tsx` | `.page-title`, `.page-subtitle` |
| `usuario/.../student-edit-form.tsx` | `.page-title`, `.page-subtitle` |
| `dashboard/components/*.tsx` | `.widget-title` (6 componentes) |

---

## Regras Gerais

1. **Nunca use cores hardcoded** como `#71717A` ou `#09090B` para texto. Use tokens semânticos (`text-foreground`, `text-muted-foreground`).

2. **Nunca use escala de landing na área logada** - O máximo é `text-2xl` para títulos de página.

3. **Use as classes utilitárias** - `.page-title`, `.section-title`, `.card-title` garantem consistência.

4. **Prefira componentes** - Use `DataPageHeader` e `DataPageEmptyState` quando aplicável.

5. **Dark mode automático** - As classes utilitárias já usam tokens que suportam dark mode.

6. **Um H1 por página** - Cada página deve ter apenas um `.page-title`.

---

## Arquivos de Referência

| Arquivo | Propósito |
|---------|-----------|
| `app/globals.css` | Classes utilitárias de tipografia |
| `@/components/ui/data-page.tsx` | Componentes padronizados |
| `design-system/MASTER.md` | Design System completo |
| `design-system/tokens/typography.ts` | Tokens de tipografia |
