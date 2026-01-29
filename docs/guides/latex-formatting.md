# 📐 Guia de Formatação LaTeX no Aluminify

Este documento descreve como textos e fórmulas matemáticas em LaTeX devem ser formatados e renderizados no Aluminify, especialmente nos módulos de Flashcards e conteúdo educacional.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Delimitadores LaTeX](#delimitadores-latex)
- [Formatação no Backend](#formatação-no-backend)
- [Renderização no Frontend](#renderização-no-frontend)
- [Exemplos de Uso](#exemplos-de-uso)
- [Comandos LaTeX Suportados](#comandos-latex-suportados)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Aluminify utiliza **KaTeX** para renderizar fórmulas matemáticas escritas em LaTeX. Para que as fórmulas sejam renderizadas corretamente, é **essencial** que os textos contenham os delimitadores apropriados.

### Bibliotecas Utilizadas

- **Frontend**: `remark-math` + `rehype-katex` (via componente Markdown)
- **Renderização**: KaTeX (biblioteca JavaScript para renderização de LaTeX)
- **CSS**: `katex/dist/katex.min.css` (importado globalmente)

---

## 🔤 Delimitadores LaTeX

O KaTeX requer delimitadores específicos para identificar e renderizar fórmulas matemáticas:

### Fórmulas Inline (dentro do texto)

Use **um único `$`** no início e no fim:

```latex
A força é calculada por $F = m \cdot a$, onde $m$ é a massa.
```

**Renderiza como:** A força é calculada por F = m · a, onde m é a massa.

### Fórmulas em Bloco (destaque centralizado)

Use **dois `$$`** no início e no fim:

```latex
A fórmula da energia cinética é:

$$E_k = \frac{1}{2} \cdot m \cdot v^2$$
```

**Renderiza como:** Fórmula centralizada e destacada.

---

## 💾 Formatação no Backend

### ⚠️ **REGRAS OBRIGATÓRIAS**

O backend **DEVE** enviar textos com delimitadores LaTeX já incluídos. **NÃO** envie comandos LaTeX sem delimitadores.

### ✅ **Formato Correto**

```json
{
  "pergunta": "O que é a força normal?",
  "resposta": "A força normal é calculada por $N = m \cdot g$, onde $m$ é a massa e $g$ é a aceleração da gravidade."
}
```

### ❌ **Formato Incorreto (NÃO FAZER)**

```json
{
  "pergunta": "O que é a força normal?",
  "resposta": "A força normal é calculada por N = m \cdot g, onde m é a massa e g é a aceleração da gravidade."
}
```

### 📝 **Padrões de Formatação**

#### 1. **Fórmulas Simples Inline**

```latex
A densidade é $\rho = \frac{m}{V}$.
```

#### 2. **Fórmulas com Variáveis com Subscritos**

```latex
A força de atrito estático máxima é $f_s^{max} = \mu_s \cdot N$.
```

#### 3. **Fórmulas Complexas (Bloco)**

```latex
A resistência do ar é modelada pela fórmula:

$$F_{ar} = \frac{1}{2} \cdot \rho \cdot v^2 \cdot C_d \cdot A$$

onde $\rho$ é a densidade do ar, $v$ é a velocidade, $C_d$ é o coeficiente de arrasto e $A$ é a área.
```

#### 4. **Múltiplas Fórmulas no Mesmo Texto**

```latex
A energia cinética é $E_k = \frac{1}{2} \cdot m \cdot v^2$ e a energia potencial é $E_p = m \cdot g \cdot h$.
```

---

## 🎨 Renderização no Frontend

### Componente Markdown

O componente `Markdown` (`app/shared/components/ui/custom/prompt/markdown.tsx`) processa automaticamente:

- **Markdown** (texto formatado)
- **LaTeX/KaTeX** (fórmulas matemáticas)

### Processamento Automático

O frontend possui uma função `normalizeMathDelimiters` que tenta corrigir textos sem delimitadores, mas **não é recomendado depender dela**. O backend deve sempre enviar textos corretamente formatados.

### Estilos para Tema Escuro

Os flashcards utilizam tema escuro, e os estilos CSS garantem que o KaTeX seja renderizado em branco:

```css
.katex {
    color: rgb(255, 255, 255) !important;
}
```

---

## 📚 Exemplos de Uso

### Exemplo 1: Fórmula Simples

**Backend deve enviar:**
```json
{
  "resposta": "A aceleração é $a = \frac{\Delta v}{\Delta t}$."
}
```

**Renderiza como:** A aceleração é a = Δv/Δt.

### Exemplo 2: Fórmula com Múltiplas Variáveis

**Backend deve enviar:**
```json
{
  "resposta": "A segunda lei de Newton é $F = m \cdot a$, onde $F$ é a força, $m$ é a massa e $a$ é a aceleração."
}
```

**Renderiza como:** A segunda lei de Newton é F = m · a, onde F é a força, m é a massa e a é a aceleração.

### Exemplo 3: Fórmula Complexa

**Backend deve enviar:**
```json
{
  "resposta": "A resistência do ar é $F_{ar} = \frac{1}{2} \cdot \rho \cdot v^2 \cdot C_d \cdot A$, onde $\rho$ é a densidade do ar, $v$ é a velocidade do objeto, $C_d$ é o coeficiente de arrasto e $A$ é a área de superfície do objeto."
}
```

**Renderiza como:** Fórmula completa e formatada.

### Exemplo 4: Fórmula em Bloco (Destaque)

**Backend deve enviar:**
```json
{
  "resposta": "A equação de Einstein é:\n\n$$E = m \cdot c^2$$\n\nonde $E$ é a energia, $m$ é a massa e $c$ é a velocidade da luz."
}
```

---

## 🔧 Comandos LaTeX Suportados

### Símbolos Gregos

- `\alpha`, `\beta`, `\gamma`, `\delta`, `\theta`, `\lambda`, `\mu`, `\pi`, `\rho`, `\sigma`, `\phi`, `\omega`
- `\Alpha`, `\Beta`, `\Gamma`, `\Delta`, `\Theta`, `\Lambda`, `\Pi`, `\Sigma`, `\Phi`, `\Omega`

### Frações

```latex
$\frac{numerador}{denominador}$
```

Exemplo: `$\frac{1}{2}$` → ½

### Subscritos e Superscritos

```latex
$C_d$        → Subscrito
$v^2$        → Superscrito
$f_s^{max}$  → Ambos
```

### Operadores Matemáticos

- `\cdot` (multiplicação: ·)
- `\times` (multiplicação: ×)
- `\div` (divisão: ÷)
- `\pm` (mais ou menos: ±)
- `\leq` (menor ou igual: ≤)
- `\geq` (maior ou igual: ≥)
- `\neq` (diferente: ≠)
- `\approx` (aproximadamente: ≈)
- `\equiv` (equivalente: ≡)

### Funções

- `\sin`, `\cos`, `\tan`
- `\log`, `\ln`
- `\sqrt{x}`, `\sqrt[n]{x}`

### Integrais e Somatórias

```latex
$\int_{a}^{b} f(x) dx$
$\sum_{i=1}^{n} x_i$
$\prod_{i=1}^{n} x_i$
```

---

## 🐛 Troubleshooting

### Problema: Fórmulas aparecem em vermelho

**Causa:** Fórmula mal formatada ou delimitadores ausentes.

**Solução:** Verificar se a fórmula está entre `$...$` ou `$$...$$` e se a sintaxe LaTeX está correta.

### Problema: Delimitadores `$` aparecem no texto

**Causa:** Delimitadores duplicados ou mal posicionados.

**Solução:** Verificar se não há `$$$` ou delimitadores soltos no texto.

### Problema: Fórmula não renderiza

**Causa:** 
1. Delimitadores ausentes
2. Sintaxe LaTeX inválida
3. Comando LaTeX não suportado pelo KaTeX

**Solução:**
1. Adicionar delimitadores `$` ou `$$`
2. Verificar sintaxe (chaves balanceadas, etc.)
3. Consultar [documentação do KaTeX](https://katex.org/docs/supported.html)

### Problema: Caracteres extras aparecem após fórmula

**Causa:** Detecção automática de fórmula capturou texto além do necessário.

**Solução:** Garantir que o backend envie fórmulas já delimitadas corretamente.

---

## ✅ Checklist de Formatação

Ao criar ou editar conteúdo com fórmulas matemáticas:

- [ ] Todas as fórmulas estão entre `$...$` (inline) ou `$$...$$` (bloco)
- [ ] Variáveis gregas usam comandos LaTeX (`\rho`, `\theta`, etc.)
- [ ] Subscritos e superscritos estão formatados (`C_d`, `v^2`)
- [ ] Frações usam `\frac{numerador}{denominador}`
- [ ] Operadores matemáticos usam comandos LaTeX (`\cdot`, `\times`, etc.)
- [ ] Texto não-matemático está fora dos delimitadores
- [ ] Não há delimitadores duplicados (`$$$`)
- [ ] Não há delimitadores soltos no final do texto

---

## 📖 Referências

- [Documentação do KaTeX](https://katex.org/docs/supported.html)
- [Lista de Símbolos LaTeX](https://katex.org/docs/supported.html#symbols)
- [Guia de Sintaxe LaTeX](https://www.overleaf.com/learn/latex/Mathematical_expressions)

---

## 🔄 Atualizações

**Última atualização:** Janeiro de 2025

**Versão:** 1.0

**Mantido por:** Equipe de Desenvolvimento Aluminify

---

## 📝 Notas Importantes

1. **O backend é responsável por formatar corretamente** os textos com delimitadores LaTeX antes de enviar ao frontend.

2. **O frontend possui função de normalização** (`normalizeMathDelimiters`) que tenta corrigir textos sem delimitadores, mas esta é uma **medida de segurança** e não deve ser a solução principal.

3. **Teste sempre** a renderização após criar ou editar conteúdo com fórmulas matemáticas.

4. **Em caso de dúvida**, consulte a [documentação oficial do KaTeX](https://katex.org/docs/supported.html) para verificar se um comando específico é suportado.
