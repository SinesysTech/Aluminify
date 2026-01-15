-- Atualizar função de cadastro para diferenciar aluno e professor
create or replace function public.handle_new_user()
returns trigger as $$
declare
    user_role text;
begin
    -- Tenta ler o papel do usuário (ex: { "role": "professor" })
    user_role := new.raw_user_meta_data->>'role';

    if user_role = 'professor' then
        insert into public.professores (id, email, nome_completo)
        values (
            new.id, 
            new.email, 
            coalesce(new.raw_user_meta_data->>'full_name', 'Novo Professor')
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
