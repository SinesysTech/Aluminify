-- Migration: Atualizar trigger handle_new_user para suportar empresa_id em alunos
-- Descrição: Quando um aluno é criado, o trigger agora define empresa_id corretamente
-- Author: Claude
-- Date: 2026-01-17

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_role text;
    empresa_id_param uuid;
    is_admin_param boolean;
BEGIN
    -- Tenta ler o papel do usuário (ex: { "role": "professor" })
    user_role := new.raw_user_meta_data->>'role';

    -- Tenta ler empresa_id do metadata
    IF new.raw_user_meta_data->>'empresa_id' IS NOT NULL THEN
        empresa_id_param := (new.raw_user_meta_data->>'empresa_id')::uuid;
    END IF;

    -- Tenta ler is_admin do metadata
    is_admin_param := COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false);

    IF user_role = 'professor' OR user_role = 'superadmin' THEN
        -- Validar que empresa_id existe e está ativa (se fornecido)
        IF empresa_id_param IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1
                FROM public.empresas
                WHERE id = empresa_id_param
                AND ativo = true
            ) THEN
                RAISE EXCEPTION 'Empresa não encontrada ou inativa: %', empresa_id_param;
            END IF;
        END IF;

        -- Insert professor record with empresa_id
        INSERT INTO public.professores (id, email, nome_completo, empresa_id, is_admin)
        VALUES (
            new.id,
            COALESCE(new.email, ''),
            COALESCE(
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'name',
                split_part(COALESCE(new.email, ''), '@', 1),
                'Novo Professor'
            ),
            empresa_id_param,
            is_admin_param
        )
        ON CONFLICT (id) DO UPDATE
        SET
            email = EXCLUDED.email,
            nome_completo = COALESCE(NULLIF(professores.nome_completo, ''), EXCLUDED.nome_completo),
            empresa_id = COALESCE(professores.empresa_id, EXCLUDED.empresa_id),
            is_admin = COALESCE(professores.is_admin, EXCLUDED.is_admin),
            updated_at = now();

        -- Se is_admin = true, também inserir em empresa_admins (se empresa_id fornecido)
        IF is_admin_param = true AND empresa_id_param IS NOT NULL THEN
            INSERT INTO public.empresa_admins (empresa_id, user_id, is_owner, permissoes)
            VALUES (empresa_id_param, new.id, false, '{}'::jsonb)
            ON CONFLICT (empresa_id, user_id) DO NOTHING;
        END IF;
    ELSE
        -- Default: Se não vier nada ou vier 'aluno', cria como Aluno
        -- IMPORTANTE: Agora passamos empresa_id para isolamento multi-tenant

        -- Validar que empresa_id existe e está ativa (se fornecido)
        IF empresa_id_param IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1
                FROM public.empresas
                WHERE id = empresa_id_param
                AND ativo = true
            ) THEN
                RAISE EXCEPTION 'Empresa não encontrada ou inativa: %', empresa_id_param;
            END IF;
        END IF;

        INSERT INTO public.alunos (id, email, nome_completo, empresa_id)
        VALUES (
            new.id,
            COALESCE(new.email, ''),
            COALESCE(
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'name',
                split_part(COALESCE(new.email, ''), '@', 1),
                'Novo Aluno'
            ),
            empresa_id_param  -- NOVO: passa empresa_id para isolamento
        )
        ON CONFLICT (id) DO UPDATE
        SET
            email = EXCLUDED.email,
            nome_completo = COALESCE(NULLIF(alunos.nome_completo, ''), EXCLUDED.nome_completo),
            empresa_id = COALESCE(alunos.empresa_id, EXCLUDED.empresa_id),
            updated_at = now();
    END IF;

    RETURN new;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function que cria registros de professor ou aluno ao criar usuário. Suporta empresa_id via user_metadata para isolamento multi-tenant.';
