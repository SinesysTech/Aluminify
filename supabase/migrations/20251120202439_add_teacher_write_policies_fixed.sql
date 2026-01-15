-- Permissões de ESCRITA para Professores

-- Cursos
drop policy if exists "Professores criam cursos" on public.cursos;
create policy "Professores criam cursos" on public.cursos 
    for insert with check (exists (select 1 from public.professores where id = auth.uid()));

drop policy if exists "Professores editam seus cursos" on public.cursos;
create policy "Professores editam seus cursos" on public.cursos 
    for update using (created_by = auth.uid());

drop policy if exists "Professores deletam seus cursos" on public.cursos;
create policy "Professores deletam seus cursos" on public.cursos 
    for delete using (created_by = auth.uid());

-- Disciplinas
drop policy if exists "Professores criam disciplinas" on public.disciplinas;
create policy "Professores criam disciplinas" on public.disciplinas 
    for insert with check (exists (select 1 from public.professores where id = auth.uid()));

drop policy if exists "Professores editam suas disciplinas" on public.disciplinas;
create policy "Professores editam suas disciplinas" on public.disciplinas 
    for update using (created_by = auth.uid());

drop policy if exists "Professores deletam suas disciplinas" on public.disciplinas;
create policy "Professores deletam suas disciplinas" on public.disciplinas 
    for delete using (created_by = auth.uid());

-- Segmentos
drop policy if exists "Professores criam segmentos" on public.segmentos;
create policy "Professores criam segmentos" on public.segmentos 
    for insert with check (exists (select 1 from public.professores where id = auth.uid()));

drop policy if exists "Professores editam seus segmentos" on public.segmentos;
create policy "Professores editam seus segmentos" on public.segmentos 
    for update using (created_by = auth.uid());

drop policy if exists "Professores deletam seus segmentos" on public.segmentos;
create policy "Professores deletam seus segmentos" on public.segmentos 
    for delete using (created_by = auth.uid());;
