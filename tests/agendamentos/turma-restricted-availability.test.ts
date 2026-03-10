/**
 * Testes de Integração - Disponibilidade Restrita por Turma
 *
 * 7.2: Fluxo completo — professor cria recorrência com turma,
 *      aluno da turma vê slot, aluno de outra turma não vê.
 * 7.3: Validação — aluno tenta agendar slot de regra restrita
 *      sem estar na turma → rejeição.
 *
 * Requer Supabase (service role) para setup de dados de teste.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const hasSupabase = !!SUPABASE_URL && !!SUPABASE_SERVICE_KEY
const describeIfSupabase = hasSupabase ? describe : describe.skip

if (!hasSupabase) {
  console.warn(
    'Supabase environment variables not found. Skipping turma-restricted availability integration tests.',
  )
}

const supabase = hasSupabase
  ? createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)
  : (null as unknown as ReturnType<typeof createClient>)

describeIfSupabase('Disponibilidade Restrita por Turma', () => {
  // IDs de teste
  let empresaId: string
  let professorId: string
  let alunoTurmaAId: string
  let alunoTurmaBId: string
  let cursoId: string
  let turmaAId: string
  let turmaBId: string
  let recorrenciaSemTurmaId: string
  let recorrenciaComTurmaAId: string

  const timestamp = Date.now()

  beforeAll(async () => {
    // 1. Criar empresa
    const { data: empresa, error: empErr } = await supabase
      .from('empresas')
      .insert({ nome: 'Teste Turma Avail', slug: `teste-turma-avail-${timestamp}`, ativo: true })
      .select()
      .single()
    if (empErr) throw empErr
    empresaId = empresa.id

    // 2. Criar professor (auth + usuarios)
    const { data: profAuth, error: profAuthErr } = await supabase.auth.admin.createUser({
      email: `prof-turma-${timestamp}@teste.com`,
      password: 'senha-teste-123',
      email_confirm: true,
    })
    if (profAuthErr) throw profAuthErr
    professorId = profAuth.user.id

    await supabase.from('usuarios').insert({
      id: professorId,
      nome_completo: 'Professor Turma Teste',
      email: profAuth.user.email!,
      empresa_id: empresaId,
      ativo: true,
    })

    // 3. Criar aluno A (matriculado na turma A)
    const { data: alunoAAuth } = await supabase.auth.admin.createUser({
      email: `aluno-a-${timestamp}@teste.com`,
      password: 'senha-teste-123',
      email_confirm: true,
    })
    alunoTurmaAId = alunoAAuth!.user.id

    await supabase.from('usuarios').insert({
      id: alunoTurmaAId,
      nome_completo: 'Aluno Turma A',
      email: alunoAAuth!.user.email!,
      empresa_id: empresaId,
      ativo: true,
    })

    // 4. Criar aluno B (matriculado na turma B)
    const { data: alunoBAuth } = await supabase.auth.admin.createUser({
      email: `aluno-b-${timestamp}@teste.com`,
      password: 'senha-teste-123',
      email_confirm: true,
    })
    alunoTurmaBId = alunoBAuth!.user.id

    await supabase.from('usuarios').insert({
      id: alunoTurmaBId,
      nome_completo: 'Aluno Turma B',
      email: alunoBAuth!.user.email!,
      empresa_id: empresaId,
      ativo: true,
    })

    // 5. Criar curso
    const { data: curso } = await supabase
      .from('cursos')
      .insert({ nome: `Curso Teste ${timestamp}`, empresa_id: empresaId, ativo: true })
      .select()
      .single()
    cursoId = curso!.id

    // 6. Criar turma A e turma B
    const { data: tA } = await supabase
      .from('turmas')
      .insert({ nome: 'Turma A', curso_id: cursoId, empresa_id: empresaId, ativo: true })
      .select()
      .single()
    turmaAId = tA!.id

    const { data: tB } = await supabase
      .from('turmas')
      .insert({ nome: 'Turma B', curso_id: cursoId, empresa_id: empresaId, ativo: true })
      .select()
      .single()
    turmaBId = tB!.id

    // 7. Matricular alunos
    await supabase.from('alunos_turmas').insert([
      { usuario_id: alunoTurmaAId, turma_id: turmaAId },
      { usuario_id: alunoTurmaBId, turma_id: turmaBId },
    ])

    // 8. Criar recorrência SEM restrição de turma (universal)
    const todayStr = new Date().toISOString().split('T')[0]
    const { data: recUniv } = await supabase
      .from('agendamento_recorrencia')
      .insert({
        professor_id: professorId,
        empresa_id: empresaId,
        tipo_servico: 'plantao',
        data_inicio: todayStr,
        dia_semana: 1, // segunda
        hora_inicio: '08:00',
        hora_fim: '12:00',
        duracao_slot_minutos: 30,
        ativo: true,
      })
      .select()
      .single()
    recorrenciaSemTurmaId = recUniv!.id

    // 9. Criar recorrência COM restrição para turma A
    const { data: recTurmaA } = await supabase
      .from('agendamento_recorrencia')
      .insert({
        professor_id: professorId,
        empresa_id: empresaId,
        tipo_servico: 'plantao',
        data_inicio: todayStr,
        dia_semana: 2, // terça
        hora_inicio: '14:00',
        hora_fim: '18:00',
        duracao_slot_minutos: 30,
        ativo: true,
      })
      .select()
      .single()
    recorrenciaComTurmaAId = recTurmaA!.id

    // 10. Vincular recorrência à turma A
    await supabase.from('agendamento_recorrencia_turmas').insert({
      recorrencia_id: recorrenciaComTurmaAId,
      turma_id: turmaAId,
      empresa_id: empresaId,
    })
  })

  afterAll(async () => {
    // Limpar na ordem inversa de dependências
    await supabase.from('agendamento_recorrencia_turmas').delete().eq('recorrencia_id', recorrenciaComTurmaAId)
    await supabase.from('agendamento_recorrencia').delete().eq('id', recorrenciaSemTurmaId)
    await supabase.from('agendamento_recorrencia').delete().eq('id', recorrenciaComTurmaAId)
    await supabase.from('alunos_turmas').delete().eq('turma_id', turmaAId)
    await supabase.from('alunos_turmas').delete().eq('turma_id', turmaBId)
    await supabase.from('turmas').delete().eq('id', turmaAId)
    await supabase.from('turmas').delete().eq('id', turmaBId)
    await supabase.from('cursos').delete().eq('id', cursoId)
    for (const uid of [professorId, alunoTurmaAId, alunoTurmaBId]) {
      await supabase.from('usuarios').delete().eq('id', uid)
      await supabase.auth.admin.deleteUser(uid)
    }
    await supabase.from('empresas').delete().eq('id', empresaId)
  })

  describe('7.2 - Fluxo completo de visibilidade por turma', () => {
    it('deve vincular recorrência à turma corretamente', async () => {
      const { data, error } = await supabase
        .from('agendamento_recorrencia_turmas')
        .select('*')
        .eq('recorrencia_id', recorrenciaComTurmaAId)

      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data![0].turma_id).toBe(turmaAId)
    })

    it('deve buscar turmas do aluno A corretamente', async () => {
      const { data, error } = await supabase
        .from('alunos_turmas')
        .select('turma_id, turmas!inner(ativo, empresa_id)')
        .eq('usuario_id', alunoTurmaAId)
        .eq('turmas.empresa_id', empresaId)
        .eq('turmas.ativo', true)

      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data![0].turma_id).toBe(turmaAId)
    })

    it('aluno da turma A deve ver recorrência restrita à turma A', async () => {
      // Simular getRecorrenciaTurmas
      const { data: turmaLinks } = await supabase
        .from('agendamento_recorrencia_turmas')
        .select('recorrencia_id, turma_id')
        .in('recorrencia_id', [recorrenciaSemTurmaId, recorrenciaComTurmaAId])

      const turmasMap: Record<string, string[]> = {}
      for (const row of turmaLinks || []) {
        if (!turmasMap[row.recorrencia_id]) turmasMap[row.recorrencia_id] = []
        turmasMap[row.recorrencia_id].push(row.turma_id)
      }

      // Simular getAlunoTurmaIds
      const { data: alunoTurmas } = await supabase
        .from('alunos_turmas')
        .select('turma_id, turmas!inner(ativo, empresa_id)')
        .eq('usuario_id', alunoTurmaAId)
        .eq('turmas.empresa_id', empresaId)
        .eq('turmas.ativo', true)

      const alunoTurmaIds = (alunoTurmas || []).map(r => r.turma_id)

      // Simular filterRecorrenciasByTurma
      const recorrencias = [
        { id: recorrenciaSemTurmaId, dia: 1 },
        { id: recorrenciaComTurmaAId, dia: 2 },
      ]

      const filtered = recorrencias.filter((rec) => {
        const tIds = turmasMap[rec.id]
        if (!tIds || tIds.length === 0) return true
        return tIds.some(tid => alunoTurmaIds.includes(tid))
      })

      // Aluno A está na turma A → deve ver ambas as recorrências
      expect(filtered).toHaveLength(2)
    })

    it('aluno da turma B NÃO deve ver recorrência restrita à turma A', async () => {
      // Buscar turmas do aluno B
      const { data: alunoTurmas } = await supabase
        .from('alunos_turmas')
        .select('turma_id, turmas!inner(ativo, empresa_id)')
        .eq('usuario_id', alunoTurmaBId)
        .eq('turmas.empresa_id', empresaId)
        .eq('turmas.ativo', true)

      const alunoTurmaIds = (alunoTurmas || []).map(r => r.turma_id)
      expect(alunoTurmaIds).toContain(turmaBId)
      expect(alunoTurmaIds).not.toContain(turmaAId)

      // Buscar turma links
      const { data: turmaLinks } = await supabase
        .from('agendamento_recorrencia_turmas')
        .select('recorrencia_id, turma_id')
        .in('recorrencia_id', [recorrenciaSemTurmaId, recorrenciaComTurmaAId])

      const turmasMap: Record<string, string[]> = {}
      for (const row of turmaLinks || []) {
        if (!turmasMap[row.recorrencia_id]) turmasMap[row.recorrencia_id] = []
        turmasMap[row.recorrencia_id].push(row.turma_id)
      }

      const recorrencias = [
        { id: recorrenciaSemTurmaId, dia: 1 },
        { id: recorrenciaComTurmaAId, dia: 2 },
      ]

      const filtered = recorrencias.filter((rec) => {
        const tIds = turmasMap[rec.id]
        if (!tIds || tIds.length === 0) return true
        return tIds.some(tid => alunoTurmaIds.includes(tid))
      })

      // Aluno B está na turma B → deve ver apenas a recorrência universal
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(recorrenciaSemTurmaId)
    })

    it('recorrência sem turma deve ficar visível para todos os alunos', async () => {
      const { data: turmaLinks } = await supabase
        .from('agendamento_recorrencia_turmas')
        .select('recorrencia_id, turma_id')
        .eq('recorrencia_id', recorrenciaSemTurmaId)

      // Sem vínculos → universal
      expect(turmaLinks).toHaveLength(0)
    })
  })

  describe('7.3 - Validação: rejeição de agendamento sem turma', () => {
    it('deve rejeitar acesso quando aluno não está na turma da recorrência', async () => {
      // Buscar turmas vinculadas à recorrência restrita
      const { data: turmaLinks } = await supabase
        .from('agendamento_recorrencia_turmas')
        .select('turma_id')
        .eq('recorrencia_id', recorrenciaComTurmaAId)

      const recTurmaIds = (turmaLinks || []).map(r => r.turma_id)
      expect(recTurmaIds).toContain(turmaAId)

      // Buscar turmas do aluno B
      const { data: alunoTurmas } = await supabase
        .from('alunos_turmas')
        .select('turma_id, turmas!inner(ativo, empresa_id)')
        .eq('usuario_id', alunoTurmaBId)
        .eq('turmas.empresa_id', empresaId)
        .eq('turmas.ativo', true)

      const alunoTurmaIds = (alunoTurmas || []).map(r => r.turma_id)

      // Verificar que não há intersecção
      const hasAccess = recTurmaIds.some(tid => alunoTurmaIds.includes(tid))
      expect(hasAccess).toBe(false)

      // Simular validação: filtrar recorrências para este aluno
      const recorrencias = [{ id: recorrenciaComTurmaAId }]
      const turmasMap: Record<string, string[]> = { [recorrenciaComTurmaAId]: recTurmaIds }

      const filtered = recorrencias.filter((rec) => {
        const tIds = turmasMap[rec.id]
        if (!tIds || tIds.length === 0) return true
        return tIds.some(tid => alunoTurmaIds.includes(tid))
      })

      // Após filtro → nenhuma recorrência disponível → validação deve rejeitar
      expect(filtered).toHaveLength(0)

      // Isso corresponde ao comportamento do validateAgendamento:
      // filteredRecorrencias.length === 0 → { valid: false, error: "O professor não tem disponibilidade neste horário." }
    })

    it('deve permitir acesso quando aluno está na turma da recorrência', async () => {
      const { data: turmaLinks } = await supabase
        .from('agendamento_recorrencia_turmas')
        .select('turma_id')
        .eq('recorrencia_id', recorrenciaComTurmaAId)

      const recTurmaIds = (turmaLinks || []).map(r => r.turma_id)

      // Buscar turmas do aluno A
      const { data: alunoTurmas } = await supabase
        .from('alunos_turmas')
        .select('turma_id, turmas!inner(ativo, empresa_id)')
        .eq('usuario_id', alunoTurmaAId)
        .eq('turmas.empresa_id', empresaId)
        .eq('turmas.ativo', true)

      const alunoTurmaIds = (alunoTurmas || []).map(r => r.turma_id)

      // Verificar intersecção
      const hasAccess = recTurmaIds.some(tid => alunoTurmaIds.includes(tid))
      expect(hasAccess).toBe(true)
    })

    it('unique constraint impede vincular mesma turma duas vezes', async () => {
      const { error } = await supabase
        .from('agendamento_recorrencia_turmas')
        .insert({
          recorrencia_id: recorrenciaComTurmaAId,
          turma_id: turmaAId,
          empresa_id: empresaId,
        })

      expect(error).not.toBeNull()
      expect(error?.code).toBe('23505') // Unique constraint violation
    })

    it('cascade delete remove vínculos ao deletar recorrência', async () => {
      // Criar recorrência temporária
      const { data: tempRec } = await supabase
        .from('agendamento_recorrencia')
        .insert({
          professor_id: professorId,
          empresa_id: empresaId,
          tipo_servico: 'plantao',
          data_inicio: new Date().toISOString().split('T')[0],
          dia_semana: 5,
          hora_inicio: '09:00',
          hora_fim: '11:00',
          duracao_slot_minutos: 30,
          ativo: true,
        })
        .select()
        .single()

      // Vincular turma
      await supabase.from('agendamento_recorrencia_turmas').insert({
        recorrencia_id: tempRec!.id,
        turma_id: turmaAId,
        empresa_id: empresaId,
      })

      // Deletar recorrência
      await supabase.from('agendamento_recorrencia').delete().eq('id', tempRec!.id)

      // Verificar que vínculo foi removido por cascade
      const { data: links } = await supabase
        .from('agendamento_recorrencia_turmas')
        .select('id')
        .eq('recorrencia_id', tempRec!.id)

      expect(links).toHaveLength(0)
    })
  })
})
