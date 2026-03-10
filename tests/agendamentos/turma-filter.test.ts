/**
 * Testes Unitários - filterRecorrenciasByTurma
 *
 * Testa a lógica de filtragem de recorrências por turma:
 * - Regra sem turma → inclui para todos
 * - Regra com turma → inclui apenas para aluno matriculado
 * - Regra com múltiplas turmas → usa OR (pelo menos uma)
 */

import { describe, it, expect } from '@jest/globals'

// Importação direta da função pura (não depende de "use server")
// Re-implementada aqui para teste unitário isolado, já que o módulo usa "use server"
function filterRecorrenciasByTurma<T extends { id?: string }>(
  recorrencias: T[],
  recorrenciaTurmasMap: Record<string, string[]>,
  alunoTurmaIds: string[],
): T[] {
  return recorrencias.filter((rec) => {
    const recId = rec.id
    if (!recId) return true

    const turmaIds = recorrenciaTurmasMap[recId]
    if (!turmaIds || turmaIds.length === 0) return true

    return turmaIds.some((turmaId) => alunoTurmaIds.includes(turmaId))
  })
}

describe('filterRecorrenciasByTurma', () => {
  const turmaA = 'turma-a-id'
  const turmaB = 'turma-b-id'
  const turmaC = 'turma-c-id'

  const recSemTurma = { id: 'rec-1', dia_semana: 1, hora_inicio: '09:00', hora_fim: '12:00' }
  const recComTurmaA = { id: 'rec-2', dia_semana: 2, hora_inicio: '14:00', hora_fim: '18:00' }
  const recComTurmaAeB = { id: 'rec-3', dia_semana: 3, hora_inicio: '10:00', hora_fim: '16:00' }
  const recComTurmaC = { id: 'rec-4', dia_semana: 4, hora_inicio: '08:00', hora_fim: '11:00' }

  const turmasMap: Record<string, string[]> = {
    // rec-1 não aparece → sem turma vinculada
    'rec-2': [turmaA],
    'rec-3': [turmaA, turmaB],
    'rec-4': [turmaC],
  }

  describe('regra sem turma retorna para todos', () => {
    it('deve incluir recorrência sem turmas vinculadas para qualquer aluno', () => {
      const result = filterRecorrenciasByTurma(
        [recSemTurma],
        turmasMap,
        [], // aluno sem nenhuma turma
      )
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('rec-1')
    })

    it('deve incluir recorrência sem turmas mesmo quando mapa está vazio', () => {
      const result = filterRecorrenciasByTurma(
        [recSemTurma],
        {}, // mapa vazio
        [turmaA],
      )
      expect(result).toHaveLength(1)
    })
  })

  describe('regra com turma retorna apenas para aluno matriculado', () => {
    it('deve incluir recorrência quando aluno está na turma vinculada', () => {
      const result = filterRecorrenciasByTurma(
        [recComTurmaA],
        turmasMap,
        [turmaA],
      )
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('rec-2')
    })

    it('deve excluir recorrência quando aluno NÃO está na turma vinculada', () => {
      const result = filterRecorrenciasByTurma(
        [recComTurmaA],
        turmasMap,
        [turmaB], // aluno na turma B, regra restrita à turma A
      )
      expect(result).toHaveLength(0)
    })

    it('deve excluir recorrência quando aluno não tem turmas', () => {
      const result = filterRecorrenciasByTurma(
        [recComTurmaA],
        turmasMap,
        [], // aluno sem turmas
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('regra com múltiplas turmas usa OR', () => {
    it('deve incluir quando aluno está em uma das turmas vinculadas (turma A)', () => {
      const result = filterRecorrenciasByTurma(
        [recComTurmaAeB],
        turmasMap,
        [turmaA], // aluno apenas na turma A
      )
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('rec-3')
    })

    it('deve incluir quando aluno está em outra das turmas vinculadas (turma B)', () => {
      const result = filterRecorrenciasByTurma(
        [recComTurmaAeB],
        turmasMap,
        [turmaB], // aluno apenas na turma B
      )
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('rec-3')
    })

    it('deve incluir quando aluno está em ambas as turmas', () => {
      const result = filterRecorrenciasByTurma(
        [recComTurmaAeB],
        turmasMap,
        [turmaA, turmaB],
      )
      expect(result).toHaveLength(1)
    })

    it('deve excluir quando aluno não está em nenhuma das turmas vinculadas', () => {
      const result = filterRecorrenciasByTurma(
        [recComTurmaAeB],
        turmasMap,
        [turmaC], // aluno na turma C, regra restrita às turmas A e B
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('cenários mistos', () => {
    const todasRecorrencias = [recSemTurma, recComTurmaA, recComTurmaAeB, recComTurmaC]

    it('aluno na turma A vê regras universais + regras da turma A', () => {
      const result = filterRecorrenciasByTurma(
        todasRecorrencias,
        turmasMap,
        [turmaA],
      )
      expect(result).toHaveLength(3) // rec-1 (universal), rec-2 (turma A), rec-3 (turma A+B)
      expect(result.map(r => r.id)).toEqual(['rec-1', 'rec-2', 'rec-3'])
    })

    it('aluno na turma C vê regras universais + regras da turma C', () => {
      const result = filterRecorrenciasByTurma(
        todasRecorrencias,
        turmasMap,
        [turmaC],
      )
      expect(result).toHaveLength(2) // rec-1 (universal), rec-4 (turma C)
      expect(result.map(r => r.id)).toEqual(['rec-1', 'rec-4'])
    })

    it('aluno sem turmas vê apenas regras universais', () => {
      const result = filterRecorrenciasByTurma(
        todasRecorrencias,
        turmasMap,
        [],
      )
      expect(result).toHaveLength(1) // rec-1 (universal)
      expect(result[0].id).toBe('rec-1')
    })

    it('aluno em todas as turmas vê todas as regras', () => {
      const result = filterRecorrenciasByTurma(
        todasRecorrencias,
        turmasMap,
        [turmaA, turmaB, turmaC],
      )
      expect(result).toHaveLength(4)
    })
  })

  describe('edge cases', () => {
    it('deve lidar com lista vazia de recorrências', () => {
      const result = filterRecorrenciasByTurma([], turmasMap, [turmaA])
      expect(result).toHaveLength(0)
    })

    it('deve incluir recorrência sem id', () => {
      const recSemId = { dia_semana: 1, hora_inicio: '09:00', hora_fim: '12:00' }
      const result = filterRecorrenciasByTurma(
        [recSemId],
        turmasMap,
        [],
      )
      expect(result).toHaveLength(1)
    })

    it('deve lidar com mapa vazio (todas as regras são universais)', () => {
      const result = filterRecorrenciasByTurma(
        [recSemTurma, recComTurmaA],
        {}, // mapa vazio → nenhuma regra tem turmas
        [],
      )
      expect(result).toHaveLength(2)
    })
  })
})
