## MODIFIED Requirements

### Requirement: Footer Section
The landing page SHALL include a Footer with navigation links, legal document links, and final CTA.

#### Scenario: Footer displays correctly
- **WHEN** the user scrolls to the Footer
- **THEN** the Footer displays:
  - Final CTA message
  - Links: Documentation, GitHub Repo, Discord Community, Login
  - Legal links: Termos de Uso, Política de Privacidade, DPA
  - Social proof badge: "Powered by Sinesys Intelligence"

#### Scenario: Legal links navigate to public pages
- **WHEN** a user clicks on "Termos de Uso" in the Footer
- **THEN** the user is navigated to `/termos-de-uso`

#### Scenario: Legal links navigate to privacy policy
- **WHEN** a user clicks on "Política de Privacidade" in the Footer
- **THEN** the user is navigated to `/politica-de-privacidade`

#### Scenario: Legal links navigate to DPA
- **WHEN** a user clicks on "DPA" in the Footer
- **THEN** the user is navigated to `/dpa`

## ADDED Requirements

### Requirement: Public terms of use page
O sistema DEVE fornecer uma página pública em `/termos-de-uso` que renderiza o conteúdo de `docs/Aluminify_01_Termos_de_Uso.md` como HTML legível, sem necessidade de autenticação.

#### Scenario: Visitante acessa termos de uso
- **WHEN** um visitante não autenticado acessa `/termos-de-uso`
- **THEN** o conteúdo completo dos Termos de Uso é exibido em formato HTML legível

### Requirement: Public privacy policy page
O sistema DEVE fornecer uma página pública em `/politica-de-privacidade` que renderiza o conteúdo de `docs/Aluminify_02_Politica_de_Privacidade.md` como HTML legível, sem necessidade de autenticação.

#### Scenario: Visitante acessa política de privacidade
- **WHEN** um visitante não autenticado acessa `/politica-de-privacidade`
- **THEN** o conteúdo completo da Política de Privacidade é exibido em formato HTML legível

### Requirement: Public DPA page
O sistema DEVE fornecer uma página pública em `/dpa` que renderiza o conteúdo de `docs/Aluminify_03_DPA_Acordo_Processamento_Dados.md` como HTML legível, sem necessidade de autenticação.

#### Scenario: Visitante acessa DPA
- **WHEN** um visitante não autenticado acessa `/dpa`
- **THEN** o conteúdo completo do DPA é exibido em formato HTML legível
