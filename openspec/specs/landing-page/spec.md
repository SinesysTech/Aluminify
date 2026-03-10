# Landing Page Specification

### Requirement: Public Landing Page Access
The system SHALL display a public landing page to unauthenticated users when accessing the root URL.

#### Scenario: Unauthenticated user visits root
- **WHEN** an unauthenticated user visits `/`
- **THEN** the landing page is displayed with the Aluminify value proposition

#### Scenario: Authenticated user visits root
- **WHEN** an authenticated user visits `/`
- **THEN** the user is redirected to their role-specific dashboard

### Requirement: Hero Section
The landing page SHALL display a Hero Section with the main value proposition of Aluminify.

#### Scenario: Hero section displays correctly
- **WHEN** the landing page loads
- **THEN** the Hero section displays:
  - H1: "A infraestrutura invisivel da educacao"
  - H2: Subtitle about Open Source and White Label
  - Primary CTA: "Comecar Agora (Cloud)"
  - Secondary CTA: "Star on GitHub"
  - Version badge

### Requirement: Value Proposition Section
The landing page SHALL display a 3-column grid explaining the key value propositions.

#### Scenario: Value proposition displays three pillars
- **WHEN** the user scrolls to the Value Proposition section
- **THEN** three cards are displayed:
  - Data Sovereignty card
  - White Label Native card
  - Contextual AI (RAG) card

### Requirement: Features Bento Grid
The landing page SHALL display a Bento Grid layout showcasing the main platform features.

#### Scenario: Bento grid displays features
- **WHEN** the user views the Features section
- **THEN** a Bento Grid displays:
  - Large card: Student Area Zen
  - Medium card: Algorithmic Flashcards
  - Medium card: Smart Schedule

### Requirement: Open Source vs Cloud Model Section
The landing page SHALL clearly present the two deployment models: self-hosted (free) and cloud (managed).

#### Scenario: Model section shows two options
- **WHEN** the user views the Model section
- **THEN** two cards are displayed:
  - Community (Self-Hosted) with R$ 0/month and GitHub link
  - Aluminify Cloud with pricing scale and sign-up CTA

### Requirement: Pricing Table
The landing page SHALL display a pricing table for the Cloud plans.

#### Scenario: Pricing table shows all tiers
- **WHEN** the user views the Pricing section
- **THEN** a table displays:
  - Start plan (up to 300 students): R$ 500/month
  - Growth plan (301-500): R$ 500 + R$ 1.50/extra student
  - Scale plan (501-1000): Previous ceiling + R$ 1.00/extra student
  - Enterprise plan (1001+): Custom pricing

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
