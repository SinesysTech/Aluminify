## Why

A plataforma Aluminify já possui documentos legais completos (Termos de Uso v2.0, Política de Privacidade v2.0 e DPA v1.0) em `docs/`, mas não existe nenhum mecanismo para que administradores de tenant aceitem formalmente esses termos. Para conformidade com a LGPD e proteção jurídica da Sinesys, é necessário que o primeiro administrador de cada instituição aceite os termos antes de operar a plataforma, com registro auditável de cada aceite. Além disso, os documentos legais precisam estar acessíveis publicamente na landing page e consultáveis dentro da plataforma.

## What Changes

- **Nova tabela `termos_aceite`**: Registro auditável de cada aceite com usuario_id, empresa_id, tipo de documento, versão, IP, user-agent e timestamp
- **Gate de aceite obrigatório**: Similar ao fluxo `must_change_password` → `/primeiro-acesso`, admins que não aceitaram os termos vigentes são redirecionados para tela de aceite antes de acessar o sistema
- **Checkbox de aceite no cadastro de empresa**: No fluxo `POST /api/empresa/self`, exigir aceite dos 3 documentos legais como parte da criação da empresa
- **Páginas públicas de termos na landing page**: Rotas públicas para visualizar Termos de Uso, Política de Privacidade e DPA, com links no footer
- **Consulta de termos dentro do tenant**: Página acessível por qualquer usuário autenticado para consultar os documentos vigentes
- **Re-aceite em novas versões**: Quando uma nova versão dos documentos for publicada, exigir re-aceite dos admins

## Capabilities

### New Capabilities
- `terms-acceptance`: Aceite obrigatório de termos legais por administradores de tenant, incluindo registro auditável, gate de aceite, páginas públicas e consulta interna

### Modified Capabilities
- `landing-page`: Adição de links para documentos legais no footer e novas rotas públicas para visualização dos termos

## Impact

- **Banco de dados**: Nova tabela `termos_aceite` com RLS policies para isolamento por tenant
- **Auth flow**: Extensão de `requireUser()` ou middleware para verificar aceite de termos vigentes antes de permitir acesso
- **API**: Novos endpoints para registrar aceite e consultar status de aceite
- **Landing page**: Novas rotas públicas (`/termos-de-uso`, `/politica-de-privacidade`, `/dpa`) e links no footer
- **Cadastro de empresa**: Modificação do fluxo de criação em `/api/empresa/self` para incluir aceite
- **UI**: Nova página de gate de aceite, nova página de consulta de termos no tenant
