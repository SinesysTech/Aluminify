-- Políticas para Superadmin ter acesso total

-- Superadmin pode ver tudo em segmentos
drop policy if exists "Superadmin vê todos os segmentos" on public.segmentos;
create policy "Superadmin vê todos os segmentos" on public.segmentos
for select using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode gerenciar tudo em segmentos
drop policy if exists "Superadmin gerencia segmentos" on public.segmentos;
create policy "Superadmin gerencia segmentos" on public.segmentos
for all using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode ver tudo em disciplinas
drop policy if exists "Superadmin vê todas as disciplinas" on public.disciplinas;
create policy "Superadmin vê todas as disciplinas" on public.disciplinas
for select using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode gerenciar tudo em disciplinas
drop policy if exists "Superadmin gerencia disciplinas" on public.disciplinas;
create policy "Superadmin gerencia disciplinas" on public.disciplinas
for all using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode ver tudo em cursos
drop policy if exists "Superadmin vê todos os cursos" on public.cursos;
create policy "Superadmin vê todos os cursos" on public.cursos
for select using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode gerenciar tudo em cursos
drop policy if exists "Superadmin gerencia cursos" on public.cursos;
create policy "Superadmin gerencia cursos" on public.cursos
for all using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode ver tudo em alunos
drop policy if exists "Superadmin vê todos os alunos" on public.alunos;
create policy "Superadmin vê todos os alunos" on public.alunos
for select using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode gerenciar tudo em alunos
drop policy if exists "Superadmin gerencia alunos" on public.alunos;
create policy "Superadmin gerencia alunos" on public.alunos
for all using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode ver tudo em professores
drop policy if exists "Superadmin vê todos os professores" on public.professores;
create policy "Superadmin vê todos os professores" on public.professores
for select using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode gerenciar tudo em professores
drop policy if exists "Superadmin gerencia professores" on public.professores;
create policy "Superadmin gerencia professores" on public.professores
for all using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode ver tudo em matriculas
drop policy if exists "Superadmin vê todas as matrículas" on public.matriculas;
create policy "Superadmin vê todas as matrículas" on public.matriculas
for select using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode gerenciar tudo em matriculas
drop policy if exists "Superadmin gerencia matrículas" on public.matriculas;
create policy "Superadmin gerencia matrículas" on public.matriculas
for all using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Superadmin pode ver tudo em materiais
drop policy if exists "Superadmin vê todos os materiais" on public.materiais_curso;
create policy "Superadmin vê todos os materiais" on public.materiais_curso
for select using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);;
