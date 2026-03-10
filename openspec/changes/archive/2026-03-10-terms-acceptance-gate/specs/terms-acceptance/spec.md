## ADDED Requirements

### Requirement: Tabela de registro de aceite de termos
O sistema DEVE manter uma tabela `termos_aceite` que registra cada aceite individual de documento legal por um administrador de tenant, incluindo: usuario_id, empresa_id, tipo_documento (termos_uso | politica_privacidade | dpa), versao, ip_address, user_agent e accepted_at.

#### Scenario: Registro de aceite persiste corretamente
- **WHEN** um administrador aceita os termos de uso versão "2.0"
- **THEN** um registro é criado em `termos_aceite` com o usuario_id do admin, empresa_id do tenant, tipo_documento "termos_uso", versao "2.0", IP do request, user-agent do navegador e timestamp do aceite

#### Scenario: Isolamento de dados por tenant via RLS
- **WHEN** um administrador do tenant A consulta os aceites
- **THEN** apenas registros onde empresa_id corresponde ao tenant A são retornados

### Requirement: Constantes de versões vigentes dos termos
O sistema DEVE manter um mapa de versões vigentes dos documentos legais como constante TypeScript (`TERMOS_VIGENTES`), contendo a versão atual de cada tipo de documento.

#### Scenario: Versões vigentes são acessíveis no código
- **WHEN** o sistema precisa verificar se um aceite está atualizado
- **THEN** compara a versão aceita com a versão em `TERMOS_VIGENTES` para cada tipo de documento

### Requirement: Gate de aceite obrigatório para administradores
O sistema DEVE bloquear o acesso de administradores (isAdmin ou isOwner) ao sistema quando não houver aceite registrado para todos os 3 documentos legais nas versões vigentes. O admin DEVE ser redirecionado para a página de aceite de termos (`/{tenant}/aceite-termos`).

#### Scenario: Admin sem aceite é redirecionado
- **WHEN** um admin autenticado tenta acessar qualquer página do tenant
- **AND** não possui aceite registrado para todos os termos vigentes
- **THEN** é redirecionado para `/{tenant}/aceite-termos`

#### Scenario: Admin com aceite vigente acessa normalmente
- **WHEN** um admin autenticado tenta acessar qualquer página do tenant
- **AND** possui aceite registrado para todos os 3 documentos nas versões vigentes
- **THEN** o acesso é permitido normalmente

#### Scenario: Usuário não-admin não é afetado pelo gate
- **WHEN** um aluno ou professor (não-admin) tenta acessar o sistema
- **THEN** o acesso é permitido sem verificação de aceite de termos

#### Scenario: Página de aceite é acessível sem gate recursivo
- **WHEN** um admin é redirecionado para `/{tenant}/aceite-termos`
- **THEN** a página de aceite carrega normalmente sem redirecionar novamente

### Requirement: Página de aceite de termos
O sistema DEVE exibir uma página em `/{tenant}/aceite-termos` que apresenta os 3 documentos legais (Termos de Uso, Política de Privacidade e DPA) com checkbox individual para cada um e botão de confirmação. Todos os 3 checkboxes DEVEM estar marcados para habilitar o botão de aceite.

#### Scenario: Página exibe os 3 documentos para aceite
- **WHEN** um admin acessa `/{tenant}/aceite-termos`
- **THEN** a página exibe os 3 documentos legais renderizados com um checkbox para cada e um botão "Aceitar e Continuar" desabilitado

#### Scenario: Botão habilita ao marcar todos os checkboxes
- **WHEN** o admin marca os 3 checkboxes
- **THEN** o botão "Aceitar e Continuar" é habilitado

#### Scenario: Aceite registra e redireciona
- **WHEN** o admin marca os 3 checkboxes e clica em "Aceitar e Continuar"
- **THEN** os 3 aceites são registrados na tabela `termos_aceite` com IP e user-agent
- **AND** o cache de sessão é invalidado
- **AND** o admin é redirecionado para o dashboard do tenant

### Requirement: Aceite durante criação de empresa
O fluxo de criação de empresa (`POST /api/empresa/self`) DEVE exigir aceite dos 3 documentos legais. O frontend DEVE exibir checkboxes com links para cada documento. O backend DEVE registrar os aceites na tabela `termos_aceite` como parte da criação.

#### Scenario: Criação de empresa com aceite
- **WHEN** um professor cria uma empresa via `POST /api/empresa/self` com `termos_aceitos: true`
- **THEN** a empresa é criada e 3 registros de aceite são inseridos na tabela `termos_aceite`

#### Scenario: Criação de empresa rejeitada sem aceite
- **WHEN** um professor tenta criar empresa via `POST /api/empresa/self` sem `termos_aceitos: true`
- **THEN** o request retorna 400 Bad Request com mensagem indicando que os termos devem ser aceitos

### Requirement: Endpoint de aceite de termos
O sistema DEVE fornecer `POST /api/empresa/{empresaId}/termos/aceitar` para registrar aceite de termos por admins de um tenant existente. O endpoint DEVE validar que o usuário é admin do tenant, registrar os 3 aceites e invalidar o cache de sessão.

#### Scenario: Admin aceita termos com sucesso
- **WHEN** um admin envia POST para `/api/empresa/{empresaId}/termos/aceitar`
- **THEN** 3 registros são criados em `termos_aceite` (um por documento)
- **AND** o cache Redis de sessão do admin é invalidado
- **AND** retorna 200 OK

#### Scenario: Não-admin tenta aceitar termos
- **WHEN** um usuário não-admin envia POST para `/api/empresa/{empresaId}/termos/aceitar`
- **THEN** retorna 403 Forbidden

### Requirement: Endpoint de consulta de status de aceite
O sistema DEVE fornecer `GET /api/empresa/{empresaId}/termos/status` que retorna o status de aceite do admin autenticado para cada documento.

#### Scenario: Admin consulta status de aceite
- **WHEN** um admin envia GET para `/api/empresa/{empresaId}/termos/status`
- **THEN** retorna um objeto com cada tipo de documento, indicando se foi aceito, a versão aceita, e se está vigente

### Requirement: Re-aceite em novas versões
Quando a versão de um documento em `TERMOS_VIGENTES` for atualizada, o sistema DEVE exigir re-aceite de todos os admins de todos os tenants que aceitaram a versão anterior.

#### Scenario: Nova versão exige re-aceite
- **WHEN** `TERMOS_VIGENTES.termos_uso` muda de "2.0" para "3.0"
- **AND** um admin que aceitou a versão "2.0" tenta acessar o sistema
- **THEN** o admin é redirecionado para `/{tenant}/aceite-termos` para aceitar a nova versão

### Requirement: Consulta de termos dentro do tenant
O sistema DEVE fornecer uma página em `/{tenant}/termos` acessível por qualquer usuário autenticado que exibe os 3 documentos legais vigentes renderizados em formato legível.

#### Scenario: Usuário consulta termos vigentes
- **WHEN** qualquer usuário autenticado acessa `/{tenant}/termos`
- **THEN** a página exibe os 3 documentos legais (Termos de Uso, Política de Privacidade, DPA) renderizados como HTML

#### Scenario: Admin vê histórico de aceites
- **WHEN** um admin acessa `/{tenant}/termos`
- **THEN** além dos documentos, a página exibe o histórico de aceites do tenant com data, versão e admin que aceitou

### Requirement: Cache de status de aceite
O sistema DEVE cachear o status de aceite de termos no Redis com TTL de 30 minutos, alinhado com o cache de sessão existente. O cache DEVE ser invalidado quando um novo aceite é registrado.

#### Scenario: Verificação usa cache
- **WHEN** o sistema verifica aceite de termos de um admin
- **THEN** consulta primeiro o Redis antes de ir ao banco de dados

#### Scenario: Cache invalidado após aceite
- **WHEN** um admin aceita os termos
- **THEN** o cache de status de aceite daquele admin é invalidado no Redis
