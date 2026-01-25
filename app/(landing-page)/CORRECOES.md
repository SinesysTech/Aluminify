# Landing Page - Correções Identificadas

Este documento lista todas as inconsistências e correções necessárias encontradas na análise da landing page.

---

## 1. Bugs Críticos

### 1.1. Typo no Link de Preços
**Arquivo:** `features\features.html` (linhas 139, 651, 720)
```html
<!-- ERRADO -->
<a href="/princing.html">Preços</a>

<!-- CORRETO -->
<a href="/pricing.html">Preços</a>
```

### 1.2. JSX em Arquivo HTML
**Arquivo:** `features\features.html` (linhas 116-121)
```html
<!-- ERRADO - Usando className (JSX) em HTML -->
<div className="w-8 h-8 bg-primary...">A</div>
<span className="font-display...">Aluminify</span>

<!-- CORRETO - Usar class em HTML -->
<div class="w-8 h-8 bg-primary...">A</div>
<span class="font-display...">Aluminify</span>
```

### 1.3. Links .html em Componentes React
**Arquivo:** `components\landing-page.tsx`
```tsx
// ERRADO - Links para arquivos .html não funcionam em Next.js App Router
href="/login.html"
href="/signup.html"
href="/pricing.html"

// CORRETO - Usar rotas Next.js
href="/login"
href="/signup"
href="/pricing"
```

---

## 2. Inconsistências de Layout

### 2.1. Altura da Navegação

| Arquivo | Altura | Classe |
|---------|--------|--------|
| `index.html` | 64px | `h-16` |
| `landing-page.tsx` | 64px | `h-16` |
| `pricing-page.tsx` | 80px | `h-20` |
| `features.html` | 64px | `h-16` |

**Recomendação:** Padronizar para `h-16` (64px)

### 2.2. Border Opacity da Nav

| Arquivo | Opacity |
|---------|---------|
| `index.html` | `/60` |
| `landing-page.tsx` | `/80` |
| `features.html` | `/60` |

**Recomendação:** Padronizar para `/80`

### 2.3. Padding Vertical do Hero

| Arquivo | Mobile | Desktop |
|---------|--------|---------|
| `index.html` | `pt-24 pb-20` | `lg:pt-32 lg:pb-28` |
| `landing-page.tsx` | `pt-24 pb-16` | `lg:pt-32 lg:pb-24` |
| `features.html` | `pt-24 pb-20` | `lg:pt-32 lg:pb-24` |

**Recomendação:** Padronizar para `pt-24 pb-20 lg:pt-32 lg:pb-24`

---

## 3. Inconsistências de Cores

### 3.1. Gray vs Zinc

| Arquivo | Paleta Usada |
|---------|--------------|
| `index.html` | `gray-*` |
| `landing-page.tsx` | `zinc-*` |
| `pricing-page.tsx` | `zinc-*` |
| `features.html` | `gray-*` |

**Recomendação:** Padronizar para `zinc-*` (mais alinhado com shadcn/ui)

### 3.2. Cores de Seleção de Texto

| Arquivo | Light | Dark |
|---------|-------|------|
| `index.html` | `selection:bg-gray-200` | `selection:bg-gray-700` |
| `landing-page.tsx` | `selection:bg-zinc-200` | `selection:bg-zinc-800` |

**Recomendação:** Padronizar para `zinc-*`

---

## 4. Inconsistências de Tipografia

### 4.1. Título Hero

| Arquivo | Estilo |
|---------|--------|
| `index.html` | Gradient text (`bg-clip-text bg-gradient-to-b`) |
| `landing-page.tsx` | Cor sólida (`text-primary dark:text-white`) |

**Recomendação:** Usar gradient para mais impacto visual

---

## 5. Inconsistências de Dados

### 5.1. Tabela de Preços

**index.html:**
| Plano | Capacidade | Preço |
|-------|------------|-------|
| Start | Até 500 | R$ 299/mês |
| Growth | Até 5.000 | R$ 899/mês |
| Scale | Até 25.000 | R$ 2.499/mês |

**landing-page.tsx:**
| Plano | Capacidade | Preço |
|-------|------------|-------|
| Start | Até 300 | R$ 500/fixo |
| Growth | 301-500 | R$ 500 + R$ 1,50/extra |
| Scale | 501-1.000 | R$ 800 + R$ 1,00/extra |

**Recomendação:** Sincronizar dados com pricing-page.tsx (fonte de verdade)

---

## 6. Problemas de Acessibilidade

### 6.1. Focus States Ausentes
Os botões não têm estilos de foco definidos.

```css
/* Adicionar a todos os botões */
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
```

### 6.2. aria-label Ausentes

```html
<!-- Ícones de redes sociais sem label -->
<a href="https://github.com/aluminify">
  <svg>...</svg>
</a>

<!-- CORRETO -->
<a href="https://github.com/aluminify" aria-label="GitHub do Aluminify">
  <svg aria-hidden="true">...</svg>
</a>
```

### 6.3. Skip Navigation Link
Adicionar link para pular navegação:

```html
<a href="#main-content" class="sr-only focus:not-sr-only">
  Pular para conteúdo principal
</a>
```

---

## 7. Arquivos HTML vs Next.js

### Status dos Arquivos

| Arquivo | Funciona em Next.js? | Ação Recomendada |
|---------|---------------------|------------------|
| `index.html` | Parcial | Mover para `/public` ou converter |
| `features.html` | Parcial | Converter para `features/page.tsx` |
| `docs.html` | Parcial | Converter para `docs/page.tsx` |
| `changelog.html` | Parcial | Converter para `changelog/page.tsx` |
| `roadmap.html` | Parcial | Converter para `roadmap/page.tsx` |
| `status.html` | Parcial | Converter para `status/page.tsx` |
| `open-source.html` | Parcial | Converter para `opensource/page.tsx` |

### Opções para Servir HTML

**Opção 1 - Mover para `/public`:**
```
public/
└── landing/
    ├── features.html
    ├── docs.html
    └── ...
```
Acesso: `/landing/features.html`

**Opção 2 - Rewrites no next.config.ts:**
```ts
async rewrites() {
  return [
    {
      source: '/features',
      destination: '/api/serve-html?file=features',
    },
  ]
}
```

**Opção 3 - Converter para TSX (Recomendado):**
Manter consistência com o resto do projeto.

---

## 8. Checklist de Correções

### Prioritárias (Bugs)
- [ ] Corrigir typo `/princing.html` -> `/pricing.html`
- [ ] Corrigir `className` -> `class` em features.html
- [ ] Atualizar links `.html` em landing-page.tsx

### Layout
- [ ] Padronizar altura nav para `h-16`
- [ ] Padronizar border opacity para `/80`
- [ ] Padronizar padding hero

### Cores
- [ ] Substituir `gray-*` por `zinc-*`
- [ ] Padronizar selection colors

### Dados
- [ ] Sincronizar tabela de preços
- [ ] Verificar CTAs e links

### Acessibilidade
- [ ] Adicionar focus states
- [ ] Adicionar aria-labels
- [ ] Adicionar skip link

### Arquitetura
- [ ] Decidir estratégia para arquivos HTML
- [ ] Componentizar navegação e footer
- [ ] Criar componentes reutilizáveis

---

## 9. Componentes a Extrair

Para melhor manutenibilidade, extrair:

```
components/
├── nav.tsx              # Navegação compartilhada
├── footer.tsx           # Footer compartilhado
├── hero-section.tsx     # Seção hero
├── feature-card.tsx     # Card de feature
├── pricing-card.tsx     # Card de plano
├── pricing-table.tsx    # Tabela de preços
├── cta-button.tsx       # Botões CTA (primary/secondary)
├── badge.tsx            # Badges/pills
└── browser-mockup.tsx   # Mockup de navegador
```

---

*Documento gerado em: 2026-01-25*
