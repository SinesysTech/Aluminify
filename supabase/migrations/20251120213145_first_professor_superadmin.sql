-- Função para verificar se é o primeiro professor e marcar como superadmin
create or replace function public.check_and_set_first_professor_superadmin(user_id uuid)
returns void as $$
declare
    professor_count integer;
begin
    -- Contar quantos professores já existem (excluindo o atual)
    select count(*) into professor_count
    from public.professores
    where id != user_id;

    -- Se não há outros professores, este é o primeiro
    if professor_count = 0 then
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
$$ language plpgsql security definer;

-- Atualizar a função handle_new_user para:
-- 1. Sempre criar como professor quando vem do frontend
-- 2. Chamar a função para verificar se é o primeiro professor
create or replace function public.handle_new_user()
returns trigger as $$
declare
    user_role text;
    is_superadmin boolean;
begin
    -- Tenta ler o papel do usuário (ex: { "role": "professor" })
    user_role := new.raw_user_meta_data->>'role';
    is_superadmin := (new.raw_user_meta_data->>'is_superadmin')::boolean = true or user_role = 'superadmin';

    -- Se for professor ou superadmin, criar na tabela professores
    if user_role = 'professor' or user_role = 'superadmin' or is_superadmin then
        insert into public.professores (id, email, nome_completo)
        values (
            new.id, 
            new.email, 
            coalesce(new.raw_user_meta_data->>'full_name', 
                case when is_superadmin then 'Super Admin' else 'Novo Professor' end)
        );

        -- Verificar se é o primeiro professor e marcar como superadmin
        perform public.check_and_set_first_professor_superadmin(new.id);
    else
        -- Default: Se não vier nada ou vier 'aluno', cria como Aluno
        -- (Isso só acontece para criação interna, não via frontend)
        insert into public.alunos (id, email, nome_completo)
        values (
            new.id, 
            new.email, 
            coalesce(new.raw_user_meta_data->>'full_name', 'Novo Aluno')
        );
    end if;

    return new;
end;
$$ language plpgsql security definer;;
