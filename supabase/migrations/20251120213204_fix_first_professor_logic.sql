-- Corrigir a função para verificar antes de inserir
-- A função será chamada DEPOIS da inserção, então precisamos contar todos exceto o atual
create or replace function public.check_and_set_first_professor_superadmin(user_id uuid)
returns void as $$
declare
    professor_count integer;
begin
    -- Contar quantos professores já existem (incluindo o que acabou de ser criado)
    select count(*) into professor_count
    from public.professores;

    -- Se há apenas 1 professor (o que acabou de ser criado), este é o primeiro
    if professor_count = 1 then
        -- Atualizar o metadata do usuário para superadmin
        update auth.users
        set raw_user_meta_data = jsonb_set(
            jsonb_set(
                coalesce(raw_user_meta_data, '{}'::jsonb),
                '{is_superadmin}',
                'true'::jsonb
            ),
            '{role}',
            '"superadmin"'::jsonb
        )
        where id = user_id;
    end if;
end;
$$ language plpgsql security definer;;
