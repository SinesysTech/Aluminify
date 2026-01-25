# Configuração do Extract from PDF no N8N

## ⚠️ Configuração Crítica

### 1. HTTP Request Node (ANTES do Extract from PDF)

**Configurações OBRIGATÓRIAS:**

```
Method: GET
URL: {{ $json.attachments_metadata[0].url }}

Options → Response → Response Format: File
```

**⚠️ IMPORTANTE:** O Response Format **DEVE** ser `File`, não `JSON`!

### 2. Extract from PDF Node

**Configurações:**

```
Binary Property: data
Options → Pages: (deixe vazio para todas as páginas)
Options → Password: (DEIXE VAZIO - não preencha nada!)
```

**⚠️ CRÍTICO:** O campo **Password** deve estar **VAZIO** ou **desabilitado**. Se você preencher qualquer valor (mesmo que seja uma string vazia ou espaço), o N8N tentará usar essa senha e pode gerar o erro "No password given".

### 3. Fluxo Correto

```
Webhook 
  ↓
HTTP Request (Response Format: File) ← CRÍTICO!
  ↓
Extract from PDF (Binary Property: data)
  ↓
Process Text
```

## 🔍 Como Verificar se Está Configurado Corretamente

### Passo 1: Verifique o Output do HTTP Request

Adicione um nó "Code" entre HTTP Request e Extract from PDF:

```javascript
// Verificar se o arquivo binário está presente
const item = $input.item(0);
const binary = item.binary;

console.log('Binary keys:', Object.keys(binary || {}));
console.log('Has data:', !!binary?.data);
console.log('Data type:', typeof binary?.data);
console.log('Data size:', binary?.data?.data?.length || 0);

return item;
```

**Resultado esperado:**
- `Binary keys: ['data']`
- `Has data: true`
- `Data type: object`
- `Data size: > 0` (número de bytes do PDF)

### Passo 2: Teste a URL Manualmente

1. Copie a URL do log do N8N
2. Cole no navegador
3. Deve fazer download do PDF (não mostrar página de login)

## ❌ Erros Comuns e Soluções

### Erro: "No password given"

**Causa:** O campo Password no nó "Extract from PDF" está configurado incorretamente
- ✅ **Solução:** Deixe o campo **Password completamente vazio** (não preencha nada, nem espaços)
- ✅ **Solução:** Se houver uma opção para desabilitar senha, desabilite
- ✅ **Solução:** Verifique nas opções avançadas se há alguma configuração de senha ativa
- ✅ **Solução:** Se o PDF realmente não tem senha, não é necessário preencher nada

**Como verificar:**
1. Abra o nó "Extract from PDF" no N8N
2. Vá até a seção "Options" ou "Advanced"
3. Procure pelo campo "Password" ou "PDF Password"
4. **Deixe completamente vazio** (não coloque espaços, não coloque aspas vazias, não coloque nada)
5. Salve o nó

### Erro: "This operation expects the node's input data to contain a binary file"

**Causa 1:** HTTP Request retornando JSON ao invés de File
- ✅ **Solução:** Mude Response Format para `File` no HTTP Request

**Causa 2:** HTTP Request retornando HTML (página de login)
- ✅ **Solução:** Verifique se a URL está completa com `?token=...`
- ✅ **Solução:** Teste a URL no navegador primeiro

**Causa 3:** Binary Property incorreta
- ✅ **Solução:** No Extract from PDF, use `data` como Binary Property
- ✅ **Solução:** Verifique o output do HTTP Request para ver qual propriedade binária existe

**Causa 4:** Arquivo não é PDF
- ✅ **Solução:** Verifique se o `mimeType` é `application/pdf`
- ✅ **Solução:** Verifique se a URL termina com `.pdf`

## 📋 Checklist de Configuração

- [ ] HTTP Request Method = `GET`
- [ ] HTTP Request URL = URL completa com token
- [ ] HTTP Request Response Format = `File` (não JSON!)
- [ ] Extract from PDF Binary Property = `data`
- [ ] Extract from PDF Password = **VAZIO** (não preencher nada!)
- [ ] URL testada no navegador e funciona
- [ ] Arquivo não expirou (menos de 10 minutos)

## 🔧 Configuração Detalhada do HTTP Request

### Aba "Parameters"
- Deixe vazio (o token já está na URL)

### Aba "Headers"
- Não é necessário, mas pode adicionar:
  ```
  Accept: application/pdf
  ```

### Aba "Options"
- Expandir "Response"
- **Response Format:** Selecionar `File` no dropdown
- **Response:** Deixar padrão

### Aba "Authentication"
- **Nenhuma** (o token já está na URL)

## 📝 Exemplo de Workflow Completo

```
1. Webhook (recebe dados do chat)
   ↓
2. Code (extrai URL do anexo)
   ```javascript
   return {
     url: $json.attachments_metadata[0].url,
     filename: $json.attachments_metadata[0].name
   };
   ```
   ↓
3. HTTP Request
   - Method: GET
   - URL: {{ $json.url }}
   - Response Format: File ⚠️
   ↓
4. Extract from PDF
   - Binary Property: data
   - Password: (DEIXE VAZIO - não preencher!)
   ↓
5. Process Text (usa o texto extraído)
```

## 🆘 Se Ainda Não Funcionar

1. **Adicione logs:** Use nó "Code" para ver o que está chegando
2. **Teste a URL:** Cole no navegador e veja se baixa o PDF
3. **Verifique logs do servidor:** Veja se a requisição está chegando
4. **Verifique versão do N8N:** Versões antigas podem ter sintaxe diferente para binary data








