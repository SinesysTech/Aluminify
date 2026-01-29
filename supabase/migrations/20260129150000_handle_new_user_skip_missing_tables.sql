-- Migration: handle_new_user - skip inserts when alunos/professores don't exist
-- Description: Em projetos que unificaram em "usuarios", as tabelas alunos e professores
--              podem não existir. O trigger falhava com "Database error creating new user".
--              Agora só insere nessas tabelas se existirem; a aplicação cria o registro em
--              usuarios em seguida.
-- Author: diagnostic fix
-- Date: 2026-01-29

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
        -- Aluno
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
$function$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger em auth.users. Insere em professores/alunos/usuarios conforme role. Se alunos ou professores nao existirem (modelo unificado em usuarios), nao insere nessas tabelas e a aplicacao cria o registro em usuarios.';
