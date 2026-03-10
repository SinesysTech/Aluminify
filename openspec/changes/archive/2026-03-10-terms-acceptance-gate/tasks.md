## 1. Database e Tipos

- [x] 1.1 Criar migration Supabase com tabela `termos_aceite` (id, usuario_id, empresa_id, tipo_documento, versao, ip_address, user_agent, accepted_at) e RLS policies
- [x] 1.2 Regenerar `database.types.ts` com os novos tipos
- [x] 1.3 Criar tipo `TipoDocumentoLegal` (enum: termos_uso, politica_privacidade, dpa) e constante `TERMOS_VIGENTES` em `app/shared/types/`

## 2. Serviço de Termos

- [x] 2.1 Criar `app/shared/core/services/termos/termos.service.ts` com funções: registrarAceite(), verificarAceiteVigente(), consultarStatusAceite(), consultarHistoricoAceites()
- [x] 2.2 Implementar cache Redis para status de aceite (TTL 30min, invalidação ao aceitar)

## 3. Integração no Auth Flow (Gate)

- [x] 3.1 Estender `getAuthenticatedUser()` ou `requireUser()` para verificar aceite de termos vigentes para admins/owners
- [x] 3.2 Implementar redirect para `/{tenant}/aceite-termos` quando admin não aceitou termos vigentes
- [x] 3.3 Garantir que a rota `/aceite-termos` não caia no gate (evitar loop de redirect)

## 4. API Endpoints

- [x] 4.1 Criar `POST /api/empresa/[empresaId]/termos/aceitar` — registra aceite dos 3 documentos, valida admin, captura IP e user-agent, invalida cache
- [x] 4.2 Criar `GET /api/empresa/[empresaId]/termos/status` — retorna status de aceite por documento para o admin autenticado
- [x] 4.3 Modificar `POST /api/empresa/self` para exigir `termos_aceitos: true` e registrar aceites na criação de empresa

## 5. Páginas Públicas (Landing Page)

- [x] 5.1 Criar componente compartilhado para renderizar Markdown dos documentos legais como HTML (Server Component)
- [x] 5.2 Criar rota `app/(landing-page)/termos-de-uso/page.tsx` renderizando `docs/Aluminify_01_Termos_de_Uso.md`
- [x] 5.3 Criar rota `app/(landing-page)/politica-de-privacidade/page.tsx` renderizando `docs/Aluminify_02_Politica_de_Privacidade.md`
- [x] 5.4 Criar rota `app/(landing-page)/dpa/page.tsx` renderizando `docs/Aluminify_03_DPA_Acordo_Processamento_Dados.md`
- [x] 5.5 Adicionar links para os 3 documentos no footer da landing page (`landing-page.tsx`)

## 6. Página de Aceite de Termos (Gate UI)

- [x] 6.1 Criar rota `app/[tenant]/(modules)/aceite-termos/page.tsx` com layout de aceite
- [x] 6.2 Implementar componente com 3 checkboxes (um por documento), previews colapsáveis dos documentos, e botão "Aceitar e Continuar" (desabilitado até todos marcados)
- [x] 6.3 Integrar submit com endpoint `POST /api/empresa/{empresaId}/termos/aceitar` e redirect para dashboard

## 7. Página de Consulta de Termos (Tenant)

- [x] 7.1 Criar rota `app/[tenant]/(modules)/termos/page.tsx` acessível por qualquer usuário autenticado
- [x] 7.2 Renderizar os 3 documentos em abas ou accordion
- [x] 7.3 Para admins, exibir seção de histórico de aceites do tenant (tabela com data, versão, admin)

## 8. Integração no Cadastro de Empresa

- [x] 8.1 Adicionar checkboxes de aceite de termos no formulário de criação de empresa (frontend)
- [x] 8.2 Validar aceite no frontend (Zod + React Hook Form) antes de enviar

## 9. Testes

- [x] 9.1 Testes unitários para `termos.service.ts` (registrar aceite, verificar vigência, cache)
- [x] 9.2 Testes para endpoints de aceite e status (happy path + permissões)
- [x] 9.3 Teste de integração do gate: admin sem aceite é redirecionado, com aceite passa
