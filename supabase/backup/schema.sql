--
-- PostgreSQL database dump
--

\restrict KVQdJl0Q9QBZxdmi7T4WVXsZqrJ1xxAR1rjh14HUKUg9kuN3HinPlRIS4dfvZpe

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: discount_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.discount_type AS ENUM (
    'percentage',
    'fixed'
);


--
-- Name: enum_dificuldade_percebida; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_dificuldade_percebida AS ENUM (
    'Muito Facil',
    'Facil',
    'Medio',
    'Dificil',
    'Muito Dificil'
);


--
-- Name: enum_importancia_modulo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_importancia_modulo AS ENUM (
    'Alta',
    'Media',
    'Baixa',
    'Base'
);


--
-- Name: enum_logo_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_logo_type AS ENUM (
    'login',
    'sidebar',
    'favicon'
);


--
-- Name: enum_modalidade; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_modalidade AS ENUM (
    'EAD',
    'LIVE'
);


--
-- Name: enum_papel_base; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_papel_base AS ENUM (
    'aluno',
    'professor',
    'usuario'
);


--
-- Name: enum_plano_empresa; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_plano_empresa AS ENUM (
    'basico',
    'profissional',
    'enterprise'
);


--
-- Name: enum_status_aluno_turma; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_status_aluno_turma AS ENUM (
    'ativo',
    'concluido',
    'cancelado',
    'trancado'
);


--
-- Name: enum_status_atividade; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_status_atividade AS ENUM (
    'Pendente',
    'Iniciado',
    'Concluido'
);


--
-- Name: enum_tipo_atividade; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tipo_atividade AS ENUM (
    'Nivel_1',
    'Nivel_2',
    'Nivel_3',
    'Nivel_4',
    'Conceituario',
    'Lista_Mista',
    'Simulado_Diagnostico',
    'Simulado_Cumulativo',
    'Simulado_Global',
    'Flashcards',
    'Revisao'
);


--
-- Name: enum_tipo_bloqueio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tipo_bloqueio AS ENUM (
    'feriado',
    'recesso',
    'imprevisto',
    'outro'
);


--
-- Name: enum_tipo_curso; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tipo_curso AS ENUM (
    'Superextensivo',
    'Extensivo',
    'Intensivo',
    'Superintensivo',
    'Revisão'
);


--
-- Name: enum_tipo_material; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tipo_material AS ENUM (
    'Apostila',
    'Lista de Exercícios',
    'Planejamento',
    'Resumo',
    'Gabarito',
    'Outros'
);


--
-- Name: enum_tipo_relatorio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tipo_relatorio AS ENUM (
    'mensal',
    'semanal',
    'customizado'
);


--
-- Name: enum_tipo_servico_agendamento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tipo_servico_agendamento AS ENUM (
    'plantao',
    'mentoria'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'credit_card',
    'debit_card',
    'pix',
    'boleto',
    'bank_transfer',
    'other'
);


--
-- Name: transaction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_status AS ENUM (
    'pending',
    'approved',
    'cancelled',
    'refunded',
    'disputed',
    'chargeback'
);


--
-- Name: user_context_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_context_type AS (
	user_id uuid,
	empresa_id uuid,
	is_admin boolean,
	is_professor boolean,
	is_aluno boolean
);


--
-- Name: TYPE user_context_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.user_context_type IS 'Return type for get_user_context(). Contains user_id, empresa_id, and boolean role flags.';


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: aluno_em_turma(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.aluno_em_turma(p_turma_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM alunos_turmas at
    WHERE at.aluno_id = auth.uid()
      AND at.turma_id = p_turma_id
      AND at.status = 'ativo'
  );
END;
$$;


--
-- Name: aluno_matriculado_empresa(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.aluno_matriculado_empresa(empresa_id_param uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    -- Verifica se o usuário logado está matriculado em algum curso da empresa.
    -- Modelo unificado: alunos_cursos.usuario_id = auth.uid()
    RETURN EXISTS (
        SELECT 1
        FROM public.alunos_cursos ac
        INNER JOIN public.cursos c ON c.id = ac.curso_id
        WHERE ac.usuario_id = (SELECT auth.uid())
        AND c.empresa_id = aluno_matriculado_empresa.empresa_id_param
    );
END;
$$;


--
-- Name: FUNCTION aluno_matriculado_empresa(empresa_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.aluno_matriculado_empresa(empresa_id_param uuid) IS 'Checks if the authenticated user is enrolled in any course belonging to the given empresa. SECURITY DEFINER to avoid RLS recursion when called from RLS policies on alunos_cursos/cursos.';


--
-- Name: autofill_agendamentos_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.autofill_agendamentos_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  IF NEW.empresa_id IS NULL AND NEW.professor_id IS NOT NULL THEN
    SELECT u.empresa_id INTO NEW.empresa_id
    FROM public.usuarios u
    WHERE u.id = NEW.professor_id;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: autofill_api_keys_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.autofill_api_keys_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    IF NEW.empresa_id IS NULL AND NEW.created_by IS NOT NULL THEN
        SELECT u.empresa_id INTO NEW.empresa_id
        FROM public.usuarios u
        WHERE u.id = NEW.created_by
          AND u.deleted_at IS NULL;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: autofill_aulas_concluidas_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.autofill_aulas_concluidas_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    IF NEW.empresa_id IS NULL THEN
        SELECT a.empresa_id INTO NEW.empresa_id
        FROM public.aulas a
        WHERE a.id = NEW.aula_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: autofill_progresso_atividades_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.autofill_progresso_atividades_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    IF NEW.empresa_id IS NULL THEN
        SELECT at.empresa_id INTO NEW.empresa_id
        FROM public.atividades at
        WHERE at.id = NEW.atividade_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: autofill_progresso_flashcards_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.autofill_progresso_flashcards_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    IF NEW.empresa_id IS NULL THEN
        SELECT f.empresa_id INTO NEW.empresa_id
        FROM public.flashcards f
        WHERE f.id = NEW.flashcard_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: autofill_regras_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.autofill_regras_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    IF NEW.empresa_id IS NULL THEN
        SELECT d.empresa_id INTO NEW.empresa_id
        FROM public.disciplinas d
        WHERE d.id = NEW.disciplina_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: autofill_sessoes_estudo_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.autofill_sessoes_estudo_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    IF NEW.empresa_id IS NULL THEN
        SELECT u.empresa_id INTO NEW.empresa_id
        FROM public.usuarios u
        WHERE u.id = NEW.usuario_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: calcular_taxa_comparecimento(uuid, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calcular_taxa_comparecimento(professor_id_param uuid, data_inicio_param date, data_fim_param date) RETURNS numeric
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
declare
    total_confirmados numeric;
    total_concluidos numeric;
    taxa numeric;
begin
    -- Contar agendamentos confirmados
    select count(*)
    into total_confirmados
    from public.agendamentos
    where professor_id = calcular_taxa_comparecimento.professor_id_param
    and status = 'confirmado'
    and date(data_inicio) >= calcular_taxa_comparecimento.data_inicio_param
    and date(data_fim) <= calcular_taxa_comparecimento.data_fim_param;

    -- Contar agendamentos concluídos
    select count(*)
    into total_concluidos
    from public.agendamentos
    where professor_id = calcular_taxa_comparecimento.professor_id_param
    and status = 'concluido'
    and date(data_inicio) >= calcular_taxa_comparecimento.data_inicio_param
    and date(data_fim) <= calcular_taxa_comparecimento.data_fim_param;

    -- Calcular taxa (0 a 1)
    if total_confirmados > 0 then
        taxa := total_concluidos / total_confirmados;
    else
        taxa := 0;
    end if;

    return coalesce(taxa, 0);
end;
$$;


--
-- Name: FUNCTION calcular_taxa_comparecimento(professor_id_param uuid, data_inicio_param date, data_fim_param date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.calcular_taxa_comparecimento(professor_id_param uuid, data_inicio_param date, data_fim_param date) IS 'Calcula a taxa de comparecimento de um professor (concluídos / confirmados) no período especificado. Retorna valor entre 0 e 1.';


--
-- Name: calcular_taxa_ocupacao(uuid, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calcular_taxa_ocupacao(empresa_id_param uuid, data_inicio_param date, data_fim_param date) RETURNS numeric
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
declare
    total_slots numeric;
    slots_ocupados numeric;
    taxa numeric;
begin
    -- Calcular total de slots disponíveis no período
    -- Baseado em agendamento_recorrencia
    select count(*)
    into total_slots
    from public.agendamento_recorrencia ar
    inner join public.professores p on p.id = ar.professor_id
    where p.empresa_id = calcular_taxa_ocupacao.empresa_id_param
    and ar.ativo = true
    and ar.data_inicio <= calcular_taxa_ocupacao.data_fim_param
    and (ar.data_fim is null or ar.data_fim >= calcular_taxa_ocupacao.data_inicio_param);

    -- Calcular slots ocupados (agendamentos confirmados ou concluídos)
    select count(*)
    into slots_ocupados
    from public.agendamentos a
    inner join public.professores p on p.id = a.professor_id
    where p.empresa_id = calcular_taxa_ocupacao.empresa_id_param
    and a.status in ('confirmado', 'concluido')
    and date(a.data_inicio) >= calcular_taxa_ocupacao.data_inicio_param
    and date(a.data_fim) <= calcular_taxa_ocupacao.data_fim_param;

    -- Calcular taxa (0 a 1)
    if total_slots > 0 then
        taxa := slots_ocupados / total_slots;
    else
        taxa := 0;
    end if;

    return coalesce(taxa, 0);
end;
$$;


--
-- Name: FUNCTION calcular_taxa_ocupacao(empresa_id_param uuid, data_inicio_param date, data_fim_param date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.calcular_taxa_ocupacao(empresa_id_param uuid, data_inicio_param date, data_fim_param date) IS 'Calcula a taxa de ocupação de slots de agendamento para uma empresa no período especificado. Retorna valor entre 0 e 1.';


--
-- Name: cascade_usuario_deactivation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cascade_usuario_deactivation() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  -- Only act when user is being deactivated or soft-deleted
  IF (NEW.ativo = false AND OLD.ativo = true)
     OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    
    -- Remove course enrollments
    DELETE FROM public.alunos_cursos
    WHERE usuario_id = NEW.id;

    -- Remove turma enrollments
    DELETE FROM public.alunos_turmas
    WHERE usuario_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: check_no_professor_and_aluno_same_empresa(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_no_professor_and_aluno_same_empresa() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF NEW.papel_base = 'aluno' THEN
    IF EXISTS (
      SELECT 1 FROM public.usuarios_empresas
      WHERE usuario_id = NEW.usuario_id
        AND empresa_id = NEW.empresa_id
        AND papel_base IN ('professor', 'usuario')
        AND ativo = true
        AND deleted_at IS NULL
        AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) THEN
      RAISE EXCEPTION 'Este usuário já é professor ou administrador nesta empresa e não pode ser aluno na mesma instituição.';
    END IF;
  ELSIF NEW.papel_base IN ('professor', 'usuario') THEN
    IF EXISTS (
      SELECT 1 FROM public.usuarios_empresas
      WHERE usuario_id = NEW.usuario_id
        AND empresa_id = NEW.empresa_id
        AND papel_base = 'aluno'
        AND ativo = true
        AND deleted_at IS NULL
        AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) THEN
      RAISE EXCEPTION 'Este usuário já é aluno nesta empresa e não pode ser professor ou administrador na mesma instituição.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: FUNCTION check_no_professor_and_aluno_same_empresa(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_no_professor_and_aluno_same_empresa() IS 'Garante que um usuário não tenha papel professor e aluno na mesma empresa. Professor pode ser aluno em outra empresa.';


--
-- Name: cleanup_tenant_access_log(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_tenant_access_log(days_to_keep integer DEFAULT 90) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.tenant_access_log
    WHERE created_at < now() - (days_to_keep || ' days')::interval;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


--
-- Name: FUNCTION cleanup_tenant_access_log(days_to_keep integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.cleanup_tenant_access_log(days_to_keep integer) IS 'Removes audit log entries older than specified days (default 90). Run periodically via pg_cron.';


--
-- Name: create_bloqueio_and_cancel_conflicts(uuid, uuid, public.enum_tipo_bloqueio, timestamp with time zone, timestamp with time zone, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_bloqueio_and_cancel_conflicts(p_professor_id uuid, p_empresa_id uuid, p_tipo public.enum_tipo_bloqueio, p_data_inicio timestamp with time zone, p_data_fim timestamp with time zone, p_motivo text, p_criado_por uuid) RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_bloqueio_id UUID;
  v_motivo_cancelamento TEXT;
BEGIN
  -- Insert bloqueio
  INSERT INTO agendamento_bloqueios (
    professor_id, empresa_id, tipo, data_inicio, data_fim, motivo, criado_por
  ) VALUES (
    p_professor_id, p_empresa_id, p_tipo, p_data_inicio, p_data_fim, p_motivo, p_criado_por
  ) RETURNING id INTO v_bloqueio_id;
  
  -- Prepare cancellation message
  v_motivo_cancelamento := 'Bloqueio de agenda: ' || COALESCE(p_motivo, 'Sem motivo especificado');
  
  -- Cancel conflicting appointments atomically
  IF p_professor_id IS NOT NULL THEN
    -- Cancel for specific professor
    UPDATE agendamentos
    SET status = 'cancelado',
        motivo_cancelamento = v_motivo_cancelamento,
        cancelado_por = p_criado_por
    WHERE professor_id = p_professor_id
      AND status IN ('pendente', 'confirmado')
      AND data_inicio < p_data_fim
      AND data_fim > p_data_inicio;
  ELSE
    -- Cancel for all professors in empresa
    UPDATE agendamentos
    SET status = 'cancelado',
        motivo_cancelamento = v_motivo_cancelamento,
        cancelado_por = p_criado_por
    WHERE professor_id IN (
        SELECT id FROM usuarios WHERE empresa_id = p_empresa_id
      )
      AND status IN ('pendente', 'confirmado')
      AND data_inicio < p_data_fim
      AND data_fim > p_data_inicio;
  END IF;
  
  RETURN v_bloqueio_id;
END;
$$;


--
-- Name: FUNCTION create_bloqueio_and_cancel_conflicts(p_professor_id uuid, p_empresa_id uuid, p_tipo public.enum_tipo_bloqueio, p_data_inicio timestamp with time zone, p_data_fim timestamp with time zone, p_motivo text, p_criado_por uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_bloqueio_and_cancel_conflicts(p_professor_id uuid, p_empresa_id uuid, p_tipo public.enum_tipo_bloqueio, p_data_inicio timestamp with time zone, p_data_fim timestamp with time zone, p_motivo text, p_criado_por uuid) IS 'Atomically creates a bloqueio and cancels all conflicting appointments to prevent race conditions';


--
-- Name: decrement_plantao_usage(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.decrement_plantao_usage(p_usuario_id uuid, p_empresa_id uuid, p_ano_mes text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_ano_mes text;
BEGIN
    v_ano_mes := COALESCE(p_ano_mes, to_char(now(), 'YYYY-MM'));

    UPDATE public.plantao_uso_mensal
    SET uso_count = GREATEST(uso_count - 1, 0)
    WHERE usuario_id = p_usuario_id
      AND empresa_id = p_empresa_id
      AND ano_mes = v_ano_mes;
END;
$$;


--
-- Name: ensure_single_active_conversation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ensure_single_active_conversation() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Se está marcando como ativa
  IF NEW.is_active = TRUE THEN
    -- Desmarcar todas as outras conversas deste usuário
    UPDATE chat_conversations
    SET is_active = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: gerar_atividades_personalizadas(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.gerar_atividades_personalizadas(p_curso_id uuid, p_frente_id uuid) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
    r_regra RECORD;
    r_modulo RECORD;
    v_contador INTEGER;
    v_total_modulos INTEGER;
    v_titulo_final TEXT;
    v_modulo_inicio INTEGER;
BEGIN
    SELECT count(*) INTO v_total_modulos FROM public.modulos WHERE frente_id = p_frente_id;
    IF v_total_modulos = 0 THEN RETURN; END IF;

    DELETE FROM public.atividades WHERE modulo_id IN (SELECT id FROM public.modulos WHERE frente_id = p_frente_id);

    FOR r_regra IN SELECT * FROM public.regras_atividades WHERE curso_id = p_curso_id LOOP
        v_contador := 0;
        FOR r_modulo IN SELECT * FROM public.modulos WHERE frente_id = p_frente_id ORDER BY numero_modulo ASC LOOP
            v_contador := v_contador + 1;
            IF v_contador >= r_regra.comecar_no_modulo THEN
                IF ((v_contador - r_regra.comecar_no_modulo) % r_regra.frequencia_modulos = 0) THEN
                    IF r_regra.acumulativo THEN
                        -- Se acumulativo_desde_inicio = true, sempre começa do módulo 1
                        -- Se false, usa o intervalo baseado na frequência (comportamento original)
                        IF r_regra.acumulativo_desde_inicio THEN
                            v_modulo_inicio := 1;
                        ELSE
                            v_modulo_inicio := GREATEST(v_contador - r_regra.frequencia_modulos + 1, r_regra.comecar_no_modulo);
                        END IF;
                        
                        IF v_modulo_inicio = v_contador THEN
                            v_titulo_final := r_regra.nome_padrao || ' (Módulo ' || v_contador || ')';
                        ELSE
                            v_titulo_final := r_regra.nome_padrao || ' (Módulos ' || v_modulo_inicio || ' ao ' || v_contador || ')';
                        END IF;
                    ELSE
                        v_titulo_final := r_regra.nome_padrao;
                    END IF;
                    INSERT INTO public.atividades (modulo_id, tipo, titulo, ordem_exibicao) VALUES (r_modulo.id, r_regra.tipo_atividade, v_titulo_final, 10);
                END IF;
            END IF;
            IF r_regra.gerar_no_ultimo AND v_contador = v_total_modulos AND (v_contador < r_regra.comecar_no_modulo OR (v_contador - r_regra.comecar_no_modulo) % r_regra.frequencia_modulos <> 0) THEN
                v_titulo_final := r_regra.nome_padrao || ' (Final)';
                INSERT INTO public.atividades (modulo_id, tipo, titulo, ordem_exibicao) VALUES (r_modulo.id, r_regra.tipo_atividade, v_titulo_final, 99);
            END IF;
        END LOOP;
    END LOOP;
END;
$$;


--
-- Name: get_aluno_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_aluno_empresa_id() RETURNS uuid
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    empresa_id_result uuid;
BEGIN
    -- Try usuarios first
    SELECT u.empresa_id
    INTO empresa_id_result
    FROM public.usuarios u
    WHERE u.id = (SELECT auth.uid())
      AND u.deleted_at IS NULL
    LIMIT 1;

    -- Fallback: get via course enrollment
    IF empresa_id_result IS NULL THEN
        SELECT DISTINCT c.empresa_id
        INTO empresa_id_result
        FROM public.alunos_cursos ac
        JOIN public.cursos c ON c.id = ac.curso_id
        WHERE ac.usuario_id = (SELECT auth.uid())
          AND c.empresa_id IS NOT NULL
        LIMIT 1;
    END IF;

    RETURN empresa_id_result;
END;
$$;


--
-- Name: get_aluno_empresas(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_aluno_empresas() RETURNS TABLE(empresa_id uuid)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT c.empresa_id
    FROM public.alunos_cursos ac
    INNER JOIN public.cursos c ON c.id = ac.curso_id
    WHERE ac.usuario_id = (SELECT auth.uid())
      AND c.empresa_id IS NOT NULL;
END;
$$;


--
-- Name: FUNCTION get_aluno_empresas(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_aluno_empresas() IS 'Returns list of empresas (via course enrollments) for the authenticated student. SECURITY DEFINER to avoid RLS recursion.';


--
-- Name: get_auth_user_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_auth_user_empresa_id() RETURNS uuid
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    empresa_id_result uuid;
BEGIN
    -- Primary lookup: usuarios table
    SELECT u.empresa_id
    INTO empresa_id_result
    FROM public.usuarios u
    WHERE u.id = (SELECT auth.uid())
      AND u.deleted_at IS NULL
    LIMIT 1;

    -- Fallback: professores table
    IF empresa_id_result IS NULL THEN
        SELECT p.empresa_id
        INTO empresa_id_result
        FROM public.professores p
        WHERE p.id = (SELECT auth.uid())
        LIMIT 1;
    END IF;

    RETURN empresa_id_result;
END;
$$;


--
-- Name: get_auth_user_id_by_email(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_auth_user_id_by_email(email text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth', 'pg_temp'
    AS $_$
DECLARE
  user_id uuid;
BEGIN
  -- Validate input
  IF email IS NULL OR btrim(email) = '' THEN
    RETURN NULL;
  END IF;

  -- Use positional argument ($1) to avoid ambiguity with auth.users.email
  SELECT u.id INTO user_id
  FROM auth.users u
  WHERE lower(u.email) = lower($1)
  LIMIT 1;

  RETURN user_id;
END;
$_$;


--
-- Name: FUNCTION get_auth_user_id_by_email(email text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_auth_user_id_by_email(email text) IS 'Securely looks up an auth user ID by email. Used to handle user conflicts efficiently.';


--
-- Name: get_matriculas_aluno(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_matriculas_aluno(p_aluno_id uuid) RETURNS TABLE(curso_id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT m.curso_id
  FROM public.matriculas m
  WHERE m.aluno_id = p_aluno_id
    AND m.ativo = true;
END;
$$;


--
-- Name: get_oauth_credentials(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_oauth_credentials(p_empresa_id uuid, p_provider text, p_encryption_key text) RETURNS TABLE(credential_id uuid, client_id text, client_secret text, access_token text, refresh_token text, token_expiry timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        eoc.id,
        eoc.client_id,
        pgp_sym_decrypt(eoc.client_secret_encrypted, p_encryption_key)::TEXT,
        CASE WHEN eoc.access_token_encrypted IS NOT NULL
             THEN pgp_sym_decrypt(eoc.access_token_encrypted, p_encryption_key)::TEXT
             ELSE NULL END,
        CASE WHEN eoc.refresh_token_encrypted IS NOT NULL
             THEN pgp_sym_decrypt(eoc.refresh_token_encrypted, p_encryption_key)::TEXT
             ELSE NULL END,
        eoc.token_expiry
    FROM public.empresa_oauth_credentials eoc
    WHERE eoc.empresa_id = p_empresa_id
      AND eoc.provider = p_provider
      AND eoc.active = true;
END;
$$;


--
-- Name: get_professor_disciplinas(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_professor_disciplinas() RETURNS uuid[]
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  disciplinas uuid[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT ud.disciplina_id)
  INTO disciplinas
  FROM public.usuarios_disciplinas ud
  WHERE ud.usuario_id = (SELECT auth.uid())
    AND ud.ativo = true;

  RETURN COALESCE(disciplinas, ARRAY[]::uuid[]);
END;
$$;


--
-- Name: FUNCTION get_professor_disciplinas(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_professor_disciplinas() IS 'Retorna array de UUIDs das disciplinas que o professor atual leciona';


--
-- Name: get_student_ids_by_empresa_courses(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_ids_by_empresa_courses(empresa_id_param uuid) RETURNS TABLE(aluno_id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT alunos_cursos.usuario_id
  FROM public.alunos_cursos
  INNER JOIN public.cursos ON cursos.id = alunos_cursos.curso_id
  WHERE cursos.empresa_id = empresa_id_param;
END;
$$;


--
-- Name: FUNCTION get_student_ids_by_empresa_courses(empresa_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_student_ids_by_empresa_courses(empresa_id_param uuid) IS 'Retorna IDs de todos os alunos matriculados em cursos de uma empresa específica. Usado para listagem cross-tenant.';


--
-- Name: get_student_plantao_quota(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_plantao_quota(p_usuario_id uuid, p_empresa_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_course_quota integer;
  v_extra_quota integer;
begin
  -- Get total from courses
  select coalesce(sum(cpq.quota_mensal), 0)
  into v_course_quota
  from alunos_cursos ac
  join curso_plantao_quotas cpq on ac.curso_id = cpq.curso_id
  where ac.usuario_id = p_usuario_id
  and cpq.empresa_id = p_empresa_id;

  -- Get extra quota from user profile
  select coalesce(quota_extra, 0)
  into v_extra_quota
  from usuarios
  where id = p_usuario_id;

  return v_course_quota + v_extra_quota;
end;
$$;


--
-- Name: get_student_plantao_usage(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_student_plantao_usage(p_usuario_id uuid, p_empresa_id uuid, p_ano_mes text DEFAULT NULL::text) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_ano_mes text;
    v_usage integer;
BEGIN
    v_ano_mes := COALESCE(p_ano_mes, to_char(now(), 'YYYY-MM'));

    SELECT COALESCE(uso_count, 0)
    INTO v_usage
    FROM public.plantao_uso_mensal
    WHERE usuario_id = p_usuario_id
      AND empresa_id = p_empresa_id
      AND ano_mes = v_ano_mes;

    RETURN COALESCE(v_usage, 0);
END;
$$;


--
-- Name: get_user_context(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_context() RETURNS public.user_context_type
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    ctx public.user_context_type;
BEGIN
    -- Get authenticated user id (single call to auth.uid())
    ctx.user_id := (SELECT auth.uid());

    -- Fast-path: no authenticated user
    IF ctx.user_id IS NULL THEN
        ctx.empresa_id := NULL;
        ctx.is_admin := false;
        ctx.is_professor := false;
        ctx.is_aluno := false;
        RETURN ctx;
    END IF;

    -- Get empresa_id: try usuarios first, then professores-style lookup
    -- Mirrors get_user_empresa_id() logic but avoids a separate function call
    SELECT u.empresa_id INTO ctx.empresa_id
    FROM public.usuarios u
    WHERE u.id = ctx.user_id
      AND u.deleted_at IS NULL
    LIMIT 1;

    -- Fallback: check usuarios_empresas for active membership
    IF ctx.empresa_id IS NULL THEN
        SELECT ue.empresa_id INTO ctx.empresa_id
        FROM public.usuarios_empresas ue
        WHERE ue.usuario_id = ctx.user_id
          AND ue.ativo = true
          AND ue.deleted_at IS NULL
        LIMIT 1;
    END IF;

    -- Determine roles from usuarios_empresas (single query for all roles)
    SELECT
        COALESCE(bool_or(ue.papel_base = 'professor'), false),
        COALESCE(bool_or(ue.papel_base = 'aluno'), false)
    INTO ctx.is_professor, ctx.is_aluno
    FROM public.usuarios_empresas ue
    WHERE ue.usuario_id = ctx.user_id
      AND ue.ativo = true
      AND ue.deleted_at IS NULL;

    -- Check admin status via is_empresa_admin (already SECURITY DEFINER)
    IF ctx.empresa_id IS NOT NULL THEN
        ctx.is_admin := public.is_empresa_admin(ctx.user_id, ctx.empresa_id);
    ELSE
        ctx.is_admin := false;
    END IF;

    RETURN ctx;
END;
$$;


--
-- Name: FUNCTION get_user_context(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_user_context() IS 'Consolidated user context helper. Returns user_id, empresa_id, and role flags in a single SECURITY DEFINER call. Use this in RLS policies to avoid multiple InitPlans from repeated auth.uid() / get_user_empresa_id() / is_empresa_admin() calls. Marked STABLE so PostgreSQL can cache the result within a single statement/transaction.';


--
-- Name: get_user_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_empresa_id() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    empresa_id_result uuid;
BEGIN
    SELECT empresa_id
    INTO empresa_id_result
    FROM public.usuarios
    WHERE id = (SELECT auth.uid())
    AND deleted_at IS NULL
    LIMIT 1;

    IF empresa_id_result IS NULL THEN
        SELECT ue.empresa_id
        INTO empresa_id_result
        FROM public.usuarios_empresas ue
        WHERE ue.usuario_id = (SELECT auth.uid())
        AND ue.ativo = true
        ORDER BY ue.created_at
        LIMIT 1;
    END IF;

    RETURN empresa_id_result;
END;
$$;


--
-- Name: FUNCTION get_user_empresa_id(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_user_empresa_id() IS 'Retorna empresa_id do usuário logado. Busca primeiro em professores, depois em usuarios.';


--
-- Name: get_user_empresa_ids(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_empresa_ids() RETURNS uuid[]
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    RETURN ARRAY(
        SELECT DISTINCT ue.empresa_id
        FROM public.usuarios_empresas ue
        WHERE ue.usuario_id = (SELECT auth.uid())
          AND ue.ativo = true
          AND ue.deleted_at IS NULL
    );
END;
$$;


--
-- Name: FUNCTION get_user_empresa_ids(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_user_empresa_ids() IS 'Returns array of all empresa_ids the authenticated user is bound to via usuarios_empresas. Supports multi-tenant users.';


--
-- Name: handle_created_by(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_created_by() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Se não foi enviado manualmente, usa o ID do usuário autenticado
    IF NEW.created_by IS NULL THEN
        NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
    user_role text;
    user_role_type text;
    empresa_id_param uuid;
    is_admin_param boolean;
    must_change_password_param boolean;
    papel_id_param uuid;
    tbl_exists boolean;
begin
    user_role := new.raw_user_meta_data->>'role';
    user_role_type := new.raw_user_meta_data->>'role_type';

    if new.raw_user_meta_data->>'empresa_id' is not null then
        empresa_id_param := (new.raw_user_meta_data->>'empresa_id')::uuid;
    end if;

    is_admin_param := coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false);
    must_change_password_param := coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false);

    if user_role = 'professor' or user_role = 'usuario' then
        if empresa_id_param is not null then
            if not exists (
                select 1 from public.empresas
                where id = empresa_id_param and ativo = true
            ) then
                raise exception 'Empresa nao encontrada ou inativa: %', empresa_id_param;
            end if;
        end if;

        select exists (
            select 1 from information_schema.tables
            where table_schema = 'public' and table_name = 'professores'
        ) into tbl_exists;
        if tbl_exists then
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
            on conflict (id) do update set
                email = excluded.email,
                nome_completo = coalesce(nullif(professores.nome_completo, ''), excluded.nome_completo),
                empresa_id = coalesce(professores.empresa_id, excluded.empresa_id),
                is_admin = coalesce(professores.is_admin, excluded.is_admin),
                updated_at = now();
        end if;

        if user_role_type is not null then
            select id into papel_id_param from public.papeis
            where tipo = user_role_type and is_system = true limit 1;
        elsif is_admin_param = true then
            select id into papel_id_param from public.papeis
            where tipo = 'professor_admin' and is_system = true limit 1;
        else
            select id into papel_id_param from public.papeis
            where tipo = 'professor' and is_system = true limit 1;
        end if;

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
            on conflict (id) do update set
                email = excluded.email,
                nome_completo = coalesce(nullif(usuarios.nome_completo, ''), excluded.nome_completo),
                empresa_id = coalesce(usuarios.empresa_id, excluded.empresa_id),
                papel_id = coalesce(usuarios.papel_id, excluded.papel_id),
                updated_at = now();
        end if;

        if is_admin_param = true and empresa_id_param is not null then
            select exists (
                select 1 from information_schema.tables
                where table_schema = 'public' and table_name = 'empresa_admins'
            ) into tbl_exists;
            if tbl_exists then
                insert into public.empresa_admins (empresa_id, user_id, is_owner, permissoes)
                values (empresa_id_param, new.id, false, '{}'::jsonb)
                on conflict (empresa_id, user_id) do nothing;
            end if;
        end if;
    else
        if empresa_id_param is null then
            raise exception 'empresa_id e obrigatorio para aluno';
        end if;

        if not exists (
            select 1 from public.empresas
            where id = empresa_id_param and ativo = true
        ) then
            raise exception 'Empresa nao encontrada ou inativa: %', empresa_id_param;
        end if;

        select exists (
            select 1 from information_schema.tables
            where table_schema = 'public' and table_name = 'alunos'
        ) into tbl_exists;
        if tbl_exists then
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
            on conflict (id) do update set
                email = excluded.email,
                nome_completo = coalesce(nullif(alunos.nome_completo, ''), excluded.nome_completo),
                empresa_id = coalesce(alunos.empresa_id, excluded.empresa_id),
                must_change_password = coalesce(alunos.must_change_password, excluded.must_change_password),
                updated_at = now();
        end if;
    end if;

    return new;
end;
$$;


--
-- Name: FUNCTION handle_new_user(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger em auth.users. Insere em professores/alunos/usuarios conforme role. Se alunos ou professores nao existirem (modelo unificado em usuarios), nao insere nessas tabelas e a aplicacao cria o registro em usuarios.';


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: importar_cronograma_aulas(uuid, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.importar_cronograma_aulas(p_curso_id uuid, p_disciplina_nome text, p_frente_nome text, p_conteudo jsonb) RETURNS TABLE(modulos_importados integer, aulas_importadas integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
declare
  v_disciplina_id uuid;
  v_frente_id uuid;
  v_empresa_id uuid;

  v_modulos_importados int := 0;
  v_aulas_importadas int := 0;
  v_row jsonb;
  v_modulo_numero int;
  v_modulo_nome text;
  v_aula_numero int;
  v_aula_nome text;
  v_tempo int;
  v_prioridade int;
  v_importancia enum_importancia_modulo;
  v_modulo_id uuid;
  v_aula_id uuid;
begin
  -- Validate inputs
  if p_curso_id is null then
    raise exception 'p_curso_id é obrigatório';
  end if;

  if p_disciplina_nome is null or trim(p_disciplina_nome) = '' then
    raise exception 'p_disciplina_nome é obrigatório';
  end if;

  if p_frente_nome is null or trim(p_frente_nome) = '' then
    raise exception 'p_frente_nome é obrigatório';
  end if;

  if p_conteudo is null or jsonb_typeof(p_conteudo) <> 'array' then
    raise exception 'p_conteudo deve ser um array JSON';
  end if;

  -- Verify existence of course and get company ID
  select c.empresa_id into v_empresa_id
  from public.cursos c
  where c.id = p_curso_id
  limit 1;

  if v_empresa_id is null then
    raise exception 'Curso "%" não encontrado ou erro ao buscar empresa_id. Verifique se o curso existe e se você tem permissão.', p_curso_id;
  end if;

  -- Find Discipline (tenant-aware)
  -- Prefer disciplina within the same empresa; allow legacy null-empresa record as fallback.
  select d.id into v_disciplina_id
  from public.disciplinas d
  where unaccent(lower(d.nome)) = unaccent(lower(p_disciplina_nome))
    and (d.empresa_id = v_empresa_id or d.empresa_id is null)
  order by (d.empresa_id is not null) desc
  limit 1;

  if v_disciplina_id is null then
    raise exception 'Disciplina "%" não encontrada para esta empresa. Verifique o nome exato.', p_disciplina_nome;
  end if;

  -- If we matched a legacy/global disciplina (empresa_id null), attach it to the course empresa.
  -- This prevents future ambiguous matches (e.g. "Filosofia").
  begin
    update public.disciplinas
    set empresa_id = v_empresa_id
    where id = v_disciplina_id
      and empresa_id is null;
  exception when others then
    -- If a unique constraint prevents the update (because an empresa-specific disciplina exists),
    -- ignore; we already prefer empresa-specific rows in the select above.
    null;
  end;

  -- Find or Create "Frente"
  select f.id into v_frente_id
  from public.frentes f
  where f.disciplina_id = v_disciplina_id
    and f.curso_id = p_curso_id
    and unaccent(lower(f.nome)) = unaccent(lower(p_frente_nome))
    and (f.empresa_id = v_empresa_id or f.empresa_id is null) -- Handle potentially legacy records
  order by (f.empresa_id is not null) desc -- Prefer the one with matching company
  limit 1;

  if v_frente_id is null then
    insert into public.frentes (disciplina_id, curso_id, nome, empresa_id)
    values (v_disciplina_id, p_curso_id, p_frente_nome, v_empresa_id)
    returning id into v_frente_id;
  else
    -- Fix legacy data if needed (if found record has null company)
    update public.frentes
    set empresa_id = v_empresa_id
    where id = v_frente_id
      and empresa_id is null;
  end if;

  -- Process content
  for v_row in select * from jsonb_array_elements(p_conteudo)
  loop
    -- Extract and Clean data
    v_modulo_numero := coalesce((v_row->>'modulo_numero')::int, null);
    v_modulo_nome   := nullif(trim(v_row->>'modulo_nome'), '');
    v_aula_numero   := coalesce((v_row->>'aula_numero')::int, null);
    v_aula_nome     := nullif(trim(v_row->>'aula_nome'), '');

    -- Skip invalid rows
    if v_modulo_numero is null or v_modulo_nome is null or v_aula_nome is null then
      continue;
    end if;

    -- Clean numeric fields
    v_tempo := nullif((v_row->>'tempo')::int, 0);
    if v_tempo is not null and v_tempo <= 0 then v_tempo := null; end if;

    v_prioridade := nullif((v_row->>'prioridade')::int, 0);
    if v_prioridade is not null and (v_prioridade < 1 or v_prioridade > 5) then v_prioridade := null; end if;

    begin
      v_importancia := (v_row->>'importancia')::enum_importancia_modulo;
    exception when others then
      v_importancia := 'Base';
    end;
    if v_importancia is null then v_importancia := 'Base'; end if;

    -- Modulo Logic
    select m.id into v_modulo_id
    from public.modulos m
    where m.frente_id = v_frente_id
      and m.numero_modulo = v_modulo_numero
      and (m.empresa_id = v_empresa_id or m.empresa_id is null)
    order by (m.empresa_id is not null) desc
    limit 1;

    if v_modulo_id is null then
      insert into public.modulos (frente_id, curso_id, nome, numero_modulo, importancia, empresa_id)
      values (v_frente_id, p_curso_id, v_modulo_nome, v_modulo_numero, v_importancia, v_empresa_id)
      returning id into v_modulo_id;
      v_modulos_importados := v_modulos_importados + 1;
    else
      update public.modulos
      set nome = coalesce(v_modulo_nome, nome),
          importancia = v_importancia,
          curso_id = coalesce(p_curso_id, curso_id),
          empresa_id = coalesce(empresa_id, v_empresa_id)
      where id = v_modulo_id;
    end if;

    -- Aula Logic
    select a.id into v_aula_id
    from public.aulas a
    where a.modulo_id = v_modulo_id
      and a.numero_aula = v_aula_numero
      and (a.empresa_id = v_empresa_id or a.empresa_id is null)
    order by (a.empresa_id is not null) desc
    limit 1;

    if v_aula_id is null then
      insert into public.aulas (
        modulo_id, curso_id, nome, numero_aula,
        tempo_estimado_minutos, prioridade, empresa_id
      )
      values (
        v_modulo_id, p_curso_id, v_aula_nome, v_aula_numero,
        v_tempo, v_prioridade, v_empresa_id
      )
      returning id into v_aula_id;
      v_aulas_importadas := v_aulas_importadas + 1;
    else
      update public.aulas
      set nome = coalesce(v_aula_nome, nome),
          tempo_estimado_minutos = coalesce(v_tempo, tempo_estimado_minutos),
          prioridade = coalesce(v_prioridade, prioridade),
          curso_id = coalesce(p_curso_id, curso_id),
          empresa_id = coalesce(empresa_id, v_empresa_id)
      where id = v_aula_id;
    end if;
  end loop;

  return query select v_modulos_importados, v_aulas_importadas;
end;
$$;


--
-- Name: increment_plantao_usage(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_plantao_usage(p_usuario_id uuid, p_empresa_id uuid, p_ano_mes text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_ano_mes text;
BEGIN
    v_ano_mes := COALESCE(p_ano_mes, to_char(now(), 'YYYY-MM'));

    INSERT INTO public.plantao_uso_mensal (usuario_id, empresa_id, ano_mes, uso_count)
    VALUES (p_usuario_id, p_empresa_id, v_ano_mes, 1)
    ON CONFLICT (usuario_id, empresa_id, ano_mes)
    DO UPDATE SET uso_count = plantao_uso_mensal.uso_count + 1;
END;
$$;


--
-- Name: is_aluno(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_aluno() RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.usuarios_empresas ue
    WHERE ue.usuario_id = (SELECT auth.uid())
      AND ue.papel_base = 'aluno'
      AND ue.ativo = true
      AND ue.deleted_at IS NULL
  );
END;
$$;


--
-- Name: is_empresa_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_empresa_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    current_uid uuid;
    user_empresa_id uuid;
BEGIN
    current_uid := (SELECT auth.uid());
    
    IF current_uid IS NULL THEN
        RETURN false;
    END IF;

    user_empresa_id := public.get_user_empresa_id();
    
    IF user_empresa_id IS NULL THEN
        RETURN false;
    END IF;

    RETURN public.is_empresa_admin(current_uid, user_empresa_id);
END;
$$;


--
-- Name: FUNCTION is_empresa_admin(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.is_empresa_admin() IS 'Verifica se o usuário logado é admin de sua empresa.';


--
-- Name: is_empresa_admin(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_empresa_admin(user_id_param uuid, empresa_id_param uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    -- Verificar se o usuário tem is_admin = true em usuarios_empresas
    RETURN EXISTS (
        SELECT 1
        FROM public.usuarios_empresas ue
        WHERE ue.usuario_id = user_id_param
        AND ue.empresa_id = empresa_id_param
        AND ue.ativo = true
        AND ue.is_admin = true
    );
END;
$$;


--
-- Name: FUNCTION is_empresa_admin(user_id_param uuid, empresa_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.is_empresa_admin(user_id_param uuid, empresa_id_param uuid) IS 'Verifica se um usuário é admin de uma empresa específica.';


--
-- Name: is_empresa_gestor(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_empresa_gestor() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    current_uid uuid;
    user_empresa_id uuid;
BEGIN
    current_uid := (SELECT auth.uid());
    
    IF current_uid IS NULL THEN
        RETURN false;
    END IF;

    user_empresa_id := public.get_user_empresa_id();
    
    IF user_empresa_id IS NULL THEN
        RETURN false;
    END IF;

    -- Verificar se tem is_admin = true OU é papel_base 'usuario' (staff)
    RETURN EXISTS (
        SELECT 1
        FROM public.usuarios_empresas ue
        WHERE ue.usuario_id = current_uid
        AND ue.empresa_id = user_empresa_id
        AND ue.ativo = true
        AND (ue.is_admin = true OR ue.papel_base = 'usuario')
    );
END;
$$;


--
-- Name: is_empresa_owner(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_empresa_owner(empresa_id_param uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.usuarios_empresas ue
    WHERE ue.empresa_id = empresa_id_param
      AND ue.usuario_id = (SELECT auth.uid())
      AND ue.is_owner = true
      AND ue.ativo = true
      AND ue.deleted_at IS NULL
  );
END;
$$;


--
-- Name: is_professor(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_professor() RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.usuarios_empresas ue
    WHERE ue.usuario_id = (SELECT auth.uid())
      AND ue.papel_base = 'professor'
      AND ue.ativo = true
      AND ue.deleted_at IS NULL
  );
END;
$$;


--
-- Name: is_professor_da_disciplina(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_professor_da_disciplina(p_disciplina_id uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.usuarios_disciplinas ud
    WHERE ud.usuario_id = (SELECT auth.uid())
      AND ud.disciplina_id = p_disciplina_id
      AND ud.ativo = true
  );
END;
$$;


--
-- Name: FUNCTION is_professor_da_disciplina(p_disciplina_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.is_professor_da_disciplina(p_disciplina_id uuid) IS 'Verifica se o usuário atual é professor de uma disciplina específica, considerando qualquer nível de escopo';


--
-- Name: is_teaching_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_teaching_user() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    current_uid uuid;
    user_empresa_id uuid;
BEGIN
    current_uid := (SELECT auth.uid());
    
    IF current_uid IS NULL THEN
        RETURN false;
    END IF;

    user_empresa_id := public.get_user_empresa_id();
    
    IF user_empresa_id IS NULL THEN
        RETURN false;
    END IF;

    -- Verificar se tem papel_base = 'professor'
    RETURN EXISTS (
        SELECT 1
        FROM public.usuarios_empresas ue
        WHERE ue.usuario_id = current_uid
        AND ue.empresa_id = user_empresa_id
        AND ue.ativo = true
        AND ue.papel_base = 'professor'
    );
END;
$$;


--
-- Name: FUNCTION is_teaching_user(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.is_teaching_user() IS 'Verifica se o usuário logado possui papel de ensino.';


--
-- Name: is_teaching_user(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_teaching_user(user_id_param uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    IF user_id_param IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.usuarios u
        INNER JOIN public.papeis p ON p.id = u.papel_id
        WHERE u.id = user_id_param
        AND u.ativo = true
        AND u.deleted_at IS NULL
        AND p.tipo IN ('professor', 'professor_admin', 'monitor')
    );
END;
$$;


--
-- Name: FUNCTION is_teaching_user(user_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.is_teaching_user(user_id_param uuid) IS 'Verifica se um usuário possui papel de ensino (professor, professor_admin, monitor).';


--
-- Name: listar_horarios_vagos(uuid, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.listar_horarios_vagos(empresa_id_param uuid, data_inicio_param date, data_fim_param date) RETURNS TABLE(data date, hora_inicio time without time zone, hora_fim time without time zone, professor_id uuid, professor_nome text)
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
begin
    return query
    select
        d.data,
        ar.hora_inicio,
        ar.hora_fim,
        ar.professor_id,
        p.nome_completo as professor_nome
    from generate_series(
        listar_horarios_vagos.data_inicio_param,
        listar_horarios_vagos.data_fim_param,
        interval '1 day'
    ) as d(data)
    cross join public.agendamento_recorrencia ar
    inner join public.professores p on p.id = ar.professor_id
    where p.empresa_id = listar_horarios_vagos.empresa_id_param
    and ar.ativo = true
    and extract(dow from d.data) = ar.dia_semana
    and ar.data_inicio <= d.data
    and (ar.data_fim is null or ar.data_fim >= d.data)
    and not exists (
        select 1
        from public.agendamentos a
        where a.professor_id = ar.professor_id
        and date(a.data_inicio) = d.data
        and a.status != 'cancelado'
    )
    order by d.data, ar.hora_inicio;
end;
$$;


--
-- Name: FUNCTION listar_horarios_vagos(empresa_id_param uuid, data_inicio_param date, data_fim_param date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.listar_horarios_vagos(empresa_id_param uuid, data_inicio_param date, data_fim_param date) IS 'Lista horários vagos (disponíveis mas não agendados) para uma empresa no período especificado.';


--
-- Name: log_tenant_access(text, text, integer, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_tenant_access(p_table_name text, p_operation text, p_row_count integer DEFAULT 1, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    v_empresa_id uuid;
    v_usuario_id uuid;
BEGIN
    v_usuario_id := (SELECT auth.uid());
    IF v_usuario_id IS NULL THEN
        RETURN; -- No auth context, skip logging
    END IF;

    v_empresa_id := public.get_user_empresa_id();
    IF v_empresa_id IS NULL THEN
        RETURN; -- No empresa context, skip logging
    END IF;

    INSERT INTO public.tenant_access_log (
        empresa_id,
        usuario_id,
        table_name,
        operation,
        row_count,
        metadata
    ) VALUES (
        v_empresa_id,
        v_usuario_id,
        p_table_name,
        p_operation,
        p_row_count,
        p_metadata
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Don't let audit logging failures affect the main operation
        RAISE WARNING 'Failed to log tenant access: %', SQLERRM;
END;
$$;


--
-- Name: FUNCTION log_tenant_access(p_table_name text, p_operation text, p_row_count integer, p_metadata jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.log_tenant_access(p_table_name text, p_operation text, p_row_count integer, p_metadata jsonb) IS 'Logs tenant access for audit purposes. Silently fails to avoid affecting main operations.';


--
-- Name: notify_agendamento_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_agendamento_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- On INSERT: Create notification for professor (new appointment request)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
    VALUES (NEW.id, 'criacao', NEW.professor_id);
    RETURN NEW;
  END IF;

  -- On UPDATE: Handle status changes
  IF TG_OP = 'UPDATE' THEN
    -- Status changed to confirmed
    IF OLD.status != 'confirmado' AND NEW.status = 'confirmado' THEN
      INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
      VALUES (NEW.id, 'confirmacao', NEW.aluno_id);
    END IF;

    -- Status changed to cancelled (rejection or cancellation)
    IF OLD.status != 'cancelado' AND NEW.status = 'cancelado' THEN
      -- If cancelled by professor (rejecting a pending), notify student
      IF OLD.status = 'pendente' AND NEW.cancelado_por = NEW.professor_id THEN
        INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
        VALUES (NEW.id, 'rejeicao', NEW.aluno_id);
      -- If cancelled by student, notify professor
      ELSIF NEW.cancelado_por = NEW.aluno_id THEN
        INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
        VALUES (NEW.id, 'cancelamento', NEW.professor_id);
      -- If cancelled by professor (after confirmation), notify student
      ELSIF NEW.cancelado_por = NEW.professor_id THEN
        INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
        VALUES (NEW.id, 'cancelamento', NEW.aluno_id);
      END IF;
    END IF;

    -- Link reuniao updated (notify student)
    IF OLD.link_reuniao IS DISTINCT FROM NEW.link_reuniao AND NEW.link_reuniao IS NOT NULL THEN
      IF NEW.status = 'confirmado' THEN
        INSERT INTO agendamento_notificacoes (agendamento_id, tipo, destinatario_id)
        VALUES (NEW.id, 'alteracao', NEW.aluno_id);
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;


--
-- Name: professor_tem_acesso_frente(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.professor_tem_acesso_frente(p_frente_id uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_disciplina_id uuid;
  v_curso_id uuid;
BEGIN
  -- Buscar hierarquia da frente
  SELECT f.disciplina_id, f.curso_id
  INTO v_disciplina_id, v_curso_id
  FROM public.frentes f
  WHERE f.id = p_frente_id;

  -- Verifica se professor tem acesso por algum nivel de escopo
  RETURN EXISTS (
    SELECT 1
    FROM public.usuarios_disciplinas ud
    WHERE ud.usuario_id = (SELECT auth.uid())
      AND ud.ativo = true
      AND (
        -- Acesso direto a frente
        ud.frente_id = p_frente_id
        -- Ou acesso ao curso (e qualquer frente dele)
        OR (ud.curso_id = v_curso_id AND ud.frente_id IS NULL)
        -- Ou acesso geral a disciplina
        OR (ud.disciplina_id = v_disciplina_id AND ud.curso_id IS NULL AND ud.frente_id IS NULL)
      )
  );
END;
$$;


--
-- Name: FUNCTION professor_tem_acesso_frente(p_frente_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.professor_tem_acesso_frente(p_frente_id uuid) IS 'Verifica se professor tem acesso a uma frente, considerando hierarquia de escopo (disciplina > curso > frente)';


--
-- Name: professor_tem_acesso_modulo(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.professor_tem_acesso_modulo(p_modulo_id uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_frente_id uuid;
  v_disciplina_id uuid;
  v_curso_id uuid;
BEGIN
  -- Buscar hierarquia do modulo
  SELECT m.frente_id, m.curso_id, f.disciplina_id
  INTO v_frente_id, v_curso_id, v_disciplina_id
  FROM public.modulos m
  LEFT JOIN public.frentes f ON f.id = m.frente_id
  WHERE m.id = p_modulo_id;

  -- Verifica se professor tem acesso por algum nivel de escopo
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios_disciplinas ud
    WHERE ud.usuario_id = (SELECT auth.uid())
      AND ud.ativo = true
      AND (
        -- Acesso direto ao modulo
        ud.modulo_id = p_modulo_id
        -- Ou acesso a frente (e qualquer modulo dela)
        OR (ud.frente_id = v_frente_id AND ud.modulo_id IS NULL)
        -- Ou acesso ao curso (e qualquer modulo dele)
        OR (ud.curso_id = v_curso_id AND ud.frente_id IS NULL AND ud.modulo_id IS NULL)
        -- Ou acesso geral a disciplina
        OR (ud.disciplina_id = v_disciplina_id AND ud.curso_id IS NULL AND ud.frente_id IS NULL AND ud.modulo_id IS NULL)
      )
  );
END;
$$;


--
-- Name: FUNCTION professor_tem_acesso_modulo(p_modulo_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.professor_tem_acesso_modulo(p_modulo_id uuid) IS 'Verifica se professor tem acesso a um módulo, considerando hierarquia de escopo (disciplina > curso > frente > módulo)';


--
-- Name: save_oauth_tokens(uuid, text, text, text, text, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.save_oauth_tokens(p_empresa_id uuid, p_provider text, p_access_token text, p_refresh_token text, p_encryption_key text, p_token_expiry timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    UPDATE public.empresa_oauth_credentials
    SET
        access_token_encrypted = CASE WHEN p_access_token IS NOT NULL
            THEN pgp_sym_encrypt(p_access_token, p_encryption_key)
            ELSE NULL END,
        refresh_token_encrypted = CASE WHEN p_refresh_token IS NOT NULL
            THEN pgp_sym_encrypt(p_refresh_token, p_encryption_key)
            ELSE NULL END,
        token_expiry = p_token_expiry,
        updated_at = now()
    WHERE empresa_id = p_empresa_id
      AND provider = p_provider
      AND active = true;

    RETURN FOUND;
END;
$$;


--
-- Name: set_chat_conversation_history_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_chat_conversation_history_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: set_matricula_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_matricula_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    IF NEW.empresa_id IS NULL AND NEW.curso_id IS NOT NULL THEN
        SELECT empresa_id INTO NEW.empresa_id
        FROM public.cursos
        WHERE id = NEW.curso_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: set_modulo_curso_id_from_frente(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_modulo_curso_id_from_frente() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Se curso_id não foi fornecido, buscar da frente
  IF NEW.curso_id IS NULL AND NEW.frente_id IS NOT NULL THEN
    SELECT curso_id INTO NEW.curso_id
    FROM public.frentes
    WHERE id = NEW.frente_id;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: FUNCTION set_modulo_curso_id_from_frente(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.set_modulo_curso_id_from_frente() IS 'Automatically sets curso_id from the associated frente when a module is created or updated without curso_id';


--
-- Name: sync_aluno_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_aluno_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    UPDATE public.usuarios
    SET empresa_id = (
        SELECT c.empresa_id
        FROM public.cursos c
        WHERE c.id = NEW.curso_id
    )
    WHERE id = NEW.usuario_id
    AND empresa_id IS NULL;

    RETURN NEW;
END;
$$;


--
-- Name: FUNCTION sync_aluno_empresa_id(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.sync_aluno_empresa_id() IS 'Trigger em alunos_cursos. Ao inserir, atualiza usuarios.empresa_id do usuario quando NULL, usando empresa_id do curso.';


--
-- Name: sync_aulas_tempo_estimado(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_aulas_tempo_estimado() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  minutes_from_interval integer;
BEGIN
  -- If interval provided, it wins; compute minutes from it (ARREDONDA PRA CIMA)
  IF NEW.tempo_estimado_interval IS NOT NULL THEN
    minutes_from_interval := GREATEST(1, CEIL(EXTRACT(EPOCH FROM NEW.tempo_estimado_interval) / 60.0)::int);
    NEW.tempo_estimado_minutos := minutes_from_interval;
    RETURN NEW;
  END IF;

  -- Otherwise, if minutes provided, compute interval
  IF NEW.tempo_estimado_minutos IS NOT NULL THEN
    NEW.tempo_estimado_interval := make_interval(mins => NEW.tempo_estimado_minutos);
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: update_subscription_plans_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_subscription_plans_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_subscriptions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_subscriptions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_superadmins_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_superadmins_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: upsert_oauth_credential(uuid, text, text, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.upsert_oauth_credential(p_empresa_id uuid, p_provider text, p_client_id text, p_client_secret text, p_encryption_key text, p_configured_by uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO public.empresa_oauth_credentials (
        empresa_id, provider, client_id, client_secret_encrypted, configured_by
    )
    VALUES (
        p_empresa_id,
        p_provider,
        p_client_id,
        pgp_sym_encrypt(p_client_secret, p_encryption_key),
        p_configured_by
    )
    ON CONFLICT (empresa_id, provider)
    DO UPDATE SET
        client_id = EXCLUDED.client_id,
        client_secret_encrypted = EXCLUDED.client_secret_encrypted,
        configured_by = EXCLUDED.configured_by,
        active = true,
        updated_at = now()
    RETURNING id INTO result_id;

    RETURN result_id;
END;
$$;


--
-- Name: upsert_oauth_credential(uuid, text, text, text, text, uuid, text, text, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.upsert_oauth_credential(p_empresa_id uuid, p_provider text, p_client_id text, p_client_secret text, p_encryption_key text, p_configured_by uuid DEFAULT NULL::uuid, p_access_token text DEFAULT NULL::text, p_refresh_token text DEFAULT NULL::text, p_token_expiry timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO public.empresa_oauth_credentials (
        empresa_id, provider, client_id, client_secret_encrypted,
        configured_by, access_token_encrypted, refresh_token_encrypted, token_expiry
    )
    VALUES (
        p_empresa_id,
        p_provider,
        p_client_id,
        pgp_sym_encrypt(p_client_secret, p_encryption_key),
        p_configured_by,
        CASE WHEN p_access_token IS NOT NULL
             THEN pgp_sym_encrypt(p_access_token, p_encryption_key)
             ELSE NULL END,
        CASE WHEN p_refresh_token IS NOT NULL
             THEN pgp_sym_encrypt(p_refresh_token, p_encryption_key)
             ELSE NULL END,
        p_token_expiry
    )
    ON CONFLICT (empresa_id, provider)
    DO UPDATE SET
        client_id = EXCLUDED.client_id,
        client_secret_encrypted = EXCLUDED.client_secret_encrypted,
        configured_by = EXCLUDED.configured_by,
        access_token_encrypted = EXCLUDED.access_token_encrypted,
        refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
        token_expiry = EXCLUDED.token_expiry,
        active = true,
        updated_at = now()
    RETURNING id INTO result_id;

    RETURN result_id;
END;
$$;


--
-- Name: user_belongs_to_empresa(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_belongs_to_empresa(empresa_id_param uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    -- Check via unified usuarios table
    RETURN EXISTS (
        SELECT 1
        FROM public.usuarios u
        WHERE u.id = (SELECT auth.uid())
          AND u.empresa_id = user_belongs_to_empresa.empresa_id_param
          AND u.ativo = true
          AND u.deleted_at IS NULL
    )
    OR EXISTS (
        -- Check via usuarios_empresas binding
        SELECT 1
        FROM public.usuarios_empresas ue
        WHERE ue.usuario_id = (SELECT auth.uid())
          AND ue.empresa_id = user_belongs_to_empresa.empresa_id_param
          AND ue.ativo = true
          AND ue.deleted_at IS NULL
    );
END;
$$;


--
-- Name: FUNCTION user_belongs_to_empresa(empresa_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.user_belongs_to_empresa(empresa_id_param uuid) IS 'Verifica se o usuário logado pertence à empresa especificada. Superadmin sempre retorna true.';


--
-- Name: validate_curso_disciplina_tenant(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_curso_disciplina_tenant() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_curso_empresa_id uuid;
    v_disciplina_empresa_id uuid;
BEGIN
    -- Obter empresa_id do curso
    SELECT empresa_id INTO v_curso_empresa_id
    FROM public.cursos WHERE id = NEW.curso_id;
    
    -- Obter empresa_id da disciplina
    SELECT empresa_id INTO v_disciplina_empresa_id
    FROM public.disciplinas WHERE id = NEW.disciplina_id;
    
    -- Validar que pertencem à mesma empresa
    IF v_curso_empresa_id IS DISTINCT FROM v_disciplina_empresa_id THEN
        RAISE EXCEPTION 'Curso e disciplina devem pertencer à mesma empresa. curso_empresa_id=% disciplina_empresa_id=%', 
            v_curso_empresa_id, v_disciplina_empresa_id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: FUNCTION validate_curso_disciplina_tenant(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.validate_curso_disciplina_tenant() IS 'Valida que curso e disciplina na relação pertencem à mesma empresa (tenant isolation)';


--
-- Name: validate_curso_modulos_tenant(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_curso_modulos_tenant() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.cursos
        WHERE id = NEW.curso_id AND empresa_id = NEW.empresa_id
    ) THEN
        RAISE EXCEPTION 'Curso does not belong to the specified empresa';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: validate_curso_plantao_quotas_tenant(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_curso_plantao_quotas_tenant() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.cursos
        WHERE id = NEW.curso_id AND empresa_id = NEW.empresa_id
    ) THEN
        RAISE EXCEPTION 'Curso does not belong to the specified empresa';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: validate_curso_tenant_references(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_curso_tenant_references() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Validar segmento_id pertence à mesma empresa
    IF NEW.segmento_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.segmentos 
            WHERE id = NEW.segmento_id 
            AND empresa_id = NEW.empresa_id
        ) THEN
            RAISE EXCEPTION 'Segmento deve pertencer à mesma empresa do curso. segmento_id=% não pertence à empresa_id=%', 
                NEW.segmento_id, NEW.empresa_id;
        END IF;
    END IF;
    
    -- Validar disciplina_id pertence à mesma empresa
    IF NEW.disciplina_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.disciplinas 
            WHERE id = NEW.disciplina_id 
            AND empresa_id = NEW.empresa_id
        ) THEN
            RAISE EXCEPTION 'Disciplina deve pertencer à mesma empresa do curso. disciplina_id=% não pertence à empresa_id=%', 
                NEW.disciplina_id, NEW.empresa_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: FUNCTION validate_curso_tenant_references(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.validate_curso_tenant_references() IS 'Valida que referências de segmento e disciplina em cursos pertencem à mesma empresa (tenant isolation)';


--
-- Name: validate_empresa_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_empresa_id() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    user_empresa uuid;
BEGIN
    -- Skip validation for service role / triggers (no auth context)
    IF current_setting('request.jwt.claims', true) IS NULL
       OR current_setting('request.jwt.claims', true) = '' THEN
        RETURN NEW;
    END IF;

    -- Skip if empresa_id is NULL (will be autofilled by other triggers)
    IF NEW.empresa_id IS NULL THEN
        RETURN NEW;
    END IF;

    user_empresa := public.get_user_empresa_id();

    -- Allow if user is bound to this empresa
    IF user_empresa = NEW.empresa_id THEN
        RETURN NEW;
    END IF;

    -- Check usuarios_empresas for multi-tenant users
    IF EXISTS (
        SELECT 1 FROM public.usuarios_empresas ue
        WHERE ue.usuario_id = (SELECT auth.uid())
          AND ue.empresa_id = NEW.empresa_id
          AND ue.ativo = true
          AND ue.deleted_at IS NULL
    ) THEN
        RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Tenant violation: empresa_id % does not match user tenant', NEW.empresa_id
        USING ERRCODE = '42501'; -- insufficient_privilege
END;
$$;


--
-- Name: FUNCTION validate_empresa_id(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.validate_empresa_id() IS 'Validates that INSERT/UPDATE empresa_id matches the authenticated user tenant. Skips validation for service role operations.';


--
-- Name: validate_user_tenant_access(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_user_tenant_access(tenant_id_param uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
    RETURN public.get_user_empresa_id() = tenant_id_param;
END;
$$;


--
-- Name: FUNCTION validate_user_tenant_access(tenant_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.validate_user_tenant_access(tenant_id_param uuid) IS 'Validates that the authenticated user belongs to the specified tenant. Returns true if user empresa_id matches.';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: agendamento_bloqueios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendamento_bloqueios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professor_id uuid,
    empresa_id uuid NOT NULL,
    tipo public.enum_tipo_bloqueio DEFAULT 'outro'::public.enum_tipo_bloqueio NOT NULL,
    data_inicio timestamp with time zone NOT NULL,
    data_fim timestamp with time zone NOT NULL,
    motivo text,
    criado_por uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_data_fim_after_inicio CHECK ((data_fim > data_inicio))
);


--
-- Name: TABLE agendamento_bloqueios; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.agendamento_bloqueios IS 'Bloqueios de agenda que impedem agendamentos em períodos específicos. Podem ser por professor (professor_id preenchido) ou para toda a empresa (professor_id null).';


--
-- Name: agendamento_configuracoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendamento_configuracoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professor_id uuid NOT NULL,
    auto_confirmar boolean DEFAULT false,
    tempo_antecedencia_minimo integer DEFAULT 60,
    tempo_lembrete_minutos integer DEFAULT 1440,
    link_reuniao_padrao text,
    mensagem_confirmacao text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    empresa_id uuid NOT NULL
);


--
-- Name: agendamento_disponibilidade; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendamento_disponibilidade (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professor_id uuid NOT NULL,
    dia_semana integer NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fim time without time zone NOT NULL,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    empresa_id uuid NOT NULL,
    CONSTRAINT agendamento_disponibilidade_dia_semana_check CHECK (((dia_semana >= 0) AND (dia_semana <= 6)))
);


--
-- Name: agendamento_notificacoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendamento_notificacoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agendamento_id uuid NOT NULL,
    tipo text NOT NULL,
    destinatario_id uuid NOT NULL,
    enviado boolean DEFAULT false,
    enviado_em timestamp with time zone,
    erro text,
    created_at timestamp with time zone DEFAULT now(),
    empresa_id uuid,
    CONSTRAINT agendamento_notificacoes_tipo_check CHECK ((tipo = ANY (ARRAY['criacao'::text, 'confirmacao'::text, 'cancelamento'::text, 'lembrete'::text, 'alteracao'::text, 'rejeicao'::text])))
);


--
-- Name: agendamento_recorrencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendamento_recorrencia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professor_id uuid NOT NULL,
    empresa_id uuid NOT NULL,
    tipo_servico public.enum_tipo_servico_agendamento DEFAULT 'plantao'::public.enum_tipo_servico_agendamento NOT NULL,
    data_inicio date NOT NULL,
    data_fim date,
    dia_semana integer NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fim time without time zone NOT NULL,
    duracao_slot_minutos integer DEFAULT 30 NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agendamento_recorrencia_dia_semana_check CHECK (((dia_semana >= 0) AND (dia_semana <= 6))),
    CONSTRAINT agendamento_recorrencia_duracao_slot_minutos_check CHECK ((duracao_slot_minutos = ANY (ARRAY[15, 30, 45, 60]))),
    CONSTRAINT check_data_fim_after_inicio CHECK (((data_fim IS NULL) OR (data_fim >= data_inicio))),
    CONSTRAINT check_hora_fim_after_inicio CHECK ((hora_fim > hora_inicio))
);


--
-- Name: TABLE agendamento_recorrencia; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.agendamento_recorrencia IS 'Padrões de recorrência anual de disponibilidade de professores. Permite definir horários de disponibilidade que se repetem em dias específicos da semana dentro de um período de vigência.';


--
-- Name: agendamento_recorrencia_turmas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendamento_recorrencia_turmas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recorrencia_id uuid NOT NULL,
    turma_id uuid NOT NULL,
    empresa_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE agendamento_recorrencia_turmas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.agendamento_recorrencia_turmas IS 'Tabela associativa que vincula regras de recorrência a turmas específicas. Quando uma recorrência tem vínculos nesta tabela, apenas alunos matriculados nas turmas vinculadas podem ver e agendar os slots gerados. Sem vínculos, a recorrência fica visível para todos os alunos do tenant.';


--
-- Name: agendamento_relatorios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendamento_relatorios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    periodo_inicio date NOT NULL,
    periodo_fim date NOT NULL,
    tipo public.enum_tipo_relatorio NOT NULL,
    dados_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    gerado_em timestamp with time zone DEFAULT now() NOT NULL,
    gerado_por uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_periodo_fim_after_inicio CHECK ((periodo_fim >= periodo_inicio))
);


--
-- Name: TABLE agendamento_relatorios; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.agendamento_relatorios IS 'Relatórios pré-calculados de agendamentos com estatísticas agregadas por período. Os dados são armazenados em formato JSONB para flexibilidade.';


--
-- Name: agendamentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendamentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professor_id uuid NOT NULL,
    aluno_id uuid NOT NULL,
    data_inicio timestamp with time zone NOT NULL,
    data_fim timestamp with time zone NOT NULL,
    status text DEFAULT 'pendente'::text NOT NULL,
    link_reuniao text,
    observacoes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    motivo_cancelamento text,
    cancelado_por uuid,
    confirmado_em timestamp with time zone,
    lembrete_enviado boolean DEFAULT false,
    lembrete_enviado_em timestamp with time zone,
    empresa_id uuid NOT NULL,
    CONSTRAINT agendamentos_status_check CHECK ((status = ANY (ARRAY['pendente'::text, 'confirmado'::text, 'cancelado'::text, 'concluido'::text])))
);


--
-- Name: ai_agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_agents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    avatar_url text,
    greeting_message text,
    placeholder_text text DEFAULT 'Digite sua mensagem...'::text,
    system_prompt text,
    model text DEFAULT 'gpt-4o-mini'::text,
    temperature numeric(3,2) DEFAULT 0.7,
    integration_type text DEFAULT 'copilotkit'::text NOT NULL,
    integration_config jsonb DEFAULT '{}'::jsonb,
    supports_attachments boolean DEFAULT false,
    supports_voice boolean DEFAULT false,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE ai_agents; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_agents IS 'Multi-tenant AI agent configuration. Each tenant can have multiple agents with custom branding and behavior.';


--
-- Name: COLUMN ai_agents.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_agents.slug IS 'URL-safe identifier for the agent, unique per empresa';


--
-- Name: COLUMN ai_agents.integration_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_agents.integration_type IS 'Type of backend integration: copilotkit (default), n8n (legacy), or custom';


--
-- Name: COLUMN ai_agents.integration_config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_agents.integration_config IS 'JSON config for the integration type (e.g., n8n webhook URL)';


--
-- Name: COLUMN ai_agents.is_default; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_agents.is_default IS 'If true, this is the default agent shown when accessing /agente without a slug';


--
-- Name: alunos_cursos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alunos_cursos (
    usuario_id uuid NOT NULL,
    curso_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: alunos_turmas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alunos_turmas (
    usuario_id uuid NOT NULL,
    turma_id uuid NOT NULL,
    data_entrada date DEFAULT CURRENT_DATE,
    data_saida date,
    status public.enum_status_aluno_turma DEFAULT 'ativo'::public.enum_status_aluno_turma,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE alunos_turmas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.alunos_turmas IS 'Relacionamento N:N entre alunos e turmas. Permite matricular alunos em turmas específicas de um curso.';


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    created_by uuid,
    last_used_at timestamp with time zone,
    expires_at timestamp with time zone,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    empresa_id uuid
);


--
-- Name: atividades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.atividades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    modulo_id uuid,
    tipo public.enum_tipo_atividade NOT NULL,
    titulo text NOT NULL,
    arquivo_url text,
    gabarito_url text,
    link_externo text,
    obrigatorio boolean DEFAULT true,
    ordem_exibicao integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    empresa_id uuid NOT NULL
);


--
-- Name: aulas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aulas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    modulo_id uuid,
    nome text NOT NULL,
    numero_aula integer,
    tempo_estimado_minutos integer,
    prioridade integer,
    video_url text,
    created_at timestamp with time zone DEFAULT now(),
    curso_id uuid,
    empresa_id uuid NOT NULL,
    tempo_estimado_interval interval,
    CONSTRAINT aulas_prioridade_check CHECK (((prioridade >= 1) AND (prioridade <= 5)))
);


--
-- Name: COLUMN aulas.curso_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.aulas.curso_id IS 'Curso ao qual esta aula pertence';


--
-- Name: aulas_concluidas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aulas_concluidas (
    usuario_id uuid NOT NULL,
    aula_id uuid NOT NULL,
    curso_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    empresa_id uuid
);


--
-- Name: chat_conversation_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversation_history (
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    history jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    empresa_id uuid
);


--
-- Name: COLUMN chat_conversation_history.empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_conversation_history.empresa_id IS 'ID da empresa para isolamento multi-tenant do histórico de chat';


--
-- Name: chat_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    session_id text NOT NULL,
    title text DEFAULT 'Nova Conversa'::text NOT NULL,
    messages jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT false,
    empresa_id uuid
);


--
-- Name: TABLE chat_conversations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.chat_conversations IS 'Gerenciamento de sessões de chat do TobIAs';


--
-- Name: COLUMN chat_conversations.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_conversations.session_id IS 'ID único usado para comunicação com N8N (memória do agente)';


--
-- Name: COLUMN chat_conversations.messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_conversations.messages IS 'Histórico completo de mensagens da conversa em formato JSON';


--
-- Name: COLUMN chat_conversations.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_conversations.is_active IS 'Indica a conversa atualmente ativa do usuário (apenas uma por usuário)';


--
-- Name: COLUMN chat_conversations.empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_conversations.empresa_id IS 'ID da empresa para isolamento multi-tenant do chat';


--
-- Name: color_palettes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.color_palettes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    empresa_id uuid NOT NULL,
    primary_color text NOT NULL,
    primary_foreground text NOT NULL,
    secondary_color text NOT NULL,
    secondary_foreground text NOT NULL,
    accent_color text NOT NULL,
    accent_foreground text NOT NULL,
    muted_color text NOT NULL,
    muted_foreground text NOT NULL,
    background_color text NOT NULL,
    foreground_color text NOT NULL,
    card_color text NOT NULL,
    card_foreground text NOT NULL,
    destructive_color text NOT NULL,
    destructive_foreground text NOT NULL,
    sidebar_background text NOT NULL,
    sidebar_foreground text NOT NULL,
    sidebar_primary text NOT NULL,
    sidebar_primary_foreground text NOT NULL,
    is_custom boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE color_palettes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.color_palettes IS 'Custom color palettes that can be applied to tenant branding';


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    code text NOT NULL,
    description text,
    discount_type public.discount_type DEFAULT 'percentage'::public.discount_type NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    max_uses integer,
    current_uses integer DEFAULT 0 NOT NULL,
    valid_from timestamp with time zone DEFAULT now() NOT NULL,
    valid_until timestamp with time zone,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT coupons_discount_value_check CHECK ((discount_value > (0)::numeric))
);


--
-- Name: cronograma_itens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cronograma_itens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cronograma_id uuid NOT NULL,
    aula_id uuid NOT NULL,
    semana_numero integer NOT NULL,
    ordem_na_semana integer NOT NULL,
    concluido boolean DEFAULT false,
    data_conclusao timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    data_prevista date
);


--
-- Name: TABLE cronograma_itens; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.cronograma_itens IS 'Armazena a distribuição das aulas por semana nos cronogramas';


--
-- Name: COLUMN cronograma_itens.data_prevista; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cronograma_itens.data_prevista IS 'Data prevista para a aula, calculada baseada na semana_numero, ordem_na_semana e distribuição de dias da semana';


--
-- Name: cronograma_semanas_dias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cronograma_semanas_dias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cronograma_id uuid NOT NULL,
    dias_semana integer[] DEFAULT ARRAY[1, 2, 3, 4, 5] NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE cronograma_semanas_dias; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.cronograma_semanas_dias IS 'Armazena a distribuição global de dias da semana para cada cronograma. A distribuição é aplicada a todas as semanas do cronograma.';


--
-- Name: COLUMN cronograma_semanas_dias.dias_semana; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cronograma_semanas_dias.dias_semana IS 'Array de inteiros representando os dias da semana: 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado';


--
-- Name: cronograma_tempo_estudos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cronograma_tempo_estudos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cronograma_id uuid NOT NULL,
    data date NOT NULL,
    disciplina_id uuid NOT NULL,
    frente_id uuid NOT NULL,
    tempo_estudos_concluido boolean DEFAULT false,
    data_conclusao timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE cronograma_tempo_estudos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.cronograma_tempo_estudos IS 'Rastreia a conclusão do tempo de estudos e exercícios por disciplina/frente por dia';


--
-- Name: cronogramas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cronogramas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    curso_alvo_id uuid,
    nome text DEFAULT 'Meu Cronograma'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    data_inicio date NOT NULL,
    data_fim date NOT NULL,
    dias_estudo_semana integer NOT NULL,
    horas_estudo_dia numeric(4,2) NOT NULL,
    periodos_ferias jsonb DEFAULT '[]'::jsonb,
    prioridade_minima integer DEFAULT 1 NOT NULL,
    modalidade_estudo text NOT NULL,
    disciplinas_selecionadas jsonb DEFAULT '[]'::jsonb NOT NULL,
    ordem_frentes_preferencia jsonb,
    modulos_selecionados jsonb,
    excluir_aulas_concluidas boolean DEFAULT true NOT NULL,
    empresa_id uuid NOT NULL,
    velocidade_reproducao numeric(3,2) DEFAULT 1.0,
    CONSTRAINT cronogramas_modalidade_estudo_check CHECK ((modalidade_estudo = ANY (ARRAY['paralelo'::text, 'sequencial'::text])))
);


--
-- Name: TABLE cronogramas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.cronogramas IS 'Armazena configurações e estado geral dos cronogramas de estudo personalizados';


--
-- Name: COLUMN cronogramas.horas_estudo_dia; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cronogramas.horas_estudo_dia IS 'Hours of study per day, supports decimal values like 1.5';


--
-- Name: COLUMN cronogramas.modulos_selecionados; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cronogramas.modulos_selecionados IS 'Lista de módulos escolhidos pelo aluno ao gerar o cronograma';


--
-- Name: COLUMN cronogramas.excluir_aulas_concluidas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cronogramas.excluir_aulas_concluidas IS 'Indica se aulas já concluídas foram excluídas automaticamente do cronograma';


--
-- Name: COLUMN cronogramas.velocidade_reproducao; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cronogramas.velocidade_reproducao IS 'Video playback speed multiplier (1.0, 1.25, 1.5, 2.0)';


--
-- Name: curso_modulos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curso_modulos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    curso_id uuid NOT NULL,
    module_id text NOT NULL,
    empresa_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


--
-- Name: curso_plantao_quotas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curso_plantao_quotas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    curso_id uuid NOT NULL,
    empresa_id uuid NOT NULL,
    quota_mensal integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- Name: cursos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cursos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    segmento_id uuid,
    disciplina_id uuid,
    nome text NOT NULL,
    modalidade public.enum_modalidade NOT NULL,
    tipo public.enum_tipo_curso NOT NULL,
    descricao text,
    ano_vigencia integer NOT NULL,
    data_inicio date,
    data_termino date,
    meses_acesso integer,
    planejamento_url text,
    imagem_capa_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    empresa_id uuid NOT NULL,
    usa_turmas boolean DEFAULT false NOT NULL,
    modalidade_id uuid
);


--
-- Name: COLUMN cursos.empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cursos.empresa_id IS 'Identificador da empresa (tenant) que oferece o curso. NOT NULL para garantir isolamento.';


--
-- Name: COLUMN cursos.usa_turmas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cursos.usa_turmas IS 'Indica se o curso utiliza o sistema de turmas. Quando false, alunos são matriculados diretamente no curso.';


--
-- Name: cursos_disciplinas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cursos_disciplinas (
    curso_id uuid NOT NULL,
    disciplina_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE cursos_disciplinas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.cursos_disciplinas IS 'Relacionamento muitos-para-muitos entre cursos e disciplinas';


--
-- Name: cursos_hotmart_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cursos_hotmart_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    curso_id uuid NOT NULL,
    hotmart_product_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: custom_theme_presets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_theme_presets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    empresa_id uuid NOT NULL,
    color_palette_id uuid,
    font_scheme_id uuid,
    radius numeric DEFAULT 0.5,
    scale numeric DEFAULT 1.0,
    mode text DEFAULT 'light'::text,
    preview_colors jsonb DEFAULT '[]'::jsonb,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    CONSTRAINT custom_theme_presets_mode_check CHECK ((mode = ANY (ARRAY['light'::text, 'dark'::text])))
);


--
-- Name: TABLE custom_theme_presets; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.custom_theme_presets IS 'Complete theme presets combining colors, fonts, and theme customizer settings';


--
-- Name: disciplinas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disciplinas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    empresa_id uuid NOT NULL
);


--
-- Name: COLUMN disciplinas.empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.disciplinas.empresa_id IS 'Identificador da empresa (tenant). Obrigatório - cada empresa tem suas próprias disciplinas.';


--
-- Name: empresa_oauth_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresa_oauth_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    provider text NOT NULL,
    client_id text NOT NULL,
    client_secret_encrypted bytea NOT NULL,
    extra_config jsonb DEFAULT '{}'::jsonb,
    active boolean DEFAULT true NOT NULL,
    configured_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    access_token_encrypted bytea,
    refresh_token_encrypted bytea,
    token_expiry timestamp with time zone,
    CONSTRAINT empresa_oauth_credentials_provider_check CHECK ((provider = ANY (ARRAY['google'::text, 'zoom'::text])))
);


--
-- Name: empresas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    slug text NOT NULL,
    cnpj text,
    email_contato text,
    telefone text,
    logo_url text,
    plano public.enum_plano_empresa DEFAULT 'basico'::public.enum_plano_empresa NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    configuracoes jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    dominio_customizado text,
    subdomain text,
    storage_quota_mb integer DEFAULT 1000,
    storage_used_mb integer DEFAULT 0,
    stripe_customer_id text,
    subscription_id uuid
);


--
-- Name: TABLE empresas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.empresas IS 'Tabela de empresas (cursinhos) que representa cada tenant do sistema multi-tenant. Cada empresa possui seus próprios professores, cursos e alunos.';


--
-- Name: COLUMN empresas.dominio_customizado; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.empresas.dominio_customizado IS 'Domínio customizado completo (ex: escola.com.br)';


--
-- Name: COLUMN empresas.subdomain; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.empresas.subdomain IS 'Subdomínio no domínio principal (ex: escola em escola.alumnify.com.br)';


--
-- Name: COLUMN empresas.stripe_customer_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.empresas.stripe_customer_id IS 'ID do cliente no Stripe (cus_xxx). Único por empresa.';


--
-- Name: COLUMN empresas.subscription_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.empresas.subscription_id IS 'Referência à assinatura ativa do tenant.';


--
-- Name: flashcards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flashcards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    modulo_id uuid,
    pergunta text NOT NULL,
    resposta text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    empresa_id uuid NOT NULL,
    pergunta_imagem_path text,
    resposta_imagem_path text
);


--
-- Name: TABLE flashcards; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.flashcards IS 'Flashcards para revisão espaçada (SRS). 
IMPORTANTE: empresa_id é obrigatório para garantir isolamento multi-tenant.
RLS policies garantem que cada empresa só vê seus próprios flashcards.';


--
-- Name: COLUMN flashcards.pergunta_imagem_path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.flashcards.pergunta_imagem_path IS 'Supabase Storage object path for the question image (bucket: flashcards-images).';


--
-- Name: COLUMN flashcards.resposta_imagem_path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.flashcards.resposta_imagem_path IS 'Supabase Storage object path for the answer image (bucket: flashcards-images).';


--
-- Name: font_schemes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.font_schemes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    empresa_id uuid NOT NULL,
    font_sans jsonb DEFAULT '["Inter", "system-ui", "sans-serif"]'::jsonb NOT NULL,
    font_mono jsonb DEFAULT '["Fira Code", "monospace"]'::jsonb NOT NULL,
    font_sizes jsonb DEFAULT '{"lg": "1.125rem", "sm": "0.875rem", "xl": "1.25rem", "xs": "0.75rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem", "base": "1rem"}'::jsonb NOT NULL,
    font_weights jsonb DEFAULT '{"bold": 700, "light": 300, "medium": 500, "normal": 400, "semibold": 600}'::jsonb NOT NULL,
    google_fonts jsonb DEFAULT '[]'::jsonb,
    is_custom boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE font_schemes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.font_schemes IS 'Custom font schemes with Google Fonts integration';


--
-- Name: frentes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.frentes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    disciplina_id uuid,
    nome text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    curso_id uuid,
    empresa_id uuid NOT NULL
);


--
-- Name: COLUMN frentes.curso_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.frentes.curso_id IS 'Curso ao qual esta frente pertence';


--
-- Name: materiais_curso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materiais_curso (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    curso_id uuid,
    titulo text NOT NULL,
    descricao_opcional text,
    tipo public.enum_tipo_material DEFAULT 'Apostila'::public.enum_tipo_material NOT NULL,
    arquivo_url text NOT NULL,
    ordem integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    empresa_id uuid NOT NULL
);


--
-- Name: matriculas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matriculas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid,
    curso_id uuid,
    data_matricula timestamp with time zone DEFAULT now() NOT NULL,
    data_inicio_acesso date DEFAULT CURRENT_DATE NOT NULL,
    data_fim_acesso date NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    empresa_id uuid
);


--
-- Name: modalidades_curso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modalidades_curso (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    nome text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid
);


--
-- Name: module_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.module_definitions (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    icon_name text NOT NULL,
    default_url text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_core boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    default_visible boolean DEFAULT true NOT NULL
);


--
-- Name: TABLE module_definitions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.module_definitions IS 'Reference table defining available navigation modules for the student sidebar';


--
-- Name: COLUMN module_definitions.default_visible; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.module_definitions.default_visible IS 'Whether the module is visible by default for tenants without explicit configuration. If false, tenants must explicitly enable the module.';


--
-- Name: modulos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modulos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    frente_id uuid,
    nome text NOT NULL,
    numero_modulo integer,
    created_at timestamp with time zone DEFAULT now(),
    curso_id uuid,
    importancia public.enum_importancia_modulo DEFAULT 'Media'::public.enum_importancia_modulo,
    empresa_id uuid NOT NULL
);


--
-- Name: COLUMN modulos.curso_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.modulos.curso_id IS 'Curso ao qual este módulo pertence';


--
-- Name: COLUMN modulos.importancia; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.modulos.importancia IS 'Nível de importância do módulo. Usado no modo "Mais Cobrados" dos flashcards para priorizar conteúdo mais cobrado nas provas. Valores: Alta, Media, Baixa, Base (padrão: Media)';


--
-- Name: papeis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.papeis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid,
    nome text NOT NULL,
    tipo text NOT NULL,
    descricao text,
    permissoes jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT papeis_tipo_check CHECK ((tipo = ANY (ARRAY['professor'::text, 'professor_admin'::text, 'staff'::text, 'admin'::text, 'monitor'::text])))
);


--
-- Name: TABLE papeis; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.papeis IS 'Roles table for RBAC system. System roles (is_system=true, empresa_id=NULL) are templates. Empresas can create custom roles.';


--
-- Name: COLUMN papeis.tipo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.papeis.tipo IS 'Role type: professor, professor_admin, staff, admin, monitor';


--
-- Name: COLUMN papeis.permissoes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.papeis.permissoes IS 'JSONB with permissions per resource (dashboard, cursos, disciplinas, etc.)';


--
-- Name: COLUMN papeis.is_system; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.papeis.is_system IS 'System roles cannot be deleted and serve as templates';


--
-- Name: payment_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    provider text NOT NULL,
    name text NOT NULL,
    credentials jsonb DEFAULT '{}'::jsonb,
    webhook_secret text,
    webhook_url text,
    provider_account_id text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_providers_provider_check CHECK ((provider = ANY (ARRAY['hotmart'::text, 'stripe'::text, 'internal'::text])))
);


--
-- Name: plantao_uso_mensal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plantao_uso_mensal (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    empresa_id uuid NOT NULL,
    ano_mes text NOT NULL,
    uso_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    curso_id uuid,
    name text NOT NULL,
    description text,
    price_cents integer NOT NULL,
    currency text DEFAULT 'BRL'::text NOT NULL,
    provider text DEFAULT 'internal'::text NOT NULL,
    provider_product_id text,
    provider_offer_id text,
    active boolean DEFAULT true NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_price_cents_check CHECK ((price_cents >= 0)),
    CONSTRAINT products_provider_check CHECK ((provider = ANY (ARRAY['hotmart'::text, 'stripe'::text, 'internal'::text, 'manual'::text])))
);


--
-- Name: progresso_atividades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progresso_atividades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid,
    atividade_id uuid,
    status public.enum_status_atividade DEFAULT 'Pendente'::public.enum_status_atividade,
    data_inicio timestamp with time zone,
    data_conclusao timestamp with time zone,
    questoes_totais integer DEFAULT 0,
    questoes_acertos integer DEFAULT 0,
    dificuldade_percebida public.enum_dificuldade_percebida,
    anotacoes_pessoais text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    empresa_id uuid
);


--
-- Name: progresso_flashcards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progresso_flashcards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid,
    flashcard_id uuid,
    nivel_facilidade double precision DEFAULT 2.5,
    dias_intervalo integer DEFAULT 0,
    data_proxima_revisao timestamp with time zone DEFAULT now(),
    numero_revisoes integer DEFAULT 0,
    ultimo_feedback integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    empresa_id uuid NOT NULL
);


--
-- Name: TABLE progresso_flashcards; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.progresso_flashcards IS 'Rastreia o progresso de cada aluno em cada flashcard, incluindo feedback, dificuldade e próxima revisão (SRS). 
IMPORTANTE: empresa_id é obrigatório para garantir isolamento multi-tenant. 
RLS policies garantem que cada aluno só vê/modifica seu próprio progresso dentro da sua empresa.';


--
-- Name: COLUMN progresso_flashcards.usuario_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.progresso_flashcards.usuario_id IS 'ID do aluno - sempre vinculado ao usuário autenticado';


--
-- Name: COLUMN progresso_flashcards.ultimo_feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.progresso_flashcards.ultimo_feedback IS 'Último feedback dado: 1=Errei, 2=Parcial, 3=Difícil, 4=Fácil';


--
-- Name: regras_atividades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regras_atividades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    curso_id uuid,
    tipo_atividade public.enum_tipo_atividade NOT NULL,
    nome_padrao text NOT NULL,
    frequencia_modulos integer DEFAULT 1,
    comecar_no_modulo integer DEFAULT 1,
    acumulativo boolean DEFAULT false,
    gerar_no_ultimo boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    acumulativo_desde_inicio boolean DEFAULT false,
    empresa_id uuid NOT NULL
);


--
-- Name: COLUMN regras_atividades.acumulativo_desde_inicio; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.regras_atividades.acumulativo_desde_inicio IS 'Quando true, o acumulativo sempre começa do módulo inicial. Quando false, usa o intervalo baseado na frequência.';


--
-- Name: segmentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.segmentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    slug text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    empresa_id uuid NOT NULL
);


--
-- Name: COLUMN segmentos.empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.segmentos.empresa_id IS 'Identificador da empresa (tenant). Obrigatório - cada empresa tem seus próprios segmentos.';


--
-- Name: sessoes_estudo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessoes_estudo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid,
    disciplina_id uuid,
    frente_id uuid,
    atividade_relacionada_id uuid,
    inicio timestamp with time zone DEFAULT now(),
    fim timestamp with time zone,
    tempo_total_bruto_segundos integer,
    tempo_total_liquido_segundos integer,
    log_pausas jsonb DEFAULT '[]'::jsonb,
    metodo_estudo text,
    nivel_foco integer,
    status text DEFAULT 'em_andamento'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    empresa_id uuid,
    modulo_id uuid
);


--
-- Name: COLUMN sessoes_estudo.modulo_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessoes_estudo.modulo_id IS 'Módulo associado à sessão de estudo. Preenchido preferencialmente no início da sessão; pode ser backfilled via atividade_relacionada_id.';


--
-- Name: submodule_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submodule_definitions (
    id text NOT NULL,
    module_id text NOT NULL,
    name text NOT NULL,
    default_url text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE submodule_definitions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.submodule_definitions IS 'Reference table defining sub-items for navigation modules';


--
-- Name: COLUMN submodule_definitions.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.submodule_definitions.id IS 'Stable identifier for the submodule within its parent module';


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    stripe_product_id text,
    stripe_price_id_monthly text,
    stripe_price_id_yearly text,
    price_monthly_cents integer NOT NULL,
    price_yearly_cents integer,
    currency text DEFAULT 'BRL'::text NOT NULL,
    max_active_students integer,
    max_courses integer,
    max_storage_mb integer,
    allowed_modules jsonb DEFAULT '[]'::jsonb,
    extra_student_price_cents integer,
    display_order integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    badge_text text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE subscription_plans; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.subscription_plans IS 'Planos de assinatura da plataforma, sincronizados com Stripe Products/Prices. Tabela global (sem empresa_id).';


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    stripe_subscription_id text,
    stripe_customer_id text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    billing_interval text NOT NULL,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at timestamp with time zone,
    canceled_at timestamp with time zone,
    last_payment_date timestamp with time zone,
    last_payment_amount_cents integer,
    next_payment_date timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscriptions_billing_interval_check CHECK ((billing_interval = ANY (ARRAY['month'::text, 'year'::text]))),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'past_due'::text, 'canceled'::text, 'unpaid'::text, 'trialing'::text, 'paused'::text])))
);


--
-- Name: TABLE subscriptions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.subscriptions IS 'Assinaturas ativas dos tenants, vinculadas ao Stripe Subscriptions. Isolamento multi-tenant via empresa_id.';


--
-- Name: superadmins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.superadmins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_user_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE superadmins; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.superadmins IS 'Administradores do SaaS (superadmin). Tabela separada das tabelas de tenant.';


--
-- Name: tenant_access_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_access_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    table_name text NOT NULL,
    operation text NOT NULL,
    row_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tenant_access_log_operation_check CHECK ((operation = ANY (ARRAY['SELECT'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text, 'RPC'::text])))
);


--
-- Name: tenant_branding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_branding (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    custom_css text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    color_palette_id uuid,
    font_scheme_id uuid
);


--
-- Name: TABLE tenant_branding; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tenant_branding IS 'Main branding configuration table for each empresa (tenant)';


--
-- Name: tenant_logos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_logos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_branding_id uuid NOT NULL,
    logo_type public.enum_logo_type NOT NULL,
    logo_url text NOT NULL,
    file_name text,
    file_size integer,
    mime_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    empresa_id uuid
);


--
-- Name: TABLE tenant_logos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tenant_logos IS 'Stores logos for different contexts (login, sidebar, favicon) per tenant';


--
-- Name: tenant_module_visibility; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_module_visibility (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    module_id text NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    custom_name text,
    custom_url text,
    options jsonb DEFAULT '{}'::jsonb,
    display_order integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE tenant_module_visibility; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tenant_module_visibility IS 'Per-tenant configuration for module visibility, names, and order in student navigation';


--
-- Name: tenant_submodule_visibility; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_submodule_visibility (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    module_id text NOT NULL,
    submodule_id text NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    custom_name text,
    custom_url text,
    display_order integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- Name: TABLE tenant_submodule_visibility; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tenant_submodule_visibility IS 'Per-tenant configuration for submodule visibility, names, and order in student navigation';


--
-- Name: termos_aceite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.termos_aceite (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    empresa_id uuid NOT NULL,
    tipo_documento text NOT NULL,
    versao text NOT NULL,
    ip_address inet,
    user_agent text,
    accepted_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT termos_aceite_tipo_documento_check CHECK ((tipo_documento = ANY (ARRAY['termos_uso'::text, 'politica_privacidade'::text, 'dpa'::text])))
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    usuario_id uuid,
    product_id uuid,
    coupon_id uuid,
    provider text DEFAULT 'manual'::text NOT NULL,
    provider_transaction_id text,
    status public.transaction_status DEFAULT 'pending'::public.transaction_status NOT NULL,
    amount_cents integer NOT NULL,
    currency text DEFAULT 'BRL'::text NOT NULL,
    payment_method public.payment_method,
    installments integer DEFAULT 1,
    buyer_email text NOT NULL,
    buyer_name text,
    buyer_document text,
    provider_data jsonb DEFAULT '{}'::jsonb,
    sale_date timestamp with time zone DEFAULT now() NOT NULL,
    confirmation_date timestamp with time zone,
    refund_date timestamp with time zone,
    refund_amount_cents integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_amount_cents_check CHECK ((amount_cents >= 0)),
    CONSTRAINT transactions_installments_check CHECK ((installments >= 1)),
    CONSTRAINT transactions_provider_check CHECK ((provider = ANY (ARRAY['hotmart'::text, 'stripe'::text, 'internal'::text, 'manual'::text])))
);


--
-- Name: turmas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.turmas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    curso_id uuid NOT NULL,
    nome text NOT NULL,
    data_inicio date,
    data_fim date,
    acesso_apos_termino boolean DEFAULT false,
    dias_acesso_extra integer DEFAULT 0,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE turmas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.turmas IS 'Turmas opcionais dentro de cursos. Cada curso pode ter 0 ou N turmas (ex: Manhã, Tarde, Noturno). Se não tiver turmas, alunos são vinculados diretamente ao curso.';


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    empresa_id uuid NOT NULL,
    papel_id uuid,
    nome_completo text NOT NULL,
    email text NOT NULL,
    cpf text,
    telefone text,
    chave_pix text,
    foto_url text,
    biografia text,
    especialidade text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    data_nascimento date,
    endereco text,
    cep text,
    numero_endereco text,
    complemento text,
    cidade text,
    estado text,
    bairro text,
    pais text DEFAULT 'Brasil'::text,
    instagram text,
    twitter text,
    numero_matricula text,
    hotmart_id text,
    origem_cadastro text DEFAULT 'manual'::text,
    must_change_password boolean DEFAULT false NOT NULL,
    senha_temporaria text,
    quota_extra integer DEFAULT 0
);


--
-- Name: TABLE usuarios; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.usuarios IS 'Institution staff table - replaces professores with proper RBAC support';


--
-- Name: COLUMN usuarios.papel_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.usuarios.papel_id IS 'Foreign key to papeis table - defines user role and permissions';


--
-- Name: COLUMN usuarios.ativo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.usuarios.ativo IS 'Soft-disable flag - inactive users cannot login';


--
-- Name: COLUMN usuarios.deleted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.usuarios.deleted_at IS 'Soft-delete timestamp';


--
-- Name: usuarios_disciplinas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios_disciplinas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    disciplina_id uuid NOT NULL,
    empresa_id uuid NOT NULL,
    curso_id uuid,
    turma_id uuid,
    modulo_id uuid,
    frente_id uuid,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: usuarios_empresas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios_empresas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    empresa_id uuid NOT NULL,
    papel_base public.enum_papel_base NOT NULL,
    papel_id uuid,
    is_admin boolean DEFAULT false NOT NULL,
    is_owner boolean DEFAULT false NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE usuarios_empresas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.usuarios_empresas IS 'Vinculo N:N entre usuarios e empresas com papel base. Cada registro = "esta pessoa participa deste tenant com este papel".';


--
-- Name: v_index_usage_analysis; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_index_usage_analysis WITH (security_invoker='true') AS
 SELECT s.schemaname,
    s.relname AS table_name,
    s.indexrelname AS index_name,
    pg_get_indexdef(i.indexrelid) AS index_definition,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch,
    pg_size_pretty(pg_relation_size((s.indexrelid)::regclass)) AS index_size,
    pg_relation_size((s.indexrelid)::regclass) AS index_size_bytes,
        CASE
            WHEN (pg_get_indexdef(i.indexrelid) ~~ '%empresa_id%'::text) THEN 'rls_tenant'::text
            WHEN (s.relname = ANY (ARRAY['transactions'::name, 'products'::name, 'coupons'::name, 'ai_agents'::name, 'payment_providers'::name])) THEN 'new_feature'::text
            WHEN ((s.indexrelname ~~ '%created_by%'::text) OR (s.indexrelname ~~ '%updated_by%'::text) OR (s.indexrelname ~~ '%configured_by%'::text) OR (s.indexrelname ~~ '%gerado_por%'::text) OR (s.indexrelname ~~ '%cancelado_por%'::text)) THEN 'fk_audit'::text
            ELSE 'general'::text
        END AS usage_category,
        CASE
            WHEN (pg_get_indexdef(i.indexrelid) ~~ '%empresa_id%'::text) THEN true
            WHEN ((s.indexrelname ~~ '%created_by%'::text) OR (s.indexrelname ~~ '%updated_by%'::text)) THEN true
            WHEN (s.relname = ANY (ARRAY['transactions'::name, 'products'::name, 'coupons'::name, 'ai_agents'::name, 'payment_providers'::name])) THEN true
            WHEN (s.idx_scan > 0) THEN true
            ELSE false
        END AS should_keep,
    obj_description(s.indexrelid, 'pg_class'::name) AS index_comment
   FROM (pg_stat_user_indexes s
     JOIN pg_index i ON ((i.indexrelid = s.indexrelid)))
  WHERE ((s.schemaname = 'public'::name) AND (NOT i.indisprimary))
  ORDER BY s.idx_scan, (pg_relation_size((s.indexrelid)::regclass)) DESC;


--
-- Name: VIEW v_index_usage_analysis; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.v_index_usage_analysis IS 'Index usage analysis view (SECURITY INVOKER). Categorizes indexes and flags critical infrastructure indexes.';


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: agendamento_bloqueios agendamento_bloqueios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_bloqueios
    ADD CONSTRAINT agendamento_bloqueios_pkey PRIMARY KEY (id);


--
-- Name: agendamento_configuracoes agendamento_configuracoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_configuracoes
    ADD CONSTRAINT agendamento_configuracoes_pkey PRIMARY KEY (id);


--
-- Name: agendamento_configuracoes agendamento_configuracoes_professor_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_configuracoes
    ADD CONSTRAINT agendamento_configuracoes_professor_id_key UNIQUE (professor_id);


--
-- Name: agendamento_disponibilidade agendamento_disponibilidade_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_disponibilidade
    ADD CONSTRAINT agendamento_disponibilidade_pkey PRIMARY KEY (id);


--
-- Name: agendamento_notificacoes agendamento_notificacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_notificacoes
    ADD CONSTRAINT agendamento_notificacoes_pkey PRIMARY KEY (id);


--
-- Name: agendamento_recorrencia agendamento_recorrencia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_recorrencia
    ADD CONSTRAINT agendamento_recorrencia_pkey PRIMARY KEY (id);


--
-- Name: agendamento_recorrencia_turmas agendamento_recorrencia_turmas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_recorrencia_turmas
    ADD CONSTRAINT agendamento_recorrencia_turmas_pkey PRIMARY KEY (id);


--
-- Name: agendamento_relatorios agendamento_relatorios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_relatorios
    ADD CONSTRAINT agendamento_relatorios_pkey PRIMARY KEY (id);


--
-- Name: agendamentos agendamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_pkey PRIMARY KEY (id);


--
-- Name: ai_agents ai_agents_empresa_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_agents
    ADD CONSTRAINT ai_agents_empresa_id_slug_key UNIQUE (empresa_id, slug);


--
-- Name: ai_agents ai_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_agents
    ADD CONSTRAINT ai_agents_pkey PRIMARY KEY (id);


--
-- Name: alunos_cursos alunos_cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alunos_cursos
    ADD CONSTRAINT alunos_cursos_pkey PRIMARY KEY (usuario_id, curso_id);


--
-- Name: alunos_turmas alunos_turmas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alunos_turmas
    ADD CONSTRAINT alunos_turmas_pkey PRIMARY KEY (usuario_id, turma_id);


--
-- Name: api_keys api_keys_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key UNIQUE (key);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: atividades atividades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atividades
    ADD CONSTRAINT atividades_pkey PRIMARY KEY (id);


--
-- Name: aulas_concluidas aulas_concluidas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aulas_concluidas
    ADD CONSTRAINT aulas_concluidas_pkey PRIMARY KEY (usuario_id, aula_id);


--
-- Name: aulas aulas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT aulas_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_history chat_conversation_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_history
    ADD CONSTRAINT chat_conversation_history_pkey PRIMARY KEY (conversation_id);


--
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);


--
-- Name: chat_conversations chat_conversations_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_session_id_key UNIQUE (session_id);


--
-- Name: color_palettes color_palettes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.color_palettes
    ADD CONSTRAINT color_palettes_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: cronograma_itens cronograma_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_itens
    ADD CONSTRAINT cronograma_itens_pkey PRIMARY KEY (id);


--
-- Name: cronograma_semanas_dias cronograma_semanas_dias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_semanas_dias
    ADD CONSTRAINT cronograma_semanas_dias_pkey PRIMARY KEY (id);


--
-- Name: cronograma_tempo_estudos cronograma_tempo_estudos_cronograma_id_data_disciplina_id_f_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_tempo_estudos
    ADD CONSTRAINT cronograma_tempo_estudos_cronograma_id_data_disciplina_id_f_key UNIQUE (cronograma_id, data, disciplina_id, frente_id);


--
-- Name: cronograma_tempo_estudos cronograma_tempo_estudos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_tempo_estudos
    ADD CONSTRAINT cronograma_tempo_estudos_pkey PRIMARY KEY (id);


--
-- Name: cronogramas cronogramas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronogramas
    ADD CONSTRAINT cronogramas_pkey PRIMARY KEY (id);


--
-- Name: curso_modulos curso_modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_modulos
    ADD CONSTRAINT curso_modulos_pkey PRIMARY KEY (id);


--
-- Name: curso_modulos curso_modulos_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_modulos
    ADD CONSTRAINT curso_modulos_unique UNIQUE (curso_id, module_id);


--
-- Name: curso_plantao_quotas curso_plantao_quotas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_plantao_quotas
    ADD CONSTRAINT curso_plantao_quotas_pkey PRIMARY KEY (id);


--
-- Name: curso_plantao_quotas curso_plantao_quotas_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_plantao_quotas
    ADD CONSTRAINT curso_plantao_quotas_unique UNIQUE (curso_id);


--
-- Name: cursos_disciplinas cursos_disciplinas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos_disciplinas
    ADD CONSTRAINT cursos_disciplinas_pkey PRIMARY KEY (curso_id, disciplina_id);


--
-- Name: cursos_hotmart_products cursos_hotmart_products_curso_hotmart_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos_hotmart_products
    ADD CONSTRAINT cursos_hotmart_products_curso_hotmart_product_id_key UNIQUE (curso_id, hotmart_product_id);


--
-- Name: cursos_hotmart_products cursos_hotmart_products_empresa_hotmart_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos_hotmart_products
    ADD CONSTRAINT cursos_hotmart_products_empresa_hotmart_product_id_key UNIQUE (empresa_id, hotmart_product_id);


--
-- Name: cursos_hotmart_products cursos_hotmart_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos_hotmart_products
    ADD CONSTRAINT cursos_hotmart_products_pkey PRIMARY KEY (id);


--
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- Name: custom_theme_presets custom_theme_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_theme_presets
    ADD CONSTRAINT custom_theme_presets_pkey PRIMARY KEY (id);


--
-- Name: disciplinas disciplinas_nome_empresa_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT disciplinas_nome_empresa_unique UNIQUE (nome, empresa_id);


--
-- Name: disciplinas disciplinas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT disciplinas_pkey PRIMARY KEY (id);


--
-- Name: empresa_oauth_credentials empresa_oauth_credentials_empresa_id_provider_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa_oauth_credentials
    ADD CONSTRAINT empresa_oauth_credentials_empresa_id_provider_key UNIQUE (empresa_id, provider);


--
-- Name: empresa_oauth_credentials empresa_oauth_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa_oauth_credentials
    ADD CONSTRAINT empresa_oauth_credentials_pkey PRIMARY KEY (id);


--
-- Name: empresas empresas_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_cnpj_key UNIQUE (cnpj);


--
-- Name: empresas empresas_dominio_customizado_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_dominio_customizado_key UNIQUE (dominio_customizado);


--
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id);


--
-- Name: empresas empresas_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_slug_key UNIQUE (slug);


--
-- Name: empresas empresas_stripe_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_stripe_customer_id_key UNIQUE (stripe_customer_id);


--
-- Name: empresas empresas_subdomain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_subdomain_key UNIQUE (subdomain);


--
-- Name: flashcards flashcards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcards
    ADD CONSTRAINT flashcards_pkey PRIMARY KEY (id);


--
-- Name: font_schemes font_schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.font_schemes
    ADD CONSTRAINT font_schemes_pkey PRIMARY KEY (id);


--
-- Name: frentes frentes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frentes
    ADD CONSTRAINT frentes_pkey PRIMARY KEY (id);


--
-- Name: materiais_curso materiais_curso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materiais_curso
    ADD CONSTRAINT materiais_curso_pkey PRIMARY KEY (id);


--
-- Name: matriculas matriculas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matriculas
    ADD CONSTRAINT matriculas_pkey PRIMARY KEY (id);


--
-- Name: modalidades_curso modalidades_curso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modalidades_curso
    ADD CONSTRAINT modalidades_curso_pkey PRIMARY KEY (id);


--
-- Name: modalidades_curso modalidades_curso_slug_empresa_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modalidades_curso
    ADD CONSTRAINT modalidades_curso_slug_empresa_unique UNIQUE (slug, empresa_id);


--
-- Name: module_definitions module_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_definitions
    ADD CONSTRAINT module_definitions_pkey PRIMARY KEY (id);


--
-- Name: modulos modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_pkey PRIMARY KEY (id);


--
-- Name: papeis papeis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.papeis
    ADD CONSTRAINT papeis_pkey PRIMARY KEY (id);


--
-- Name: payment_providers payment_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_providers
    ADD CONSTRAINT payment_providers_pkey PRIMARY KEY (id);


--
-- Name: plantao_uso_mensal plantao_uso_mensal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantao_uso_mensal
    ADD CONSTRAINT plantao_uso_mensal_pkey PRIMARY KEY (id);


--
-- Name: plantao_uso_mensal plantao_uso_mensal_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantao_uso_mensal
    ADD CONSTRAINT plantao_uso_mensal_unique UNIQUE (usuario_id, empresa_id, ano_mes);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: progresso_atividades progresso_atividades_aluno_id_atividade_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_atividades
    ADD CONSTRAINT progresso_atividades_aluno_id_atividade_id_key UNIQUE (usuario_id, atividade_id);


--
-- Name: progresso_atividades progresso_atividades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_atividades
    ADD CONSTRAINT progresso_atividades_pkey PRIMARY KEY (id);


--
-- Name: progresso_flashcards progresso_flashcards_aluno_id_flashcard_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_flashcards
    ADD CONSTRAINT progresso_flashcards_aluno_id_flashcard_id_key UNIQUE (usuario_id, flashcard_id);


--
-- Name: progresso_flashcards progresso_flashcards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_flashcards
    ADD CONSTRAINT progresso_flashcards_pkey PRIMARY KEY (id);


--
-- Name: regras_atividades regras_atividades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regras_atividades
    ADD CONSTRAINT regras_atividades_pkey PRIMARY KEY (id);


--
-- Name: segmentos segmentos_nome_empresa_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segmentos
    ADD CONSTRAINT segmentos_nome_empresa_unique UNIQUE (nome, empresa_id);


--
-- Name: segmentos segmentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segmentos
    ADD CONSTRAINT segmentos_pkey PRIMARY KEY (id);


--
-- Name: segmentos segmentos_slug_empresa_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segmentos
    ADD CONSTRAINT segmentos_slug_empresa_unique UNIQUE (slug, empresa_id);


--
-- Name: sessoes_estudo sessoes_estudo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessoes_estudo
    ADD CONSTRAINT sessoes_estudo_pkey PRIMARY KEY (id);


--
-- Name: submodule_definitions submodule_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submodule_definitions
    ADD CONSTRAINT submodule_definitions_pkey PRIMARY KEY (module_id, id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_slug_key UNIQUE (slug);


--
-- Name: subscription_plans subscription_plans_stripe_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_stripe_product_id_key UNIQUE (stripe_product_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);


--
-- Name: superadmins superadmins_auth_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superadmins
    ADD CONSTRAINT superadmins_auth_user_id_key UNIQUE (auth_user_id);


--
-- Name: superadmins superadmins_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superadmins
    ADD CONSTRAINT superadmins_email_key UNIQUE (email);


--
-- Name: superadmins superadmins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superadmins
    ADD CONSTRAINT superadmins_pkey PRIMARY KEY (id);


--
-- Name: tenant_access_log tenant_access_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_access_log
    ADD CONSTRAINT tenant_access_log_pkey PRIMARY KEY (id);


--
-- Name: tenant_branding tenant_branding_empresa_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_branding
    ADD CONSTRAINT tenant_branding_empresa_id_key UNIQUE (empresa_id);


--
-- Name: tenant_branding tenant_branding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_branding
    ADD CONSTRAINT tenant_branding_pkey PRIMARY KEY (id);


--
-- Name: tenant_logos tenant_logos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_logos
    ADD CONSTRAINT tenant_logos_pkey PRIMARY KEY (id);


--
-- Name: tenant_logos tenant_logos_tenant_branding_id_logo_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_logos
    ADD CONSTRAINT tenant_logos_tenant_branding_id_logo_type_key UNIQUE (tenant_branding_id, logo_type);


--
-- Name: tenant_module_visibility tenant_module_visibility_empresa_id_module_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_module_visibility
    ADD CONSTRAINT tenant_module_visibility_empresa_id_module_id_key UNIQUE (empresa_id, module_id);


--
-- Name: tenant_module_visibility tenant_module_visibility_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_module_visibility
    ADD CONSTRAINT tenant_module_visibility_pkey PRIMARY KEY (id);


--
-- Name: tenant_submodule_visibility tenant_submodule_visibility_empresa_id_module_id_submodule__key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_submodule_visibility
    ADD CONSTRAINT tenant_submodule_visibility_empresa_id_module_id_submodule__key UNIQUE (empresa_id, module_id, submodule_id);


--
-- Name: tenant_submodule_visibility tenant_submodule_visibility_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_submodule_visibility
    ADD CONSTRAINT tenant_submodule_visibility_pkey PRIMARY KEY (id);


--
-- Name: termos_aceite termos_aceite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.termos_aceite
    ADD CONSTRAINT termos_aceite_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: turmas turmas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turmas
    ADD CONSTRAINT turmas_pkey PRIMARY KEY (id);


--
-- Name: cronograma_semanas_dias unique_cronograma_dias; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_semanas_dias
    ADD CONSTRAINT unique_cronograma_dias UNIQUE (cronograma_id);


--
-- Name: agendamento_recorrencia_turmas unique_recorrencia_turma; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_recorrencia_turmas
    ADD CONSTRAINT unique_recorrencia_turma UNIQUE (recorrencia_id, turma_id);


--
-- Name: usuarios_empresas uq_usuario_empresa_papel; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_empresas
    ADD CONSTRAINT uq_usuario_empresa_papel UNIQUE (usuario_id, empresa_id, papel_base);


--
-- Name: usuarios_disciplinas usuarios_disciplinas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_disciplinas
    ADD CONSTRAINT usuarios_disciplinas_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_empresa_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_empresa_unique UNIQUE (email, empresa_id);


--
-- Name: usuarios_empresas usuarios_empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_empresas
    ADD CONSTRAINT usuarios_empresas_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: chat_conversation_history_user_conversation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_conversation_history_user_conversation_idx ON public.chat_conversation_history USING btree (user_id, conversation_id);


--
-- Name: idx_agendamento_bloqueios_criado_por; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_bloqueios_criado_por ON public.agendamento_bloqueios USING btree (criado_por);


--
-- Name: idx_agendamento_bloqueios_empresa_tipo_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_bloqueios_empresa_tipo_data ON public.agendamento_bloqueios USING btree (empresa_id, tipo, data_inicio);


--
-- Name: idx_agendamento_bloqueios_periodo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_bloqueios_periodo ON public.agendamento_bloqueios USING gist (tstzrange(data_inicio, data_fim));


--
-- Name: idx_agendamento_bloqueios_professor_empresa_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_bloqueios_professor_empresa_data ON public.agendamento_bloqueios USING btree (professor_id, empresa_id, data_inicio, data_fim);


--
-- Name: idx_agendamento_configuracoes_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_configuracoes_empresa_id ON public.agendamento_configuracoes USING btree (empresa_id);


--
-- Name: idx_agendamento_disponibilidade_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_disponibilidade_empresa_id ON public.agendamento_disponibilidade USING btree (empresa_id);


--
-- Name: INDEX idx_agendamento_disponibilidade_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_agendamento_disponibilidade_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_agendamento_disponibilidade_professor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_disponibilidade_professor_id ON public.agendamento_disponibilidade USING btree (professor_id);


--
-- Name: idx_agendamento_notificacoes_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_notificacoes_empresa_id ON public.agendamento_notificacoes USING btree (empresa_id);


--
-- Name: idx_agendamento_notificacoes_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_notificacoes_pending ON public.agendamento_notificacoes USING btree (agendamento_id, tipo, destinatario_id) WHERE (enviado = false);


--
-- Name: idx_agendamento_recorrencia_data_periodo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_recorrencia_data_periodo ON public.agendamento_recorrencia USING btree (data_inicio, data_fim);


--
-- Name: idx_agendamento_recorrencia_dia_semana; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_recorrencia_dia_semana ON public.agendamento_recorrencia USING btree (dia_semana) WHERE (ativo = true);


--
-- Name: idx_agendamento_recorrencia_empresa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_recorrencia_empresa ON public.agendamento_recorrencia USING btree (empresa_id);


--
-- Name: idx_agendamento_recorrencia_professor_empresa_ativo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_recorrencia_professor_empresa_ativo ON public.agendamento_recorrencia USING btree (professor_id, empresa_id, ativo);


--
-- Name: idx_agendamento_relatorios_empresa_periodo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_relatorios_empresa_periodo ON public.agendamento_relatorios USING btree (empresa_id, periodo_inicio, periodo_fim);


--
-- Name: idx_agendamento_relatorios_gerado_em; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_relatorios_gerado_em ON public.agendamento_relatorios USING btree (gerado_em DESC);


--
-- Name: idx_agendamento_relatorios_gerado_por; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_relatorios_gerado_por ON public.agendamento_relatorios USING btree (gerado_por);


--
-- Name: idx_agendamento_relatorios_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamento_relatorios_tipo ON public.agendamento_relatorios USING btree (tipo);


--
-- Name: idx_agendamentos_aluno_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamentos_aluno_data ON public.agendamentos USING btree (aluno_id, data_inicio);


--
-- Name: idx_agendamentos_cancelado_por; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamentos_cancelado_por ON public.agendamentos USING btree (cancelado_por);


--
-- Name: idx_agendamentos_empresa_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamentos_empresa_data ON public.agendamentos USING btree (empresa_id, data_inicio DESC);


--
-- Name: idx_agendamentos_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamentos_empresa_id ON public.agendamentos USING btree (empresa_id);


--
-- Name: idx_agendamentos_lembrete; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamentos_lembrete ON public.agendamentos USING btree (lembrete_enviado, data_inicio) WHERE (status = 'confirmado'::text);


--
-- Name: idx_agendamentos_professor_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamentos_professor_data ON public.agendamentos USING btree (professor_id, data_inicio);


--
-- Name: idx_agendamentos_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agendamentos_status ON public.agendamentos USING btree (status);


--
-- Name: idx_ai_agents_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_agents_created_by ON public.ai_agents USING btree (created_by);


--
-- Name: INDEX idx_ai_agents_created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_ai_agents_created_by IS 'New feature index (AI agents). Low usage expected until feature scales.';


--
-- Name: idx_ai_agents_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_agents_empresa_id ON public.ai_agents USING btree (empresa_id);


--
-- Name: idx_ai_agents_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_agents_is_active ON public.ai_agents USING btree (is_active) WHERE (is_active = true);


--
-- Name: INDEX idx_ai_agents_is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_ai_agents_is_active IS 'New feature index (AI agents). Partial index for active agents.';


--
-- Name: idx_ai_agents_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_agents_is_default ON public.ai_agents USING btree (is_default) WHERE (is_default = true);


--
-- Name: INDEX idx_ai_agents_is_default; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_ai_agents_is_default IS 'New feature index (AI agents). Partial index for default agent.';


--
-- Name: idx_ai_agents_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_agents_slug ON public.ai_agents USING btree (slug);


--
-- Name: INDEX idx_ai_agents_slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_ai_agents_slug IS 'New feature index (AI agents). Slug lookup.';


--
-- Name: idx_ai_agents_updated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_agents_updated_by ON public.ai_agents USING btree (updated_by);


--
-- Name: INDEX idx_ai_agents_updated_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_ai_agents_updated_by IS 'New feature index (AI agents). FK audit.';


--
-- Name: idx_alunos_cursos_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alunos_cursos_curso_id ON public.alunos_cursos USING btree (curso_id);


--
-- Name: idx_alunos_turmas_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alunos_turmas_status ON public.alunos_turmas USING btree (status) WHERE (status = 'ativo'::public.enum_status_aluno_turma);


--
-- Name: idx_alunos_turmas_turma_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alunos_turmas_turma_id ON public.alunos_turmas USING btree (turma_id);


--
-- Name: INDEX idx_alunos_turmas_turma_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_alunos_turmas_turma_id IS 'FK support for turmas reference. Required for referential integrity performance.';


--
-- Name: idx_api_keys_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_keys_created_by ON public.api_keys USING btree (created_by);


--
-- Name: idx_api_keys_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_keys_empresa_id ON public.api_keys USING btree (empresa_id);


--
-- Name: idx_atividades_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_atividades_created_by ON public.atividades USING btree (created_by);


--
-- Name: idx_atividades_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_atividades_empresa_id ON public.atividades USING btree (empresa_id);


--
-- Name: idx_atividades_empresa_modulo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_atividades_empresa_modulo ON public.atividades USING btree (empresa_id, modulo_id);


--
-- Name: idx_atividades_modulo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_atividades_modulo ON public.atividades USING btree (modulo_id);


--
-- Name: idx_aulas_concluidas_aula_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aulas_concluidas_aula_id ON public.aulas_concluidas USING btree (aula_id);


--
-- Name: idx_aulas_concluidas_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aulas_concluidas_curso_id ON public.aulas_concluidas USING btree (curso_id);


--
-- Name: idx_aulas_concluidas_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aulas_concluidas_empresa_id ON public.aulas_concluidas USING btree (empresa_id);


--
-- Name: idx_aulas_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aulas_curso_id ON public.aulas USING btree (curso_id);


--
-- Name: INDEX idx_aulas_curso_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_aulas_curso_id IS 'Index for filtering aulas by curso_id in cronograma generation';


--
-- Name: idx_aulas_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aulas_empresa_id ON public.aulas USING btree (empresa_id);


--
-- Name: idx_aulas_empresa_modulo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aulas_empresa_modulo ON public.aulas USING btree (empresa_id, modulo_id);


--
-- Name: idx_aulas_modulo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aulas_modulo_id ON public.aulas USING btree (modulo_id);


--
-- Name: INDEX idx_aulas_modulo_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_aulas_modulo_id IS 'Index for filtering aulas by modulo_id in cronograma generation';


--
-- Name: idx_aulas_prioridade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aulas_prioridade ON public.aulas USING btree (prioridade);


--
-- Name: INDEX idx_aulas_prioridade; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_aulas_prioridade IS 'Partial index for aulas with priority > 0';


--
-- Name: idx_chat_conversation_history_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversation_history_empresa_id ON public.chat_conversation_history USING btree (empresa_id);


--
-- Name: idx_chat_conversations_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_empresa_id ON public.chat_conversations USING btree (empresa_id);


--
-- Name: INDEX idx_chat_conversations_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_chat_conversations_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_chat_conversations_empresa_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_empresa_user ON public.chat_conversations USING btree (empresa_id, user_id);


--
-- Name: INDEX idx_chat_conversations_empresa_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_chat_conversations_empresa_user IS 'Critical for RLS tenant isolation (composite). Do not remove.';


--
-- Name: idx_chat_conversations_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_session_id ON public.chat_conversations USING btree (session_id);


--
-- Name: idx_chat_conversations_user_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_user_active ON public.chat_conversations USING btree (user_id, is_active) WHERE (is_active = true);


--
-- Name: idx_chat_conversations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations USING btree (user_id);


--
-- Name: idx_chp_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chp_curso_id ON public.cursos_hotmart_products USING btree (curso_id);


--
-- Name: idx_chp_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chp_empresa_id ON public.cursos_hotmart_products USING btree (empresa_id);


--
-- Name: idx_chp_hotmart_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chp_hotmart_product_id ON public.cursos_hotmart_products USING btree (hotmart_product_id);


--
-- Name: idx_color_palettes_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_color_palettes_created_by ON public.color_palettes USING btree (created_by);


--
-- Name: idx_color_palettes_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_color_palettes_empresa_id ON public.color_palettes USING btree (empresa_id);


--
-- Name: idx_color_palettes_updated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_color_palettes_updated_by ON public.color_palettes USING btree (updated_by);


--
-- Name: idx_coupons_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_active ON public.coupons USING btree (active) WHERE (active = true);


--
-- Name: INDEX idx_coupons_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_coupons_active IS 'New feature index (financeiro). Active coupons filtering.';


--
-- Name: idx_coupons_empresa_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_coupons_empresa_code ON public.coupons USING btree (empresa_id, lower(code));


--
-- Name: idx_coupons_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_empresa_id ON public.coupons USING btree (empresa_id);


--
-- Name: idx_coupons_valid_until; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_valid_until ON public.coupons USING btree (valid_until) WHERE (valid_until IS NOT NULL);


--
-- Name: INDEX idx_coupons_valid_until; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_coupons_valid_until IS 'New feature index (financeiro). Coupon expiration filtering.';


--
-- Name: idx_cronograma_aluno; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronograma_aluno ON public.cronogramas USING btree (usuario_id);


--
-- Name: idx_cronograma_itens_data_prevista; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronograma_itens_data_prevista ON public.cronograma_itens USING btree (cronograma_id, data_prevista);


--
-- Name: idx_cronograma_semanas_dias_cronograma; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronograma_semanas_dias_cronograma ON public.cronograma_semanas_dias USING btree (cronograma_id);


--
-- Name: idx_cronograma_tempo_estudos_frente_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronograma_tempo_estudos_frente_id ON public.cronograma_tempo_estudos USING btree (frente_id);


--
-- Name: INDEX idx_cronograma_tempo_estudos_frente_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_cronograma_tempo_estudos_frente_id IS 'FK support for ON DELETE CASCADE from frentes. Required for referential integrity performance.';


--
-- Name: idx_cronogramas_curso_alvo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronogramas_curso_alvo_id ON public.cronogramas USING btree (curso_alvo_id);


--
-- Name: idx_cronogramas_empresa_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronogramas_empresa_created ON public.cronogramas USING btree (empresa_id, created_at DESC);


--
-- Name: idx_cronogramas_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronogramas_empresa_id ON public.cronogramas USING btree (empresa_id);


--
-- Name: idx_curso_modulos_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_curso_modulos_created_by ON public.curso_modulos USING btree (created_by);


--
-- Name: idx_curso_modulos_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_curso_modulos_curso_id ON public.curso_modulos USING btree (curso_id);


--
-- Name: idx_curso_modulos_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_curso_modulos_empresa_id ON public.curso_modulos USING btree (empresa_id);


--
-- Name: idx_curso_modulos_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_curso_modulos_module_id ON public.curso_modulos USING btree (module_id);


--
-- Name: INDEX idx_curso_modulos_module_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_curso_modulos_module_id IS 'FK support for module_definitions reference. Required for referential integrity performance.';


--
-- Name: idx_curso_plantao_quotas_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_curso_plantao_quotas_created_by ON public.curso_plantao_quotas USING btree (created_by);


--
-- Name: idx_curso_plantao_quotas_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_curso_plantao_quotas_curso_id ON public.curso_plantao_quotas USING btree (curso_id);


--
-- Name: idx_curso_plantao_quotas_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_curso_plantao_quotas_empresa_id ON public.curso_plantao_quotas USING btree (empresa_id);


--
-- Name: idx_curso_plantao_quotas_updated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_curso_plantao_quotas_updated_by ON public.curso_plantao_quotas USING btree (updated_by);


--
-- Name: idx_cursos_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursos_created_by ON public.cursos USING btree (created_by);


--
-- Name: idx_cursos_disciplina_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursos_disciplina_id ON public.cursos USING btree (disciplina_id);


--
-- Name: INDEX idx_cursos_disciplina_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_cursos_disciplina_id IS 'FK support for disciplinas reference. Required for referential integrity performance.';


--
-- Name: idx_cursos_disciplinas_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursos_disciplinas_curso_id ON public.cursos_disciplinas USING btree (curso_id);


--
-- Name: idx_cursos_disciplinas_disciplina_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursos_disciplinas_disciplina_id ON public.cursos_disciplinas USING btree (disciplina_id);


--
-- Name: idx_cursos_empresa_disciplina; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursos_empresa_disciplina ON public.cursos USING btree (empresa_id, disciplina_id);


--
-- Name: idx_cursos_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursos_empresa_id ON public.cursos USING btree (empresa_id);


--
-- Name: idx_cursos_modalidade_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursos_modalidade_id ON public.cursos USING btree (modalidade_id);


--
-- Name: INDEX idx_cursos_modalidade_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_cursos_modalidade_id IS 'FK support for modalidades_curso reference. Required for referential integrity performance.';


--
-- Name: idx_cursos_segmento_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cursos_segmento_id ON public.cursos USING btree (segmento_id);


--
-- Name: INDEX idx_cursos_segmento_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_cursos_segmento_id IS 'FK support for segmentos reference. Required for referential integrity performance.';


--
-- Name: idx_custom_theme_presets_color_palette_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_theme_presets_color_palette_id ON public.custom_theme_presets USING btree (color_palette_id);


--
-- Name: idx_custom_theme_presets_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_theme_presets_created_by ON public.custom_theme_presets USING btree (created_by);


--
-- Name: idx_custom_theme_presets_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_theme_presets_empresa_id ON public.custom_theme_presets USING btree (empresa_id);


--
-- Name: idx_custom_theme_presets_font_scheme_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_theme_presets_font_scheme_id ON public.custom_theme_presets USING btree (font_scheme_id);


--
-- Name: idx_custom_theme_presets_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_theme_presets_is_default ON public.custom_theme_presets USING btree (empresa_id, is_default) WHERE (is_default = true);


--
-- Name: INDEX idx_custom_theme_presets_is_default; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_custom_theme_presets_is_default IS 'Critical for RLS tenant isolation (empresa_id + is_default). Do not remove.';


--
-- Name: idx_custom_theme_presets_updated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_theme_presets_updated_by ON public.custom_theme_presets USING btree (updated_by);


--
-- Name: idx_disciplinas_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disciplinas_created_by ON public.disciplinas USING btree (created_by);


--
-- Name: idx_disciplinas_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disciplinas_empresa_id ON public.disciplinas USING btree (empresa_id) WHERE (empresa_id IS NOT NULL);


--
-- Name: INDEX idx_disciplinas_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_disciplinas_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_disciplinas_empresa_id_null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disciplinas_empresa_id_null ON public.disciplinas USING btree (id) WHERE (empresa_id IS NULL);


--
-- Name: idx_empresa_oauth_credentials_configured_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_empresa_oauth_credentials_configured_by ON public.empresa_oauth_credentials USING btree (configured_by);


--
-- Name: idx_empresa_oauth_creds_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_empresa_oauth_creds_empresa_id ON public.empresa_oauth_credentials USING btree (empresa_id);


--
-- Name: idx_empresa_oauth_creds_empresa_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_empresa_oauth_creds_empresa_provider ON public.empresa_oauth_credentials USING btree (empresa_id, provider) WHERE (active = true);


--
-- Name: INDEX idx_empresa_oauth_creds_empresa_provider; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_empresa_oauth_creds_empresa_provider IS 'Critical for RLS tenant isolation (empresa_id + provider). Do not remove.';


--
-- Name: idx_empresas_ativo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_empresas_ativo ON public.empresas USING btree (ativo);


--
-- Name: idx_empresas_cnpj; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_empresas_cnpj ON public.empresas USING btree (cnpj) WHERE (cnpj IS NOT NULL);


--
-- Name: idx_empresas_dominio_customizado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_empresas_dominio_customizado ON public.empresas USING btree (dominio_customizado) WHERE (dominio_customizado IS NOT NULL);


--
-- Name: idx_empresas_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_empresas_slug ON public.empresas USING btree (slug);


--
-- Name: idx_empresas_stripe_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_empresas_stripe_customer_id ON public.empresas USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL);


--
-- Name: idx_empresas_subdomain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_empresas_subdomain ON public.empresas USING btree (subdomain) WHERE (subdomain IS NOT NULL);


--
-- Name: idx_flashcards_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flashcards_empresa_id ON public.flashcards USING btree (empresa_id);


--
-- Name: idx_flashcards_empresa_modulo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flashcards_empresa_modulo ON public.flashcards USING btree (empresa_id, modulo_id);


--
-- Name: idx_flashcards_modulo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flashcards_modulo ON public.flashcards USING btree (modulo_id);


--
-- Name: idx_font_schemes_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_font_schemes_created_by ON public.font_schemes USING btree (created_by);


--
-- Name: idx_font_schemes_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_font_schemes_empresa_id ON public.font_schemes USING btree (empresa_id);


--
-- Name: idx_font_schemes_updated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_font_schemes_updated_by ON public.font_schemes USING btree (updated_by);


--
-- Name: idx_frentes_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_frentes_created_by ON public.frentes USING btree (created_by);


--
-- Name: idx_frentes_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_frentes_curso_id ON public.frentes USING btree (curso_id);


--
-- Name: INDEX idx_frentes_curso_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_frentes_curso_id IS 'Index for filtering frentes by curso_id';


--
-- Name: idx_frentes_disciplina_curso; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_frentes_disciplina_curso ON public.frentes USING btree (disciplina_id, curso_id);


--
-- Name: idx_frentes_disciplina_curso_composite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_frentes_disciplina_curso_composite ON public.frentes USING btree (disciplina_id, curso_id) WHERE (curso_id IS NOT NULL);


--
-- Name: INDEX idx_frentes_disciplina_curso_composite; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_frentes_disciplina_curso_composite IS 'Composite index for common query pattern disciplina + curso';


--
-- Name: idx_frentes_disciplina_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_frentes_disciplina_id ON public.frentes USING btree (disciplina_id);


--
-- Name: INDEX idx_frentes_disciplina_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_frentes_disciplina_id IS 'Index for filtering frentes by disciplina_id';


--
-- Name: idx_frentes_empresa_curso; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_frentes_empresa_curso ON public.frentes USING btree (empresa_id, curso_id);


--
-- Name: INDEX idx_frentes_empresa_curso; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_frentes_empresa_curso IS 'Critical for RLS tenant isolation (composite). Do not remove.';


--
-- Name: idx_frentes_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_frentes_empresa_id ON public.frentes USING btree (empresa_id);


--
-- Name: INDEX idx_frentes_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_frentes_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_itens_aula; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_itens_aula ON public.cronograma_itens USING btree (aula_id);


--
-- Name: idx_itens_busca_semana; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_itens_busca_semana ON public.cronograma_itens USING btree (cronograma_id, semana_numero);


--
-- Name: idx_itens_cronograma; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_itens_cronograma ON public.cronograma_itens USING btree (cronograma_id);


--
-- Name: idx_materiais_curso_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_materiais_curso_created_by ON public.materiais_curso USING btree (created_by);


--
-- Name: idx_materiais_curso_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_materiais_curso_curso_id ON public.materiais_curso USING btree (curso_id);


--
-- Name: idx_materiais_curso_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_materiais_curso_empresa_id ON public.materiais_curso USING btree (empresa_id);


--
-- Name: idx_materiais_empresa_curso; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_materiais_empresa_curso ON public.materiais_curso USING btree (empresa_id, curso_id);


--
-- Name: idx_matriculas_aluno_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matriculas_aluno_id ON public.matriculas USING btree (usuario_id);


--
-- Name: idx_matriculas_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matriculas_curso_id ON public.matriculas USING btree (curso_id);


--
-- Name: idx_matriculas_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matriculas_empresa_id ON public.matriculas USING btree (empresa_id);


--
-- Name: idx_matriculas_empresa_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matriculas_empresa_usuario ON public.matriculas USING btree (empresa_id, usuario_id);


--
-- Name: idx_modalidades_curso_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modalidades_curso_created_by ON public.modalidades_curso USING btree (created_by);


--
-- Name: idx_modalidades_curso_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modalidades_curso_empresa_id ON public.modalidades_curso USING btree (empresa_id);


--
-- Name: INDEX idx_modalidades_curso_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_modalidades_curso_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_modulos_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modulos_curso_id ON public.modulos USING btree (curso_id);


--
-- Name: INDEX idx_modulos_curso_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_modulos_curso_id IS 'Index for filtering modulos by curso_id';


--
-- Name: idx_modulos_empresa_frente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modulos_empresa_frente ON public.modulos USING btree (empresa_id, frente_id);


--
-- Name: INDEX idx_modulos_empresa_frente; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_modulos_empresa_frente IS 'Critical for RLS tenant isolation (composite). Do not remove.';


--
-- Name: idx_modulos_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modulos_empresa_id ON public.modulos USING btree (empresa_id);


--
-- Name: idx_modulos_frente_curso_composite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modulos_frente_curso_composite ON public.modulos USING btree (frente_id, curso_id) WHERE (curso_id IS NOT NULL);


--
-- Name: INDEX idx_modulos_frente_curso_composite; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_modulos_frente_curso_composite IS 'Composite index for modulos query pattern frente + curso';


--
-- Name: idx_modulos_frente_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modulos_frente_id ON public.modulos USING btree (frente_id);


--
-- Name: INDEX idx_modulos_frente_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_modulos_frente_id IS 'Index for filtering modulos by frente_id';


--
-- Name: idx_modulos_importancia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modulos_importancia ON public.modulos USING btree (importancia);


--
-- Name: idx_notificacoes_agendamento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificacoes_agendamento ON public.agendamento_notificacoes USING btree (agendamento_id);


--
-- Name: idx_notificacoes_destinatario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificacoes_destinatario ON public.agendamento_notificacoes USING btree (destinatario_id, created_at);


--
-- Name: idx_notificacoes_enviado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificacoes_enviado ON public.agendamento_notificacoes USING btree (enviado, created_at);


--
-- Name: idx_papeis_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_papeis_empresa_id ON public.papeis USING btree (empresa_id);


--
-- Name: idx_papeis_is_system; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_papeis_is_system ON public.papeis USING btree (is_system) WHERE (is_system = true);


--
-- Name: idx_papeis_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_papeis_tipo ON public.papeis USING btree (tipo);


--
-- Name: idx_payment_providers_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_providers_active ON public.payment_providers USING btree (active) WHERE (active = true);


--
-- Name: INDEX idx_payment_providers_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_payment_providers_active IS 'New feature index (financeiro). Active providers filtering.';


--
-- Name: idx_payment_providers_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_providers_empresa_id ON public.payment_providers USING btree (empresa_id);


--
-- Name: idx_payment_providers_empresa_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_payment_providers_empresa_provider ON public.payment_providers USING btree (empresa_id, provider) WHERE (active = true);


--
-- Name: idx_plantao_uso_mensal_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plantao_uso_mensal_empresa_id ON public.plantao_uso_mensal USING btree (empresa_id);


--
-- Name: INDEX idx_plantao_uso_mensal_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_plantao_uso_mensal_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_plantao_uso_mensal_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plantao_uso_mensal_lookup ON public.plantao_uso_mensal USING btree (usuario_id, empresa_id, ano_mes);


--
-- Name: idx_products_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_active ON public.products USING btree (active) WHERE (active = true);


--
-- Name: INDEX idx_products_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_products_active IS 'New feature index (financeiro). Active products filtering.';


--
-- Name: idx_products_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_curso_id ON public.products USING btree (curso_id);


--
-- Name: idx_products_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_empresa_id ON public.products USING btree (empresa_id);


--
-- Name: idx_products_provider_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_provider_product_id ON public.products USING btree (provider_product_id);


--
-- Name: INDEX idx_products_provider_product_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_products_provider_product_id IS 'New feature index (financeiro). Provider product ID lookup.';


--
-- Name: idx_products_provider_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_products_provider_unique ON public.products USING btree (empresa_id, provider, provider_product_id) WHERE (provider_product_id IS NOT NULL);


--
-- Name: idx_progresso_aluno_atividade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_aluno_atividade ON public.progresso_atividades USING btree (usuario_id, atividade_id);


--
-- Name: idx_progresso_atividades_atividade_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_atividades_atividade_id ON public.progresso_atividades USING btree (atividade_id);


--
-- Name: idx_progresso_atividades_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_atividades_empresa_id ON public.progresso_atividades USING btree (empresa_id);


--
-- Name: INDEX idx_progresso_atividades_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_progresso_atividades_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_progresso_atividades_empresa_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_atividades_empresa_usuario ON public.progresso_atividades USING btree (empresa_id, usuario_id);


--
-- Name: INDEX idx_progresso_atividades_empresa_usuario; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_progresso_atividades_empresa_usuario IS 'Critical for RLS tenant isolation (composite). Do not remove.';


--
-- Name: idx_progresso_flash_aluno; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_flash_aluno ON public.progresso_flashcards USING btree (usuario_id, data_proxima_revisao);


--
-- Name: idx_progresso_flashcards_aluno_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_flashcards_aluno_id ON public.progresso_flashcards USING btree (usuario_id);


--
-- Name: idx_progresso_flashcards_data_revisao; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_flashcards_data_revisao ON public.progresso_flashcards USING btree (data_proxima_revisao);


--
-- Name: idx_progresso_flashcards_empresa_aluno; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_flashcards_empresa_aluno ON public.progresso_flashcards USING btree (empresa_id, usuario_id);


--
-- Name: INDEX idx_progresso_flashcards_empresa_aluno; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_progresso_flashcards_empresa_aluno IS 'Critical for RLS tenant isolation (composite). Do not remove.';


--
-- Name: idx_progresso_flashcards_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_flashcards_empresa_id ON public.progresso_flashcards USING btree (empresa_id);


--
-- Name: idx_progresso_flashcards_flashcard_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_flashcards_flashcard_id ON public.progresso_flashcards USING btree (flashcard_id);


--
-- Name: idx_progresso_flashcards_ultimo_feedback; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progresso_flashcards_ultimo_feedback ON public.progresso_flashcards USING btree (ultimo_feedback) WHERE (ultimo_feedback IS NOT NULL);


--
-- Name: idx_recorrencia_turmas_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recorrencia_turmas_empresa_id ON public.agendamento_recorrencia_turmas USING btree (empresa_id);


--
-- Name: idx_recorrencia_turmas_recorrencia_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recorrencia_turmas_recorrencia_id ON public.agendamento_recorrencia_turmas USING btree (recorrencia_id);


--
-- Name: idx_recorrencia_turmas_turma_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recorrencia_turmas_turma_id ON public.agendamento_recorrencia_turmas USING btree (turma_id);


--
-- Name: idx_regras_atividades_curso; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_regras_atividades_curso ON public.regras_atividades USING btree (curso_id);


--
-- Name: INDEX idx_regras_atividades_curso; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_regras_atividades_curso IS 'FK support for cursos reference. Required for referential integrity performance.';


--
-- Name: idx_regras_atividades_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_regras_atividades_empresa_id ON public.regras_atividades USING btree (empresa_id);


--
-- Name: INDEX idx_regras_atividades_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_regras_atividades_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_segmentos_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_segmentos_created_by ON public.segmentos USING btree (created_by);


--
-- Name: idx_segmentos_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_segmentos_empresa_id ON public.segmentos USING btree (empresa_id) WHERE (empresa_id IS NOT NULL);


--
-- Name: INDEX idx_segmentos_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_segmentos_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_sessoes_aluno_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessoes_aluno_data ON public.sessoes_estudo USING btree (usuario_id, inicio);


--
-- Name: idx_sessoes_disciplina; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessoes_disciplina ON public.sessoes_estudo USING btree (disciplina_id);


--
-- Name: INDEX idx_sessoes_disciplina; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_sessoes_disciplina IS 'FK support for disciplinas reference. Required for referential integrity performance.';


--
-- Name: idx_sessoes_estudo_atividade_relacionada_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessoes_estudo_atividade_relacionada_id ON public.sessoes_estudo USING btree (atividade_relacionada_id);


--
-- Name: idx_sessoes_estudo_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessoes_estudo_empresa_id ON public.sessoes_estudo USING btree (empresa_id);


--
-- Name: idx_sessoes_estudo_empresa_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessoes_estudo_empresa_usuario ON public.sessoes_estudo USING btree (empresa_id, usuario_id);


--
-- Name: INDEX idx_sessoes_estudo_empresa_usuario; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_sessoes_estudo_empresa_usuario IS 'Critical for RLS tenant isolation (composite). Do not remove.';


--
-- Name: idx_sessoes_estudo_frente_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessoes_estudo_frente_id ON public.sessoes_estudo USING btree (frente_id);


--
-- Name: INDEX idx_sessoes_estudo_frente_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_sessoes_estudo_frente_id IS 'FK support for frentes reference. Required for referential integrity performance.';


--
-- Name: idx_sessoes_estudo_modulo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessoes_estudo_modulo_id ON public.sessoes_estudo USING btree (modulo_id);


--
-- Name: INDEX idx_sessoes_estudo_modulo_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_sessoes_estudo_modulo_id IS 'FK support for modulos reference. Required for referential integrity performance.';


--
-- Name: idx_sessoes_estudo_usuario_modulo_inicio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessoes_estudo_usuario_modulo_inicio ON public.sessoes_estudo USING btree (usuario_id, modulo_id, inicio);


--
-- Name: idx_subscription_plans_active_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscription_plans_active_order ON public.subscription_plans USING btree (active, display_order);


--
-- Name: idx_subscriptions_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_empresa_id ON public.subscriptions USING btree (empresa_id);


--
-- Name: idx_subscriptions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);


--
-- Name: idx_subscriptions_stripe_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions USING btree (stripe_customer_id);


--
-- Name: idx_superadmins_auth_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_superadmins_auth_user_id ON public.superadmins USING btree (auth_user_id);


--
-- Name: idx_superadmins_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_superadmins_email ON public.superadmins USING btree (email);


--
-- Name: idx_tempo_estudos_cronograma_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tempo_estudos_cronograma_data ON public.cronograma_tempo_estudos USING btree (cronograma_id, data);


--
-- Name: idx_tempo_estudos_disciplina_frente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tempo_estudos_disciplina_frente ON public.cronograma_tempo_estudos USING btree (disciplina_id, frente_id);


--
-- Name: idx_tenant_access_log_empresa_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_access_log_empresa_created ON public.tenant_access_log USING btree (empresa_id, created_at DESC);


--
-- Name: idx_tenant_access_log_table; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_access_log_table ON public.tenant_access_log USING btree (table_name, created_at DESC);


--
-- Name: idx_tenant_access_log_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_access_log_usuario ON public.tenant_access_log USING btree (usuario_id, created_at DESC);


--
-- Name: idx_tenant_branding_color_palette_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_branding_color_palette_id ON public.tenant_branding USING btree (color_palette_id);


--
-- Name: idx_tenant_branding_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_branding_created_by ON public.tenant_branding USING btree (created_by);


--
-- Name: idx_tenant_branding_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_branding_empresa_id ON public.tenant_branding USING btree (empresa_id);


--
-- Name: idx_tenant_branding_font_scheme_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_branding_font_scheme_id ON public.tenant_branding USING btree (font_scheme_id);


--
-- Name: idx_tenant_branding_updated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_branding_updated_by ON public.tenant_branding USING btree (updated_by);


--
-- Name: idx_tenant_logos_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_logos_empresa_id ON public.tenant_logos USING btree (empresa_id);


--
-- Name: INDEX idx_tenant_logos_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_tenant_logos_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_tenant_logos_logo_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_logos_logo_type ON public.tenant_logos USING btree (logo_type);


--
-- Name: idx_tenant_logos_tenant_branding_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_logos_tenant_branding_id ON public.tenant_logos USING btree (tenant_branding_id);


--
-- Name: idx_tenant_module_visibility_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_module_visibility_created_by ON public.tenant_module_visibility USING btree (created_by);


--
-- Name: idx_tenant_module_visibility_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_module_visibility_empresa_id ON public.tenant_module_visibility USING btree (empresa_id);


--
-- Name: idx_tenant_module_visibility_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_module_visibility_module_id ON public.tenant_module_visibility USING btree (module_id);


--
-- Name: idx_tenant_module_visibility_updated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_module_visibility_updated_by ON public.tenant_module_visibility USING btree (updated_by);


--
-- Name: idx_tenant_submodule_visibility_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_submodule_visibility_created_by ON public.tenant_submodule_visibility USING btree (created_by);


--
-- Name: idx_tenant_submodule_visibility_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_submodule_visibility_empresa_id ON public.tenant_submodule_visibility USING btree (empresa_id);


--
-- Name: idx_tenant_submodule_visibility_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_submodule_visibility_module_id ON public.tenant_submodule_visibility USING btree (module_id);


--
-- Name: idx_tenant_submodule_visibility_module_submodule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_submodule_visibility_module_submodule ON public.tenant_submodule_visibility USING btree (module_id, submodule_id);


--
-- Name: idx_tenant_submodule_visibility_updated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_submodule_visibility_updated_by ON public.tenant_submodule_visibility USING btree (updated_by);


--
-- Name: idx_termos_aceite_empresa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_termos_aceite_empresa ON public.termos_aceite USING btree (empresa_id);


--
-- Name: idx_termos_aceite_usuario_empresa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_termos_aceite_usuario_empresa ON public.termos_aceite USING btree (usuario_id, empresa_id);


--
-- Name: idx_transactions_aluno_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_aluno_id ON public.transactions USING btree (usuario_id);


--
-- Name: idx_transactions_buyer_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_buyer_email ON public.transactions USING btree (buyer_email);


--
-- Name: INDEX idx_transactions_buyer_email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_transactions_buyer_email IS 'New feature index (financeiro). Buyer email lookup.';


--
-- Name: idx_transactions_coupon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_coupon_id ON public.transactions USING btree (coupon_id);


--
-- Name: INDEX idx_transactions_coupon_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_transactions_coupon_id IS 'New feature index (financeiro). FK to coupons.';


--
-- Name: idx_transactions_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_empresa_id ON public.transactions USING btree (empresa_id);


--
-- Name: idx_transactions_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_product_id ON public.transactions USING btree (product_id);


--
-- Name: idx_transactions_provider_tx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_provider_tx ON public.transactions USING btree (provider, provider_transaction_id);


--
-- Name: INDEX idx_transactions_provider_tx; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_transactions_provider_tx IS 'New feature index (financeiro). Provider transaction lookup.';


--
-- Name: idx_transactions_provider_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_transactions_provider_unique ON public.transactions USING btree (empresa_id, provider, provider_transaction_id) WHERE (provider_transaction_id IS NOT NULL);


--
-- Name: idx_transactions_sale_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_sale_date ON public.transactions USING btree (sale_date DESC);


--
-- Name: idx_transactions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_status ON public.transactions USING btree (status);


--
-- Name: INDEX idx_transactions_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_transactions_status IS 'New feature index (financeiro). Transaction status filtering.';


--
-- Name: idx_turmas_ativo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_turmas_ativo ON public.turmas USING btree (ativo) WHERE (ativo = true);


--
-- Name: idx_turmas_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_turmas_curso_id ON public.turmas USING btree (curso_id);


--
-- Name: idx_turmas_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_turmas_empresa_id ON public.turmas USING btree (empresa_id);


--
-- Name: idx_ue_active_bindings; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ue_active_bindings ON public.usuarios_empresas USING btree (usuario_id, empresa_id) WHERE ((ativo = true) AND (deleted_at IS NULL));


--
-- Name: idx_ue_ativo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ue_ativo ON public.usuarios_empresas USING btree (ativo) WHERE (ativo = true);


--
-- Name: idx_ue_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ue_empresa_id ON public.usuarios_empresas USING btree (empresa_id);


--
-- Name: idx_ue_is_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ue_is_admin ON public.usuarios_empresas USING btree (is_admin) WHERE (is_admin = true);


--
-- Name: idx_ue_papel_base; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ue_papel_base ON public.usuarios_empresas USING btree (papel_base);


--
-- Name: idx_ue_usuario_empresa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ue_usuario_empresa ON public.usuarios_empresas USING btree (usuario_id, empresa_id);


--
-- Name: idx_ue_usuario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ue_usuario_id ON public.usuarios_empresas USING btree (usuario_id);


--
-- Name: idx_usuarios_ativo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_ativo ON public.usuarios USING btree (ativo) WHERE (ativo = true);


--
-- Name: idx_usuarios_disciplinas_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_disciplinas_curso_id ON public.usuarios_disciplinas USING btree (curso_id);


--
-- Name: INDEX idx_usuarios_disciplinas_curso_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_usuarios_disciplinas_curso_id IS 'FK support for cursos reference. Required for referential integrity performance.';


--
-- Name: idx_usuarios_disciplinas_disciplina_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_disciplinas_disciplina_id ON public.usuarios_disciplinas USING btree (disciplina_id);


--
-- Name: INDEX idx_usuarios_disciplinas_disciplina_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_usuarios_disciplinas_disciplina_id IS 'FK support for disciplinas reference. Required for referential integrity performance.';


--
-- Name: idx_usuarios_disciplinas_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_disciplinas_empresa_id ON public.usuarios_disciplinas USING btree (empresa_id);


--
-- Name: INDEX idx_usuarios_disciplinas_empresa_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_usuarios_disciplinas_empresa_id IS 'Critical for RLS tenant isolation. Do not remove.';


--
-- Name: idx_usuarios_disciplinas_frente_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_disciplinas_frente_id ON public.usuarios_disciplinas USING btree (frente_id);


--
-- Name: INDEX idx_usuarios_disciplinas_frente_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_usuarios_disciplinas_frente_id IS 'FK support for frentes reference. Required for referential integrity performance.';


--
-- Name: idx_usuarios_disciplinas_modulo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_disciplinas_modulo_id ON public.usuarios_disciplinas USING btree (modulo_id);


--
-- Name: INDEX idx_usuarios_disciplinas_modulo_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_usuarios_disciplinas_modulo_id IS 'FK support for modulos reference. Required for referential integrity performance.';


--
-- Name: idx_usuarios_disciplinas_turma_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_disciplinas_turma_id ON public.usuarios_disciplinas USING btree (turma_id);


--
-- Name: INDEX idx_usuarios_disciplinas_turma_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_usuarios_disciplinas_turma_id IS 'FK support for turmas reference. Required for referential integrity performance.';


--
-- Name: idx_usuarios_disciplinas_usuario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_disciplinas_usuario_id ON public.usuarios_disciplinas USING btree (usuario_id);


--
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: idx_usuarios_empresa_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_empresa_active ON public.usuarios USING btree (empresa_id) WHERE ((deleted_at IS NULL) AND (ativo = true));


--
-- Name: idx_usuarios_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_empresa_id ON public.usuarios USING btree (empresa_id);


--
-- Name: idx_usuarios_empresas_papel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_empresas_papel_id ON public.usuarios_empresas USING btree (papel_id);


--
-- Name: idx_usuarios_papel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_papel_id ON public.usuarios USING btree (papel_id);


--
-- Name: papeis_nome_empresa_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX papeis_nome_empresa_unique ON public.papeis USING btree (nome, empresa_id) WHERE (empresa_id IS NOT NULL);


--
-- Name: papeis_nome_system_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX papeis_nome_system_unique ON public.papeis USING btree (nome) WHERE ((empresa_id IS NULL) AND (is_system = true));


--
-- Name: usuarios_cpf_empresa_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_cpf_empresa_unique ON public.usuarios USING btree (cpf, empresa_id) WHERE (cpf IS NOT NULL);


--
-- Name: stats_cursos_empresa_disciplina; Type: STATISTICS; Schema: public; Owner: -
--

CREATE STATISTICS public.stats_cursos_empresa_disciplina ON disciplina_id, empresa_id FROM public.cursos;


--
-- Name: stats_usuarios_empresa_ativo; Type: STATISTICS; Schema: public; Owner: -
--

CREATE STATISTICS public.stats_usuarios_empresa_ativo ON empresa_id, ativo FROM public.usuarios;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: coupons coupons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: chat_conversations ensure_single_active_conversation_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ensure_single_active_conversation_trigger BEFORE INSERT OR UPDATE ON public.chat_conversations FOR EACH ROW WHEN ((new.is_active = true)) EXECUTE FUNCTION public.ensure_single_active_conversation();


--
-- Name: agendamento_bloqueios handle_updated_at_agendamento_bloqueios; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_agendamento_bloqueios BEFORE UPDATE ON public.agendamento_bloqueios FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agendamento_configuracoes handle_updated_at_agendamento_configuracoes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_agendamento_configuracoes BEFORE UPDATE ON public.agendamento_configuracoes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agendamento_disponibilidade handle_updated_at_agendamento_disponibilidade; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_agendamento_disponibilidade BEFORE UPDATE ON public.agendamento_disponibilidade FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agendamento_recorrencia handle_updated_at_agendamento_recorrencia; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_agendamento_recorrencia BEFORE UPDATE ON public.agendamento_recorrencia FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agendamento_relatorios handle_updated_at_agendamento_relatorios; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_agendamento_relatorios BEFORE UPDATE ON public.agendamento_relatorios FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agendamentos handle_updated_at_agendamentos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_agendamentos BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: ai_agents handle_updated_at_ai_agents; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_ai_agents BEFORE UPDATE ON public.ai_agents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: color_palettes handle_updated_at_color_palettes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_color_palettes BEFORE UPDATE ON public.color_palettes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: custom_theme_presets handle_updated_at_custom_theme_presets; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_custom_theme_presets BEFORE UPDATE ON public.custom_theme_presets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: empresa_oauth_credentials handle_updated_at_empresa_oauth_credentials; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_empresa_oauth_credentials BEFORE UPDATE ON public.empresa_oauth_credentials FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: empresas handle_updated_at_empresas; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_empresas BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: font_schemes handle_updated_at_font_schemes; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_font_schemes BEFORE UPDATE ON public.font_schemes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: sessoes_estudo handle_updated_at_sessoes_estudo; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_sessoes_estudo BEFORE UPDATE ON public.sessoes_estudo FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: tenant_branding handle_updated_at_tenant_branding; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_tenant_branding BEFORE UPDATE ON public.tenant_branding FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: tenant_logos handle_updated_at_tenant_logos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_tenant_logos BEFORE UPDATE ON public.tenant_logos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: tenant_module_visibility handle_updated_at_tenant_module_visibility; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_tenant_module_visibility BEFORE UPDATE ON public.tenant_module_visibility FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: tenant_submodule_visibility handle_updated_at_tenant_submodule_visibility; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_updated_at_tenant_submodule_visibility BEFORE UPDATE ON public.tenant_submodule_visibility FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: usuarios_empresas handle_usuarios_empresas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_usuarios_empresas_updated_at BEFORE UPDATE ON public.usuarios_empresas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agendamentos on_agendamento_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_agendamento_change AFTER INSERT OR UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.notify_agendamento_change();


--
-- Name: api_keys on_update_api_keys; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_api_keys BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: atividades on_update_atividades; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_atividades BEFORE UPDATE ON public.atividades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: aulas_concluidas on_update_aulas_concluidas; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_aulas_concluidas BEFORE UPDATE ON public.aulas_concluidas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: cronograma_semanas_dias on_update_cronograma_semanas_dias; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_cronograma_semanas_dias BEFORE UPDATE ON public.cronograma_semanas_dias FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: cronogramas on_update_cronogramas; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_cronogramas BEFORE UPDATE ON public.cronogramas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: cursos on_update_cursos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_cursos BEFORE UPDATE ON public.cursos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: disciplinas on_update_disciplinas; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_disciplinas BEFORE UPDATE ON public.disciplinas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: materiais_curso on_update_materiais; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_materiais BEFORE UPDATE ON public.materiais_curso FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: matriculas on_update_matriculas; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_matriculas BEFORE UPDATE ON public.matriculas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: progresso_atividades on_update_progresso; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_progresso BEFORE UPDATE ON public.progresso_atividades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: regras_atividades on_update_regras_atividades; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_regras_atividades BEFORE UPDATE ON public.regras_atividades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: segmentos on_update_segmentos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_segmentos BEFORE UPDATE ON public.segmentos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: cronograma_tempo_estudos on_update_tempo_estudos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_tempo_estudos BEFORE UPDATE ON public.cronograma_tempo_estudos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: usuarios_disciplinas on_update_usuarios_disciplinas; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_usuarios_disciplinas BEFORE UPDATE ON public.usuarios_disciplinas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: payment_providers payment_providers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER payment_providers_updated_at BEFORE UPDATE ON public.payment_providers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: products products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: chat_conversation_history set_chat_conversation_history_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_chat_conversation_history_updated_at BEFORE UPDATE ON public.chat_conversation_history FOR EACH ROW EXECUTE FUNCTION public.set_chat_conversation_history_updated_at();


--
-- Name: cursos set_created_by_cursos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_created_by_cursos BEFORE INSERT ON public.cursos FOR EACH ROW EXECUTE FUNCTION public.handle_created_by();


--
-- Name: disciplinas set_created_by_disciplinas; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_created_by_disciplinas BEFORE INSERT ON public.disciplinas FOR EACH ROW EXECUTE FUNCTION public.handle_created_by();


--
-- Name: TRIGGER set_created_by_disciplinas ON disciplinas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER set_created_by_disciplinas ON public.disciplinas IS 'Automatically sets created_by to the authenticated user when a disciplina is created';


--
-- Name: materiais_curso set_created_by_materiais; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_created_by_materiais BEFORE INSERT ON public.materiais_curso FOR EACH ROW EXECUTE FUNCTION public.handle_created_by();


--
-- Name: segmentos set_created_by_segmentos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_created_by_segmentos BEFORE INSERT ON public.segmentos FOR EACH ROW EXECUTE FUNCTION public.handle_created_by();


--
-- Name: transactions transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agendamento_configuracoes trg_autofill_agendamento_configuracoes_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autofill_agendamento_configuracoes_empresa BEFORE INSERT ON public.agendamento_configuracoes FOR EACH ROW EXECUTE FUNCTION public.autofill_agendamentos_empresa_id();


--
-- Name: agendamento_disponibilidade trg_autofill_agendamento_disponibilidade_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autofill_agendamento_disponibilidade_empresa BEFORE INSERT ON public.agendamento_disponibilidade FOR EACH ROW EXECUTE FUNCTION public.autofill_agendamentos_empresa_id();


--
-- Name: agendamentos trg_autofill_agendamentos_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autofill_agendamentos_empresa BEFORE INSERT ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.autofill_agendamentos_empresa_id();


--
-- Name: api_keys trg_autofill_api_keys_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autofill_api_keys_empresa_id BEFORE INSERT ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.autofill_api_keys_empresa_id();


--
-- Name: aulas_concluidas trg_autofill_aulas_concluidas_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autofill_aulas_concluidas_empresa BEFORE INSERT ON public.aulas_concluidas FOR EACH ROW EXECUTE FUNCTION public.autofill_aulas_concluidas_empresa_id();


--
-- Name: progresso_atividades trg_autofill_progresso_atividades_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autofill_progresso_atividades_empresa BEFORE INSERT ON public.progresso_atividades FOR EACH ROW EXECUTE FUNCTION public.autofill_progresso_atividades_empresa_id();


--
-- Name: progresso_flashcards trg_autofill_progresso_flashcards_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autofill_progresso_flashcards_empresa BEFORE INSERT ON public.progresso_flashcards FOR EACH ROW EXECUTE FUNCTION public.autofill_progresso_flashcards_empresa_id();


--
-- Name: regras_atividades trg_autofill_regras_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autofill_regras_empresa BEFORE INSERT ON public.regras_atividades FOR EACH ROW EXECUTE FUNCTION public.autofill_regras_empresa_id();


--
-- Name: sessoes_estudo trg_autofill_sessoes_estudo_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_autofill_sessoes_estudo_empresa BEFORE INSERT ON public.sessoes_estudo FOR EACH ROW EXECUTE FUNCTION public.autofill_sessoes_estudo_empresa_id();


--
-- Name: usuarios trg_cascade_usuario_deactivation; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cascade_usuario_deactivation AFTER UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.cascade_usuario_deactivation();


--
-- Name: usuarios_empresas trg_check_no_professor_aluno_same_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_check_no_professor_aluno_same_empresa BEFORE INSERT OR UPDATE OF usuario_id, empresa_id, papel_base, ativo, deleted_at ON public.usuarios_empresas FOR EACH ROW EXECUTE FUNCTION public.check_no_professor_and_aluno_same_empresa();


--
-- Name: curso_plantao_quotas trg_curso_plantao_quotas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_curso_plantao_quotas_updated_at BEFORE UPDATE ON public.curso_plantao_quotas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: plantao_uso_mensal trg_plantao_uso_mensal_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_plantao_uso_mensal_updated_at BEFORE UPDATE ON public.plantao_uso_mensal FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: alunos_cursos trg_sync_aluno_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_aluno_empresa_id AFTER INSERT ON public.alunos_cursos FOR EACH ROW EXECUTE FUNCTION public.sync_aluno_empresa_id();


--
-- Name: aulas trg_sync_aulas_tempo_estimado; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_aulas_tempo_estimado BEFORE INSERT OR UPDATE ON public.aulas FOR EACH ROW EXECUTE FUNCTION public.sync_aulas_tempo_estimado();


--
-- Name: curso_modulos trg_validate_curso_modulos_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_curso_modulos_tenant BEFORE INSERT OR UPDATE ON public.curso_modulos FOR EACH ROW EXECUTE FUNCTION public.validate_curso_modulos_tenant();


--
-- Name: curso_plantao_quotas trg_validate_curso_plantao_quotas_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_curso_plantao_quotas_tenant BEFORE INSERT OR UPDATE ON public.curso_plantao_quotas FOR EACH ROW EXECUTE FUNCTION public.validate_curso_plantao_quotas_tenant();


--
-- Name: atividades trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.atividades FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: aulas trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.aulas FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: cursos trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.cursos FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: disciplinas trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.disciplinas FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: flashcards trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.flashcards FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: frentes trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.frentes FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: materiais_curso trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.materiais_curso FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: modulos trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.modulos FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: papeis trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.papeis FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: segmentos trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.segmentos FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: turmas trg_validate_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_empresa_id BEFORE INSERT ON public.turmas FOR EACH ROW EXECUTE FUNCTION public.validate_empresa_id();


--
-- Name: matriculas trigger_set_matricula_empresa_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_matricula_empresa_id BEFORE INSERT ON public.matriculas FOR EACH ROW EXECUTE FUNCTION public.set_matricula_empresa_id();


--
-- Name: modulos trigger_set_modulo_curso_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_modulo_curso_id BEFORE INSERT OR UPDATE ON public.modulos FOR EACH ROW WHEN ((new.curso_id IS NULL)) EXECUTE FUNCTION public.set_modulo_curso_id_from_frente();


--
-- Name: subscription_plans trigger_subscription_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_subscription_plans_updated_at();


--
-- Name: subscriptions trigger_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_subscriptions_updated_at();


--
-- Name: superadmins trigger_superadmins_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_superadmins_updated_at BEFORE UPDATE ON public.superadmins FOR EACH ROW EXECUTE FUNCTION public.update_superadmins_updated_at();


--
-- Name: cursos_disciplinas trigger_validate_curso_disciplina_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_validate_curso_disciplina_tenant BEFORE INSERT OR UPDATE ON public.cursos_disciplinas FOR EACH ROW EXECUTE FUNCTION public.validate_curso_disciplina_tenant();


--
-- Name: cursos trigger_validate_curso_tenant; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_validate_curso_tenant BEFORE INSERT OR UPDATE ON public.cursos FOR EACH ROW EXECUTE FUNCTION public.validate_curso_tenant_references();


--
-- Name: turmas turmas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER turmas_updated_at BEFORE UPDATE ON public.turmas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chat_conversations update_chat_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: papeis update_papeis_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_papeis_updated_at BEFORE UPDATE ON public.papeis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: usuarios update_usuarios_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: agendamento_bloqueios agendamento_bloqueios_criado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_bloqueios
    ADD CONSTRAINT agendamento_bloqueios_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE RESTRICT;


--
-- Name: agendamento_bloqueios agendamento_bloqueios_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_bloqueios
    ADD CONSTRAINT agendamento_bloqueios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: agendamento_bloqueios agendamento_bloqueios_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_bloqueios
    ADD CONSTRAINT agendamento_bloqueios_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: agendamento_configuracoes agendamento_configuracoes_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_configuracoes
    ADD CONSTRAINT agendamento_configuracoes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: agendamento_configuracoes agendamento_configuracoes_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_configuracoes
    ADD CONSTRAINT agendamento_configuracoes_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: agendamento_disponibilidade agendamento_disponibilidade_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_disponibilidade
    ADD CONSTRAINT agendamento_disponibilidade_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: agendamento_disponibilidade agendamento_disponibilidade_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_disponibilidade
    ADD CONSTRAINT agendamento_disponibilidade_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: agendamento_notificacoes agendamento_notificacoes_agendamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_notificacoes
    ADD CONSTRAINT agendamento_notificacoes_agendamento_id_fkey FOREIGN KEY (agendamento_id) REFERENCES public.agendamentos(id) ON DELETE CASCADE;


--
-- Name: agendamento_notificacoes agendamento_notificacoes_destinatario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_notificacoes
    ADD CONSTRAINT agendamento_notificacoes_destinatario_id_fkey FOREIGN KEY (destinatario_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: agendamento_notificacoes agendamento_notificacoes_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_notificacoes
    ADD CONSTRAINT agendamento_notificacoes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: agendamento_recorrencia agendamento_recorrencia_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_recorrencia
    ADD CONSTRAINT agendamento_recorrencia_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: agendamento_recorrencia agendamento_recorrencia_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_recorrencia
    ADD CONSTRAINT agendamento_recorrencia_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: agendamento_recorrencia_turmas agendamento_recorrencia_turmas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_recorrencia_turmas
    ADD CONSTRAINT agendamento_recorrencia_turmas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: agendamento_recorrencia_turmas agendamento_recorrencia_turmas_recorrencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_recorrencia_turmas
    ADD CONSTRAINT agendamento_recorrencia_turmas_recorrencia_id_fkey FOREIGN KEY (recorrencia_id) REFERENCES public.agendamento_recorrencia(id) ON DELETE CASCADE;


--
-- Name: agendamento_recorrencia_turmas agendamento_recorrencia_turmas_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_recorrencia_turmas
    ADD CONSTRAINT agendamento_recorrencia_turmas_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE CASCADE;


--
-- Name: agendamento_relatorios agendamento_relatorios_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_relatorios
    ADD CONSTRAINT agendamento_relatorios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: agendamento_relatorios agendamento_relatorios_gerado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamento_relatorios
    ADD CONSTRAINT agendamento_relatorios_gerado_por_fkey FOREIGN KEY (gerado_por) REFERENCES auth.users(id) ON DELETE RESTRICT;


--
-- Name: agendamentos agendamentos_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: agendamentos agendamentos_cancelado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_cancelado_por_fkey FOREIGN KEY (cancelado_por) REFERENCES auth.users(id);


--
-- Name: agendamentos agendamentos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: agendamentos agendamentos_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: ai_agents ai_agents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_agents
    ADD CONSTRAINT ai_agents_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: ai_agents ai_agents_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_agents
    ADD CONSTRAINT ai_agents_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: ai_agents ai_agents_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_agents
    ADD CONSTRAINT ai_agents_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: alunos_cursos alunos_cursos_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alunos_cursos
    ADD CONSTRAINT alunos_cursos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: alunos_cursos alunos_cursos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alunos_cursos
    ADD CONSTRAINT alunos_cursos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: alunos_turmas alunos_turmas_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alunos_turmas
    ADD CONSTRAINT alunos_turmas_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE CASCADE;


--
-- Name: alunos_turmas alunos_turmas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alunos_turmas
    ADD CONSTRAINT alunos_turmas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: atividades atividades_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atividades
    ADD CONSTRAINT atividades_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: atividades atividades_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atividades
    ADD CONSTRAINT atividades_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: atividades atividades_modulo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atividades
    ADD CONSTRAINT atividades_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;


--
-- Name: aulas_concluidas aulas_concluidas_aula_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aulas_concluidas
    ADD CONSTRAINT aulas_concluidas_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;


--
-- Name: aulas_concluidas aulas_concluidas_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aulas_concluidas
    ADD CONSTRAINT aulas_concluidas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE SET NULL;


--
-- Name: aulas_concluidas aulas_concluidas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aulas_concluidas
    ADD CONSTRAINT aulas_concluidas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: aulas_concluidas aulas_concluidas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aulas_concluidas
    ADD CONSTRAINT aulas_concluidas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: aulas aulas_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT aulas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: aulas aulas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT aulas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_history chat_conversation_history_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_history
    ADD CONSTRAINT chat_conversation_history_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_history chat_conversation_history_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_history
    ADD CONSTRAINT chat_conversation_history_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: chat_conversation_history chat_conversation_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_history
    ADD CONSTRAINT chat_conversation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chat_conversations chat_conversations_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: chat_conversations chat_conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: color_palettes color_palettes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.color_palettes
    ADD CONSTRAINT color_palettes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: color_palettes color_palettes_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.color_palettes
    ADD CONSTRAINT color_palettes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: color_palettes color_palettes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.color_palettes
    ADD CONSTRAINT color_palettes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: coupons coupons_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: cronograma_itens cronograma_itens_cronograma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_itens
    ADD CONSTRAINT cronograma_itens_cronograma_id_fkey FOREIGN KEY (cronograma_id) REFERENCES public.cronogramas(id) ON DELETE CASCADE;


--
-- Name: cronograma_semanas_dias cronograma_semanas_dias_cronograma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_semanas_dias
    ADD CONSTRAINT cronograma_semanas_dias_cronograma_id_fkey FOREIGN KEY (cronograma_id) REFERENCES public.cronogramas(id) ON DELETE CASCADE;


--
-- Name: cronograma_tempo_estudos cronograma_tempo_estudos_cronograma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_tempo_estudos
    ADD CONSTRAINT cronograma_tempo_estudos_cronograma_id_fkey FOREIGN KEY (cronograma_id) REFERENCES public.cronogramas(id) ON DELETE CASCADE;


--
-- Name: cronogramas cronogramas_curso_alvo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronogramas
    ADD CONSTRAINT cronogramas_curso_alvo_id_fkey FOREIGN KEY (curso_alvo_id) REFERENCES public.cursos(id) ON DELETE SET NULL;


--
-- Name: cronogramas cronogramas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronogramas
    ADD CONSTRAINT cronogramas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: cronogramas cronogramas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronogramas
    ADD CONSTRAINT cronogramas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: curso_modulos curso_modulos_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_modulos
    ADD CONSTRAINT curso_modulos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.usuarios(id);


--
-- Name: curso_modulos curso_modulos_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_modulos
    ADD CONSTRAINT curso_modulos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: curso_modulos curso_modulos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_modulos
    ADD CONSTRAINT curso_modulos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: curso_modulos curso_modulos_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_modulos
    ADD CONSTRAINT curso_modulos_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.module_definitions(id) ON DELETE CASCADE;


--
-- Name: curso_plantao_quotas curso_plantao_quotas_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_plantao_quotas
    ADD CONSTRAINT curso_plantao_quotas_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.usuarios(id);


--
-- Name: curso_plantao_quotas curso_plantao_quotas_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_plantao_quotas
    ADD CONSTRAINT curso_plantao_quotas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: curso_plantao_quotas curso_plantao_quotas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_plantao_quotas
    ADD CONSTRAINT curso_plantao_quotas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: curso_plantao_quotas curso_plantao_quotas_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_plantao_quotas
    ADD CONSTRAINT curso_plantao_quotas_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.usuarios(id);


--
-- Name: cursos cursos_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: cursos cursos_disciplina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_disciplina_id_fkey FOREIGN KEY (disciplina_id) REFERENCES public.disciplinas(id) ON DELETE SET NULL;


--
-- Name: cursos_disciplinas cursos_disciplinas_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos_disciplinas
    ADD CONSTRAINT cursos_disciplinas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: cursos_disciplinas cursos_disciplinas_disciplina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos_disciplinas
    ADD CONSTRAINT cursos_disciplinas_disciplina_id_fkey FOREIGN KEY (disciplina_id) REFERENCES public.disciplinas(id) ON DELETE CASCADE;


--
-- Name: cursos cursos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: cursos_hotmart_products cursos_hotmart_products_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos_hotmart_products
    ADD CONSTRAINT cursos_hotmart_products_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: cursos_hotmart_products cursos_hotmart_products_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos_hotmart_products
    ADD CONSTRAINT cursos_hotmart_products_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: cursos cursos_modalidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_modalidade_id_fkey FOREIGN KEY (modalidade_id) REFERENCES public.modalidades_curso(id);


--
-- Name: cursos cursos_segmento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_segmento_id_fkey FOREIGN KEY (segmento_id) REFERENCES public.segmentos(id) ON DELETE SET NULL;


--
-- Name: custom_theme_presets custom_theme_presets_color_palette_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_theme_presets
    ADD CONSTRAINT custom_theme_presets_color_palette_id_fkey FOREIGN KEY (color_palette_id) REFERENCES public.color_palettes(id) ON DELETE SET NULL;


--
-- Name: custom_theme_presets custom_theme_presets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_theme_presets
    ADD CONSTRAINT custom_theme_presets_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: custom_theme_presets custom_theme_presets_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_theme_presets
    ADD CONSTRAINT custom_theme_presets_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: custom_theme_presets custom_theme_presets_font_scheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_theme_presets
    ADD CONSTRAINT custom_theme_presets_font_scheme_id_fkey FOREIGN KEY (font_scheme_id) REFERENCES public.font_schemes(id) ON DELETE SET NULL;


--
-- Name: custom_theme_presets custom_theme_presets_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_theme_presets
    ADD CONSTRAINT custom_theme_presets_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: disciplinas disciplinas_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT disciplinas_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: disciplinas disciplinas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT disciplinas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE SET NULL;


--
-- Name: empresa_oauth_credentials empresa_oauth_credentials_configured_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa_oauth_credentials
    ADD CONSTRAINT empresa_oauth_credentials_configured_by_fkey FOREIGN KEY (configured_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: empresa_oauth_credentials empresa_oauth_credentials_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa_oauth_credentials
    ADD CONSTRAINT empresa_oauth_credentials_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: empresas empresas_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: aulas fk_aulas_modulo_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT fk_aulas_modulo_id FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;


--
-- Name: cronograma_itens fk_cronograma_itens_aula_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_itens
    ADD CONSTRAINT fk_cronograma_itens_aula_id FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;


--
-- Name: cronograma_tempo_estudos fk_cronograma_tempo_estudos_disciplina_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_tempo_estudos
    ADD CONSTRAINT fk_cronograma_tempo_estudos_disciplina_id FOREIGN KEY (disciplina_id) REFERENCES public.disciplinas(id) ON DELETE CASCADE;


--
-- Name: cronograma_tempo_estudos fk_cronograma_tempo_estudos_frente_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cronograma_tempo_estudos
    ADD CONSTRAINT fk_cronograma_tempo_estudos_frente_id FOREIGN KEY (frente_id) REFERENCES public.frentes(id) ON DELETE CASCADE;


--
-- Name: modulos fk_modulos_frente_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT fk_modulos_frente_id FOREIGN KEY (frente_id) REFERENCES public.frentes(id) ON DELETE CASCADE;


--
-- Name: sessoes_estudo fk_sessoes_estudo_frente_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessoes_estudo
    ADD CONSTRAINT fk_sessoes_estudo_frente_id FOREIGN KEY (frente_id) REFERENCES public.frentes(id) ON DELETE SET NULL;


--
-- Name: sessoes_estudo fk_sessoes_estudo_modulo_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessoes_estudo
    ADD CONSTRAINT fk_sessoes_estudo_modulo_id FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE SET NULL;


--
-- Name: flashcards flashcards_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcards
    ADD CONSTRAINT flashcards_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: flashcards flashcards_modulo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcards
    ADD CONSTRAINT flashcards_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;


--
-- Name: font_schemes font_schemes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.font_schemes
    ADD CONSTRAINT font_schemes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: font_schemes font_schemes_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.font_schemes
    ADD CONSTRAINT font_schemes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: font_schemes font_schemes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.font_schemes
    ADD CONSTRAINT font_schemes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: frentes frentes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frentes
    ADD CONSTRAINT frentes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: frentes frentes_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frentes
    ADD CONSTRAINT frentes_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: frentes frentes_disciplina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frentes
    ADD CONSTRAINT frentes_disciplina_id_fkey FOREIGN KEY (disciplina_id) REFERENCES public.disciplinas(id) ON DELETE CASCADE;


--
-- Name: frentes frentes_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frentes
    ADD CONSTRAINT frentes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: materiais_curso materiais_curso_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materiais_curso
    ADD CONSTRAINT materiais_curso_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: materiais_curso materiais_curso_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materiais_curso
    ADD CONSTRAINT materiais_curso_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: materiais_curso materiais_curso_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materiais_curso
    ADD CONSTRAINT materiais_curso_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: matriculas matriculas_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matriculas
    ADD CONSTRAINT matriculas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: matriculas matriculas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matriculas
    ADD CONSTRAINT matriculas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: matriculas matriculas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matriculas
    ADD CONSTRAINT matriculas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: modalidades_curso modalidades_curso_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modalidades_curso
    ADD CONSTRAINT modalidades_curso_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: modalidades_curso modalidades_curso_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modalidades_curso
    ADD CONSTRAINT modalidades_curso_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: modulos modulos_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: modulos modulos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: papeis papeis_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.papeis
    ADD CONSTRAINT papeis_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: payment_providers payment_providers_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_providers
    ADD CONSTRAINT payment_providers_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: plantao_uso_mensal plantao_uso_mensal_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantao_uso_mensal
    ADD CONSTRAINT plantao_uso_mensal_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: plantao_uso_mensal plantao_uso_mensal_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plantao_uso_mensal
    ADD CONSTRAINT plantao_uso_mensal_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: products products_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE SET NULL;


--
-- Name: products products_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: progresso_atividades progresso_atividades_atividade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_atividades
    ADD CONSTRAINT progresso_atividades_atividade_id_fkey FOREIGN KEY (atividade_id) REFERENCES public.atividades(id) ON DELETE CASCADE;


--
-- Name: progresso_atividades progresso_atividades_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_atividades
    ADD CONSTRAINT progresso_atividades_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: progresso_atividades progresso_atividades_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_atividades
    ADD CONSTRAINT progresso_atividades_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: progresso_flashcards progresso_flashcards_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_flashcards
    ADD CONSTRAINT progresso_flashcards_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: progresso_flashcards progresso_flashcards_flashcard_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_flashcards
    ADD CONSTRAINT progresso_flashcards_flashcard_id_fkey FOREIGN KEY (flashcard_id) REFERENCES public.flashcards(id) ON DELETE CASCADE;


--
-- Name: progresso_flashcards progresso_flashcards_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progresso_flashcards
    ADD CONSTRAINT progresso_flashcards_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: regras_atividades regras_atividades_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regras_atividades
    ADD CONSTRAINT regras_atividades_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: regras_atividades regras_atividades_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regras_atividades
    ADD CONSTRAINT regras_atividades_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: segmentos segmentos_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segmentos
    ADD CONSTRAINT segmentos_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: segmentos segmentos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segmentos
    ADD CONSTRAINT segmentos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE SET NULL;


--
-- Name: sessoes_estudo sessoes_estudo_atividade_relacionada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessoes_estudo
    ADD CONSTRAINT sessoes_estudo_atividade_relacionada_id_fkey FOREIGN KEY (atividade_relacionada_id) REFERENCES public.atividades(id);


--
-- Name: sessoes_estudo sessoes_estudo_disciplina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessoes_estudo
    ADD CONSTRAINT sessoes_estudo_disciplina_id_fkey FOREIGN KEY (disciplina_id) REFERENCES public.disciplinas(id);


--
-- Name: sessoes_estudo sessoes_estudo_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessoes_estudo
    ADD CONSTRAINT sessoes_estudo_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: sessoes_estudo sessoes_estudo_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessoes_estudo
    ADD CONSTRAINT sessoes_estudo_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: submodule_definitions submodule_definitions_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submodule_definitions
    ADD CONSTRAINT submodule_definitions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.module_definitions(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: superadmins superadmins_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superadmins
    ADD CONSTRAINT superadmins_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tenant_access_log tenant_access_log_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_access_log
    ADD CONSTRAINT tenant_access_log_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: tenant_branding tenant_branding_color_palette_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_branding
    ADD CONSTRAINT tenant_branding_color_palette_id_fkey FOREIGN KEY (color_palette_id) REFERENCES public.color_palettes(id) ON DELETE SET NULL;


--
-- Name: tenant_branding tenant_branding_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_branding
    ADD CONSTRAINT tenant_branding_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: tenant_branding tenant_branding_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_branding
    ADD CONSTRAINT tenant_branding_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: tenant_branding tenant_branding_font_scheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_branding
    ADD CONSTRAINT tenant_branding_font_scheme_id_fkey FOREIGN KEY (font_scheme_id) REFERENCES public.font_schemes(id) ON DELETE SET NULL;


--
-- Name: tenant_branding tenant_branding_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_branding
    ADD CONSTRAINT tenant_branding_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: tenant_logos tenant_logos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_logos
    ADD CONSTRAINT tenant_logos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: tenant_logos tenant_logos_tenant_branding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_logos
    ADD CONSTRAINT tenant_logos_tenant_branding_id_fkey FOREIGN KEY (tenant_branding_id) REFERENCES public.tenant_branding(id) ON DELETE CASCADE;


--
-- Name: tenant_module_visibility tenant_module_visibility_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_module_visibility
    ADD CONSTRAINT tenant_module_visibility_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: tenant_module_visibility tenant_module_visibility_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_module_visibility
    ADD CONSTRAINT tenant_module_visibility_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: tenant_module_visibility tenant_module_visibility_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_module_visibility
    ADD CONSTRAINT tenant_module_visibility_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.module_definitions(id) ON DELETE CASCADE;


--
-- Name: tenant_module_visibility tenant_module_visibility_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_module_visibility
    ADD CONSTRAINT tenant_module_visibility_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: tenant_submodule_visibility tenant_submodule_visibility_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_submodule_visibility
    ADD CONSTRAINT tenant_submodule_visibility_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: tenant_submodule_visibility tenant_submodule_visibility_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_submodule_visibility
    ADD CONSTRAINT tenant_submodule_visibility_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: tenant_submodule_visibility tenant_submodule_visibility_module_id_submodule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_submodule_visibility
    ADD CONSTRAINT tenant_submodule_visibility_module_id_submodule_id_fkey FOREIGN KEY (module_id, submodule_id) REFERENCES public.submodule_definitions(module_id, id) ON DELETE CASCADE;


--
-- Name: tenant_submodule_visibility tenant_submodule_visibility_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_submodule_visibility
    ADD CONSTRAINT tenant_submodule_visibility_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: termos_aceite termos_aceite_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.termos_aceite
    ADD CONSTRAINT termos_aceite_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: termos_aceite termos_aceite_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.termos_aceite
    ADD CONSTRAINT termos_aceite_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: turmas turmas_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turmas
    ADD CONSTRAINT turmas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- Name: turmas turmas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turmas
    ADD CONSTRAINT turmas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: usuarios_disciplinas usuarios_disciplinas_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_disciplinas
    ADD CONSTRAINT usuarios_disciplinas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id);


--
-- Name: usuarios_disciplinas usuarios_disciplinas_disciplina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_disciplinas
    ADD CONSTRAINT usuarios_disciplinas_disciplina_id_fkey FOREIGN KEY (disciplina_id) REFERENCES public.disciplinas(id) ON DELETE CASCADE;


--
-- Name: usuarios_disciplinas usuarios_disciplinas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_disciplinas
    ADD CONSTRAINT usuarios_disciplinas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: usuarios_disciplinas usuarios_disciplinas_frente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_disciplinas
    ADD CONSTRAINT usuarios_disciplinas_frente_id_fkey FOREIGN KEY (frente_id) REFERENCES public.frentes(id);


--
-- Name: usuarios_disciplinas usuarios_disciplinas_modulo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_disciplinas
    ADD CONSTRAINT usuarios_disciplinas_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id);


--
-- Name: usuarios_disciplinas usuarios_disciplinas_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_disciplinas
    ADD CONSTRAINT usuarios_disciplinas_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id);


--
-- Name: usuarios_disciplinas usuarios_disciplinas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_disciplinas
    ADD CONSTRAINT usuarios_disciplinas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: usuarios usuarios_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: usuarios_empresas usuarios_empresas_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_empresas
    ADD CONSTRAINT usuarios_empresas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: usuarios_empresas usuarios_empresas_papel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_empresas
    ADD CONSTRAINT usuarios_empresas_papel_id_fkey FOREIGN KEY (papel_id) REFERENCES public.papeis(id) ON DELETE SET NULL;


--
-- Name: usuarios_empresas usuarios_empresas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_empresas
    ADD CONSTRAINT usuarios_empresas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: usuarios usuarios_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: usuarios usuarios_papel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_papel_id_fkey FOREIGN KEY (papel_id) REFERENCES public.papeis(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: papeis Admins can create empresa roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create empresa roles" ON public.papeis FOR INSERT TO authenticated WITH CHECK (((empresa_id IS NOT NULL) AND public.is_empresa_admin(auth.uid(), empresa_id)));


--
-- Name: usuarios Admins can create users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create users" ON public.usuarios FOR INSERT TO authenticated WITH CHECK ((empresa_id = public.get_auth_user_empresa_id()));


--
-- Name: usuarios_disciplinas Admins can delete assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete assignments" ON public.usuarios_disciplinas FOR DELETE USING (public.is_empresa_admin(auth.uid(), empresa_id));


--
-- Name: papeis Admins can delete empresa roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete empresa roles" ON public.papeis FOR DELETE TO authenticated USING (((is_system = false) AND (empresa_id IS NOT NULL) AND public.is_empresa_admin(auth.uid(), empresa_id)));


--
-- Name: usuarios Admins can delete users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete users" ON public.usuarios FOR DELETE TO authenticated USING ((empresa_id = public.get_auth_user_empresa_id()));


--
-- Name: usuarios_disciplinas Admins can insert assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert assignments" ON public.usuarios_disciplinas FOR INSERT WITH CHECK (public.is_empresa_admin(auth.uid(), empresa_id));


--
-- Name: usuarios_disciplinas Admins can update assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update assignments" ON public.usuarios_disciplinas FOR UPDATE USING (public.is_empresa_admin(auth.uid(), empresa_id));


--
-- Name: papeis Admins can update empresa roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update empresa roles" ON public.papeis FOR UPDATE TO authenticated USING (((is_system = false) AND (empresa_id IS NOT NULL) AND public.is_empresa_admin(auth.uid(), empresa_id)));


--
-- Name: tenant_access_log Admins can view tenant audit log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view tenant audit log" ON public.tenant_access_log FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()));


--
-- Name: empresas Admins da empresa podem atualizar; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins da empresa podem atualizar" ON public.empresas FOR UPDATE TO authenticated USING (public.is_empresa_admin(( SELECT auth.uid() AS uid), id)) WITH CHECK (public.is_empresa_admin(( SELECT auth.uid() AS uid), id));


--
-- Name: empresa_oauth_credentials Admins podem atualizar credenciais OAuth da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem atualizar credenciais OAuth da empresa" ON public.empresa_oauth_credentials FOR UPDATE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin())) WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()));


--
-- Name: cursos Admins podem criar cursos em sua empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem criar cursos em sua empresa" ON public.cursos FOR INSERT TO authenticated WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()));


--
-- Name: empresa_oauth_credentials Admins podem deletar credenciais OAuth da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem deletar credenciais OAuth da empresa" ON public.empresa_oauth_credentials FOR DELETE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()));


--
-- Name: agendamento_bloqueios Admins podem gerenciar bloqueios da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar bloqueios da empresa" ON public.agendamento_bloqueios TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = agendamento_bloqueios.empresa_id) AND (EXISTS ( SELECT 1
           FROM public.papeis p
          WHERE ((p.id = u.papel_id) AND ((p.tipo = ANY (ARRAY['admin'::text, 'dono'::text, 'gerente'::text])) OR (p.tipo = 'professor_admin'::text)))))))));


--
-- Name: empresa_oauth_credentials Admins podem inserir credenciais OAuth da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem inserir credenciais OAuth da empresa" ON public.empresa_oauth_credentials FOR INSERT TO authenticated WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()));


--
-- Name: empresa_oauth_credentials Admins podem visualizar credenciais OAuth da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem visualizar credenciais OAuth da empresa" ON public.empresa_oauth_credentials FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()));


--
-- Name: module_definitions All authenticated users can view module definitions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "All authenticated users can view module definitions" ON public.module_definitions FOR SELECT TO authenticated USING (true);


--
-- Name: submodule_definitions All authenticated users can view submodule definitions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "All authenticated users can view submodule definitions" ON public.submodule_definitions FOR SELECT TO authenticated USING (true);


--
-- Name: cronogramas Aluno atualiza seus cronogramas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Aluno atualiza seus cronogramas" ON public.cronogramas FOR UPDATE USING ((usuario_id = auth.uid())) WITH CHECK ((usuario_id = auth.uid()));


--
-- Name: cronogramas Aluno cria cronogramas na sua empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Aluno cria cronogramas na sua empresa" ON public.cronogramas FOR INSERT WITH CHECK (((usuario_id = auth.uid()) AND (empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = auth.uid()) AND (ue.ativo = true) AND (ue.deleted_at IS NULL))))));


--
-- Name: cronogramas Aluno deleta seus cronogramas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Aluno deleta seus cronogramas" ON public.cronogramas FOR DELETE USING ((usuario_id = auth.uid()));


--
-- Name: cronograma_itens Aluno gerencia itens do seu cronograma; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Aluno gerencia itens do seu cronograma" ON public.cronograma_itens TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cronogramas c
  WHERE ((c.id = cronograma_itens.cronograma_id) AND (c.usuario_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.cronogramas c
  WHERE ((c.id = cronograma_itens.cronograma_id) AND (c.usuario_id = auth.uid())))));


--
-- Name: cronograma_semanas_dias Aluno gerencia semanas dias do cronograma; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Aluno gerencia semanas dias do cronograma" ON public.cronograma_semanas_dias TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cronogramas c
  WHERE ((c.id = cronograma_semanas_dias.cronograma_id) AND (c.usuario_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.cronogramas c
  WHERE ((c.id = cronograma_semanas_dias.cronograma_id) AND (c.usuario_id = auth.uid())))));


--
-- Name: cronograma_tempo_estudos Aluno gerencia tempo estudos do cronograma; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Aluno gerencia tempo estudos do cronograma" ON public.cronograma_tempo_estudos TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cronogramas c
  WHERE ((c.id = cronograma_tempo_estudos.cronograma_id) AND (c.usuario_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.cronogramas c
  WHERE ((c.id = cronograma_tempo_estudos.cronograma_id) AND (c.usuario_id = auth.uid())))));


--
-- Name: cronogramas Aluno visualiza seus cronogramas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Aluno visualiza seus cronogramas" ON public.cronogramas FOR SELECT USING ((usuario_id = auth.uid()));


--
-- Name: agendamento_bloqueios Alunos podem ver bloqueios para agendamento; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Alunos podem ver bloqueios para agendamento" ON public.agendamento_bloqueios FOR SELECT TO authenticated USING ((empresa_id IN ( SELECT DISTINCT c.empresa_id
   FROM (public.alunos_cursos ac
     JOIN public.cursos c ON ((c.id = ac.curso_id)))
  WHERE (ac.usuario_id = ( SELECT auth.uid() AS uid)))));


--
-- Name: color_palettes Anon can view color palettes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon can view color palettes" ON public.color_palettes FOR SELECT TO anon USING (true);


--
-- Name: custom_theme_presets Anon can view custom theme presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon can view custom theme presets" ON public.custom_theme_presets FOR SELECT TO anon USING (true);


--
-- Name: font_schemes Anon can view font schemes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon can view font schemes" ON public.font_schemes FOR SELECT TO anon USING (true);


--
-- Name: tenant_branding Anon can view tenant branding; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon can view tenant branding" ON public.tenant_branding FOR SELECT TO anon USING (true);


--
-- Name: tenant_logos Anon can view tenant logos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon can view tenant logos" ON public.tenant_logos FOR SELECT TO anon USING ((tenant_branding_id IN ( SELECT tenant_branding.id
   FROM public.tenant_branding)));


--
-- Name: atividades Atividades visiveis por empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Atividades visiveis por empresa" ON public.atividades FOR SELECT USING (((empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: aulas Aulas visiveis por empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Aulas visiveis por empresa" ON public.aulas FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: color_palettes Color palettes public access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Color palettes public access" ON public.color_palettes FOR SELECT USING (true);


--
-- Name: cursos Criador ou admin pode atualizar cursos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Criador ou admin pode atualizar cursos" ON public.cursos FOR UPDATE TO authenticated USING ((((created_by = ( SELECT auth.uid() AS uid)) AND (empresa_id = public.get_user_empresa_id())) OR ((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()))) WITH CHECK ((((created_by = ( SELECT auth.uid() AS uid)) AND (empresa_id = public.get_user_empresa_id())) OR ((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin())));


--
-- Name: cursos Criador ou admin pode deletar cursos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Criador ou admin pode deletar cursos" ON public.cursos FOR DELETE TO authenticated USING ((((created_by = ( SELECT auth.uid() AS uid)) AND (empresa_id = public.get_user_empresa_id())) OR ((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin())));


--
-- Name: cursos Cursos visiveis por empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cursos visiveis por empresa" ON public.cursos FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: disciplinas Disciplinas visiveis por empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Disciplinas visiveis por empresa" ON public.disciplinas FOR SELECT USING (((empresa_id = public.get_user_empresa_id()) OR (EXISTS ( SELECT 1
   FROM (public.alunos_cursos ac
     JOIN public.cursos c ON ((c.id = ac.curso_id)))
  WHERE ((ac.usuario_id = auth.uid()) AND (c.empresa_id = disciplinas.empresa_id))))));


--
-- Name: ai_agents Empresa admins can manage agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresa admins can manage agents" ON public.ai_agents TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.empresa_id = ai_agents.empresa_id) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.empresa_id = ai_agents.empresa_id) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: tenant_branding Empresa admins can manage branding; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresa admins can manage branding" ON public.tenant_branding TO authenticated USING (((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = tenant_branding.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL)))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = tenant_branding.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL))))));


--
-- Name: color_palettes Empresa admins can manage color palettes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresa admins can manage color palettes" ON public.color_palettes TO authenticated USING (((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = color_palettes.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL)))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = color_palettes.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL))))));


--
-- Name: font_schemes Empresa admins can manage font schemes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresa admins can manage font schemes" ON public.font_schemes TO authenticated USING (((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = font_schemes.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL)))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = font_schemes.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL))))));


--
-- Name: tenant_logos Empresa admins can manage logos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresa admins can manage logos" ON public.tenant_logos TO authenticated USING (((tenant_branding_id IN ( SELECT tb.id
   FROM public.tenant_branding tb
  WHERE (EXISTS ( SELECT 1
           FROM (public.usuarios u
             JOIN public.papeis p ON ((p.id = u.papel_id)))
          WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = tb.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL)))))) WITH CHECK (((tenant_branding_id IN ( SELECT tb.id
   FROM public.tenant_branding tb
  WHERE (EXISTS ( SELECT 1
           FROM (public.usuarios u
             JOIN public.papeis p ON ((p.id = u.papel_id)))
          WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = tb.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL))))));


--
-- Name: tenant_module_visibility Empresa admins can manage module visibility; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresa admins can manage module visibility" ON public.tenant_module_visibility TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.empresa_id = tenant_module_visibility.empresa_id) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.empresa_id = tenant_module_visibility.empresa_id) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: tenant_submodule_visibility Empresa admins can manage submodule visibility; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresa admins can manage submodule visibility" ON public.tenant_submodule_visibility TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.empresa_id = tenant_submodule_visibility.empresa_id) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.empresa_id = tenant_submodule_visibility.empresa_id) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: custom_theme_presets Empresa admins can manage theme presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresa admins can manage theme presets" ON public.custom_theme_presets TO authenticated USING (((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = custom_theme_presets.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL)))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (u.empresa_id = custom_theme_presets.empresa_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.usuarios u
     JOIN public.papeis p ON ((p.id = u.papel_id)))
  WHERE ((u.id = ( SELECT auth.uid() AS uid)) AND (p.tipo = ANY (ARRAY['admin'::text, 'professor_admin'::text])) AND (p.empresa_id IS NULL))))));


--
-- Name: usuarios_disciplinas Empresa users can view assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresa users can view assignments" ON public.usuarios_disciplinas FOR SELECT USING (public.user_belongs_to_empresa(empresa_id));


--
-- Name: empresas Empresas public access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Empresas public access" ON public.empresas FOR SELECT USING (true);


--
-- Name: font_schemes Font schemes public access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Font schemes public access" ON public.font_schemes FOR SELECT USING (true);


--
-- Name: frentes Frentes visiveis por empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Frentes visiveis por empresa" ON public.frentes FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: agendamento_bloqueios Gestores podem atualizar bloqueios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Gestores podem atualizar bloqueios" ON public.agendamento_bloqueios FOR UPDATE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_gestor())) WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_gestor()));


--
-- Name: agendamento_bloqueios Gestores podem criar bloqueios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Gestores podem criar bloqueios" ON public.agendamento_bloqueios FOR INSERT TO authenticated WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_gestor() AND (criado_por = ( SELECT auth.uid() AS uid)) AND ((professor_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = agendamento_bloqueios.professor_id) AND (u.empresa_id = agendamento_bloqueios.empresa_id) AND (u.deleted_at IS NULL)))) OR (EXISTS ( SELECT 1
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = agendamento_bloqueios.professor_id) AND (ue.empresa_id = agendamento_bloqueios.empresa_id) AND (ue.ativo = true)))))));


--
-- Name: agendamento_bloqueios Gestores podem deletar bloqueios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Gestores podem deletar bloqueios" ON public.agendamento_bloqueios FOR DELETE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_gestor()));


--
-- Name: cronograma_itens Itens visiveis via cronograma; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Itens visiveis via cronograma" ON public.cronograma_itens FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cronogramas c
  WHERE ((c.id = cronograma_itens.cronograma_id) AND ((c.usuario_id = auth.uid()) OR (c.empresa_id = public.get_user_empresa_id()))))));


--
-- Name: modalidades_curso Modalidades are deletable by admins/professors of the tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modalidades are deletable by admins/professors of the tenant" ON public.modalidades_curso FOR DELETE USING (((empresa_id = ( SELECT public.get_user_empresa_id() AS get_user_empresa_id)) AND (public.is_empresa_admin() OR public.is_professor())));


--
-- Name: modalidades_curso Modalidades are insertable by admins/professors of the tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modalidades are insertable by admins/professors of the tenant" ON public.modalidades_curso FOR INSERT WITH CHECK (((empresa_id = ( SELECT public.get_user_empresa_id() AS get_user_empresa_id)) AND (public.is_empresa_admin() OR public.is_professor())));


--
-- Name: modalidades_curso Modalidades are updatable by admins/professors of the tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modalidades are updatable by admins/professors of the tenant" ON public.modalidades_curso FOR UPDATE USING (((empresa_id = ( SELECT public.get_user_empresa_id() AS get_user_empresa_id)) AND (public.is_empresa_admin() OR public.is_professor())));


--
-- Name: modalidades_curso Modalidades are viewable by everyone in the tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modalidades are viewable by everyone in the tenant" ON public.modalidades_curso FOR SELECT USING ((empresa_id = ( SELECT public.get_user_empresa_id() AS get_user_empresa_id)));


--
-- Name: modulos Modulos visiveis por empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modulos visiveis por empresa" ON public.modulos FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: regras_atividades Professores gerenciam regras da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores gerenciam regras da empresa" ON public.regras_atividades TO authenticated USING ((empresa_id = public.get_user_empresa_id())) WITH CHECK ((empresa_id = public.get_user_empresa_id()));


--
-- Name: agendamento_bloqueios Professores podem atualizar bloqueios proprios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores podem atualizar bloqueios proprios" ON public.agendamento_bloqueios FOR UPDATE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND (professor_id = ( SELECT auth.uid() AS uid)))) WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND (professor_id = ( SELECT auth.uid() AS uid))));


--
-- Name: agendamento_relatorios Professores podem atualizar relatórios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores podem atualizar relatórios" ON public.agendamento_relatorios FOR UPDATE TO authenticated USING ((empresa_id = public.get_user_empresa_id())) WITH CHECK ((empresa_id = public.get_user_empresa_id()));


--
-- Name: agendamento_bloqueios Professores podem criar bloqueios proprios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores podem criar bloqueios proprios" ON public.agendamento_bloqueios FOR INSERT TO authenticated WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND public.is_teaching_user() AND (professor_id = ( SELECT auth.uid() AS uid)) AND (criado_por = ( SELECT auth.uid() AS uid))));


--
-- Name: agendamento_relatorios Professores podem criar relatórios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores podem criar relatórios" ON public.agendamento_relatorios FOR INSERT TO authenticated WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND (gerado_por = ( SELECT auth.uid() AS uid))));


--
-- Name: agendamento_bloqueios Professores podem deletar bloqueios proprios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores podem deletar bloqueios proprios" ON public.agendamento_bloqueios FOR DELETE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND (professor_id = ( SELECT auth.uid() AS uid))));


--
-- Name: agendamento_relatorios Professores podem deletar relatórios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores podem deletar relatórios" ON public.agendamento_relatorios FOR DELETE TO authenticated USING ((empresa_id = public.get_user_empresa_id()));


--
-- Name: agendamento_recorrencia_turmas Professores podem desvincular turmas de suas recorrências; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores podem desvincular turmas de suas recorrências" ON public.agendamento_recorrencia_turmas FOR DELETE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND (EXISTS ( SELECT 1
   FROM public.agendamento_recorrencia ar
  WHERE ((ar.id = agendamento_recorrencia_turmas.recorrencia_id) AND (ar.professor_id = ( SELECT auth.uid() AS uid)))))));


--
-- Name: agendamento_recorrencia_turmas Professores podem vincular turmas às suas recorrências; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores podem vincular turmas às suas recorrências" ON public.agendamento_recorrencia_turmas FOR INSERT TO authenticated WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND (EXISTS ( SELECT 1
   FROM public.agendamento_recorrencia ar
  WHERE ((ar.id = agendamento_recorrencia_turmas.recorrencia_id) AND (ar.professor_id = ( SELECT auth.uid() AS uid)))))));


--
-- Name: agendamento_relatorios Professores veem relatórios da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores veem relatórios da empresa" ON public.agendamento_relatorios FOR SELECT TO authenticated USING ((empresa_id = public.get_user_empresa_id()));


--
-- Name: agendamento_recorrencia_turmas Professores veem turmas de suas recorrências; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Professores veem turmas de suas recorrências" ON public.agendamento_recorrencia_turmas FOR SELECT TO authenticated USING ((empresa_id = public.get_user_empresa_id()));


--
-- Name: regras_atividades Regras visiveis por empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Regras visiveis por empresa" ON public.regras_atividades FOR SELECT USING (((empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: cursos_disciplinas Relacoes curso-disciplina visiveis por empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Relacoes curso-disciplina visiveis por empresa" ON public.cursos_disciplinas FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = cursos_disciplinas.curso_id) AND ((c.empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(c.empresa_id))))));


--
-- Name: segmentos Segmentos visiveis por empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Segmentos visiveis por empresa" ON public.segmentos FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: cronograma_semanas_dias Semanas dias visiveis via cronograma; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Semanas dias visiveis via cronograma" ON public.cronograma_semanas_dias FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cronogramas c
  WHERE ((c.id = cronograma_semanas_dias.cronograma_id) AND ((c.usuario_id = auth.uid()) OR (c.empresa_id = public.get_user_empresa_id()))))));


--
-- Name: cronogramas Staff visualiza cronogramas da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff visualiza cronogramas da empresa" ON public.cronogramas FOR SELECT USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = auth.uid()) AND (ue.ativo = true) AND (ue.deleted_at IS NULL) AND (ue.papel_base = ANY (ARRAY['usuario'::public.enum_papel_base, 'professor'::public.enum_papel_base]))))));


--
-- Name: cronograma_tempo_estudos Tempo estudos visivel via cronograma; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tempo estudos visivel via cronograma" ON public.cronograma_tempo_estudos FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cronogramas c
  WHERE ((c.id = cronograma_tempo_estudos.cronograma_id) AND ((c.usuario_id = auth.uid()) OR (c.empresa_id = public.get_user_empresa_id()))))));


--
-- Name: tenant_branding Tenant branding public access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant branding public access" ON public.tenant_branding FOR SELECT USING (true);


--
-- Name: chat_conversations Users can insert their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own conversations" ON public.chat_conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_agents Users can view active agents from their empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view active agents from their empresa" ON public.ai_agents FOR SELECT TO authenticated USING (((is_active = true) AND (empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.ativo = true) AND (ue.deleted_at IS NULL))))));


--
-- Name: tenant_module_visibility Users can view their empresa module visibility; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their empresa module visibility" ON public.tenant_module_visibility FOR SELECT TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: tenant_submodule_visibility Users can view their empresa submodule visibility; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their empresa submodule visibility" ON public.tenant_submodule_visibility FOR SELECT TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: matriculas Usuarios atualizam matriculas da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios atualizam matriculas da empresa" ON public.matriculas FOR UPDATE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR (EXISTS ( SELECT 1
   FROM (public.cursos c
     JOIN public.usuarios u ON ((u.empresa_id = c.empresa_id)))
  WHERE ((c.id = matriculas.curso_id) AND (u.id = auth.uid()) AND (u.ativo = true) AND (u.deleted_at IS NULL)))))) WITH CHECK (((empresa_id = public.get_user_empresa_id()) OR (EXISTS ( SELECT 1
   FROM (public.cursos c
     JOIN public.usuarios u ON ((u.empresa_id = c.empresa_id)))
  WHERE ((c.id = matriculas.curso_id) AND (u.id = auth.uid()) AND (u.ativo = true) AND (u.deleted_at IS NULL))))));


--
-- Name: cursos_disciplinas Usuarios atualizam relacoes curso-disciplina; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios atualizam relacoes curso-disciplina" ON public.cursos_disciplinas FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.cursos c
     JOIN public.usuarios u ON ((u.empresa_id = c.empresa_id)))
  WHERE ((c.id = cursos_disciplinas.curso_id) AND (u.id = auth.uid()) AND (u.ativo = true) AND (u.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.cursos c
     JOIN public.usuarios u ON ((u.empresa_id = c.empresa_id)))
  WHERE ((c.id = cursos_disciplinas.curso_id) AND (u.id = auth.uid()) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: disciplinas Usuarios criam disciplinas de sua empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios criam disciplinas de sua empresa" ON public.disciplinas FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = disciplinas.empresa_id) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: matriculas Usuarios criam matriculas da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios criam matriculas da empresa" ON public.matriculas FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.cursos c
     JOIN public.usuarios u ON ((u.empresa_id = c.empresa_id)))
  WHERE ((c.id = matriculas.curso_id) AND (u.id = auth.uid()) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: cursos_disciplinas Usuarios criam relacoes curso-disciplina; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios criam relacoes curso-disciplina" ON public.cursos_disciplinas FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.cursos c
     JOIN public.usuarios u ON ((u.empresa_id = c.empresa_id)))
  WHERE ((c.id = cursos_disciplinas.curso_id) AND (u.id = auth.uid()) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: segmentos Usuarios criam segmentos de sua empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios criam segmentos de sua empresa" ON public.segmentos FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = segmentos.empresa_id) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: disciplinas Usuarios deletam disciplinas de sua empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios deletam disciplinas de sua empresa" ON public.disciplinas FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = disciplinas.empresa_id) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: matriculas Usuarios deletam matriculas da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios deletam matriculas da empresa" ON public.matriculas FOR DELETE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR (EXISTS ( SELECT 1
   FROM (public.cursos c
     JOIN public.usuarios u ON ((u.empresa_id = c.empresa_id)))
  WHERE ((c.id = matriculas.curso_id) AND (u.id = auth.uid()) AND (u.ativo = true) AND (u.deleted_at IS NULL))))));


--
-- Name: cursos_disciplinas Usuarios deletam relacoes curso-disciplina; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios deletam relacoes curso-disciplina" ON public.cursos_disciplinas FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.cursos c
     JOIN public.usuarios u ON ((u.empresa_id = c.empresa_id)))
  WHERE ((c.id = cursos_disciplinas.curso_id) AND (u.id = auth.uid()) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: segmentos Usuarios deletam segmentos de sua empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios deletam segmentos de sua empresa" ON public.segmentos FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = segmentos.empresa_id) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: disciplinas Usuarios editam disciplinas de sua empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios editam disciplinas de sua empresa" ON public.disciplinas FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = disciplinas.empresa_id) AND (u.ativo = true) AND (u.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = disciplinas.empresa_id) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: segmentos Usuarios editam segmentos de sua empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios editam segmentos de sua empresa" ON public.segmentos FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = segmentos.empresa_id) AND (u.ativo = true) AND (u.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = segmentos.empresa_id) AND (u.ativo = true) AND (u.deleted_at IS NULL)))));


--
-- Name: agendamento_bloqueios Usuarios veem bloqueios da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuarios veem bloqueios da empresa" ON public.agendamento_bloqueios FOR SELECT TO authenticated USING ((empresa_id = public.get_user_empresa_id()));


--
-- Name: chat_conversation_history Usuários gerenciam seu próprio histórico de chat; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários gerenciam seu próprio histórico de chat" ON public.chat_conversation_history USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: empresas Usuários veem apenas sua empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários veem apenas sua empresa" ON public.empresas FOR SELECT TO authenticated USING (((id = public.get_user_empresa_id()) OR (id = ANY (public.get_user_empresa_ids()))));


--
-- Name: agendamento_bloqueios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agendamento_bloqueios ENABLE ROW LEVEL SECURITY;

--
-- Name: agendamento_configuracoes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agendamento_configuracoes ENABLE ROW LEVEL SECURITY;

--
-- Name: agendamento_configuracoes agendamento_configuracoes_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_configuracoes_all ON public.agendamento_configuracoes TO authenticated USING (((professor_id = auth.uid()) OR (public.is_empresa_admin() AND (EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = agendamento_configuracoes.professor_id) AND (u.empresa_id = public.get_user_empresa_id()) AND (u.deleted_at IS NULL))))))) WITH CHECK (((professor_id = auth.uid()) OR (public.is_empresa_admin() AND (EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = agendamento_configuracoes.professor_id) AND (u.empresa_id = public.get_user_empresa_id()) AND (u.deleted_at IS NULL)))))));


--
-- Name: agendamento_configuracoes agendamento_configuracoes_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_configuracoes_select ON public.agendamento_configuracoes FOR SELECT TO authenticated USING (((professor_id = auth.uid()) OR (empresa_id = public.get_user_empresa_id())));


--
-- Name: agendamento_disponibilidade; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agendamento_disponibilidade ENABLE ROW LEVEL SECURITY;

--
-- Name: agendamento_disponibilidade agendamento_disponibilidade_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_disponibilidade_all ON public.agendamento_disponibilidade TO authenticated USING ((professor_id = auth.uid())) WITH CHECK ((professor_id = auth.uid()));


--
-- Name: agendamento_disponibilidade agendamento_disponibilidade_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_disponibilidade_select ON public.agendamento_disponibilidade FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(empresa_id) OR (professor_id = auth.uid())));


--
-- Name: agendamento_notificacoes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agendamento_notificacoes ENABLE ROW LEVEL SECURITY;

--
-- Name: agendamento_notificacoes agendamento_notificacoes_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_notificacoes_all ON public.agendamento_notificacoes TO authenticated USING (((destinatario_id = auth.uid()) OR (empresa_id = public.get_user_empresa_id()))) WITH CHECK ((empresa_id = public.get_user_empresa_id()));


--
-- Name: agendamento_notificacoes agendamento_notificacoes_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_notificacoes_select ON public.agendamento_notificacoes FOR SELECT TO authenticated USING (((destinatario_id = auth.uid()) OR (empresa_id = public.get_user_empresa_id())));


--
-- Name: agendamento_recorrencia; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agendamento_recorrencia ENABLE ROW LEVEL SECURITY;

--
-- Name: agendamento_recorrencia agendamento_recorrencia_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_recorrencia_delete ON public.agendamento_recorrencia FOR DELETE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND (public.is_empresa_admin() OR (( SELECT auth.uid() AS uid) = professor_id))));


--
-- Name: agendamento_recorrencia agendamento_recorrencia_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_recorrencia_insert ON public.agendamento_recorrencia FOR INSERT TO authenticated WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND (public.is_empresa_admin() OR (( SELECT auth.uid() AS uid) = professor_id))));


--
-- Name: agendamento_recorrencia agendamento_recorrencia_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_recorrencia_select ON public.agendamento_recorrencia FOR SELECT TO authenticated USING ((((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()) OR ((( SELECT auth.uid() AS uid) = professor_id) AND (empresa_id = public.get_user_empresa_id())) OR ((ativo = true) AND ((data_fim IS NULL) OR (data_fim >= CURRENT_DATE)) AND (data_inicio <= CURRENT_DATE))));


--
-- Name: agendamento_recorrencia_turmas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agendamento_recorrencia_turmas ENABLE ROW LEVEL SECURITY;

--
-- Name: agendamento_recorrencia agendamento_recorrencia_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamento_recorrencia_update ON public.agendamento_recorrencia FOR UPDATE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND (public.is_empresa_admin() OR (( SELECT auth.uid() AS uid) = professor_id)))) WITH CHECK (((empresa_id = public.get_user_empresa_id()) AND (public.is_empresa_admin() OR (( SELECT auth.uid() AS uid) = professor_id))));


--
-- Name: agendamento_relatorios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agendamento_relatorios ENABLE ROW LEVEL SECURITY;

--
-- Name: agendamentos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

--
-- Name: agendamentos agendamentos_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamentos_insert ON public.agendamentos FOR INSERT TO authenticated WITH CHECK (((empresa_id = public.get_user_empresa_id()) OR ((auth.uid() = aluno_id) AND public.aluno_matriculado_empresa(empresa_id))));


--
-- Name: agendamentos agendamentos_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamentos_select ON public.agendamentos FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR (aluno_id = auth.uid()) OR (professor_id = auth.uid())));


--
-- Name: agendamentos agendamentos_select_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamentos_select_admin ON public.agendamentos FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = agendamentos.empresa_id) AND (EXISTS ( SELECT 1
           FROM public.papeis p
          WHERE ((p.id = u.papel_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'dono'::text, 'gerente'::text, 'professor_admin'::text])))))))));


--
-- Name: agendamentos agendamentos_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamentos_update ON public.agendamentos FOR UPDATE TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR (professor_id = auth.uid()) OR (aluno_id = auth.uid()))) WITH CHECK (((empresa_id = public.get_user_empresa_id()) OR (professor_id = auth.uid()) OR (aluno_id = auth.uid())));


--
-- Name: agendamentos agendamentos_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY agendamentos_update_admin ON public.agendamentos FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = agendamentos.empresa_id) AND (EXISTS ( SELECT 1
           FROM public.papeis p
          WHERE ((p.id = u.papel_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'dono'::text, 'gerente'::text, 'professor_admin'::text]))))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios u
  WHERE ((u.id = auth.uid()) AND (u.empresa_id = agendamentos.empresa_id) AND (EXISTS ( SELECT 1
           FROM public.papeis p
          WHERE ((p.id = u.papel_id) AND (p.tipo = ANY (ARRAY['admin'::text, 'dono'::text, 'gerente'::text, 'professor_admin'::text])))))))));


--
-- Name: ai_agents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

--
-- Name: alunos_cursos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.alunos_cursos ENABLE ROW LEVEL SECURITY;

--
-- Name: alunos_cursos alunos_cursos_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY alunos_cursos_delete ON public.alunos_cursos FOR DELETE TO authenticated USING ((public.is_empresa_admin() AND (EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = alunos_cursos.curso_id) AND (c.empresa_id = public.get_user_empresa_id()))))));


--
-- Name: alunos_cursos alunos_cursos_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY alunos_cursos_insert ON public.alunos_cursos FOR INSERT TO authenticated WITH CHECK ((public.is_empresa_admin() AND (EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = alunos_cursos.curso_id) AND (c.empresa_id = public.get_user_empresa_id()))))));


--
-- Name: alunos_cursos alunos_cursos_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY alunos_cursos_select ON public.alunos_cursos FOR SELECT TO authenticated USING (((usuario_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = alunos_cursos.curso_id) AND (c.empresa_id = public.get_user_empresa_id()))))));


--
-- Name: alunos_turmas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.alunos_turmas ENABLE ROW LEVEL SECURITY;

--
-- Name: alunos_turmas alunos_turmas_aluno_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY alunos_turmas_aluno_select ON public.alunos_turmas FOR SELECT TO authenticated USING ((public.is_aluno() AND (usuario_id = auth.uid())));


--
-- Name: alunos_turmas alunos_turmas_empresa_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY alunos_turmas_empresa_admin_all ON public.alunos_turmas TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.turmas t
  WHERE ((t.id = alunos_turmas.turma_id) AND (t.empresa_id = public.get_user_empresa_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.turmas t
  WHERE ((t.id = alunos_turmas.turma_id) AND (t.empresa_id = public.get_user_empresa_id())))));


--
-- Name: alunos_turmas alunos_turmas_professor_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY alunos_turmas_professor_select ON public.alunos_turmas FOR SELECT TO authenticated USING ((public.is_professor() AND (EXISTS ( SELECT 1
   FROM public.turmas t
  WHERE ((t.id = alunos_turmas.turma_id) AND (t.empresa_id = public.get_user_empresa_id()))))));


--
-- Name: api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: api_keys api_keys_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY api_keys_delete ON public.api_keys FOR DELETE TO authenticated USING (((created_by = ( SELECT auth.uid() AS uid)) OR ((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin())));


--
-- Name: api_keys api_keys_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY api_keys_insert ON public.api_keys FOR INSERT TO authenticated WITH CHECK (((created_by = ( SELECT auth.uid() AS uid)) AND (public.is_professor() OR (empresa_id IS NULL) OR (empresa_id = public.get_user_empresa_id()))));


--
-- Name: api_keys api_keys_select_empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY api_keys_select_empresa ON public.api_keys FOR SELECT TO authenticated USING (((created_by = ( SELECT auth.uid() AS uid)) OR ((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin())));


--
-- Name: api_keys api_keys_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY api_keys_update ON public.api_keys FOR UPDATE TO authenticated USING (((created_by = ( SELECT auth.uid() AS uid)) OR ((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()))) WITH CHECK (((created_by = ( SELECT auth.uid() AS uid)) OR ((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin())));


--
-- Name: atividades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

--
-- Name: atividades atividades_professor_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY atividades_professor_delete ON public.atividades FOR DELETE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: atividades atividades_professor_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY atividades_professor_insert ON public.atividades FOR INSERT TO authenticated WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: atividades atividades_professor_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY atividades_professor_select ON public.atividades FOR SELECT TO authenticated USING (((public.is_professor() AND (empresa_id = public.get_user_empresa_id())) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: atividades atividades_professor_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY atividades_professor_update ON public.atividades FOR UPDATE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id()))) WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: aulas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

--
-- Name: aulas_concluidas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.aulas_concluidas ENABLE ROW LEVEL SECURITY;

--
-- Name: aulas_concluidas aulas_concluidas_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY aulas_concluidas_all ON public.aulas_concluidas TO authenticated USING ((usuario_id = auth.uid())) WITH CHECK ((usuario_id = auth.uid()));


--
-- Name: aulas_concluidas aulas_concluidas_professor_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY aulas_concluidas_professor_select ON public.aulas_concluidas FOR SELECT TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id()) AND (EXISTS ( SELECT 1
   FROM ((public.aulas au
     JOIN public.modulos m ON ((m.id = au.modulo_id)))
     JOIN public.frentes f ON ((f.id = m.frente_id)))
  WHERE ((au.id = aulas_concluidas.aula_id) AND public.is_professor_da_disciplina(f.disciplina_id))))));


--
-- Name: aulas aulas_professor_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY aulas_professor_delete ON public.aulas FOR DELETE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: aulas aulas_professor_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY aulas_professor_insert ON public.aulas FOR INSERT TO authenticated WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: aulas aulas_professor_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY aulas_professor_select ON public.aulas FOR SELECT TO authenticated USING (((public.is_professor() AND (empresa_id = public.get_user_empresa_id())) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: aulas aulas_professor_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY aulas_professor_update ON public.aulas FOR UPDATE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id()))) WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: chat_conversation_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_conversation_history ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_conversation_history chat_conversation_history_user_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY chat_conversation_history_user_own ON public.chat_conversation_history TO authenticated USING (((user_id = auth.uid()) AND ((empresa_id IS NULL) OR (empresa_id = public.get_user_empresa_id())))) WITH CHECK (((user_id = auth.uid()) AND ((empresa_id IS NULL) OR (empresa_id = public.get_user_empresa_id()))));


--
-- Name: chat_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_conversations chat_conversations_user_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY chat_conversations_user_own ON public.chat_conversations TO authenticated USING (((user_id = auth.uid()) AND ((empresa_id IS NULL) OR (empresa_id = public.get_user_empresa_id())))) WITH CHECK (((user_id = auth.uid()) AND ((empresa_id IS NULL) OR (empresa_id = public.get_user_empresa_id()))));


--
-- Name: color_palettes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.color_palettes ENABLE ROW LEVEL SECURITY;

--
-- Name: coupons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: coupons coupons_delete_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_delete_empresa_admin ON public.coupons FOR DELETE TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: coupons coupons_insert_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_insert_empresa_admin ON public.coupons FOR INSERT TO authenticated WITH CHECK ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: coupons coupons_select_empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_select_empresa ON public.coupons FOR SELECT TO authenticated USING (((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))) OR (empresa_id = public.get_user_empresa_id())));


--
-- Name: coupons coupons_update_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coupons_update_empresa_admin ON public.coupons FOR UPDATE TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL))))) WITH CHECK ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: cronograma_itens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cronograma_itens ENABLE ROW LEVEL SECURITY;

--
-- Name: cronograma_semanas_dias; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cronograma_semanas_dias ENABLE ROW LEVEL SECURITY;

--
-- Name: cronograma_tempo_estudos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cronograma_tempo_estudos ENABLE ROW LEVEL SECURITY;

--
-- Name: cronogramas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cronogramas ENABLE ROW LEVEL SECURITY;

--
-- Name: curso_modulos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.curso_modulos ENABLE ROW LEVEL SECURITY;

--
-- Name: curso_modulos curso_modulos_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curso_modulos_delete ON public.curso_modulos FOR DELETE TO authenticated USING ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: curso_modulos curso_modulos_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curso_modulos_insert ON public.curso_modulos FOR INSERT TO authenticated WITH CHECK ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: curso_modulos curso_modulos_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curso_modulos_select ON public.curso_modulos FOR SELECT TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = auth.uid()) AND (ue.deleted_at IS NULL)))));


--
-- Name: curso_modulos curso_modulos_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curso_modulos_update ON public.curso_modulos FOR UPDATE TO authenticated USING ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id()))) WITH CHECK ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: curso_plantao_quotas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.curso_plantao_quotas ENABLE ROW LEVEL SECURITY;

--
-- Name: curso_plantao_quotas curso_plantao_quotas_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curso_plantao_quotas_delete ON public.curso_plantao_quotas FOR DELETE TO authenticated USING ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: curso_plantao_quotas curso_plantao_quotas_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curso_plantao_quotas_insert ON public.curso_plantao_quotas FOR INSERT TO authenticated WITH CHECK ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: curso_plantao_quotas curso_plantao_quotas_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curso_plantao_quotas_select ON public.curso_plantao_quotas FOR SELECT TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = auth.uid()) AND (ue.deleted_at IS NULL)))));


--
-- Name: curso_plantao_quotas curso_plantao_quotas_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curso_plantao_quotas_update ON public.curso_plantao_quotas FOR UPDATE TO authenticated USING ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id()))) WITH CHECK ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: cursos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

--
-- Name: cursos_disciplinas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cursos_disciplinas ENABLE ROW LEVEL SECURITY;

--
-- Name: cursos_hotmart_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cursos_hotmart_products ENABLE ROW LEVEL SECURITY;

--
-- Name: cursos_hotmart_products cursos_hotmart_products_delete_creator_or_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cursos_hotmart_products_delete_creator_or_admin ON public.cursos_hotmart_products FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = cursos_hotmart_products.curso_id) AND (c.empresa_id = cursos_hotmart_products.empresa_id) AND (((c.created_by = ( SELECT auth.uid() AS uid)) AND (c.empresa_id = public.get_user_empresa_id())) OR ((c.empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()))))));


--
-- Name: cursos_hotmart_products cursos_hotmart_products_insert_creator_or_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cursos_hotmart_products_insert_creator_or_admin ON public.cursos_hotmart_products FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = cursos_hotmart_products.curso_id) AND (c.empresa_id = cursos_hotmart_products.empresa_id) AND (((c.created_by = ( SELECT auth.uid() AS uid)) AND (c.empresa_id = public.get_user_empresa_id())) OR ((c.empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()))))));


--
-- Name: cursos_hotmart_products cursos_hotmart_products_select_creator_or_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cursos_hotmart_products_select_creator_or_admin ON public.cursos_hotmart_products FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = cursos_hotmart_products.curso_id) AND (c.empresa_id = cursos_hotmart_products.empresa_id) AND (((c.created_by = ( SELECT auth.uid() AS uid)) AND (c.empresa_id = public.get_user_empresa_id())) OR ((c.empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()))))));


--
-- Name: cursos_hotmart_products cursos_hotmart_products_update_creator_or_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cursos_hotmart_products_update_creator_or_admin ON public.cursos_hotmart_products FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = cursos_hotmart_products.curso_id) AND (c.empresa_id = cursos_hotmart_products.empresa_id) AND (((c.created_by = ( SELECT auth.uid() AS uid)) AND (c.empresa_id = public.get_user_empresa_id())) OR ((c.empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin())))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = cursos_hotmart_products.curso_id) AND (c.empresa_id = cursos_hotmart_products.empresa_id) AND (((c.created_by = ( SELECT auth.uid() AS uid)) AND (c.empresa_id = public.get_user_empresa_id())) OR ((c.empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin()))))));


--
-- Name: custom_theme_presets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_theme_presets ENABLE ROW LEVEL SECURITY;

--
-- Name: disciplinas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;

--
-- Name: empresa_oauth_credentials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.empresa_oauth_credentials ENABLE ROW LEVEL SECURITY;

--
-- Name: empresas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

--
-- Name: flashcards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

--
-- Name: flashcards flashcards_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY flashcards_delete_policy ON public.flashcards FOR DELETE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: flashcards flashcards_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY flashcards_insert_policy ON public.flashcards FOR INSERT TO authenticated WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: flashcards flashcards_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY flashcards_select_policy ON public.flashcards FOR SELECT TO authenticated USING (((public.is_professor() AND (empresa_id = public.get_user_empresa_id())) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: flashcards flashcards_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY flashcards_update_policy ON public.flashcards FOR UPDATE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id()))) WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: font_schemes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.font_schemes ENABLE ROW LEVEL SECURITY;

--
-- Name: frentes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.frentes ENABLE ROW LEVEL SECURITY;

--
-- Name: frentes frentes_professor_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY frentes_professor_delete ON public.frentes FOR DELETE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: frentes frentes_professor_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY frentes_professor_insert ON public.frentes FOR INSERT TO authenticated WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: frentes frentes_professor_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY frentes_professor_select ON public.frentes FOR SELECT TO authenticated USING (((public.is_professor() AND (empresa_id = public.get_user_empresa_id())) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: frentes frentes_professor_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY frentes_professor_update ON public.frentes FOR UPDATE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id()))) WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: materiais_curso; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.materiais_curso ENABLE ROW LEVEL SECURITY;

--
-- Name: materiais_curso materiais_curso_professor_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY materiais_curso_professor_delete ON public.materiais_curso FOR DELETE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: materiais_curso materiais_curso_professor_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY materiais_curso_professor_insert ON public.materiais_curso FOR INSERT TO authenticated WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: materiais_curso materiais_curso_professor_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY materiais_curso_professor_update ON public.materiais_curso FOR UPDATE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id()))) WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: materiais_curso materiais_curso_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY materiais_curso_select ON public.materiais_curso FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: matriculas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;

--
-- Name: matriculas matriculas_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY matriculas_select ON public.matriculas FOR SELECT TO authenticated USING (((usuario_id = auth.uid()) OR (empresa_id = public.get_user_empresa_id()) OR (EXISTS ( SELECT 1
   FROM public.cursos c
  WHERE ((c.id = matriculas.curso_id) AND (c.empresa_id = public.get_user_empresa_id()))))));


--
-- Name: modalidades_curso; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modalidades_curso ENABLE ROW LEVEL SECURITY;

--
-- Name: module_definitions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.module_definitions ENABLE ROW LEVEL SECURITY;

--
-- Name: modulos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;

--
-- Name: modulos modulos_professor_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modulos_professor_delete ON public.modulos FOR DELETE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: modulos modulos_professor_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modulos_professor_insert ON public.modulos FOR INSERT TO authenticated WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: modulos modulos_professor_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modulos_professor_select ON public.modulos FOR SELECT TO authenticated USING (((public.is_professor() AND (empresa_id = public.get_user_empresa_id())) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: modulos modulos_professor_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modulos_professor_update ON public.modulos FOR UPDATE TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id()))) WITH CHECK ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: papeis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.papeis ENABLE ROW LEVEL SECURITY;

--
-- Name: papeis papeis_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY papeis_select ON public.papeis FOR SELECT TO authenticated USING ((((is_system = true) AND (empresa_id IS NULL)) OR ((empresa_id IS NOT NULL) AND public.user_belongs_to_empresa(empresa_id)) OR (id IN ( SELECT u.papel_id
   FROM public.usuarios u
  WHERE (u.id = auth.uid())))));


--
-- Name: payment_providers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_providers payment_providers_delete_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY payment_providers_delete_empresa_admin ON public.payment_providers FOR DELETE TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: payment_providers payment_providers_insert_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY payment_providers_insert_empresa_admin ON public.payment_providers FOR INSERT TO authenticated WITH CHECK ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: payment_providers payment_providers_select_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY payment_providers_select_empresa_admin ON public.payment_providers FOR SELECT TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: payment_providers payment_providers_update_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY payment_providers_update_empresa_admin ON public.payment_providers FOR UPDATE TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL))))) WITH CHECK ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: plantao_uso_mensal; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plantao_uso_mensal ENABLE ROW LEVEL SECURITY;

--
-- Name: plantao_uso_mensal plantao_uso_mensal_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY plantao_uso_mensal_insert ON public.plantao_uso_mensal FOR INSERT TO authenticated WITH CHECK ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = auth.uid()) AND (ue.deleted_at IS NULL)))));


--
-- Name: plantao_uso_mensal plantao_uso_mensal_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY plantao_uso_mensal_select ON public.plantao_uso_mensal FOR SELECT TO authenticated USING (((usuario_id = auth.uid()) OR ((empresa_id = public.get_user_empresa_id()) AND public.is_empresa_admin())));


--
-- Name: plantao_uso_mensal plantao_uso_mensal_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY plantao_uso_mensal_update ON public.plantao_uso_mensal FOR UPDATE TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = auth.uid()) AND (ue.deleted_at IS NULL)))));


--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: products products_delete_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_delete_empresa_admin ON public.products FOR DELETE TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: products products_insert_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_insert_empresa_admin ON public.products FOR INSERT TO authenticated WITH CHECK ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: products products_select_empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_select_empresa ON public.products FOR SELECT TO authenticated USING (((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))) OR (empresa_id = public.get_user_empresa_id())));


--
-- Name: products products_update_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_update_empresa_admin ON public.products FOR UPDATE TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL))))) WITH CHECK ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: progresso_atividades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.progresso_atividades ENABLE ROW LEVEL SECURITY;

--
-- Name: progresso_atividades progresso_atividades_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY progresso_atividades_all ON public.progresso_atividades TO authenticated USING ((usuario_id = auth.uid())) WITH CHECK ((usuario_id = auth.uid()));


--
-- Name: progresso_atividades progresso_atividades_professor_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY progresso_atividades_professor_select ON public.progresso_atividades FOR SELECT TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id()) AND (EXISTS ( SELECT 1
   FROM ((public.atividades a
     JOIN public.modulos m ON ((m.id = a.modulo_id)))
     JOIN public.frentes f ON ((f.id = m.frente_id)))
  WHERE ((a.id = progresso_atividades.atividade_id) AND public.is_professor_da_disciplina(f.disciplina_id))))));


--
-- Name: progresso_flashcards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.progresso_flashcards ENABLE ROW LEVEL SECURITY;

--
-- Name: progresso_flashcards progresso_flashcards_aluno_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY progresso_flashcards_aluno_delete ON public.progresso_flashcards FOR DELETE TO authenticated USING (((usuario_id = auth.uid()) AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: progresso_flashcards progresso_flashcards_aluno_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY progresso_flashcards_aluno_insert ON public.progresso_flashcards FOR INSERT TO authenticated WITH CHECK (((usuario_id = auth.uid()) AND (empresa_id = public.get_user_empresa_id()) AND (EXISTS ( SELECT 1
   FROM public.flashcards f
  WHERE ((f.id = progresso_flashcards.flashcard_id) AND (f.empresa_id = f.empresa_id))))));


--
-- Name: progresso_flashcards progresso_flashcards_aluno_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY progresso_flashcards_aluno_select ON public.progresso_flashcards FOR SELECT TO authenticated USING ((((usuario_id = auth.uid()) AND (empresa_id = public.get_user_empresa_id())) OR (public.is_professor() AND (empresa_id = public.get_user_empresa_id()))));


--
-- Name: progresso_flashcards progresso_flashcards_aluno_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY progresso_flashcards_aluno_update ON public.progresso_flashcards FOR UPDATE TO authenticated USING (((usuario_id = auth.uid()) AND (empresa_id = public.get_user_empresa_id()))) WITH CHECK (((usuario_id = auth.uid()) AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: regras_atividades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.regras_atividades ENABLE ROW LEVEL SECURITY;

--
-- Name: segmentos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.segmentos ENABLE ROW LEVEL SECURITY;

--
-- Name: sessoes_estudo; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessoes_estudo ENABLE ROW LEVEL SECURITY;

--
-- Name: sessoes_estudo sessoes_estudo_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sessoes_estudo_all ON public.sessoes_estudo TO authenticated USING ((usuario_id = auth.uid())) WITH CHECK ((usuario_id = auth.uid()));


--
-- Name: sessoes_estudo sessoes_estudo_select_empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sessoes_estudo_select_empresa ON public.sessoes_estudo FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) AND ((usuario_id = auth.uid()) OR (public.is_professor() AND (public.is_professor_da_disciplina(disciplina_id) OR ((frente_id IS NOT NULL) AND public.professor_tem_acesso_frente(frente_id)))))));


--
-- Name: submodule_definitions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.submodule_definitions ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_plans subscription_plans_read_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY subscription_plans_read_public ON public.subscription_plans FOR SELECT TO authenticated, anon USING (true);


--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions subscriptions_select_own_empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY subscriptions_select_own_empresa ON public.subscriptions FOR SELECT TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE (ue.usuario_id = auth.uid()))));


--
-- Name: superadmins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.superadmins ENABLE ROW LEVEL SECURITY;

--
-- Name: tenant_access_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenant_access_log ENABLE ROW LEVEL SECURITY;

--
-- Name: tenant_branding; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;

--
-- Name: tenant_logos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenant_logos ENABLE ROW LEVEL SECURITY;

--
-- Name: tenant_logos tenant_logos_select_empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tenant_logos_select_empresa ON public.tenant_logos FOR SELECT TO authenticated USING (((empresa_id = public.get_user_empresa_id()) OR (empresa_id = ANY (public.get_user_empresa_ids()))));


--
-- Name: tenant_module_visibility; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenant_module_visibility ENABLE ROW LEVEL SECURITY;

--
-- Name: tenant_submodule_visibility; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenant_submodule_visibility ENABLE ROW LEVEL SECURITY;

--
-- Name: termos_aceite; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.termos_aceite ENABLE ROW LEVEL SECURITY;

--
-- Name: termos_aceite termos_aceite_select_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY termos_aceite_select_admin ON public.termos_aceite FOR SELECT USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = auth.uid()) AND (ue.is_admin = true) AND (ue.ativo = true)))));


--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions transactions_delete_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transactions_delete_empresa_admin ON public.transactions FOR DELETE TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: transactions transactions_insert_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transactions_insert_empresa_admin ON public.transactions FOR INSERT TO authenticated WITH CHECK ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: transactions transactions_select_empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transactions_select_empresa ON public.transactions FOR SELECT TO authenticated USING (((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))) OR (empresa_id = public.get_user_empresa_id())));


--
-- Name: transactions transactions_update_empresa_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY transactions_update_empresa_admin ON public.transactions FOR UPDATE TO authenticated USING ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL))))) WITH CHECK ((empresa_id IN ( SELECT ue.empresa_id
   FROM public.usuarios_empresas ue
  WHERE ((ue.usuario_id = ( SELECT auth.uid() AS uid)) AND (ue.is_admin = true) AND (ue.ativo = true) AND (ue.deleted_at IS NULL)))));


--
-- Name: turmas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

--
-- Name: turmas turmas_aluno_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY turmas_aluno_select ON public.turmas FOR SELECT TO authenticated USING ((public.is_aluno() AND (empresa_id = public.get_user_empresa_id()) AND (ativo = true)));


--
-- Name: turmas turmas_empresa_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY turmas_empresa_admin_all ON public.turmas TO authenticated USING ((empresa_id = public.get_user_empresa_id())) WITH CHECK ((empresa_id = public.get_user_empresa_id()));


--
-- Name: turmas turmas_professor_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY turmas_professor_select ON public.turmas FOR SELECT TO authenticated USING ((public.is_professor() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: usuarios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios_disciplinas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usuarios_disciplinas ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios_empresas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usuarios_empresas ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios_empresas usuarios_empresas: delete admin da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "usuarios_empresas: delete admin da empresa" ON public.usuarios_empresas FOR DELETE TO authenticated USING ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: usuarios_empresas usuarios_empresas: insert admin da empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "usuarios_empresas: insert admin da empresa" ON public.usuarios_empresas FOR INSERT TO authenticated WITH CHECK ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())));


--
-- Name: usuarios_empresas usuarios_empresas: select da mesma empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "usuarios_empresas: select da mesma empresa" ON public.usuarios_empresas FOR SELECT TO authenticated USING (((deleted_at IS NULL) AND ((usuario_id = ( SELECT auth.uid() AS uid)) OR (empresa_id = public.get_user_empresa_id()))));


--
-- Name: usuarios_empresas usuarios_empresas: update admin ou proprio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "usuarios_empresas: update admin ou proprio" ON public.usuarios_empresas FOR UPDATE TO authenticated USING (((deleted_at IS NULL) AND ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())) OR (usuario_id = ( SELECT auth.uid() AS uid))))) WITH CHECK (((deleted_at IS NULL) AND ((public.is_empresa_admin() AND (empresa_id = public.get_user_empresa_id())) OR (usuario_id = ( SELECT auth.uid() AS uid)))));


--
-- Name: usuarios usuarios_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY usuarios_select ON public.usuarios FOR SELECT TO authenticated USING (((id = ( SELECT auth.uid() AS uid)) OR (empresa_id = public.get_user_empresa_id()) OR (EXISTS ( SELECT 1
   FROM (public.alunos_cursos ac
     JOIN public.cursos c ON ((c.id = ac.curso_id)))
  WHERE ((ac.usuario_id = usuarios.id) AND (c.empresa_id = public.get_user_empresa_id())))) OR public.aluno_matriculado_empresa(empresa_id)));


--
-- Name: usuarios usuarios_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY usuarios_update ON public.usuarios FOR UPDATE TO authenticated USING (((auth.uid() = id) OR (empresa_id = public.get_auth_user_empresa_id()))) WITH CHECK (((auth.uid() = id) OR (empresa_id = public.get_auth_user_empresa_id())));


--
-- PostgreSQL database dump complete
--

\unrestrict KVQdJl0Q9QBZxdmi7T4WVXsZqrJ1xxAR1rjh14HUKUg9kuN3HinPlRIS4dfvZpe

