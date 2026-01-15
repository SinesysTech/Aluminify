-- Atualizar função de cadastro para suportar superadmin
create or replace function public.handle_new_user()
returns trigger as $$
declare
    user_role text;
    is_superadmin boolean;
begin
    -- Tenta ler o papel do usuário (ex: { "role": "professor" })
    user_role := new.raw_user_meta_data->>'role';
    is_superadmin := (new.raw_user_meta_data->>'is_superadmin')::boolean = true or user_role = 'superadmin';

    if user_role = 'professor' or is_superadmin then
        insert into public.professores (id, email, nome_completo)
        values (
            new.id, 
            new.email, 
            coalesce(new.raw_user_meta_data->>'full_name', 
                case when is_superadmin then 'Super Admin' else 'Novo Professor' end)
        );
    else
        -- Default: Se não vier nada ou vier 'aluno', cria como Aluno
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
