# Guia de Responsividade Mobile-First

Este documento descreve os padrões e práticas para implementar interfaces responsivas no Aluminify.

## Princípios

1. **Mobile-First**: Estilos base são para mobile, progressivamente aprimorados para telas maiores
2. **Touch-Friendly**: Elementos interativos têm área mínima de 44x44px em mobile
3. **Consistência**: Usar breakpoints e tokens padronizados do Tailwind

## Breakpoints

| Breakpoint | Largura | Uso |
|------------|---------|-----|
| `base` | < 640px | Mobile (padrão) |
| `sm` | ≥ 640px | Mobile grande / Phablet |
| `md` | ≥ 768px | Tablet portrait |
| `lg` | ≥ 1024px | Tablet landscape / Desktop pequeno |
| `xl` | ≥ 1280px | Desktop |
| `2xl` | ≥ 1536px | Desktop grande |

### Hook useBreakpoint

```tsx
import { useBreakpoint } from '@/hooks/use-breakpoint'

function MyComponent() {
  const { isMobile, isTablet, isDesktop, breakpoint, isAbove, isBelow } = useBreakpoint()

  if (isMobile) {
    return <MobileView />
  }

  return <DesktopView />
}
```

## Design Tokens Responsivos

### CSS Variables

```css
/* Mobile (base) */
--space-page-x: 1rem;      /* 16px */
--space-page-y: 1rem;      /* 16px */
--space-section: 0.75rem;  /* 12px */
--space-component: 0.5rem; /* 8px */

/* Tablet (≥768px) */
--space-page-x: 1.5rem;    /* 24px */
--space-page-y: 1.5rem;    /* 24px */

/* Desktop (≥1024px) */
--space-page-x: 2rem;      /* 32px */
--space-page-y: 2rem;      /* 32px */
```

### Classes Utilitárias

| Classe | Descrição |
|--------|-----------|
| `.form-grid` | Grid 1 col mobile, 2 cols tablet+ |
| `.form-grid-3` | Grid 1 col mobile, 2 cols tablet, 3 cols desktop |
| `.form-grid-4` | Grid 1 col mobile, 2 cols tablet, 4 cols desktop |
| `.page-container` | Padding responsivo de página |
| `.section-container` | Espaçamento responsivo de seção |
| `.mobile-only` | Visível apenas em mobile (<768px) |
| `.desktop-only` | Visível apenas em desktop (≥768px) |
| `.pb-bottom-nav` | Padding bottom para compensar bottom nav |

## Padrões de Componentes

### Navegação

```tsx
// Bottom Navigation - visível apenas em mobile
<nav className="md:hidden fixed bottom-0 ...">
  {/* 4-5 itens principais */}
</nav>

// Sidebar - drawer em mobile, fixo em desktop
<Sidebar>
  {/* Fecha automaticamente ao navegar em mobile */}
</Sidebar>
```

### Tabelas Responsivas

```tsx
// Padrão: cards em mobile, tabela em desktop
<>
  {/* Mobile Card View */}
  <div className="block md:hidden space-y-3">
    {data.map(item => (
      <Card key={item.id}>
        <CardContent>
          {/* Informações em formato de card */}
        </CardContent>
      </Card>
    ))}
  </div>

  {/* Desktop Table View */}
  <div className="hidden md:block">
    <Table>
      {/* Tabela tradicional */}
    </Table>
  </div>
</>

// Ou use o componente ResponsiveTable
import { ResponsiveTable } from '@/components/ui/responsive-table'

<ResponsiveTable
  data={users}
  columns={[
    { key: 'name', label: 'Nome', isPrimary: true },
    { key: 'email', label: 'Email', isImportant: true },
  ]}
  getRowKey={(user) => user.id}
  renderActions={(user) => <Button>Editar</Button>}
/>
```

### Formulários

```tsx
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField name="firstName" />
  <FormField name="lastName" />
</div>

// Ou use a classe utilitária
<div className="form-grid">
  <FormField name="firstName" />
  <FormField name="lastName" />
</div>

// Campo que ocupa linha inteira
<div className="form-grid">
  <FormField name="firstName" />
  <FormField name="lastName" />
  <FormField name="bio" className="col-span-full" />
</div>
```

### Modais e Dialogs

```tsx
// Dialog com opção full-screen em mobile
<DialogContent fullScreenMobile>
  {/* Ocupa tela inteira em mobile, centralizado em desktop */}
</DialogContent>

// BottomSheet para seleção em mobile
import { BottomSheet } from '@/components/ui/bottom-sheet'

<BottomSheet
  open={open}
  onOpenChange={setOpen}
  title="Selecione uma opção"
  options={[
    { value: 'opt1', label: 'Opção 1' },
    { value: 'opt2', label: 'Opção 2' },
  ]}
  value={selected}
  onSelect={setSelected}
/>
```

### Botões e Inputs

```tsx
// Tamanhos já são responsivos por padrão
// Mobile: h-11 (44px) | Desktop: h-9 (36px)
<Button>Ação</Button>
<Input placeholder="Digite..." />
<Select>...</Select>
```

### Tipografia Responsiva

```tsx
// Títulos com escala responsiva
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Título Principal
</h1>

// Texto de corpo - mínimo 16px em mobile
<p className="text-base">
  Conteúdo do texto...
</p>
```

### Grids Responsivos

```tsx
// 1 coluna mobile → 2 colunas tablet → 3 colunas desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

// Stats cards responsivos
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Flex Direction Responsiva

```tsx
// Coluna em mobile, linha em desktop
<div className="flex flex-col md:flex-row gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Viewports de Teste

| Dispositivo | Largura | Altura |
|-------------|---------|--------|
| iPhone SE | 320px | 568px |
| iPhone 12/13 | 390px | 844px |
| iPhone 14 Pro Max | 430px | 932px |
| iPad Mini | 768px | 1024px |
| iPad Pro 11" | 834px | 1194px |
| Laptop | 1366px | 768px |
| Desktop | 1920px | 1080px |

## Checklist de Responsividade

Antes de finalizar um componente, verifique:

- [ ] Layout funciona em 320px de largura (menor mobile)
- [ ] Elementos interativos têm área de toque ≥ 44px
- [ ] Texto é legível (mínimo 16px para corpo)
- [ ] Tabelas têm visualização alternativa (cards) em mobile
- [ ] Modais não ultrapassam a viewport
- [ ] Formulários usam 1 coluna em mobile
- [ ] Bottom nav não cobre conteúdo importante
- [ ] Safe area respeitada em iPhones com notch

## Acessibilidade

- Touch targets de 44x44px mínimo
- Contraste adequado para leitura outdoor
- Labels sempre visíveis (não apenas placeholders)
- Foco visível para navegação por teclado
