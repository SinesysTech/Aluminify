import { getDatabaseClient } from '@/backend/clients/database';
import { DificuldadePercebida } from '@/backend/services/progresso-atividade/progresso-atividade.types';

export type FlashcardImportRow = {
  disciplina: string;
  frente: string;
  moduloNumero: number;
  pergunta: string;
  resposta: string;
};

export type FlashcardImportResult = {
  total: number;
  inserted: number;
  errors: { line: number; message: string }[];
};

export type FlashcardReviewItem = {
  id: string;
  moduloId: string | null;
  pergunta: string;
  resposta: string;
  importancia?: string | null;
  dataProximaRevisao?: string | null;
};

export type FlashcardAdmin = {
  id: string;
  modulo_id: string;
  pergunta: string;
  resposta: string;
  created_at: string;
  modulo: {
    id: string;
    nome: string;
    numero_modulo: number | null;
    frente: {
      id: string;
      nome: string;
      disciplina: {
        id: string;
        nome: string;
      };
    };
  };
};

export type CreateFlashcardInput = {
  moduloId: string;
  pergunta: string;
  resposta: string;
};

export type UpdateFlashcardInput = {
  moduloId?: string;
  pergunta?: string;
  resposta?: string;
};

export type ListFlashcardsFilters = {
  disciplinaId?: string;
  frenteId?: string;
  moduloId?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'created_at' | 'pergunta';
  orderDirection?: 'asc' | 'desc';
};

export class FlashcardsService {
  private client = getDatabaseClient();

  private normalizeName(value?: string | null): string {
    return (value ?? '').trim().toLowerCase();
  }

  private async ensureProfessor(userId: string) {
    const { data, error } = await this.client
      .from('professores')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Apenas professores podem realizar esta ação.');
    }
  }

  async importFlashcards(rows: FlashcardImportRow[], userId: string): Promise<FlashcardImportResult> {
    await this.ensureProfessor(userId);

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      throw new Error('Nenhuma linha recebida para importação.');
    }

    const normalizedRows = rows
      .map((row, idx) => ({
        ...row,
        _index: idx + 1,
        disciplina: row.disciplina?.trim(),
        frente: row.frente?.trim(),
        moduloNumero: Number(row.moduloNumero),
        pergunta: row.pergunta?.trim(),
        resposta: row.resposta?.trim(),
      }))
      .filter((r) => r.pergunta && r.resposta);

    const { data: disciplinas, error: discError } = await this.client
      .from('disciplinas')
      .select('id, nome');
    if (discError) {
      throw new Error(`Erro ao buscar disciplinas: ${discError.message}`);
    }
    const disciplinaMap = new Map<string, { id: string; nome: string }>();
    (disciplinas ?? []).forEach((d) => {
      disciplinaMap.set(this.normalizeName(d.nome), { id: d.id, nome: d.nome });
    });

    let inserted = 0;
    const errors: { line: number; message: string }[] = [];

    for (const row of normalizedRows) {
      const disciplinaKey = this.normalizeName(row.disciplina);
      const disciplina = disciplinaKey ? disciplinaMap.get(disciplinaKey) : null;
      if (!disciplina) {
        errors.push({
          line: row._index,
          message: `Disciplina não encontrada: ${row.disciplina || '(vazia)'}`,
        });
        continue;
      }

      const { data: frentes, error: frenteError } = await this.client
        .from('frentes')
        .select('id, nome')
        .eq('disciplina_id', disciplina.id)
        .ilike('nome', row.frente);

      if (frenteError) {
        errors.push({
          line: row._index,
          message: `Erro ao buscar frente ${row.frente}: ${frenteError.message}`,
        });
        continue;
      }

      const frente = frentes?.find(
        (f) => this.normalizeName(f.nome) === this.normalizeName(row.frente),
      );
      if (!frente) {
        errors.push({
          line: row._index,
          message: `Frente não encontrada: ${row.frente}`,
        });
        continue;
      }

      const { data: modulo, error: moduloError } = await this.client
        .from('modulos')
        .select('id')
        .eq('frente_id', frente.id)
        .eq('numero_modulo', row.moduloNumero)
        .maybeSingle();

      if (moduloError) {
        errors.push({
          line: row._index,
          message: `Erro ao buscar módulo ${row.moduloNumero}: ${moduloError.message}`,
        });
        continue;
      }

      if (!modulo) {
        errors.push({
          line: row._index,
          message: `Módulo ${row.moduloNumero} não encontrado para frente ${row.frente}`,
        });
        continue;
      }

      const { error: insertError } = await this.client.from('flashcards').insert({
        modulo_id: modulo.id,
        pergunta: row.pergunta,
        resposta: row.resposta,
      });

      if (insertError) {
        errors.push({
          line: row._index,
          message: `Erro ao inserir flashcard: ${insertError.message}`,
        });
        continue;
      }

      inserted += 1;
    }

    return { inserted, errors, total: normalizedRows.length };
  }

  private shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private async fetchProgressMap(alunoId: string, flashcardIds: string[]) {
    if (!flashcardIds.length) return new Map<string, any>();
    const { data, error } = await this.client
      .from('progresso_flashcards')
      .select('*')
      .eq('aluno_id', alunoId)
      .in('flashcard_id', flashcardIds);
    if (error) {
      console.warn('[flashcards] erro ao buscar progresso', error);
      return new Map<string, any>();
    }
    return new Map((data ?? []).map((p) => [p.flashcard_id as string, p]));
  }

  async listForReview(alunoId: string, modo: string): Promise<FlashcardReviewItem[]> {
    const now = new Date();
    let moduloIds: string[] = [];

    if (modo === 'mais_cobrados') {
      const { data, error } = await this.client
        .from('modulos')
        .select('id')
        .eq('importancia', 'Alta');
      if (error) throw new Error(`Erro ao buscar módulos prioritários: ${error.message}`);
      moduloIds = (data ?? []).map((m) => m.id);
    } else if (modo === 'mais_errados') {
      const { data: progressos, error: progError } = await this.client
        .from('progresso_atividades')
        .select('atividade_id, dificuldade_percebida, questoes_totais, questoes_acertos')
        .eq('aluno_id', alunoId);
      if (progError) {
        throw new Error(`Erro ao buscar progresso de atividades: ${progError.message}`);
      }
      const atividadeIds = (progressos ?? [])
        .filter((p) => {
          const dificuldade = p.dificuldade_percebida as DificuldadePercebida | null;
          const difficult = dificuldade === 'Dificil' || dificuldade === 'Muito Dificil';
          const aproveitamentoOk =
            p.questoes_totais && p.questoes_totais > 0
              ? (p.questoes_acertos ?? 0) / p.questoes_totais <= 0.5
              : false;
          return difficult || aproveitamentoOk;
        })
        .map((p) => p.atividade_id as string);

      if (atividadeIds.length) {
        const { data: atividades, error: atvError } = await this.client
          .from('atividades')
          .select('id, modulo_id')
          .in('id', atividadeIds);
        if (atvError) {
          throw new Error(`Erro ao buscar atividades: ${atvError.message}`);
        }
        moduloIds = Array.from(new Set((atividades ?? []).map((a) => a.modulo_id as string)));
      }
    } else {
      const { data: progFlash, error: progFlashError } = await this.client
        .from('progresso_flashcards')
        .select('flashcard_id')
        .eq('aluno_id', alunoId);
      if (progFlashError) {
        console.warn('[flashcards] erro ao buscar progresso para revisao_geral', progFlashError);
      }
      const flashcardIdsVistos = (progFlash ?? []).map((p) => p.flashcard_id as string);
      let moduloIdsVisited: string[] = [];
      if (flashcardIdsVistos.length) {
        const { data: cardsVisitados } = await this.client
          .from('flashcards')
          .select('id, modulo_id')
          .in('id', flashcardIdsVistos);
        moduloIdsVisited = Array.from(
          new Set((cardsVisitados ?? []).map((c) => c.modulo_id as string)),
        );
      }
      const { data: cardsQualquer } = await this.client.from('flashcards').select('modulo_id');
      const moduloIdsAll = Array.from(
        new Set((cardsQualquer ?? []).map((c) => c.modulo_id as string)),
      );
      moduloIds = moduloIdsVisited.length ? moduloIdsVisited : moduloIdsAll;
    }

    if (!moduloIds.length) {
      return [];
    }

    const { data: flashcards, error: cardsError } = await this.client
      .from('flashcards')
      .select('id, modulo_id, pergunta, resposta, modulos(importancia)')
      .in('modulo_id', moduloIds)
      .limit(50);

    if (cardsError) {
      throw new Error(`Erro ao buscar flashcards: ${cardsError.message}`);
    }

    const cards = (flashcards ?? []).map((c) => ({
      id: c.id as string,
      moduloId: c.modulo_id as string,
      pergunta: c.pergunta as string,
      resposta: c.resposta as string,
      importancia: Array.isArray(c.modulos)
        ? (c.modulos as any)[0]?.importancia
        : (c as any).modulos?.importancia,
    }));

    const progressMap = await this.fetchProgressMap(
      alunoId,
      cards.map((c) => c.id),
    );

    const dueCards = cards.filter((card) => {
      const progress = progressMap.get(card.id);
      if (!progress) return true;
      const nextDate = progress.data_proxima_revisao
        ? new Date(progress.data_proxima_revisao)
        : null;
      return !nextDate || nextDate <= now;
    });

    const shuffled = this.shuffle(dueCards);
    return shuffled.slice(0, 20).map((c) => {
      const progress = progressMap.get(c.id);
      return {
        ...c,
        dataProximaRevisao: progress?.data_proxima_revisao ?? null,
      };
    });
  }

  async sendFeedback(alunoId: string, cardId: string, feedback: number) {
    if (![1, 2, 3, 4].includes(feedback)) {
      throw new Error('Feedback inválido. Use 1, 2, 3 ou 4.');
    }

    const { data: existing, error } = await this.client
      .from('progresso_flashcards')
      .select('*')
      .eq('aluno_id', alunoId)
      .eq('flashcard_id', cardId)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar progresso do flashcard: ${error.message}`);
    }

    const now = new Date();
    const prevInterval = existing?.dias_intervalo ?? 0;
    let diasIntervalo = 1;
    let nivelFacilidade = existing?.nivel_facilidade ?? 2.5;

    if (feedback === 1) {
      diasIntervalo = 1;
      nivelFacilidade = Math.max(1.3, nivelFacilidade - 0.2);
    } else {
      const intervaloBase = Math.max(1, prevInterval || 1);
      const fator = nivelFacilidade || 2.5;
      diasIntervalo = Math.max(1, Math.round(intervaloBase * fator));
      if (feedback === 2) {
        nivelFacilidade = Math.max(1.3, nivelFacilidade - 0.15);
      } else if (feedback === 3) {
        nivelFacilidade = Math.min(3.5, nivelFacilidade + 0.05);
      } else if (feedback === 4) {
        nivelFacilidade = Math.min(3.5, nivelFacilidade + 0.15);
      }
    }

    const proximaRevisao = new Date(now);
    proximaRevisao.setDate(proximaRevisao.getDate() + diasIntervalo);

    const payload = {
      aluno_id: alunoId,
      flashcard_id: cardId,
      nivel_facilidade: nivelFacilidade,
      dias_intervalo: diasIntervalo,
      data_proxima_revisao: proximaRevisao.toISOString(),
      numero_revisoes: (existing?.numero_revisoes ?? 0) + 1,
      ultimo_feedback: feedback,
      updated_at: now.toISOString(),
    };

    const { data: upserted, error: upsertError } = await this.client
      .from('progresso_flashcards')
      .upsert(payload, { onConflict: 'aluno_id,flashcard_id' })
      .select('*')
      .maybeSingle();

    if (upsertError) {
      throw new Error(`Erro ao registrar feedback: ${upsertError.message}`);
    }

    return upserted;
  }

  async listAll(filters: ListFlashcardsFilters = {}, userId: string): Promise<{
    data: FlashcardAdmin[];
    total: number;
  }> {
    await this.ensureProfessor(userId);

    // Primeiro, buscar módulos filtrados se necessário
    let moduloIds: string[] | null = null;
    
    if (filters.moduloId) {
      moduloIds = [filters.moduloId];
    } else if (filters.frenteId) {
      const { data: modulosData } = await this.client
        .from('modulos')
        .select('id')
        .eq('frente_id', filters.frenteId);
      moduloIds = modulosData?.map((m) => m.id as string) || [];
    } else if (filters.disciplinaId) {
      // Buscar frentes da disciplina
      const { data: frentesData } = await this.client
        .from('frentes')
        .select('id')
        .eq('disciplina_id', filters.disciplinaId);
      const frenteIds = frentesData?.map((f) => f.id as string) || [];
      
      if (frenteIds.length > 0) {
        const { data: modulosData } = await this.client
          .from('modulos')
          .select('id')
          .in('frente_id', frenteIds);
        moduloIds = modulosData?.map((m) => m.id as string) || [];
      }
    }

    // Construir query de flashcards
    let query = this.client
      .from('flashcards')
      .select('id, modulo_id, pergunta, resposta, created_at', { count: 'exact' });

    if (moduloIds !== null) {
      if (moduloIds.length === 0) {
        // Nenhum módulo encontrado, retornar vazio
        return { data: [], total: 0 };
      }
      query = query.in('modulo_id', moduloIds);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`pergunta.ilike.${searchTerm},resposta.ilike.${searchTerm}`);
    }

    const orderBy = filters.orderBy || 'created_at';
    const orderDirection = filters.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data: flashcardsData, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao listar flashcards: ${error.message}`);
    }

    if (!flashcardsData || flashcardsData.length === 0) {
      return { data: [], total: count || 0 };
    }

    // Buscar módulos relacionados
    const moduloIdsFromFlashcards = [
      ...new Set(flashcardsData.map((f) => f.modulo_id as string)),
    ];

    const { data: modulosData, error: modulosError } = await this.client
      .from('modulos')
      .select(
        `
        id,
        nome,
        numero_modulo,
        frente_id,
        frentes!inner(
          id,
          nome,
          disciplina_id,
          disciplinas!inner(
            id,
            nome
          )
        )
      `,
      )
      .in('id', moduloIdsFromFlashcards);

    if (modulosError) {
      throw new Error(`Erro ao buscar módulos: ${modulosError.message}`);
    }

    // Criar map de módulos
    const modulosMap = new Map(
      (modulosData || []).map((m: any) => [
        m.id,
        {
          id: m.id,
          nome: m.nome,
          numero_modulo: m.numero_modulo,
          frente: {
            id: m.frentes.id,
            nome: m.frentes.nome,
            disciplina: {
              id: m.frentes.disciplinas.id,
              nome: m.frentes.disciplinas.nome,
            },
          },
        },
      ]),
    );

    // Montar resposta final
    const flashcards = flashcardsData
      .map((item: any) => {
        const modulo = modulosMap.get(item.modulo_id);
        if (!modulo) return null;

        return {
          id: item.id,
          modulo_id: item.modulo_id,
          pergunta: item.pergunta,
          resposta: item.resposta,
          created_at: item.created_at,
          modulo,
        };
      })
      .filter((f): f is FlashcardAdmin => f !== null);

    return {
      data: flashcards,
      total: count || 0,
    };
  }

  async getById(id: string, userId: string): Promise<FlashcardAdmin | null> {
    await this.ensureProfessor(userId);

    const { data: flashcard, error } = await this.client
      .from('flashcards')
      .select('id, modulo_id, pergunta, resposta, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar flashcard: ${error.message}`);
    }

    if (!flashcard) {
      return null;
    }

    // Buscar módulo com relacionamentos
    const { data: modulo, error: moduloGetError } = await this.client
      .from('modulos')
      .select(
        `
        id,
        nome,
        numero_modulo,
        frentes!inner(
          id,
          nome,
          disciplinas!inner(
            id,
            nome
          )
        )
      `,
      )
      .eq('id', flashcard.modulo_id)
      .maybeSingle();

    if (moduloGetError || !modulo) {
      throw new Error(`Erro ao buscar módulo: ${moduloGetError?.message || 'Módulo não encontrado'}`);
    }

    return {
      id: flashcard.id,
      modulo_id: flashcard.modulo_id,
      pergunta: flashcard.pergunta,
      resposta: flashcard.resposta,
      created_at: flashcard.created_at,
      modulo: {
        id: (modulo as any).id,
        nome: (modulo as any).nome,
        numero_modulo: (modulo as any).numero_modulo,
        frente: {
          id: (modulo as any).frentes.id,
          nome: (modulo as any).frentes.nome,
          disciplina: {
            id: (modulo as any).frentes.disciplinas.id,
            nome: (modulo as any).frentes.disciplinas.nome,
          },
        },
      },
    };
  }

  async create(input: CreateFlashcardInput, userId: string): Promise<FlashcardAdmin> {
    await this.ensureProfessor(userId);

    if (!input.moduloId || !input.pergunta?.trim() || !input.resposta?.trim()) {
      throw new Error('Módulo, pergunta e resposta são obrigatórios.');
    }

    // Verificar se módulo existe
    const { data: moduloCheck, error: moduloCheckError } = await this.client
      .from('modulos')
      .select('id')
      .eq('id', input.moduloId)
      .maybeSingle();

    if (moduloCheckError || !moduloCheck) {
      throw new Error('Módulo não encontrado.');
    }

    const { data: flashcard, error } = await this.client
      .from('flashcards')
      .insert({
        modulo_id: input.moduloId,
        pergunta: input.pergunta.trim(),
        resposta: input.resposta.trim(),
      })
      .select('id, modulo_id, pergunta, resposta, created_at')
      .single();

    if (error) {
      throw new Error(`Erro ao criar flashcard: ${error.message}`);
    }

    // Buscar módulo com relacionamentos
    const { data: modulo, error: moduloFetchError } = await this.client
      .from('modulos')
      .select(
        `
        id,
        nome,
        numero_modulo,
        frentes!inner(
          id,
          nome,
          disciplinas!inner(
            id,
            nome
          )
        )
      `,
      )
      .eq('id', flashcard.modulo_id)
      .maybeSingle();

    if (moduloFetchError || !modulo) {
      throw new Error(`Erro ao buscar módulo: ${moduloFetchError?.message || 'Módulo não encontrado'}`);
    }

    return {
      id: flashcard.id,
      modulo_id: flashcard.modulo_id,
      pergunta: flashcard.pergunta,
      resposta: flashcard.resposta,
      created_at: flashcard.created_at,
      modulo: {
        id: (modulo as any).id,
        nome: (modulo as any).nome,
        numero_modulo: (modulo as any).numero_modulo,
        frente: {
          id: (modulo as any).frentes.id,
          nome: (modulo as any).frentes.nome,
          disciplina: {
            id: (modulo as any).frentes.disciplinas.id,
            nome: (modulo as any).frentes.disciplinas.nome,
          },
        },
      },
    };
  }

  async update(id: string, input: UpdateFlashcardInput, userId: string): Promise<FlashcardAdmin> {
    await this.ensureProfessor(userId);

    // Verificar se flashcard existe
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error('Flashcard não encontrado.');
    }

    const updateData: any = {};
    if (input.moduloId !== undefined) {
      // Verificar se novo módulo existe
      const { data: moduloCheck, error: moduloCheckError } = await this.client
        .from('modulos')
        .select('id')
        .eq('id', input.moduloId)
        .maybeSingle();

      if (moduloCheckError || !moduloCheck) {
        throw new Error('Módulo não encontrado.');
      }
      updateData.modulo_id = input.moduloId;
    }
    if (input.pergunta !== undefined) {
      if (!input.pergunta.trim()) {
        throw new Error('Pergunta não pode estar vazia.');
      }
      updateData.pergunta = input.pergunta.trim();
    }
    if (input.resposta !== undefined) {
      if (!input.resposta.trim()) {
        throw new Error('Resposta não pode estar vazia.');
      }
      updateData.resposta = input.resposta.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return existing;
    }

    const { data: flashcard, error } = await this.client
      .from('flashcards')
      .update(updateData)
      .eq('id', id)
      .select('id, modulo_id, pergunta, resposta, created_at')
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar flashcard: ${error.message}`);
    }

    // Buscar módulo com relacionamentos
    const { data: modulo, error: moduloFetchError } = await this.client
      .from('modulos')
      .select(
        `
        id,
        nome,
        numero_modulo,
        frentes!inner(
          id,
          nome,
          disciplinas!inner(
            id,
            nome
          )
        )
      `,
      )
      .eq('id', flashcard.modulo_id)
      .maybeSingle();

    if (moduloFetchError || !modulo) {
      throw new Error(`Erro ao buscar módulo: ${moduloFetchError?.message || 'Módulo não encontrado'}`);
    }

    return {
      id: flashcard.id,
      modulo_id: flashcard.modulo_id,
      pergunta: flashcard.pergunta,
      resposta: flashcard.resposta,
      created_at: flashcard.created_at,
      modulo: {
        id: (modulo as any).id,
        nome: (modulo as any).nome,
        numero_modulo: (modulo as any).numero_modulo,
        frente: {
          id: (modulo as any).frentes.id,
          nome: (modulo as any).frentes.nome,
          disciplina: {
            id: (modulo as any).frentes.disciplinas.id,
            nome: (modulo as any).frentes.disciplinas.nome,
          },
        },
      },
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.ensureProfessor(userId);

    // Verificar se flashcard existe
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error('Flashcard não encontrado.');
    }

    // Verificar se há progresso associado
    const { data: progresso, error: progressoError } = await this.client
      .from('progresso_flashcards')
      .select('id')
      .eq('flashcard_id', id)
      .limit(1);

    if (progressoError) {
      console.warn('[flashcards] Erro ao verificar progresso:', progressoError);
    }

    if (progresso && progresso.length > 0) {
      // Deletar progresso também (cascade)
      const { error: deleteProgressoError } = await this.client
        .from('progresso_flashcards')
        .delete()
        .eq('flashcard_id', id);

      if (deleteProgressoError) {
        console.warn('[flashcards] Erro ao deletar progresso:', deleteProgressoError);
      }
    }

    const { error } = await this.client.from('flashcards').delete().eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar flashcard: ${error.message}`);
    }
  }
}

export const flashcardsService = new FlashcardsService();
