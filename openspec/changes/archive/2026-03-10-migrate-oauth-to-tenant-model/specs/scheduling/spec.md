## MODIFIED Requirements

### Requirement: Integration Management
The system SHALL allow tenant administrators to configure meeting link providers (Google Meet, Zoom) at the tenant level. All appointments within the tenant SHALL use the configured integration to generate meeting links automatically.

#### Scenario: Admin configures OAuth app credentials
- **WHEN** a tenant admin navigates to integration settings
- **THEN** they can enter `client_id` and `client_secret` for Google or Zoom
- **AND** the credentials are stored encrypted in `empresa_oauth_credentials`

#### Scenario: Admin connects corporate account via OAuth
- **WHEN** a tenant admin clicks "Conectar" for a configured provider
- **THEN** the system redirects to the provider's OAuth authorization page
- **AND** the `state` parameter contains `empresaId` and `tenantSlug`
- **AND** `professorId` is NOT included in the OAuth flow

#### Scenario: OAuth callback stores tokens at tenant level
- **WHEN** the OAuth callback receives an authorization code
- **THEN** the system exchanges the code for `access_token` and `refresh_token`
- **AND** tokens are encrypted with `pgp_sym_encrypt` using `OAUTH_ENCRYPTION_KEY`
- **AND** tokens are stored in `empresa_oauth_credentials` alongside the app credentials
- **AND** `token_expiry` is recorded

#### Scenario: Meeting link uses tenant integration
- **WHEN** an appointment is confirmed and the tenant has an active OAuth integration
- **THEN** the system fetches the tenant's `access_token` from `empresa_oauth_credentials`
- **AND** creates a meeting (Google Calendar event or Zoom meeting) using that token
- **AND** the generated link is stored in `agendamentos.link_reuniao`

#### Scenario: Admin disconnects integration
- **WHEN** a tenant admin disconnects a provider
- **THEN** `access_token_encrypted`, `refresh_token_encrypted`, and `token_expiry` are cleared
- **AND** `client_id` and `client_secret` MAY be preserved for re-connection
- **AND** future appointments fall back to the professor's default meeting link

#### Scenario: Provider fallback
- **WHEN** meeting link generation fails for the configured provider
- **THEN** the system falls back to the professor's `link_reuniao_padrao` from `agendamento_configuracoes`
- **AND** if no default link exists, the appointment is confirmed without a meeting link

#### Scenario: Integration visibility for professors
- **WHEN** a professor (non-admin) views the integration settings
- **THEN** they can see which providers are connected at the tenant level
- **AND** they CANNOT initiate or disconnect OAuth flows

## REMOVED Requirements

### Requirement: Per-professor OAuth integration
**Reason**: Replaced by tenant-level integration model. The previous design required each professor to individually connect their personal Google/Zoom account via OAuth. The correct model is one corporate account per tenant managed by the admin.
**Migration**: All meeting link generation now uses tenant-level tokens stored in `empresa_oauth_credentials`. The `professor_integracoes` table, associated types (`DbProfessorIntegracao`, `ProfessorIntegracao`), and per-professor OAuth functions (`getIntegracaoProfessor`, `updateIntegracaoProfessor`) are removed entirely.
