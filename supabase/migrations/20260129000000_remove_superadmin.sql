-- Migration: Remove superadmin role entirely
-- Description: Remove all superadmin references from RLS policies, functions, and triggers.
--              Superadmin was never used in production. Cross-tenant admin will be a separate app.
--              The Supabase service role key (Secret) already bypasses RLS.
-- Author: Auto-generated
-- Date: 2026-01-29

BEGIN;

-- ============================================================================
-- SECTION 1: Drop exclusive superadmin-only policies (11 policies)
-- These policies ONLY grant access to superadmin and have no other conditions.
-- ============================================================================

DROP POLICY IF EXISTS "alunos_turmas_superadmin_all" ON public.alunos_turmas;
DROP POLICY IF EXISTS "chat_conversation_history_superadmin_all" ON public.chat_conversation_history;
DROP POLICY IF EXISTS "chat_conversations_superadmin_all" ON public.chat_conversations;
DROP POLICY IF EXISTS "Superadmin gerencia cursos" ON public.cursos;
DROP POLICY IF EXISTS "Superadmin gerencia disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Apenas superadmin pode criar empresas" ON public.empresas;
DROP POLICY IF EXISTS "Apenas superadmin pode deletar empresas" ON public.empresas;
DROP POLICY IF EXISTS "Superadmin gerencia professores" ON public.professores;
DROP POLICY IF EXISTS "professores_disciplinas_superadmin_all" ON public.professores_disciplinas;
DROP POLICY IF EXISTS "Superadmin gerencia segmentos" ON public.segmentos;
DROP POLICY IF EXISTS "turmas_superadmin_all" ON public.turmas;

-- ============================================================================
-- SECTION 2: Drop and recreate mixed policies (policies that have superadmin
--            as one of multiple conditions). Organized by table.
-- ============================================================================

-- --------------------------------------------------------------------------
-- TABLE: agendamento_configuracoes
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Configuracoes visiveis por empresa" ON public.agendamento_configuracoes;
CREATE POLICY "Configuracoes visiveis por empresa"
    ON public.agendamento_configuracoes
    FOR SELECT
    TO public
    USING (
        (empresa_id = get_user_empresa_id())
        OR (professor_id = auth.uid())
    );

DROP POLICY IF EXISTS "Professor gerencia suas configuracoes" ON public.agendamento_configuracoes;
CREATE POLICY "Professor gerencia suas configuracoes"
    ON public.agendamento_configuracoes
    FOR ALL
    TO authenticated
    USING (
        (professor_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        (professor_id = auth.uid())
    );

-- --------------------------------------------------------------------------
-- TABLE: agendamento_disponibilidade
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Disponibilidade visivel por empresa" ON public.agendamento_disponibilidade;
CREATE POLICY "Disponibilidade visivel por empresa"
    ON public.agendamento_disponibilidade
    FOR SELECT
    TO public
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
        OR (professor_id = auth.uid())
    );

DROP POLICY IF EXISTS "Professor gerencia sua disponibilidade" ON public.agendamento_disponibilidade;
CREATE POLICY "Professor gerencia sua disponibilidade"
    ON public.agendamento_disponibilidade
    FOR ALL
    TO authenticated
    USING (
        (professor_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        (professor_id = auth.uid())
    );

-- --------------------------------------------------------------------------
-- TABLE: agendamento_notificacoes
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Notificacoes visiveis por empresa" ON public.agendamento_notificacoes;
CREATE POLICY "Notificacoes visiveis por empresa"
    ON public.agendamento_notificacoes
    FOR SELECT
    TO public
    USING (
        (empresa_id = get_user_empresa_id())
        OR (destinatario_id = auth.uid())
    );

DROP POLICY IF EXISTS "Sistema gerencia notificacoes" ON public.agendamento_notificacoes;
CREATE POLICY "Sistema gerencia notificacoes"
    ON public.agendamento_notificacoes
    FOR ALL
    TO authenticated
    USING (
        (destinatario_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        (empresa_id = get_user_empresa_id())
    );

-- --------------------------------------------------------------------------
-- TABLE: agendamentos
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Agendamentos visiveis por empresa" ON public.agendamentos;
CREATE POLICY "Agendamentos visiveis por empresa"
    ON public.agendamentos
    FOR SELECT
    TO public
    USING (
        (empresa_id = get_user_empresa_id())
        OR (aluno_id = auth.uid())
        OR (professor_id = auth.uid())
    );

DROP POLICY IF EXISTS "Atualizar agendamentos proprios" ON public.agendamentos;
CREATE POLICY "Atualizar agendamentos proprios"
    ON public.agendamentos
    FOR UPDATE
    TO authenticated
    USING (
        (aluno_id = auth.uid())
        OR (professor_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        (aluno_id = auth.uid())
        OR (professor_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "Criar agendamentos na empresa" ON public.agendamentos;
CREATE POLICY "Criar agendamentos na empresa"
    ON public.agendamentos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
    );

-- --------------------------------------------------------------------------
-- TABLE: ai_agents
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Empresa admins can manage agents" ON public.ai_agents;
CREATE POLICY "Empresa admins can manage agents"
    ON public.ai_agents
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM professores
            WHERE professores.id = auth.uid()
            AND professores.empresa_id = ai_agents.empresa_id
            AND professores.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM professores
            WHERE professores.id = auth.uid()
            AND professores.empresa_id = ai_agents.empresa_id
            AND professores.is_admin = true
        )
    );

DROP POLICY IF EXISTS "Users can view active agents from their empresa" ON public.ai_agents;
CREATE POLICY "Users can view active agents from their empresa"
    ON public.ai_agents
    FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND (
            empresa_id IN (
                SELECT p.empresa_id FROM professores p WHERE p.id = auth.uid()
            )
            OR empresa_id IN (
                SELECT c.empresa_id
                FROM alunos_cursos ac
                JOIN cursos c ON ac.curso_id = c.id
                WHERE ac.aluno_id = auth.uid()
            )
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: alunos
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Alunos: delete apenas admin da empresa" ON public.alunos;
CREATE POLICY "Alunos: delete apenas admin da empresa"
    ON public.alunos
    FOR DELETE
    TO authenticated
    USING (
        is_empresa_admin() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "Alunos: insert apenas admin da empresa" ON public.alunos;
CREATE POLICY "Alunos: insert apenas admin da empresa"
    ON public.alunos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_empresa_admin() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "Alunos: select próprio ou admin da empresa" ON public.alunos;
CREATE POLICY "Alunos: select próprio ou admin da empresa"
    ON public.alunos
    FOR SELECT
    TO authenticated
    USING (
        (id = (SELECT auth.uid()))
        OR (is_professor() AND (empresa_id = get_user_empresa_id()))
        OR (is_empresa_admin() AND (empresa_id = get_user_empresa_id()))
    );

DROP POLICY IF EXISTS "Alunos: update próprio ou admin da empresa" ON public.alunos;
CREATE POLICY "Alunos: update próprio ou admin da empresa"
    ON public.alunos
    FOR UPDATE
    TO authenticated
    USING (
        (id = (SELECT auth.uid()))
        OR (is_empresa_admin() AND (empresa_id = get_user_empresa_id()))
    )
    WITH CHECK (
        (id = (SELECT auth.uid()))
        OR (is_empresa_admin() AND (empresa_id = get_user_empresa_id()))
    );

-- --------------------------------------------------------------------------
-- TABLE: alunos_cursos
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins podem remover matriculas de cursos da sua empresa" ON public.alunos_cursos;
CREATE POLICY "Admins podem remover matriculas de cursos da sua empresa"
    ON public.alunos_cursos
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM cursos c
            WHERE c.id = alunos_cursos.curso_id
            AND c.empresa_id = get_user_empresa_id()
            AND is_empresa_admin()
        )
    );

DROP POLICY IF EXISTS "Alunos veem suas matrículas e admins veem matrículas de sua e" ON public.alunos_cursos;
CREATE POLICY "Alunos veem suas matrículas e admins veem matrículas de sua e"
    ON public.alunos_cursos
    FOR SELECT
    TO authenticated
    USING (
        (aluno_id = (SELECT auth.uid()))
        OR (is_empresa_admin() AND EXISTS (
            SELECT 1 FROM cursos
            WHERE cursos.id = alunos_cursos.curso_id
            AND cursos.empresa_id = get_user_empresa_id()
        ))
    );

DROP POLICY IF EXISTS "Apenas admins podem criar matrículas" ON public.alunos_cursos;
CREATE POLICY "Apenas admins podem criar matrículas"
    ON public.alunos_cursos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_empresa_admin() AND EXISTS (
            SELECT 1 FROM cursos
            WHERE cursos.id = alunos_cursos.curso_id
            AND cursos.empresa_id = get_user_empresa_id()
        )
    );

DROP POLICY IF EXISTS "Apenas admins podem deletar matrículas" ON public.alunos_cursos;
CREATE POLICY "Apenas admins podem deletar matrículas"
    ON public.alunos_cursos
    FOR DELETE
    TO authenticated
    USING (
        is_empresa_admin() AND EXISTS (
            SELECT 1 FROM cursos
            WHERE cursos.id = alunos_cursos.curso_id
            AND cursos.empresa_id = get_user_empresa_id()
        )
    );

DROP POLICY IF EXISTS "Usuarios criam matriculas em cursos da empresa" ON public.alunos_cursos;
CREATE POLICY "Usuarios criam matriculas em cursos da empresa"
    ON public.alunos_cursos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM cursos c
            JOIN usuarios u ON u.empresa_id = c.empresa_id
            WHERE c.id = alunos_cursos.curso_id
            AND u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Ver matriculas de alunos" ON public.alunos_cursos;
CREATE POLICY "Ver matriculas de alunos"
    ON public.alunos_cursos
    FOR SELECT
    TO authenticated
    USING (
        (aluno_id = (SELECT auth.uid()))
        OR EXISTS (
            SELECT 1 FROM cursos c
            WHERE c.id = alunos_cursos.curso_id
            AND c.empresa_id = get_user_empresa_id()
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: api_keys
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Atualizar API keys proprias ou superadmin" ON public.api_keys;
CREATE POLICY "Atualizar API keys proprias"
    ON public.api_keys
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Deletar API keys proprias ou superadmin" ON public.api_keys;
CREATE POLICY "Deletar API keys proprias"
    ON public.api_keys
    FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Professores criam API keys" ON public.api_keys;
CREATE POLICY "Professores criam API keys"
    ON public.api_keys
    FOR INSERT
    TO authenticated
    WITH CHECK (is_professor());

DROP POLICY IF EXISTS "Ver API keys proprias ou superadmin" ON public.api_keys;
CREATE POLICY "Ver API keys proprias"
    ON public.api_keys
    FOR SELECT
    TO public
    USING (created_by = auth.uid());

-- --------------------------------------------------------------------------
-- TABLE: atividades
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Atividades visiveis por empresa" ON public.atividades;
CREATE POLICY "Atividades visiveis por empresa"
    ON public.atividades
    FOR SELECT
    TO public
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "atividades_professor_delete" ON public.atividades;
CREATE POLICY "atividades_professor_delete"
    ON public.atividades
    FOR DELETE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "atividades_professor_insert" ON public.atividades;
CREATE POLICY "atividades_professor_insert"
    ON public.atividades
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "atividades_professor_select" ON public.atividades;
CREATE POLICY "atividades_professor_select"
    ON public.atividades
    FOR SELECT
    TO authenticated
    USING (
        (is_professor() AND (empresa_id = get_user_empresa_id()))
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "atividades_professor_update" ON public.atividades;
CREATE POLICY "atividades_professor_update"
    ON public.atividades
    FOR UPDATE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

-- --------------------------------------------------------------------------
-- TABLE: aulas
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Aulas visiveis por empresa" ON public.aulas;
CREATE POLICY "Aulas visiveis por empresa"
    ON public.aulas
    FOR SELECT
    TO authenticated
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "aulas_professor_delete" ON public.aulas;
CREATE POLICY "aulas_professor_delete"
    ON public.aulas
    FOR DELETE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "aulas_professor_insert" ON public.aulas;
CREATE POLICY "aulas_professor_insert"
    ON public.aulas
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "aulas_professor_select" ON public.aulas;
CREATE POLICY "aulas_professor_select"
    ON public.aulas
    FOR SELECT
    TO authenticated
    USING (
        (is_professor() AND (empresa_id = get_user_empresa_id()))
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "aulas_professor_update" ON public.aulas;
CREATE POLICY "aulas_professor_update"
    ON public.aulas
    FOR UPDATE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

-- --------------------------------------------------------------------------
-- TABLE: aulas_concluidas
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Aluno gerencia suas aulas concluidas" ON public.aulas_concluidas;
CREATE POLICY "Aluno gerencia suas aulas concluidas"
    ON public.aulas_concluidas
    FOR ALL
    TO authenticated
    USING (
        (aluno_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        aluno_id = auth.uid()
    );

-- --------------------------------------------------------------------------
-- TABLE: cronograma_itens
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Aluno gerencia itens do seu cronograma" ON public.cronograma_itens;
CREATE POLICY "Aluno gerencia itens do seu cronograma"
    ON public.cronograma_itens
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM cronogramas c
            WHERE c.id = cronograma_itens.cronograma_id
            AND c.aluno_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cronogramas c
            WHERE c.id = cronograma_itens.cronograma_id
            AND c.aluno_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Itens visiveis via cronograma" ON public.cronograma_itens;
CREATE POLICY "Itens visiveis via cronograma"
    ON public.cronograma_itens
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM cronogramas c
            WHERE c.id = cronograma_itens.cronograma_id
            AND (
                c.aluno_id = auth.uid()
                OR c.empresa_id = get_user_empresa_id()
            )
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: cronograma_semanas_dias
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Aluno gerencia semanas dias do cronograma" ON public.cronograma_semanas_dias;
CREATE POLICY "Aluno gerencia semanas dias do cronograma"
    ON public.cronograma_semanas_dias
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM cronogramas c
            WHERE c.id = cronograma_semanas_dias.cronograma_id
            AND c.aluno_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cronogramas c
            WHERE c.id = cronograma_semanas_dias.cronograma_id
            AND c.aluno_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Semanas dias visiveis via cronograma" ON public.cronograma_semanas_dias;
CREATE POLICY "Semanas dias visiveis via cronograma"
    ON public.cronograma_semanas_dias
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM cronogramas c
            WHERE c.id = cronograma_semanas_dias.cronograma_id
            AND (
                c.aluno_id = auth.uid()
                OR c.empresa_id = get_user_empresa_id()
            )
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: cronograma_tempo_estudos
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Aluno gerencia tempo estudos do cronograma" ON public.cronograma_tempo_estudos;
CREATE POLICY "Aluno gerencia tempo estudos do cronograma"
    ON public.cronograma_tempo_estudos
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM cronogramas c
            WHERE c.id = cronograma_tempo_estudos.cronograma_id
            AND c.aluno_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cronogramas c
            WHERE c.id = cronograma_tempo_estudos.cronograma_id
            AND c.aluno_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Tempo estudos visivel via cronograma" ON public.cronograma_tempo_estudos;
CREATE POLICY "Tempo estudos visivel via cronograma"
    ON public.cronograma_tempo_estudos
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM cronogramas c
            WHERE c.id = cronograma_tempo_estudos.cronograma_id
            AND (
                c.aluno_id = auth.uid()
                OR c.empresa_id = get_user_empresa_id()
            )
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: cronogramas
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Aluno gerencia seus cronogramas" ON public.cronogramas;
CREATE POLICY "Aluno gerencia seus cronogramas"
    ON public.cronogramas
    FOR ALL
    TO authenticated
    USING (aluno_id = auth.uid())
    WITH CHECK (aluno_id = auth.uid());

DROP POLICY IF EXISTS "Cronogramas visiveis por empresa" ON public.cronogramas;
CREATE POLICY "Cronogramas visiveis por empresa"
    ON public.cronogramas
    FOR SELECT
    TO public
    USING (
        (aluno_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    );

-- --------------------------------------------------------------------------
-- TABLE: cursos
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins podem criar cursos em sua empresa" ON public.cursos;
CREATE POLICY "Admins podem criar cursos em sua empresa"
    ON public.cursos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (empresa_id = get_user_empresa_id()) AND is_empresa_admin()
    );

DROP POLICY IF EXISTS "Criador ou admin pode atualizar cursos" ON public.cursos;
CREATE POLICY "Criador ou admin pode atualizar cursos"
    ON public.cursos
    FOR UPDATE
    TO authenticated
    USING (
        ((created_by = (SELECT auth.uid())) AND (empresa_id = get_user_empresa_id()))
        OR ((empresa_id = get_user_empresa_id()) AND is_empresa_admin())
    )
    WITH CHECK (
        ((created_by = (SELECT auth.uid())) AND (empresa_id = get_user_empresa_id()))
        OR ((empresa_id = get_user_empresa_id()) AND is_empresa_admin())
    );

DROP POLICY IF EXISTS "Criador ou admin pode deletar cursos" ON public.cursos;
CREATE POLICY "Criador ou admin pode deletar cursos"
    ON public.cursos
    FOR DELETE
    TO authenticated
    USING (
        ((created_by = (SELECT auth.uid())) AND (empresa_id = get_user_empresa_id()))
        OR ((empresa_id = get_user_empresa_id()) AND is_empresa_admin())
    );

DROP POLICY IF EXISTS "Cursos visiveis por empresa" ON public.cursos;
CREATE POLICY "Cursos visiveis por empresa"
    ON public.cursos
    FOR SELECT
    TO authenticated
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
    );

-- --------------------------------------------------------------------------
-- TABLE: cursos_disciplinas
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Relacoes curso-disciplina visiveis por empresa" ON public.cursos_disciplinas;
CREATE POLICY "Relacoes curso-disciplina visiveis por empresa"
    ON public.cursos_disciplinas
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM cursos c
            WHERE c.id = cursos_disciplinas.curso_id
            AND (
                c.empresa_id = get_user_empresa_id()
                OR aluno_matriculado_empresa(c.empresa_id)
            )
        )
    );

DROP POLICY IF EXISTS "Usuarios atualizam relacoes curso-disciplina" ON public.cursos_disciplinas;
CREATE POLICY "Usuarios atualizam relacoes curso-disciplina"
    ON public.cursos_disciplinas
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM cursos c
            JOIN usuarios u ON u.empresa_id = c.empresa_id
            WHERE c.id = cursos_disciplinas.curso_id
            AND u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM cursos c
            JOIN usuarios u ON u.empresa_id = c.empresa_id
            WHERE c.id = cursos_disciplinas.curso_id
            AND u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Usuarios criam relacoes curso-disciplina" ON public.cursos_disciplinas;
CREATE POLICY "Usuarios criam relacoes curso-disciplina"
    ON public.cursos_disciplinas
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM cursos c
            JOIN usuarios u ON u.empresa_id = c.empresa_id
            WHERE c.id = cursos_disciplinas.curso_id
            AND u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Usuarios deletam relacoes curso-disciplina" ON public.cursos_disciplinas;
CREATE POLICY "Usuarios deletam relacoes curso-disciplina"
    ON public.cursos_disciplinas
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM cursos c
            JOIN usuarios u ON u.empresa_id = c.empresa_id
            WHERE c.id = cursos_disciplinas.curso_id
            AND u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: disciplinas
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Disciplinas visiveis por empresa" ON public.disciplinas;
CREATE POLICY "Disciplinas visiveis por empresa"
    ON public.disciplinas
    FOR SELECT
    TO public
    USING (
        (empresa_id = get_user_empresa_id())
        OR EXISTS (
            SELECT 1
            FROM alunos_cursos ac
            JOIN cursos c ON c.id = ac.curso_id
            WHERE ac.aluno_id = auth.uid()
            AND c.empresa_id = disciplinas.empresa_id
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: empresa_admins
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins veem admins de sua empresa" ON public.empresa_admins;
CREATE POLICY "Admins veem admins de sua empresa"
    ON public.empresa_admins
    FOR SELECT
    TO authenticated
    USING (
        is_empresa_admin((SELECT auth.uid()), empresa_id)
    );

DROP POLICY IF EXISTS "Owner ou superadmin adiciona admins" ON public.empresa_admins;
CREATE POLICY "Owner adiciona admins"
    ON public.empresa_admins
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_empresa_owner(empresa_id)
    );

DROP POLICY IF EXISTS "Owner ou superadmin atualiza admins" ON public.empresa_admins;
CREATE POLICY "Owner atualiza admins"
    ON public.empresa_admins
    FOR UPDATE
    TO authenticated
    USING (is_empresa_owner(empresa_id))
    WITH CHECK (is_empresa_owner(empresa_id));

DROP POLICY IF EXISTS "Owner ou superadmin remove admins" ON public.empresa_admins;
CREATE POLICY "Owner remove admins"
    ON public.empresa_admins
    FOR DELETE
    TO authenticated
    USING (is_empresa_owner(empresa_id));

DROP POLICY IF EXISTS "Ver admins da empresa" ON public.empresa_admins;
CREATE POLICY "Ver admins da empresa"
    ON public.empresa_admins
    FOR SELECT
    TO public
    USING (
        (empresa_id = get_user_empresa_id())
        OR (user_id = auth.uid())
    );

-- --------------------------------------------------------------------------
-- TABLE: empresas
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins da empresa ou superadmin podem atualizar" ON public.empresas;
CREATE POLICY "Admins da empresa podem atualizar"
    ON public.empresas
    FOR UPDATE
    TO authenticated
    USING (is_empresa_admin((SELECT auth.uid()), id))
    WITH CHECK (is_empresa_admin((SELECT auth.uid()), id));

DROP POLICY IF EXISTS "Usuários veem apenas sua empresa" ON public.empresas;
CREATE POLICY "Usuários veem apenas sua empresa"
    ON public.empresas
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) IN (
            SELECT usuarios.id
            FROM usuarios
            WHERE usuarios.empresa_id = empresas.id
            AND usuarios.ativo = true
            AND usuarios.deleted_at IS NULL
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: flashcards
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "flashcards_delete_policy" ON public.flashcards;
CREATE POLICY "flashcards_delete_policy"
    ON public.flashcards
    FOR DELETE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "flashcards_insert_policy" ON public.flashcards;
CREATE POLICY "flashcards_insert_policy"
    ON public.flashcards
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "flashcards_select_policy" ON public.flashcards;
CREATE POLICY "flashcards_select_policy"
    ON public.flashcards
    FOR SELECT
    TO authenticated
    USING (
        (is_professor() AND (empresa_id = get_user_empresa_id()))
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "flashcards_update_policy" ON public.flashcards;
CREATE POLICY "flashcards_update_policy"
    ON public.flashcards
    FOR UPDATE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

-- --------------------------------------------------------------------------
-- TABLE: frentes
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Frentes visiveis por empresa" ON public.frentes;
CREATE POLICY "Frentes visiveis por empresa"
    ON public.frentes
    FOR SELECT
    TO authenticated
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "frentes_professor_delete" ON public.frentes;
CREATE POLICY "frentes_professor_delete"
    ON public.frentes
    FOR DELETE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "frentes_professor_insert" ON public.frentes;
CREATE POLICY "frentes_professor_insert"
    ON public.frentes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "frentes_professor_select" ON public.frentes;
CREATE POLICY "frentes_professor_select"
    ON public.frentes
    FOR SELECT
    TO authenticated
    USING (
        (is_professor() AND (empresa_id = get_user_empresa_id()))
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "frentes_professor_update" ON public.frentes;
CREATE POLICY "frentes_professor_update"
    ON public.frentes
    FOR UPDATE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

-- --------------------------------------------------------------------------
-- TABLE: materiais_curso
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Materiais visiveis por empresa" ON public.materiais_curso;
CREATE POLICY "Materiais visiveis por empresa"
    ON public.materiais_curso
    FOR SELECT
    TO public
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "materiais_curso_professor_delete" ON public.materiais_curso;
CREATE POLICY "materiais_curso_professor_delete"
    ON public.materiais_curso
    FOR DELETE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "materiais_curso_professor_insert" ON public.materiais_curso;
CREATE POLICY "materiais_curso_professor_insert"
    ON public.materiais_curso
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "materiais_curso_professor_select" ON public.materiais_curso;
CREATE POLICY "materiais_curso_professor_select"
    ON public.materiais_curso
    FOR SELECT
    TO authenticated
    USING (
        (is_professor() AND (empresa_id = get_user_empresa_id()))
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "materiais_curso_professor_update" ON public.materiais_curso;
CREATE POLICY "materiais_curso_professor_update"
    ON public.materiais_curso
    FOR UPDATE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

-- --------------------------------------------------------------------------
-- TABLE: matriculas
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Matriculas visiveis por empresa" ON public.matriculas;
CREATE POLICY "Matriculas visiveis por empresa"
    ON public.matriculas
    FOR SELECT
    TO public
    USING (
        (aluno_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
        OR EXISTS (
            SELECT 1 FROM cursos c
            WHERE c.id = matriculas.curso_id
            AND c.empresa_id = get_user_empresa_id()
        )
    );

DROP POLICY IF EXISTS "Usuarios atualizam matriculas da empresa" ON public.matriculas;
CREATE POLICY "Usuarios atualizam matriculas da empresa"
    ON public.matriculas
    FOR UPDATE
    TO authenticated
    USING (
        (empresa_id = get_user_empresa_id())
        OR EXISTS (
            SELECT 1
            FROM cursos c
            JOIN usuarios u ON u.empresa_id = c.empresa_id
            WHERE c.id = matriculas.curso_id
            AND u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
        )
    )
    WITH CHECK (
        (empresa_id = get_user_empresa_id())
        OR EXISTS (
            SELECT 1
            FROM cursos c
            JOIN usuarios u ON u.empresa_id = c.empresa_id
            WHERE c.id = matriculas.curso_id
            AND u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Usuarios criam matriculas da empresa" ON public.matriculas;
CREATE POLICY "Usuarios criam matriculas da empresa"
    ON public.matriculas
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM cursos c
            JOIN usuarios u ON u.empresa_id = c.empresa_id
            WHERE c.id = matriculas.curso_id
            AND u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Usuarios deletam matriculas da empresa" ON public.matriculas;
CREATE POLICY "Usuarios deletam matriculas da empresa"
    ON public.matriculas
    FOR DELETE
    TO authenticated
    USING (
        (empresa_id = get_user_empresa_id())
        OR EXISTS (
            SELECT 1
            FROM cursos c
            JOIN usuarios u ON u.empresa_id = c.empresa_id
            WHERE c.id = matriculas.curso_id
            AND u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: modulos
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Modulos visiveis por empresa" ON public.modulos;
CREATE POLICY "Modulos visiveis por empresa"
    ON public.modulos
    FOR SELECT
    TO authenticated
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "modulos_professor_delete" ON public.modulos;
CREATE POLICY "modulos_professor_delete"
    ON public.modulos
    FOR DELETE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "modulos_professor_insert" ON public.modulos;
CREATE POLICY "modulos_professor_insert"
    ON public.modulos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "modulos_professor_select" ON public.modulos;
CREATE POLICY "modulos_professor_select"
    ON public.modulos
    FOR SELECT
    TO authenticated
    USING (
        (is_professor() AND (empresa_id = get_user_empresa_id()))
        OR aluno_matriculado_empresa(empresa_id)
    );

DROP POLICY IF EXISTS "modulos_professor_update" ON public.modulos;
CREATE POLICY "modulos_professor_update"
    ON public.modulos
    FOR UPDATE
    TO authenticated
    USING (
        is_professor() AND (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        is_professor() AND (empresa_id = get_user_empresa_id())
    );

-- --------------------------------------------------------------------------
-- TABLE: papeis
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can create empresa roles" ON public.papeis;
CREATE POLICY "Admins can create empresa roles"
    ON public.papeis
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (empresa_id IS NOT NULL)
        AND is_empresa_admin(auth.uid(), empresa_id)
    );

DROP POLICY IF EXISTS "Admins can delete empresa roles" ON public.papeis;
CREATE POLICY "Admins can delete empresa roles"
    ON public.papeis
    FOR DELETE
    TO authenticated
    USING (
        (is_system = false)
        AND (empresa_id IS NOT NULL)
        AND is_empresa_admin(auth.uid(), empresa_id)
    );

DROP POLICY IF EXISTS "Admins can update empresa roles" ON public.papeis;
CREATE POLICY "Admins can update empresa roles"
    ON public.papeis
    FOR UPDATE
    TO authenticated
    USING (
        (is_system = false)
        AND (empresa_id IS NOT NULL)
        AND is_empresa_admin(auth.uid(), empresa_id)
    );

DROP POLICY IF EXISTS "Empresa roles visible to empresa users" ON public.papeis;
CREATE POLICY "Empresa roles visible to empresa users"
    ON public.papeis
    FOR SELECT
    TO authenticated
    USING (
        (empresa_id IS NOT NULL)
        AND user_belongs_to_empresa(empresa_id)
    );

-- --------------------------------------------------------------------------
-- TABLE: professores
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins podem criar professores em sua empresa" ON public.professores;
CREATE POLICY "Admins podem criar professores em sua empresa"
    ON public.professores
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (empresa_id = get_user_empresa_id()) AND is_empresa_admin()
    );

DROP POLICY IF EXISTS "Professores veem apenas professores da mesma empresa" ON public.professores;
CREATE POLICY "Professores veem apenas professores da mesma empresa"
    ON public.professores
    FOR SELECT
    TO authenticated
    USING (
        (id = (SELECT auth.uid()))
        OR (empresa_id = get_user_empresa_id())
    );

DROP POLICY IF EXISTS "Professores visiveis por empresa" ON public.professores;
CREATE POLICY "Professores visiveis por empresa"
    ON public.professores
    FOR SELECT
    TO authenticated
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
        OR (id = (SELECT auth.uid()))
    );

-- --------------------------------------------------------------------------
-- TABLE: progresso_atividades
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Aluno gerencia seu progresso atividades" ON public.progresso_atividades;
CREATE POLICY "Aluno gerencia seu progresso atividades"
    ON public.progresso_atividades
    FOR ALL
    TO authenticated
    USING (
        (aluno_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        aluno_id = auth.uid()
    );

-- --------------------------------------------------------------------------
-- TABLE: progresso_flashcards
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "progresso_flashcards_aluno_select" ON public.progresso_flashcards;
CREATE POLICY "progresso_flashcards_aluno_select"
    ON public.progresso_flashcards
    FOR SELECT
    TO authenticated
    USING (
        ((aluno_id = auth.uid()) AND (empresa_id = get_user_empresa_id()))
        OR (is_professor() AND (empresa_id = get_user_empresa_id()))
    );

-- --------------------------------------------------------------------------
-- TABLE: regras_atividades
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Professores gerenciam regras da empresa" ON public.regras_atividades;
CREATE POLICY "Professores gerenciam regras da empresa"
    ON public.regras_atividades
    FOR ALL
    TO authenticated
    USING (empresa_id = get_user_empresa_id())
    WITH CHECK (empresa_id = get_user_empresa_id());

DROP POLICY IF EXISTS "Regras visiveis por empresa" ON public.regras_atividades;
CREATE POLICY "Regras visiveis por empresa"
    ON public.regras_atividades
    FOR SELECT
    TO public
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
    );

-- --------------------------------------------------------------------------
-- TABLE: segmentos
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Segmentos visiveis por empresa" ON public.segmentos;
CREATE POLICY "Segmentos visiveis por empresa"
    ON public.segmentos
    FOR SELECT
    TO authenticated
    USING (
        (empresa_id = get_user_empresa_id())
        OR aluno_matriculado_empresa(empresa_id)
    );

-- --------------------------------------------------------------------------
-- TABLE: sessoes_estudo
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Aluno gerencia suas sessoes" ON public.sessoes_estudo;
CREATE POLICY "Aluno gerencia suas sessoes"
    ON public.sessoes_estudo
    FOR ALL
    TO authenticated
    USING (
        (aluno_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    )
    WITH CHECK (
        aluno_id = auth.uid()
    );

DROP POLICY IF EXISTS "Sessoes visiveis por empresa" ON public.sessoes_estudo;
CREATE POLICY "Sessoes visiveis por empresa"
    ON public.sessoes_estudo
    FOR SELECT
    TO public
    USING (
        (aluno_id = auth.uid())
        OR (empresa_id = get_user_empresa_id())
    );

-- --------------------------------------------------------------------------
-- TABLE: tenant_module_visibility
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Empresa admins can manage module visibility" ON public.tenant_module_visibility;
CREATE POLICY "Empresa admins can manage module visibility"
    ON public.tenant_module_visibility
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM professores
            WHERE professores.id = (SELECT auth.uid())
            AND professores.empresa_id = tenant_module_visibility.empresa_id
            AND professores.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM professores
            WHERE professores.id = (SELECT auth.uid())
            AND professores.empresa_id = tenant_module_visibility.empresa_id
            AND professores.is_admin = true
        )
    );

DROP POLICY IF EXISTS "Users can view their empresa module visibility" ON public.tenant_module_visibility;
CREATE POLICY "Users can view their empresa module visibility"
    ON public.tenant_module_visibility
    FOR SELECT
    TO authenticated
    USING (
        empresa_id IN (
            SELECT professores.empresa_id
            FROM professores
            WHERE professores.id = (SELECT auth.uid())
            UNION
            SELECT c.empresa_id
            FROM alunos_cursos ac
            JOIN cursos c ON ac.curso_id = c.id
            WHERE ac.aluno_id = (SELECT auth.uid())
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: tenant_submodule_visibility
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Empresa admins can manage submodule visibility" ON public.tenant_submodule_visibility;
CREATE POLICY "Empresa admins can manage submodule visibility"
    ON public.tenant_submodule_visibility
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM professores
            WHERE professores.id = (SELECT auth.uid())
            AND professores.empresa_id = tenant_submodule_visibility.empresa_id
            AND professores.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM professores
            WHERE professores.id = (SELECT auth.uid())
            AND professores.empresa_id = tenant_submodule_visibility.empresa_id
            AND professores.is_admin = true
        )
    );

DROP POLICY IF EXISTS "Users can view their empresa submodule visibility" ON public.tenant_submodule_visibility;
CREATE POLICY "Users can view their empresa submodule visibility"
    ON public.tenant_submodule_visibility
    FOR SELECT
    TO authenticated
    USING (
        empresa_id IN (
            SELECT professores.empresa_id
            FROM professores
            WHERE professores.id = (SELECT auth.uid())
            UNION
            SELECT c.empresa_id
            FROM alunos_cursos ac
            JOIN cursos c ON ac.curso_id = c.id
            WHERE ac.aluno_id = (SELECT auth.uid())
        )
    );

-- --------------------------------------------------------------------------
-- TABLE: usuarios
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can create users" ON public.usuarios;
CREATE POLICY "Admins can create users"
    ON public.usuarios
    FOR INSERT
    TO authenticated
    WITH CHECK (
        empresa_id = get_auth_user_empresa_id()
    );

DROP POLICY IF EXISTS "Admins can delete users" ON public.usuarios;
CREATE POLICY "Admins can delete users"
    ON public.usuarios
    FOR DELETE
    TO authenticated
    USING (
        empresa_id = get_auth_user_empresa_id()
    );

DROP POLICY IF EXISTS "Admins can update users" ON public.usuarios;
CREATE POLICY "Admins can update users"
    ON public.usuarios
    FOR UPDATE
    TO authenticated
    USING (
        empresa_id = get_auth_user_empresa_id()
    );

DROP POLICY IF EXISTS "Users can view empresa colleagues" ON public.usuarios;
CREATE POLICY "Users can view empresa colleagues"
    ON public.usuarios
    FOR SELECT
    TO authenticated
    USING (
        empresa_id = get_auth_user_empresa_id()
    );

-- --------------------------------------------------------------------------
-- TABLE: usuarios_disciplinas
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can delete assignments" ON public.usuarios_disciplinas;
CREATE POLICY "Admins can delete assignments"
    ON public.usuarios_disciplinas
    FOR DELETE
    TO public
    USING (
        is_empresa_admin(auth.uid(), empresa_id)
    );

DROP POLICY IF EXISTS "Admins can insert assignments" ON public.usuarios_disciplinas;
CREATE POLICY "Admins can insert assignments"
    ON public.usuarios_disciplinas
    FOR INSERT
    TO public
    WITH CHECK (
        is_empresa_admin(auth.uid(), empresa_id)
    );

DROP POLICY IF EXISTS "Admins can update assignments" ON public.usuarios_disciplinas;
CREATE POLICY "Admins can update assignments"
    ON public.usuarios_disciplinas
    FOR UPDATE
    TO public
    USING (
        is_empresa_admin(auth.uid(), empresa_id)
    );

DROP POLICY IF EXISTS "Empresa users can view assignments" ON public.usuarios_disciplinas;
CREATE POLICY "Empresa users can view assignments"
    ON public.usuarios_disciplinas
    FOR SELECT
    TO public
    USING (
        user_belongs_to_empresa(empresa_id)
    );


-- ============================================================================
-- SECTION 3: Update functions that reference superadmin
-- ============================================================================

-- 3a. Update user_belongs_to_empresa() - remove is_superadmin() bypass
CREATE OR REPLACE FUNCTION public.user_belongs_to_empresa(empresa_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
begin
    -- Verifica se o usuario logado pertence a empresa via tabela usuarios
    return exists (
        select 1
        from public.usuarios
        where id = (select auth.uid())
        and empresa_id = user_belongs_to_empresa.empresa_id_param
        and ativo = true
        and deleted_at is null
    );
end;
$function$;

-- 3b. Update handle_new_user() - remove superadmin early return block
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
    user_role text;
    user_role_type text;
    empresa_id_param uuid;
    is_admin_param boolean;
    must_change_password_param boolean;
    papel_id_param uuid;
begin
    -- Tenta ler o papel do usuario
    user_role := new.raw_user_meta_data->>'role';
    user_role_type := new.raw_user_meta_data->>'role_type';

    -- Tenta ler empresa_id do metadata
    if new.raw_user_meta_data->>'empresa_id' is not null then
        empresa_id_param := (new.raw_user_meta_data->>'empresa_id')::uuid;
    end if;

    -- Tenta ler is_admin do metadata
    is_admin_param := coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false);

    -- Tenta ler must_change_password do metadata
    must_change_password_param := coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false);

    if user_role = 'professor' or user_role = 'usuario' then
        -- Validar que empresa_id existe e esta ativa (se fornecido)
        if empresa_id_param is not null then
            if not exists (
                select 1
                from public.empresas
                where id = empresa_id_param
                and ativo = true
            ) then
                raise exception 'Empresa nao encontrada ou inativa: %', empresa_id_param;
            end if;
        end if;

        -- Insert into professores (legacy table)
        insert into public.professores (id, email, nome_completo, empresa_id, is_admin)
        values (
            new.id,
            coalesce(new.email, ''),
            coalesce(
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'name',
                split_part(coalesce(new.email, ''), '@', 1),
                'Novo Professor'
            ),
            empresa_id_param,
            is_admin_param
        )
        on conflict (id) do update
        set
            email = excluded.email,
            nome_completo = coalesce(nullif(professores.nome_completo, ''), excluded.nome_completo),
            empresa_id = coalesce(professores.empresa_id, excluded.empresa_id),
            is_admin = coalesce(professores.is_admin, excluded.is_admin),
            updated_at = now();

        -- Also insert into usuarios table for consistency with UserRoleIdentifierService
        -- Determine papel_id based on role_type or is_admin
        if user_role_type is not null then
            select id into papel_id_param
            from public.papeis
            where tipo = user_role_type and is_system = true
            limit 1;
        elsif is_admin_param = true then
            select id into papel_id_param
            from public.papeis
            where tipo = 'professor_admin' and is_system = true
            limit 1;
        else
            select id into papel_id_param
            from public.papeis
            where tipo = 'professor' and is_system = true
            limit 1;
        end if;

        -- Only insert into usuarios if we have a valid papel_id and empresa_id
        if papel_id_param is not null and empresa_id_param is not null then
            insert into public.usuarios (id, email, nome_completo, empresa_id, papel_id, ativo)
            values (
                new.id,
                coalesce(new.email, ''),
                coalesce(
                    new.raw_user_meta_data->>'full_name',
                    new.raw_user_meta_data->>'name',
                    split_part(coalesce(new.email, ''), '@', 1),
                    'Novo Usuario'
                ),
                empresa_id_param,
                papel_id_param,
                true
            )
            on conflict (id) do update
            set
                email = excluded.email,
                nome_completo = coalesce(nullif(usuarios.nome_completo, ''), excluded.nome_completo),
                empresa_id = coalesce(usuarios.empresa_id, excluded.empresa_id),
                papel_id = coalesce(usuarios.papel_id, excluded.papel_id),
                updated_at = now();
        end if;

        if is_admin_param = true and empresa_id_param is not null then
            insert into public.empresa_admins (empresa_id, user_id, is_owner, permissoes)
            values (empresa_id_param, new.id, false, '{}'::jsonb)
            on conflict (empresa_id, user_id) do nothing;
        end if;
    else
        -- Default: cria como Aluno.
        if empresa_id_param is null then
            raise exception 'empresa_id e obrigatorio para aluno';
        end if;

        if not exists (
            select 1
            from public.empresas
            where id = empresa_id_param
            and ativo = true
        ) then
            raise exception 'Empresa nao encontrada ou inativa: %', empresa_id_param;
        end if;

        insert into public.alunos (id, email, nome_completo, empresa_id, must_change_password)
        values (
            new.id,
            coalesce(new.email, ''),
            coalesce(
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'name',
                split_part(coalesce(new.email, ''), '@', 1),
                'Novo Aluno'
            ),
            empresa_id_param,
            must_change_password_param
        )
        on conflict (id) do update
        set
            email = excluded.email,
            nome_completo = coalesce(nullif(alunos.nome_completo, ''), excluded.nome_completo),
            empresa_id = coalesce(alunos.empresa_id, excluded.empresa_id),
            must_change_password = coalesce(alunos.must_change_password, excluded.must_change_password),
            updated_at = now();
    end if;

    return new;
end;
$function$;


-- ============================================================================
-- SECTION 3c: Fix storage policies referencing is_superadmin()
-- ============================================================================

DROP POLICY IF EXISTS "Empresa admins can delete tenant logos" ON storage.objects;
CREATE POLICY "Empresa admins can delete tenant logos"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'tenant-logos'
        AND EXISTS (
            SELECT 1
            FROM public.usuarios u
            JOIN public.papeis p ON u.papel_id = p.id
            WHERE u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
            AND p.tipo = ANY (ARRAY['admin', 'professor_admin'])
            AND (storage.foldername(objects.name))[1] = u.empresa_id::text
        )
    );

DROP POLICY IF EXISTS "Empresa admins can upload tenant logos" ON storage.objects;
CREATE POLICY "Empresa admins can upload tenant logos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'tenant-logos'
        AND EXISTS (
            SELECT 1
            FROM public.usuarios u
            JOIN public.papeis p ON u.papel_id = p.id
            WHERE u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
            AND p.tipo = ANY (ARRAY['admin', 'professor_admin'])
            AND (storage.foldername(objects.name))[1] = u.empresa_id::text
        )
    );

DROP POLICY IF EXISTS "Empresa admins can update tenant logos" ON storage.objects;
CREATE POLICY "Empresa admins can update tenant logos"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'tenant-logos'
        AND EXISTS (
            SELECT 1
            FROM public.usuarios u
            JOIN public.papeis p ON u.papel_id = p.id
            WHERE u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
            AND p.tipo = ANY (ARRAY['admin', 'professor_admin'])
            AND (storage.foldername(objects.name))[1] = u.empresa_id::text
        )
    )
    WITH CHECK (
        bucket_id = 'tenant-logos'
        AND EXISTS (
            SELECT 1
            FROM public.usuarios u
            JOIN public.papeis p ON u.papel_id = p.id
            WHERE u.id = auth.uid()
            AND u.ativo = true
            AND u.deleted_at IS NULL
            AND p.tipo = ANY (ARRAY['admin', 'professor_admin'])
            AND (storage.foldername(objects.name))[1] = u.empresa_id::text
        )
    );


-- ============================================================================
-- SECTION 4: Drop superadmin functions (after all references removed)
-- ============================================================================

DROP FUNCTION IF EXISTS public.is_superadmin();
DROP FUNCTION IF EXISTS public.is_current_user_superadmin();
DROP FUNCTION IF EXISTS public.check_and_set_first_professor_superadmin(uuid);


-- ============================================================================
-- SECTION 5: Clean up any user metadata with role=superadmin
-- ============================================================================

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'is_superadmin'
WHERE raw_user_meta_data ? 'is_superadmin';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{role}',
    '"usuario"'::jsonb
)
WHERE raw_user_meta_data->>'role' = 'superadmin';


COMMIT;
