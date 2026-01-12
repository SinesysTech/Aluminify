-- Fix: importar_cronograma_aulas must set curso_id on aulas (and empresa_id already derived)
-- Date: 2026-01-12

BEGIN;

CREATE OR REPLACE FUNCTION public.importar_cronograma_aulas(
  p_curso_id uuid,
  p_disciplina_nome text,
  p_frente_nome text,
  p_conteudo jsonb
)
RETURNS TABLE(modulos_importados integer, aulas_importadas integer)
LANGUAGE plpgsql
SECURITY DEFINER
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
  if p_curso_id is null then
    raise exception 'p_curso_id é obrigatório';
  end if;

  if p_conteudo is null or jsonb_typeof(p_conteudo) <> 'array' then
    raise exception 'p_conteudo deve ser um array JSON';
  end if;

  -- Descobrir empresa_id pelo curso (tenant)
  select c.empresa_id into v_empresa_id
  from public.cursos c
  where c.id = p_curso_id
  limit 1;

  if v_empresa_id is null then
    raise exception 'Curso "%" não encontrado ou sem empresa_id', p_curso_id;
  end if;

  -- Disciplina por nome (case-insensitive, sem acento)
  select d.id into v_disciplina_id
  from public.disciplinas d
  where unaccent(lower(d.nome)) = unaccent(lower(p_disciplina_nome))
  limit 1;

  if v_disciplina_id is null then
    raise exception 'Disciplina "%" não encontrada', p_disciplina_nome;
  end if;

  -- Garantir frente (preferir match por empresa_id; se achar frente legada sem empresa_id, "adota" para a empresa do curso)
  select f.id into v_frente_id
  from public.frentes f
  where f.disciplina_id = v_disciplina_id
    and f.curso_id = p_curso_id
    and unaccent(lower(f.nome)) = unaccent(lower(p_frente_nome))
    and (f.empresa_id = v_empresa_id or f.empresa_id is null)
  order by (f.empresa_id is null) asc
  limit 1;

  if v_frente_id is null then
    insert into public.frentes (disciplina_id, curso_id, nome, empresa_id)
    values (v_disciplina_id, p_curso_id, p_frente_nome, v_empresa_id)
    returning id into v_frente_id;
  else
    -- Se a frente existir mas estiver sem empresa_id (legado), corrigir
    update public.frentes
    set empresa_id = v_empresa_id
    where id = v_frente_id
      and empresa_id is null;
  end if;

  for v_row in select * from jsonb_array_elements(p_conteudo)
  loop
    v_modulo_numero := coalesce((v_row->>'modulo_numero')::int, null);
    v_modulo_nome   := nullif(v_row->>'modulo_nome', '');
    v_aula_numero   := coalesce((v_row->>'aula_numero')::int, null);
    v_aula_nome     := nullif(v_row->>'aula_nome', '');

    -- 0 (ou <=0) deve virar NULL
    v_tempo         := nullif((v_row->>'tempo')::int, 0);
    if v_tempo is not null and v_tempo <= 0 then
      v_tempo := null;
    end if;

    -- 0 deve virar NULL; e se estiver fora do range 1..5, virar NULL
    v_prioridade    := nullif((v_row->>'prioridade')::int, 0);
    if v_prioridade is not null and (v_prioridade < 1 or v_prioridade > 5) then
      v_prioridade := null;
    end if;

    v_importancia   := nullif(v_row->>'importancia', '')::enum_importancia_modulo;
    if v_importancia is null then
      v_importancia := 'Base';
    end if;

    if v_modulo_numero is null or v_modulo_nome is null or v_aula_nome is null then
      continue;
    end if;

    -- Upsert módulo por frente + número (com adoção de legado sem empresa_id)
    select m.id into v_modulo_id
    from public.modulos m
    where m.frente_id = v_frente_id
      and m.numero_modulo = v_modulo_numero
      and (m.empresa_id = v_empresa_id or m.empresa_id is null)
    order by (m.empresa_id is null) asc
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

    -- Upsert aula por módulo + número (com adoção de legado sem empresa_id)
    select a.id into v_aula_id
    from public.aulas a
    where a.modulo_id = v_modulo_id
      and a.numero_aula = v_aula_numero
      and (a.empresa_id = v_empresa_id or a.empresa_id is null)
    order by (a.empresa_id is null) asc
    limit 1;

    if v_aula_id is null then
      insert into public.aulas (
        modulo_id,
        curso_id,
        nome,
        numero_aula,
        tempo_estimado_minutos,
        prioridade,
        empresa_id
      )
      values (
        v_modulo_id,
        p_curso_id,
        v_aula_nome,
        v_aula_numero,
        v_tempo,
        v_prioridade,
        v_empresa_id
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

COMMIT;

