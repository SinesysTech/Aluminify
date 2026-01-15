-- Função que preenche o created_by
create or replace function public.handle_created_by()
returns trigger as $$
begin
    -- Se não foi enviado manualmente, usa o ID do usuário autenticado
    if new.created_by is null then
        new.created_by := auth.uid();
    end if;
    return new;
end;
$$ language plpgsql;

-- Aplicando a trigger nas tabelas
drop trigger if exists set_created_by_segmentos on public.segmentos;
create trigger set_created_by_segmentos 
before insert on public.segmentos 
for each row execute procedure public.handle_created_by();

drop trigger if exists set_created_by_disciplinas on public.disciplinas;
create trigger set_created_by_disciplinas 
before insert on public.disciplinas 
for each row execute procedure public.handle_created_by();

drop trigger if exists set_created_by_cursos on public.cursos;
create trigger set_created_by_cursos 
before insert on public.cursos 
for each row execute procedure public.handle_created_by();;
