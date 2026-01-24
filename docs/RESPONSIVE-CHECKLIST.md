# Checklist de Responsividade para Novos Componentes

Use este checklist ao criar ou revisar componentes para garantir que funcionem bem em todos os tamanhos de tela.

## Antes de Começar

- [ ] Definir qual é o caso de uso principal (mobile ou desktop?)
- [ ] Identificar breakpoints relevantes para o componente
- [ ] Verificar se existe um padrão similar no codebase

## Layout

- [ ] **Mobile-first**: Estilos base são para mobile
- [ ] **Breakpoints corretos**: Usar `md:` para tablet, `lg:` para desktop
- [ ] **Flex/Grid responsivo**: `flex-col md:flex-row` ou `grid-cols-1 md:grid-cols-2`
- [ ] **Largura máxima**: Não ultrapassar viewport (`max-w-full` ou `max-w-[calc(100%-2rem)]`)
- [ ] **Overflow**: Conteúdo não causa scroll horizontal indesejado

## Touch Targets

- [ ] **Altura mínima**: Botões e inputs têm `h-11 md:h-9` (44px em mobile)
- [ ] **Área clicável**: Links e ícones têm padding suficiente ou pseudo-elementos
- [ ] **Espaçamento**: Itens de lista têm gap adequado para evitar mis-taps

## Tipografia

- [ ] **Tamanho mínimo**: Texto de corpo ≥ 16px em mobile (`text-base`)
- [ ] **Escala responsiva**: Títulos usam `text-xl md:text-2xl lg:text-3xl`
- [ ] **Line-height**: Blocos de texto têm `leading-relaxed` ou similar

## Tabelas

- [ ] **Visualização alternativa**: Cards em mobile (`block md:hidden`)
- [ ] **Scroll horizontal**: Se necessário, `overflow-x-auto` no container
- [ ] **Colunas essenciais**: Identificar quais colunas mostrar em mobile

## Formulários

- [ ] **Layout de grid**: `grid-cols-1 md:grid-cols-2` para campos
- [ ] **Campos full-width**: Em mobile, todos os inputs ocupam 100%
- [ ] **Labels visíveis**: Não depender apenas de placeholders
- [ ] **Validação**: Mensagens de erro legíveis em mobile

## Modais e Dialogs

- [ ] **Full-screen opcional**: Usar `fullScreenMobile` prop quando apropriado
- [ ] **Max-width**: `max-w-[95vw] md:max-w-lg` para não ultrapassar tela
- [ ] **Botão fechar**: Visível e com área de toque adequada
- [ ] **Scroll interno**: Conteúdo longo tem scroll dentro do modal

## Navegação

- [ ] **Bottom nav**: Não cobrir conteúdo com `pb-bottom-nav` ou `pb-20 md:pb-0`
- [ ] **Menu mobile**: Drawer/sheet em vez de dropdown complexo
- [ ] **Breadcrumbs**: Truncar ou ocultar níveis intermediários em mobile

## Imagens e Mídia

- [ ] **Responsive images**: `max-w-full h-auto` ou `object-cover`
- [ ] **Aspect ratio**: Usar `aspect-video` ou `aspect-square` quando fixo
- [ ] **Lazy loading**: Considerar `loading="lazy"` para performance

## Gráficos

- [ ] **ResponsiveContainer**: Gráficos Recharts dentro de container responsivo
- [ ] **Legendas**: Posicionar abaixo em mobile se necessário
- [ ] **Tooltips**: Ativar por tap, não apenas hover

## Performance Mobile

- [ ] **Bundle size**: Componentes pesados são lazy-loaded
- [ ] **Animações**: Reduzir em `prefers-reduced-motion`
- [ ] **Imagens**: Formatos otimizados (WebP) e tamanhos adequados

## Acessibilidade

- [ ] **Focus visible**: Estados de foco claros para navegação por teclado
- [ ] **Contraste**: Cores legíveis em luz solar
- [ ] **Screen readers**: Labels e aria-labels apropriados
- [ ] **Safe area**: Respeitar `env(safe-area-inset-*)` para notches

## Testes

- [ ] **320px**: Menor largura mobile (iPhone SE)
- [ ] **375px**: iPhone padrão
- [ ] **768px**: Tablet portrait
- [ ] **1024px**: Tablet landscape / Desktop pequeno
- [ ] **Orientação**: Testar portrait e landscape em tablets

---

## Exemplo de Componente Responsivo

```tsx
function ResponsiveCard({ title, description, actions }) {
  return (
    <Card className="w-full">
      <CardContent className="p-4 md:p-6">
        {/* Título com escala responsiva */}
        <h3 className="text-lg md:text-xl font-semibold mb-2">
          {title}
        </h3>

        {/* Descrição com tamanho mínimo legível */}
        <p className="text-base text-muted-foreground mb-4">
          {description}
        </p>

        {/* Ações em coluna (mobile) ou linha (desktop) */}
        <div className="flex flex-col sm:flex-row gap-2">
          {actions}
        </div>
      </CardContent>
    </Card>
  )
}
```

## Recursos

- [Guia Completo de Responsividade](./RESPONSIVE-GUIDE.md)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
