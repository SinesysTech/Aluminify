import { getDatabaseClient, clearDatabaseClientCache } from '@/backend/clients/database';
import {
  GerarCronogramaInput,
  GerarCronogramaResult,
  AulaCompleta,
  FrenteDistribuicao,
  SemanaInfo,
  ItemDistribuicao,
  CronogramaSemanasDias,
  AtualizarDistribuicaoDiasInput,
  RecalcularDatasResult,
} from './cronograma.types';
import {
  CronogramaValidationError,
  CronogramaTempoInsuficienteError,
  CronogramaConflictError,
} from './errors';

const TEMPO_PADRAO_MINUTOS = 10;
const FATOR_MULTIPLICADOR = 1.5;

export class CronogramaService {
  async gerarCronograma(
    input: GerarCronogramaInput,
    userId: string,
    userEmail?: string,
  ): Promise<GerarCronogramaResult> {
    console.log('[CronogramaService] Iniciando geração de cronograma:', {
      aluno_id: input.aluno_id,
      userId,
      userEmail,
      data_inicio: input.data_inicio,
      data_fim: input.data_fim,
      disciplinas_count: input.disciplinas_ids?.length || 0,
    });

    // Validações básicas
    if (!input.aluno_id || !input.data_inicio || !input.data_fim) {
      throw new CronogramaValidationError('Campos obrigatórios: aluno_id, data_inicio, data_fim');
    }

    // Verificar se aluno_id corresponde ao usuário autenticado
    if (input.aluno_id !== userId) {
      throw new CronogramaValidationError('Você só pode criar cronogramas para si mesmo');
    }

    // Validar datas
    const dataInicio = new Date(input.data_inicio);
    const dataFim = new Date(input.data_fim);

    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      throw new CronogramaValidationError('Datas inválidas');
    }

    if (dataFim <= dataInicio) {
      throw new CronogramaValidationError('data_fim deve ser posterior a data_inicio');
    }

    const client = getDatabaseClient();

    // Verificar se o aluno existe, se não existir, criar
    await this.ensureAlunoExists(client, userId, userEmail);

    // Deletar cronograma anterior do aluno (se existir)
    await this.deletarCronogramaAnterior(client, userId);

    const excluirConcluidas = input.excluir_aulas_concluidas !== false;
    const aulasConcluidas = excluirConcluidas
      ? await this.buscarAulasConcluidas(client, input.aluno_id, input.curso_alvo_id)
      : new Set<string>();

    // ============================================
    // ETAPA 1: Cálculo de Capacidade
    // ============================================

    const semanas = this.calcularSemanas(dataInicio, dataFim, input.ferias, input.horas_dia, input.dias_semana);
    const capacidadeTotal = semanas
      .filter((s) => !s.is_ferias)
      .reduce((acc, s) => acc + s.capacidade_minutos, 0);

    // ============================================
    // ETAPA 2: Busca e Filtragem de Aulas
    // ============================================

    const aulasBase = await this.buscarAulas(
      client,
      input.disciplinas_ids,
      input.prioridade_minima,
      input.curso_alvo_id,
      input.modulos_ids,
    );

    const aulas = excluirConcluidas
      ? aulasBase.filter((aula) => !aulasConcluidas.has(aula.id))
      : aulasBase;

    if (!aulas.length) {
      throw new CronogramaValidationError(
        'Nenhuma aula disponível após aplicar os filtros selecionados.',
      );
    }

    // ============================================
    // ETAPA 3: Cálculo de Custo Real
    // ============================================

    // Velocidade de reprodução padrão: 1.00x
    const velocidadeReproducao = input.velocidade_reproducao ?? 1.0;
    
    // Tempo de aula ajustado pela velocidade: se assistir em 1.5x, o tempo real é reduzido
    // Tempo de estudo (anotações/exercícios) é calculado sobre o tempo de aula ajustado
    const aulasComCusto = aulas.map((aula) => {
      const tempoOriginal = aula.tempo_estimado_minutos ?? TEMPO_PADRAO_MINUTOS;
      const tempoAulaAjustado = tempoOriginal / velocidadeReproducao;
      // Custo = tempo de aula (ajustado) + tempo de estudo (calculado sobre o tempo ajustado)
      const custo = tempoAulaAjustado * FATOR_MULTIPLICADOR;
      return {
        ...aula,
        custo,
      };
    });

    const custoTotalNecessario = aulasComCusto.reduce((acc, aula) => acc + aula.custo, 0);

    // ============================================
    // ETAPA 4: Verificação de Viabilidade
    // ============================================

    if (custoTotalNecessario > capacidadeTotal) {
      const horasNecessarias = custoTotalNecessario / 60;
      const horasDisponiveis = capacidadeTotal / 60;
      const semanasUteis = semanas.filter((s) => !s.is_ferias).length;
      const horasDiaNecessarias = horasNecessarias / (semanasUteis * input.dias_semana);

      throw new CronogramaTempoInsuficienteError('Tempo insuficiente', {
        horas_necessarias: Math.ceil(horasNecessarias),
        horas_disponiveis: Math.ceil(horasDisponiveis),
        horas_dia_necessarias: Math.ceil(horasDiaNecessarias * 10) / 10,
        horas_dia_atual: input.horas_dia,
      });
    }

    // ============================================
    // ETAPA 5: Algoritmo de Distribuição
    // ============================================

    const itens = this.distribuirAulas(
      aulasComCusto,
      semanas,
      input.modalidade,
      input.ordem_frentes_preferencia,
    );

    if (itens.length === 0) {
      console.error('[CronogramaService] Nenhum item foi criado na distribuição!', {
        totalAulas: aulasComCusto.length,
        totalSemanas: semanas.length,
        semanasUteis: semanas.filter((s) => !s.is_ferias).length,
        modalidade: input.modalidade,
      });
      throw new CronogramaValidationError(
        'Nenhuma aula foi distribuída. Verifique se há semanas úteis disponíveis e se as aulas selecionadas são compatíveis com o período.',
      );
    }

    console.log('[CronogramaService] Distribuição concluída:', {
      totalItens: itens.length,
      semanasComItens: new Set(itens.map((i) => i.semana_numero)).size,
    });

    // ============================================
    // ETAPA 6: Persistência
    // ============================================

    const cronograma = await this.persistirCronograma(client, input, itens);

    const semanasUteis = semanas.filter((s) => !s.is_ferias);

    return {
      success: true,
      cronograma,
      estatisticas: {
        total_aulas: aulas.length,
        total_semanas: semanas.length,
        semanas_uteis: semanasUteis.length,
        capacidade_total_minutos: capacidadeTotal,
        custo_total_minutos: custoTotalNecessario,
        frentes_distribuidas: new Set(aulas.map((a) => a.frente_id)).size,
      },
    };
  }

  private async deletarCronogramaAnterior(
    client: ReturnType<typeof getDatabaseClient>,
    userId: string,
  ): Promise<void> {
    console.log('[CronogramaService] Verificando e deletando cronograma anterior...');
    
    // Buscar cronograma existente do aluno
    const { data: cronogramaExistente, error: selectError } = await client
      .from('cronogramas')
      .select('id')
      .eq('aluno_id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('[CronogramaService] Erro ao verificar cronograma existente:', selectError);
      // Não lançar erro, apenas logar - pode não existir cronograma anterior
      return;
    }

    if (cronogramaExistente) {
      console.log('[CronogramaService] Deletando cronograma anterior:', cronogramaExistente.id);
      
      // Deletar cronograma (cascade vai deletar os itens automaticamente devido ao ON DELETE CASCADE)
      const { error: deleteError } = await client
        .from('cronogramas')
        .delete()
        .eq('id', cronogramaExistente.id);

      if (deleteError) {
        console.error('[CronogramaService] Erro ao deletar cronograma anterior:', deleteError);
        throw new Error(`Erro ao deletar cronograma anterior: ${deleteError.message}`);
      }

      console.log('[CronogramaService] Cronograma anterior deletado com sucesso');
    } else {
      console.log('[CronogramaService] Nenhum cronograma anterior encontrado');
    }
  }

  private async ensureAlunoExists(
    client: ReturnType<typeof getDatabaseClient>,
    userId: string,
    userEmail?: string,
  ): Promise<void> {
    // Verificar se o aluno já existe
    const { data: alunoExistente, error: selectError } = await client
      .from('alunos')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('[CronogramaService] Erro ao verificar aluno:', selectError);
      throw new Error(`Erro ao verificar aluno: ${selectError.message}`);
    }

    // Se o aluno não existe, criar um registro básico
    if (!alunoExistente) {
      console.log('[CronogramaService] Aluno não encontrado, criando registro...');
      
      if (!userEmail) {
        throw new CronogramaValidationError('Email do usuário é necessário para criar o registro de aluno');
      }

      const { error: insertError } = await client
        .from('alunos')
        .insert({
          id: userId,
          email: userEmail,
        });

      if (insertError) {
        console.error('[CronogramaService] Erro ao criar aluno:', insertError);
        throw new Error(`Erro ao criar registro de aluno: ${insertError.message}`);
      }

      console.log('[CronogramaService] Registro de aluno criado com sucesso');
    }
  }

  private calcularSemanas(
    dataInicio: Date,
    dataFim: Date,
    ferias: Array<{ inicio: string; fim: string }>,
    horasDia: number,
    diasSemana: number,
  ): SemanaInfo[] {
    const semanas: SemanaInfo[] = [];
    const inicio = new Date(dataInicio);
    let semanaNumero = 1;

    while (inicio <= dataFim) {
      const fimSemana = new Date(inicio);
      fimSemana.setDate(fimSemana.getDate() + 6); // 7 dias (0-6)

      // Verificar se a semana cai em período de férias
      let isFerias = false;
      for (const periodo of ferias || []) {
        const inicioFerias = new Date(periodo.inicio);
        const fimFerias = new Date(periodo.fim);
        if (
          (inicio >= inicioFerias && inicio <= fimFerias) ||
          (fimSemana >= inicioFerias && fimSemana <= fimFerias) ||
          (inicio <= inicioFerias && fimSemana >= fimFerias)
        ) {
          isFerias = true;
          break;
        }
      }

      semanas.push({
        numero: semanaNumero,
        data_inicio: new Date(inicio),
        data_fim: fimSemana > dataFim ? new Date(dataFim) : fimSemana,
        is_ferias: isFerias,
        capacidade_minutos: isFerias ? 0 : horasDia * diasSemana * 60,
      });

      inicio.setDate(inicio.getDate() + 7);
      semanaNumero++;
    }

    return semanas;
  }

  private async buscarAulas(
    client: ReturnType<typeof getDatabaseClient>,
    disciplinasIds: string[],
    prioridadeMinima: number,
    cursoId?: string,
    modulosSelecionados?: string[],
  ): Promise<AulaCompleta[]> {
    const prioridadeMinimaEfetiva = Math.max(1, prioridadeMinima ?? 1);
    console.log('[CronogramaService] Buscando aulas para disciplinas:', disciplinasIds);
    
    // Buscar frentes das disciplinas selecionadas
    let frentesQuery = client
      .from('frentes')
      .select('id')
      .in('disciplina_id', disciplinasIds);

    if (cursoId) {
      frentesQuery = frentesQuery.eq('curso_id', cursoId);
    }

    const { data: frentesData, error: frentesError } = await frentesQuery;

    if (frentesError) {
      console.error('[CronogramaService] Erro ao buscar frentes:', frentesError);
      throw new CronogramaValidationError(`Erro ao buscar frentes: ${frentesError.message}`);
    }

    const frenteIds = frentesData?.map((f) => f.id) || [];

    if (frenteIds.length === 0) {
      throw new CronogramaValidationError('Nenhuma frente encontrada para as disciplinas selecionadas');
    }

    // Buscar módulos das frentes
    let modulosQuery = client
      .from('modulos')
      .select('id')
      .in('frente_id', frenteIds);

    if (cursoId) {
      modulosQuery = modulosQuery.eq('curso_id', cursoId);
    }

    const { data: modulosData, error: modulosError } = await modulosQuery;

    if (modulosError) {
      console.error('[CronogramaService] Erro ao buscar módulos:', modulosError);
      throw new CronogramaValidationError(`Erro ao buscar módulos: ${modulosError.message}`);
    }

    let moduloIds = modulosData?.map((m) => m.id) || [];

    if (modulosSelecionados && modulosSelecionados.length > 0) {
      moduloIds = moduloIds.filter((id) => modulosSelecionados.includes(id));
      if (moduloIds.length === 0) {
        throw new CronogramaValidationError(
          'Nenhum módulo válido encontrado para o curso selecionado.',
        );
      }
    }

    if (moduloIds.length === 0) {
      throw new CronogramaValidationError('Nenhum módulo encontrado para as frentes selecionadas');
    }

    // Buscar aulas dos módulos com filtro de prioridade
    // Não usamos curso_id direto de aulas para evitar problemas de cache/sincronização
    // Filtramos via join com frentes após buscar
    let aulasQuery = client
      .from('aulas')
      .select(
        `
        id,
        nome,
        numero_aula,
        tempo_estimado_minutos,
        prioridade,
        modulos!inner(
          id,
          nome,
          numero_modulo,
          frentes!inner(
            id,
            nome,
            curso_id,
            disciplinas!inner(
              id,
              nome
            )
          )
        )
      `,
      )
      .in('modulo_id', moduloIds)
      .gte('prioridade', prioridadeMinimaEfetiva)
      .neq('prioridade', 0);

    const { data: aulasDataRaw, error: aulasError } = await aulasQuery;

    if (aulasError) {
      console.error('[CronogramaService] Erro ao buscar aulas:', {
        message: aulasError.message,
        details: aulasError.details,
        hint: aulasError.hint,
        code: aulasError.code,
      });
      
      // Se o erro for sobre curso_id não existir, tentar buscar sem selecionar curso_id
      if (aulasError.message?.includes('curso_id')) {
        console.warn('[CronogramaService] Tentando buscar aulas sem filtro de curso_id...');
        const { data: aulasDataSemFiltro, error: errorSemFiltro } = await client
          .from('aulas')
          .select(
            `
            id,
            nome,
            numero_aula,
            tempo_estimado_minutos,
            prioridade,
            modulos!inner(
              id,
              nome,
              numero_modulo,
              frentes!inner(
                id,
                nome,
                curso_id,
                disciplinas!inner(
                  id,
                  nome
                )
              )
            )
          `,
          )
          .in('modulo_id', moduloIds)
          .gte('prioridade', prioridadeMinimaEfetiva)
          .neq('prioridade', 0);
        
        if (errorSemFiltro) {
          throw new CronogramaValidationError(`Erro ao buscar aulas: ${errorSemFiltro.message}`);
        }
        
        // Filtrar por curso_id em memória baseado na frente
        if (aulasDataSemFiltro) {
          const aulasFiltradas = aulasDataSemFiltro.filter((aula: any) => {
            const frenteCursoId = aula.modulos?.frentes?.curso_id;
            return frenteCursoId === cursoId;
          });
          
          if (aulasFiltradas.length === 0) {
            throw new CronogramaValidationError('Nenhuma aula encontrada com os critérios fornecidos');
          }
          
          // Continuar com aulasFiltradas
          const aulas: AulaCompleta[] = aulasFiltradas.map((aula: any) => ({
            id: aula.id,
            nome: aula.nome,
            numero_aula: aula.numero_aula,
            tempo_estimado_minutos: aula.tempo_estimado_minutos ?? TEMPO_PADRAO_MINUTOS,
            prioridade: aula.prioridade ?? 1,
            modulo_id: aula.modulos.id,
            modulo_nome: aula.modulos.nome,
            numero_modulo: aula.modulos.numero_modulo,
            frente_id: aula.modulos.frentes.id,
            frente_nome: aula.modulos.frentes.nome,
            disciplina_id: aula.modulos.frentes.disciplinas.id,
            disciplina_nome: aula.modulos.frentes.disciplinas.nome,
          }));
          
          return aulas;
        }
      }
      
      console.error('[CronogramaService] Erro ao buscar aulas:', {
        message: aulasError.message,
        details: aulasError.details,
        hint: aulasError.hint,
        code: aulasError.code,
      });
      throw new CronogramaValidationError(`Erro ao buscar aulas: ${aulasError.message}`);
    }

    if (!aulasDataRaw || aulasDataRaw.length === 0) {
      throw new CronogramaValidationError('Nenhuma aula encontrada com os critérios fornecidos');
    }

    // Filtrar por curso_id usando o join com frentes (se fornecido)
    let aulasData = aulasDataRaw;
    if (cursoId) {
      aulasData = aulasDataRaw.filter((aula: any) => {
        const frenteCursoId = aula.modulos?.frentes?.curso_id;
        return frenteCursoId === cursoId;
      });
      
      if (aulasData.length === 0) {
        throw new CronogramaValidationError('Nenhuma aula encontrada para o curso selecionado');
      }
    }

    // Mapear dados para estrutura mais simples
    const aulas: AulaCompleta[] = aulasData.map((aula: any) => ({
      id: aula.id,
      nome: aula.nome,
      numero_aula: aula.numero_aula,
      tempo_estimado_minutos: aula.tempo_estimado_minutos,
      prioridade: aula.prioridade ?? 0,
      modulo_id: aula.modulos.id,
      modulo_nome: aula.modulos.nome,
      numero_modulo: aula.modulos.numero_modulo,
      frente_id: aula.modulos.frentes.id,
      frente_nome: aula.modulos.frentes.nome,
      disciplina_id: aula.modulos.frentes.disciplinas.id,
      disciplina_nome: aula.modulos.frentes.disciplinas.nome,
    }));

    // Ordenar aulas: Disciplina > Frente > Numero Modulo > Numero Aula
    aulas.sort((a, b) => {
      // Ordenar por disciplina
      if (a.disciplina_nome !== b.disciplina_nome) {
        return a.disciplina_nome.localeCompare(b.disciplina_nome);
      }
      // Ordenar por frente
      if (a.frente_nome !== b.frente_nome) {
        return a.frente_nome.localeCompare(b.frente_nome);
      }
      // Ordenar por número do módulo
      const numModA = a.numero_modulo ?? 0;
      const numModB = b.numero_modulo ?? 0;
      if (numModA !== numModB) {
        return numModA - numModB;
      }
      // Ordenar por número da aula
      const numAulaA = a.numero_aula ?? 0;
      const numAulaB = b.numero_aula ?? 0;
      return numAulaA - numAulaB;
    });

    return aulas;
  }

  private distribuirAulas(
    aulasComCusto: Array<AulaCompleta & { custo: number }>,
    semanas: SemanaInfo[],
    modalidade: 'paralelo' | 'sequencial',
    ordemFrentesPreferencia?: string[],
  ): ItemDistribuicao[] {
    // Agrupar aulas por frente
    type FrenteComCusto = Omit<FrenteDistribuicao, 'aulas'> & {
      aulas: Array<AulaCompleta & { custo: number }>;
    };
    const frentesMap = new Map<string, FrenteComCusto>();

    for (const aula of aulasComCusto) {
      if (!frentesMap.has(aula.frente_id)) {
        frentesMap.set(aula.frente_id, {
          frente_id: aula.frente_id,
          frente_nome: aula.frente_nome,
          aulas: [],
          custo_total: 0,
          peso: 0,
        });
      }

      const frente = frentesMap.get(aula.frente_id)!;
      frente.aulas.push(aula);
      frente.custo_total += aula.custo;
    }

    const frentes: FrenteComCusto[] = Array.from(frentesMap.values());
    const custoTotalNecessario = aulasComCusto.reduce((acc, aula) => acc + aula.custo, 0);

    // Calcular pesos (modo paralelo)
    if (modalidade === 'paralelo') {
      frentes.forEach((frente) => {
        frente.peso = frente.custo_total / custoTotalNecessario;
      });
    }

    // Ordenar frentes (modo sequencial)
    if (modalidade === 'sequencial' && ordemFrentesPreferencia) {
      const ordemMap = new Map(ordemFrentesPreferencia.map((nome, idx) => [nome, idx]));
      frentes.sort((a, b) => {
        const ordemA = ordemMap.get(a.frente_nome) ?? Infinity;
        const ordemB = ordemMap.get(b.frente_nome) ?? Infinity;
        return ordemA - ordemB;
      });
    }

    // Distribuir aulas por semana
    const itens: ItemDistribuicao[] = [];
    const semanasUteis = semanas.filter((s) => !s.is_ferias);
    
    console.log('[CronogramaService] Distribuindo aulas:', {
      totalAulas: aulasComCusto.length,
      totalSemanas: semanas.length,
      semanasUteis: semanasUteis.length,
      semanasFerias: semanas.filter((s) => s.is_ferias).length,
      totalFrentes: frentes.length,
      modalidade,
    });
    
    let frenteIndex = 0;
    let aulaIndexPorFrente = new Map<string, number>();

    // Inicializar índices de aula por frente
    frentes.forEach((frente) => {
      aulaIndexPorFrente.set(frente.frente_id, 0);
    });

    if (modalidade === 'paralelo') {
      // Modo Paralelo: Distribuir proporcionalmente
      for (const semana of semanasUteis) {
        const capacidadeSemanal = semana.capacidade_minutos;
        let tempoUsado = 0;
        let ordemNaSemana = 1;

        // Distribuir cada frente proporcionalmente
        for (const frente of frentes) {
          const cotaFrente = capacidadeSemanal * frente.peso;
          let tempoFrenteUsado = 0;
          let aulaIndex = aulaIndexPorFrente.get(frente.frente_id) ?? 0;

          while (
            aulaIndex < frente.aulas.length &&
            tempoFrenteUsado + frente.aulas[aulaIndex].custo <= cotaFrente &&
            tempoUsado + frente.aulas[aulaIndex].custo <= capacidadeSemanal
          ) {
            itens.push({
              cronograma_id: '', // Será preenchido após criar cronograma
              aula_id: frente.aulas[aulaIndex].id,
              semana_numero: semana.numero,
              ordem_na_semana: ordemNaSemana++,
            });

            tempoFrenteUsado += frente.aulas[aulaIndex].custo;
            tempoUsado += frente.aulas[aulaIndex].custo;
            aulaIndex++;
          }

          aulaIndexPorFrente.set(frente.frente_id, aulaIndex);
        }

        // Fallback: Se sobrou tempo, preencher com aulas restantes
        for (const frente of frentes) {
          let aulaIndex = aulaIndexPorFrente.get(frente.frente_id) ?? 0;
          while (
            aulaIndex < frente.aulas.length &&
            tempoUsado + frente.aulas[aulaIndex].custo <= capacidadeSemanal
          ) {
            itens.push({
              cronograma_id: '',
              aula_id: frente.aulas[aulaIndex].id,
              semana_numero: semana.numero,
              ordem_na_semana: ordemNaSemana++,
            });

            tempoUsado += frente.aulas[aulaIndex].custo;
            aulaIndex++;
          }
          aulaIndexPorFrente.set(frente.frente_id, aulaIndex);
        }

        // Garantir que pelo menos uma aula seja adicionada se houver aulas disponíveis e capacidade
        if (ordemNaSemana === 1 && capacidadeSemanal > 0) {
          // Nenhuma aula foi adicionada nesta semana, mas há capacidade
          // Tentar adicionar pelo menos uma aula de qualquer frente
          for (const frente of frentes) {
            let aulaIndex = aulaIndexPorFrente.get(frente.frente_id) ?? 0;
            if (aulaIndex < frente.aulas.length && tempoUsado + frente.aulas[aulaIndex].custo <= capacidadeSemanal) {
              itens.push({
                cronograma_id: '',
                aula_id: frente.aulas[aulaIndex].id,
                semana_numero: semana.numero,
                ordem_na_semana: ordemNaSemana++,
              });
              tempoUsado += frente.aulas[aulaIndex].custo;
              aulaIndexPorFrente.set(frente.frente_id, aulaIndex + 1);
              break; // Adicionar apenas uma aula para garantir progresso
            }
          }
        }
      }
    } else {
      // Modo Sequencial: Completar uma frente antes de iniciar próxima
      for (const semana of semanasUteis) {
        const capacidadeSemanal = semana.capacidade_minutos;
        let tempoUsado = 0;
        let ordemNaSemana = 1;

        while (frenteIndex < frentes.length && tempoUsado < capacidadeSemanal) {
          const frente = frentes[frenteIndex];
          let aulaIndex = aulaIndexPorFrente.get(frente.frente_id) ?? 0;

          if (aulaIndex >= frente.aulas.length) {
            frenteIndex++;
            continue;
          }

          if (tempoUsado + frente.aulas[aulaIndex].custo <= capacidadeSemanal) {
            itens.push({
              cronograma_id: '',
              aula_id: frente.aulas[aulaIndex].id,
              semana_numero: semana.numero,
              ordem_na_semana: ordemNaSemana++,
            });

            tempoUsado += frente.aulas[aulaIndex].custo;
            aulaIndex++;
            aulaIndexPorFrente.set(frente.frente_id, aulaIndex);
          } else {
            break;
          }
        }
      }
    }

    console.log('[CronogramaService] Distribuição concluída:', {
      totalItens: itens.length,
      itensPorSemana: itens.reduce((acc, item) => {
        acc[item.semana_numero] = (acc[item.semana_numero] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    });

    return itens;
  }

  private async buscarAulasConcluidas(
    client: ReturnType<typeof getDatabaseClient>,
    alunoId: string,
    cursoId?: string,
  ): Promise<Set<string>> {
    if (!cursoId) {
      return new Set();
    }

    const { data, error } = await client
      .from('aulas_concluidas')
      .select('aula_id')
      .eq('aluno_id', alunoId)
      .eq('curso_id', cursoId);

    if (error) {
      console.error('[CronogramaService] Erro ao buscar aulas concluídas:', error);
    } else if (data && data.length > 0) {
      return new Set(data.map((row) => row.aula_id as string));
    }

    const { data: historicoData, error: historicoError } = await client
      .from('cronograma_itens')
      .select('aula_id, cronogramas!inner(aluno_id, curso_alvo_id)')
      .eq('concluido', true)
      .eq('cronogramas.aluno_id', alunoId)
      .eq('cronogramas.curso_alvo_id', cursoId);

    if (historicoError) {
      console.error('[CronogramaService] Erro ao buscar histórico de aulas concluídas:', historicoError);
      return new Set();
    }

    return new Set((historicoData ?? []).map((row) => row.aula_id as string));
  }

  private async persistirCronograma(
    client: ReturnType<typeof getDatabaseClient>,
    input: GerarCronogramaInput,
    itens: ItemDistribuicao[],
  ): Promise<any> {
    let cronograma: any = null;

    // Criar registro do cronograma
    const { data: cronogramaData, error: cronogramaError } = await client
      .from('cronogramas')
      .insert({
        aluno_id: input.aluno_id,
        curso_alvo_id: input.curso_alvo_id || null,
        nome: input.nome || 'Meu Cronograma',
        data_inicio: input.data_inicio,
        data_fim: input.data_fim,
        dias_estudo_semana: input.dias_semana,
        horas_estudo_dia: input.horas_dia,
        periodos_ferias: input.ferias || [],
        prioridade_minima: input.prioridade_minima,
        modalidade_estudo: input.modalidade,
        disciplinas_selecionadas: input.disciplinas_ids,
        ordem_frentes_preferencia: input.ordem_frentes_preferencia || null,
        modulos_selecionados: input.modulos_ids?.length ? input.modulos_ids : null,
        excluir_aulas_concluidas: input.excluir_aulas_concluidas !== false,
        velocidade_reproducao: input.velocidade_reproducao ?? 1.0,
      })
      .select()
      .single();

    if (cronogramaError || !cronogramaData) {
      console.error('[CronogramaService] Erro ao criar cronograma:', {
        message: cronogramaError?.message,
        details: cronogramaError?.details,
        hint: cronogramaError?.hint,
        code: cronogramaError?.code,
      });
      
      // Se for erro 409 (Conflict), lançar erro específico
      if (cronogramaError?.code === '23505' || cronogramaError?.code === 'PGRST116') {
        throw new CronogramaConflictError(
          `Erro ao criar cronograma: ${cronogramaError.message || 'Conflito ao criar cronograma'}`,
        );
      }
      
      // Se o erro mencionar schema cache, limpar cache e tentar novamente
      if (cronogramaError?.message?.includes('schema cache') || cronogramaError?.message?.includes('Could not find')) {
        console.warn('[CronogramaService] Problema com schema cache detectado, limpando cache...');
        clearDatabaseClientCache();
        
        // Tentar inserir sem as colunas que podem estar causando problema
        console.warn('[CronogramaService] Tentando criar cronograma sem as colunas novas...');
        const { data: cronogramaFallback, error: fallbackError } = await client
          .from('cronogramas')
          .insert({
            aluno_id: input.aluno_id,
            curso_alvo_id: input.curso_alvo_id || null,
            nome: input.nome || 'Meu Cronograma',
            data_inicio: input.data_inicio,
            data_fim: input.data_fim,
            dias_estudo_semana: input.dias_semana,
            horas_estudo_dia: input.horas_dia,
            periodos_ferias: input.ferias || [],
            prioridade_minima: input.prioridade_minima,
            modalidade_estudo: input.modalidade,
            disciplinas_selecionadas: input.disciplinas_ids,
            ordem_frentes_preferencia: input.ordem_frentes_preferencia || null,
          })
          .select()
          .single();
          
        if (fallbackError || !cronogramaFallback) {
          throw new Error(`Erro ao criar cronograma: ${fallbackError?.message || cronogramaError?.message || 'Desconhecido'}`);
        }
        
        cronograma = cronogramaFallback;
        
        // Tentar atualizar com as colunas novas separadamente (se existirem)
        try {
          const updateData: any = {};
          if (input.modulos_ids?.length) {
            updateData.modulos_selecionados = input.modulos_ids;
          }
          if (input.excluir_aulas_concluidas !== undefined) {
            updateData.excluir_aulas_concluidas = input.excluir_aulas_concluidas;
          }
          
          if (Object.keys(updateData).length > 0) {
            const { data: cronogramaUpdated, error: updateError } = await client
              .from('cronogramas')
              .update(updateData)
              .eq('id', cronograma.id)
              .select()
              .single();
              
            if (!updateError && cronogramaUpdated) {
              cronograma = cronogramaUpdated;
            } else {
              console.warn('[CronogramaService] Não foi possível atualizar alguns campos novos, mas cronograma foi criado');
            }
          }
        } catch (updateErr) {
          console.warn('[CronogramaService] Erro ao atualizar campos novos (ignorado):', updateErr);
        }
      } else {
        throw new Error(`Erro ao criar cronograma: ${cronogramaError?.message || 'Desconhecido'}`);
      }
    } else {
      cronograma = cronogramaData;
    }

    // IMPORTANTE: Sempre salvar os itens, independente de como o cronograma foi criado
    // Preencher cronograma_id nos itens
    const itensCompleto = itens.map((item) => ({
      ...item,
      cronograma_id: cronograma.id,
    }));

    console.log('[CronogramaService] Inserindo itens do cronograma:', {
      totalItens: itensCompleto.length,
      cronogramaId: cronograma.id,
      primeirosItens: itensCompleto.slice(0, 3).map(i => ({
        aula_id: i.aula_id,
        semana_numero: i.semana_numero,
        ordem_na_semana: i.ordem_na_semana,
      })),
    });

    // Bulk insert dos itens
    const { data: itensInseridos, error: itensError } = await client
      .from('cronograma_itens')
      .insert(itensCompleto)
      .select('id, aula_id, semana_numero, ordem_na_semana');

    if (itensError) {
      console.error('[CronogramaService] Erro ao inserir itens:', {
        message: itensError.message,
        details: itensError.details,
        hint: itensError.hint,
        code: itensError.code,
        totalItens: itensCompleto.length,
      });
      // Tentar deletar o cronograma criado
      await client.from('cronogramas').delete().eq('id', cronograma.id);
      throw new Error(`Erro ao inserir itens do cronograma: ${itensError.message}`);
    }

    console.log('[CronogramaService] Itens inseridos com sucesso:', {
      totalInseridos: itensInseridos?.length || 0,
      esperado: itensCompleto.length,
    });

    // Criar distribuição padrão de dias
    await this.criarDistribuicaoPadrao(client, cronograma.id, input.dias_semana);

    // Recalcular datas dos itens baseado na distribuição padrão
    try {
      await this.recalcularDatasItens(cronograma.id, input.aluno_id);
    } catch (recalcError) {
      console.error('[CronogramaService] Erro ao recalcular datas (não crítico):', recalcError);
      // Não falhar a criação do cronograma se o recálculo falhar
    }

    // Buscar cronograma completo com itens
    const { data: cronogramaCompleto, error: fetchError } = await client
      .from('cronogramas')
      .select(
        `
        *,
        cronograma_itens(
          id,
          aula_id,
          semana_numero,
          ordem_na_semana,
          concluido,
          aulas(
            id,
            nome,
            numero_aula,
            tempo_estimado_minutos
          )
        )
      `,
      )
      .eq('id', cronograma.id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar cronograma completo:', fetchError);
      return cronograma;
    }

    return cronogramaCompleto || cronograma;
  }

  /**
   * Busca a distribuição de dias da semana para um cronograma
   */
  async buscarDistribuicaoDias(
    cronogramaId: string,
    userId: string,
  ): Promise<CronogramaSemanasDias | null> {
    const client = getDatabaseClient();

    // Verificar se o cronograma pertence ao usuário
    const { data: cronograma, error: cronogramaError } = await client
      .from('cronogramas')
      .select('id, aluno_id')
      .eq('id', cronogramaId)
      .single();

    if (cronogramaError || !cronograma) {
      throw new CronogramaValidationError('Cronograma não encontrado');
    }

    if (cronograma.aluno_id !== userId) {
      throw new CronogramaValidationError('Você só pode acessar seus próprios cronogramas');
    }

    // Buscar distribuição
    const { data, error } = await client
      .from('cronograma_semanas_dias')
      .select('*')
      .eq('cronograma_id', cronogramaId)
      .maybeSingle();

    if (error) {
      console.error('[CronogramaService] Erro ao buscar distribuição de dias:', error);
      throw new Error(`Erro ao buscar distribuição de dias: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      cronograma_id: data.cronograma_id,
      dias_semana: data.dias_semana || [],
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }

  /**
   * Salva ou atualiza a distribuição de dias da semana para um cronograma
   */
  async atualizarDistribuicaoDias(
    input: AtualizarDistribuicaoDiasInput,
    userId: string,
  ): Promise<CronogramaSemanasDias> {
    const client = getDatabaseClient();

    // Validar dias da semana (0-6)
    const diasValidos = input.dias_semana.every((dia) => dia >= 0 && dia <= 6);
    if (!diasValidos || input.dias_semana.length === 0) {
      throw new CronogramaValidationError(
        'dias_semana deve ser um array de números entre 0 (domingo) e 6 (sábado)',
      );
    }

    // Verificar se o cronograma pertence ao usuário
    const { data: cronograma, error: cronogramaError } = await client
      .from('cronogramas')
      .select('id, aluno_id, data_inicio')
      .eq('id', input.cronograma_id)
      .single();

    if (cronogramaError || !cronograma) {
      throw new CronogramaValidationError('Cronograma não encontrado');
    }

    if (cronograma.aluno_id !== userId) {
      throw new CronogramaValidationError('Você só pode atualizar seus próprios cronogramas');
    }

    // Verificar se já existe distribuição
    const { data: existente } = await client
      .from('cronograma_semanas_dias')
      .select('id')
      .eq('cronograma_id', input.cronograma_id)
      .maybeSingle();

    let resultado;
    if (existente) {
      // Atualizar
      const { data, error } = await client
        .from('cronograma_semanas_dias')
        .update({
          dias_semana: input.dias_semana,
        })
        .eq('id', existente.id)
        .select()
        .single();

      if (error) {
        console.error('[CronogramaService] Erro ao atualizar distribuição de dias:', error);
        throw new Error(`Erro ao atualizar distribuição de dias: ${error.message}`);
      }

      resultado = data;
    } else {
      // Criar
      const { data, error } = await client
        .from('cronograma_semanas_dias')
        .insert({
          cronograma_id: input.cronograma_id,
          dias_semana: input.dias_semana,
        })
        .select()
        .single();

      if (error) {
        console.error('[CronogramaService] Erro ao criar distribuição de dias:', error);
        throw new Error(`Erro ao criar distribuição de dias: ${error.message}`);
      }

      resultado = data;
    }

    // Recalcular datas dos itens
    await this.recalcularDatasItens(input.cronograma_id, userId);

    return {
      id: resultado.id,
      cronograma_id: resultado.cronograma_id,
      dias_semana: resultado.dias_semana || [],
      created_at: new Date(resultado.created_at),
      updated_at: new Date(resultado.updated_at),
    };
  }

  /**
   * Recalcula as datas previstas de todos os itens do cronograma
   * baseado na distribuição de dias da semana
   */
  async recalcularDatasItens(cronogramaId: string, userId: string): Promise<RecalcularDatasResult> {
    const client = getDatabaseClient();

    // Verificar se o cronograma pertence ao usuário
    const { data: cronograma, error: cronogramaError } = await client
      .from('cronogramas')
      .select('id, aluno_id, data_inicio')
      .eq('id', cronogramaId)
      .single();

    if (cronogramaError || !cronograma) {
      throw new CronogramaValidationError('Cronograma não encontrado');
    }

    if (cronograma.aluno_id !== userId) {
      throw new CronogramaValidationError('Você só pode recalcular datas dos seus próprios cronogramas');
    }

    // Buscar distribuição de dias
    const { data: distribuicao, error: distError } = await client
      .from('cronograma_semanas_dias')
      .select('dias_semana')
      .eq('cronograma_id', cronogramaId)
      .maybeSingle();

    if (distError) {
      console.error('[CronogramaService] Erro ao buscar distribuição de dias:', distError);
      throw new Error(`Erro ao buscar distribuição de dias: ${distError.message}`);
    }

    // Se não houver distribuição, usar padrão (segunda a sexta)
    const diasSemana = distribuicao?.dias_semana || [1, 2, 3, 4, 5];
    
    console.log(`[CronogramaService] Distribuição de dias encontrada:`, {
      cronogramaId,
      distribuicaoExiste: !!distribuicao,
      diasSemana,
      diasSemanaTipo: typeof diasSemana,
      diasSemanaIsArray: Array.isArray(diasSemana),
    });

    // Buscar todos os itens do cronograma
    const { data: itens, error: itensError } = await client
      .from('cronograma_itens')
      .select('id, semana_numero, ordem_na_semana')
      .eq('cronograma_id', cronogramaId)
      .order('semana_numero', { ascending: true })
      .order('ordem_na_semana', { ascending: true });

    if (itensError) {
      console.error('[CronogramaService] Erro ao buscar itens:', itensError);
      throw new Error(`Erro ao buscar itens: ${itensError.message}`);
    }

    if (!itens || itens.length === 0) {
      return { success: true, itens_atualizados: 0 };
    }

    // Calcular datas
    const dataInicio = new Date(cronograma.data_inicio);
    const atualizacoes: Array<{ id: string; data_prevista: string }> = [];

    // Ordenar dias da semana (0=domingo, 1=segunda, ..., 6=sábado)
    const diasOrdenados = [...diasSemana].sort((a, b) => a - b);
    const numDiasSelecionados = diasOrdenados.length;

    // Ordenar todos os itens por semana e ordem para garantir distribuição sequencial
    const itensOrdenados = [...itens].sort((a, b) => {
      if (a.semana_numero !== b.semana_numero) {
        return a.semana_numero - b.semana_numero;
      }
      return a.ordem_na_semana - b.ordem_na_semana;
    });

    // Contador para debug: distribuição de itens por dia da semana
    const contadorPorDia: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    
    // Encontrar o primeiro dia útil a partir da data de início
    const diaSemanaInicio = dataInicio.getDay();
    let primeiroDiaUtilIndex = diasOrdenados.findIndex(dia => dia >= diaSemanaInicio);
    let dataAtual = new Date(dataInicio);
    
    if (primeiroDiaUtilIndex === -1) {
      // Se não encontrou, usar o primeiro dia útil da próxima semana
      primeiroDiaUtilIndex = 0;
      const diasParaProximaSemana = 7 - diaSemanaInicio + diasOrdenados[0];
      dataAtual.setDate(dataAtual.getDate() + diasParaProximaSemana);
    } else {
      // Ajustar para o primeiro dia útil
      const diasParaPrimeiroDiaUtil = diasOrdenados[primeiroDiaUtilIndex] - diaSemanaInicio;
      dataAtual.setDate(dataAtual.getDate() + diasParaPrimeiroDiaUtil);
    }

    // Distribuir itens de forma round-robin entre os dias selecionados
    // Isso garante distribuição igual ao longo de todo o cronograma
    let indiceDiaAtual = primeiroDiaUtilIndex;
    let contadorItemGlobal = 0;

    console.log(`[CronogramaService] Iniciando distribuição round-robin:`, {
      totalItens: itensOrdenados.length,
      diasSelecionados: diasOrdenados,
      primeiroDiaUtilIndex,
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataAtualInicial: dataAtual.toISOString().split('T')[0],
    });

    itensOrdenados.forEach((item, index) => {
      // Usar round-robin: distribuir sequencialmente entre os dias selecionados
      const diaSemanaEscolhido = diasOrdenados[indiceDiaAtual];
      
      // Calcular a data: partir da data atual e ajustar para o dia da semana escolhido
      const dataItem = new Date(dataAtual);
      const diaSemanaAtual = dataItem.getDay();
      
      // Calcular quantos dias adicionar para chegar ao dia escolhido
      let diasParaAdicionar = diaSemanaEscolhido - diaSemanaAtual;
      if (diasParaAdicionar < 0) {
        diasParaAdicionar += 7; // Próxima semana
      }
      
      dataItem.setDate(dataItem.getDate() + diasParaAdicionar);
      
      // Verificar se a data calculada está correta
      const diaSemanaCalculado = dataItem.getDay();
      if (diaSemanaCalculado !== diaSemanaEscolhido) {
        console.error(`[CronogramaService] Erro no cálculo de data para item ${item.id}:`, {
          semana_numero: item.semana_numero,
          ordem_na_semana: item.ordem_na_semana,
          indiceDiaAtual,
          diaSemanaEscolhido,
          diaSemanaCalculado,
          data_prevista: dataItem.toISOString().split('T')[0],
          diasOrdenados,
        });
      }

      // Contar itens por dia da semana para debug
      contadorPorDia[diaSemanaCalculado] += 1;

      // Log detalhado para os primeiros itens e quando há mudança de semana
      if (index < 10 || (index > 0 && index % 50 === 0)) {
        console.log(`[CronogramaService] Item ${index + 1}/${itensOrdenados.length}:`, {
          itemId: item.id,
          semana_numero: item.semana_numero,
          ordem_na_semana: item.ordem_na_semana,
          indiceDiaAtual,
          diaSemanaEscolhido,
          data_prevista: dataItem.toISOString().split('T')[0],
          dataAtualAntes: dataAtual.toISOString().split('T')[0],
        });
      }

      atualizacoes.push({
        id: item.id,
        data_prevista: dataItem.toISOString().split('T')[0], // Formato YYYY-MM-DD
      });

      // Avançar para o próximo dia (round-robin)
      const indiceDiaAnterior = indiceDiaAtual;
      indiceDiaAtual = (indiceDiaAtual + 1) % numDiasSelecionados;
      contadorItemGlobal++;
      
      // Atualizar dataAtual para a data do item processado
      dataAtual = new Date(dataItem);
      
      // Se completou uma rodada completa pelos dias selecionados, avançar para a próxima semana
      if (indiceDiaAtual === 0) {
        // Avançar 7 dias para começar a próxima semana
        dataAtual.setDate(dataAtual.getDate() + 7);
        // Ajustar para o primeiro dia útil da próxima semana
        const diaSemanaAtualAposAvanco = dataAtual.getDay();
        const primeiroDiaUtilProximaSemana = diasOrdenados[0];
        
        // Ajustar para o primeiro dia útil
        let diasParaAjustar = primeiroDiaUtilProximaSemana - diaSemanaAtualAposAvanco;
        if (diasParaAjustar < 0) {
          diasParaAjustar += 7;
        }
        dataAtual.setDate(dataAtual.getDate() + diasParaAjustar);
        
        if (index < 10 || (index > 0 && index % 50 === 0)) {
          console.log(`[CronogramaService] Rodada completa, avançando para próxima semana:`, {
            itemIndex: index + 1,
            dataAtualAposAvanco: dataAtual.toISOString().split('T')[0],
          });
        }
      } else {
        // Se não completou uma rodada, avançar para o próximo dia selecionado
        const proximoDiaSemanaEscolhido = diasOrdenados[indiceDiaAtual];
        const diaSemanaAtualData = dataAtual.getDay();
        
        // Calcular quantos dias adicionar para chegar ao próximo dia selecionado
        let diasParaProximoDia = proximoDiaSemanaEscolhido - diaSemanaAtualData;
        if (diasParaProximoDia <= 0) {
          // Se o próximo dia já passou nesta semana, avançar para a próxima semana
          diasParaProximoDia += 7;
        }
        dataAtual.setDate(dataAtual.getDate() + diasParaProximoDia);
      }
    });
    
    // Log da distribuição final por dia da semana
    const totalItens = Object.values(contadorPorDia).reduce((a, b) => a + b, 0);
    const itensPorDiaSelecionado = diasOrdenados.map(dia => ({
      dia: ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][dia],
      valor: dia,
      quantidade: contadorPorDia[dia],
      percentual: totalItens > 0 ? ((contadorPorDia[dia] / totalItens) * 100).toFixed(1) + '%' : '0%',
    }));
    
    // Calcular se a distribuição está igual (diferença máxima de 1 item)
    const quantidades = itensPorDiaSelecionado.map(d => d.quantidade);
    const minQuantidade = Math.min(...quantidades);
    const maxQuantidade = Math.max(...quantidades);
    const distribuicaoIgual = (maxQuantidade - minQuantidade) <= 1;
    
    console.log(`[CronogramaService] Distribuição de itens por dia da semana:`, {
      total: totalItens,
      dias_selecionados: diasOrdenados,
      distribuicao_por_dia: itensPorDiaSelecionado,
      distribuicao_igual: distribuicaoIgual,
      min: minQuantidade,
      max: maxQuantidade,
      diferenca: maxQuantidade - minQuantidade,
    });
    
    if (!distribuicaoIgual && totalItens > 0) {
      console.warn(`[CronogramaService] ⚠️ Distribuição não está completamente igual. Diferença: ${maxQuantidade - minQuantidade} itens`);
    } else if (distribuicaoIgual) {
      console.log(`[CronogramaService] ✅ Distribuição igual entre todos os dias selecionados`);
    }

    // Atualizar itens em lote
    let itensAtualizados = 0;
    for (const atualizacao of atualizacoes) {
      const { error: updateError } = await client
        .from('cronograma_itens')
        .update({ data_prevista: atualizacao.data_prevista })
        .eq('id', atualizacao.id);

      if (updateError) {
        console.error(`[CronogramaService] Erro ao atualizar item ${atualizacao.id}:`, updateError);
      } else {
        itensAtualizados++;
      }
    }

    console.log(`[CronogramaService] Datas recalculadas: ${itensAtualizados} de ${atualizacoes.length} itens`);

    return { success: true, itens_atualizados: itensAtualizados };
  }

  /**
   * Cria distribuição padrão ao gerar um novo cronograma
   */
  private async criarDistribuicaoPadrao(
    client: ReturnType<typeof getDatabaseClient>,
    cronogramaId: string,
    diasEstudoSemana: number,
  ): Promise<void> {
    // Calcular dias padrão baseado em dias_estudo_semana
    // Se dias_estudo_semana = 5, usar segunda a sexta [1,2,3,4,5]
    // Se dias_estudo_semana = 3, usar segunda, quarta, sexta [1,3,5]
    // etc.
    let diasPadrao: number[] = [];
    
    if (diasEstudoSemana >= 5) {
      diasPadrao = [1, 2, 3, 4, 5]; // Segunda a sexta
    } else if (diasEstudoSemana === 4) {
      diasPadrao = [1, 2, 4, 5]; // Segunda, terça, quinta, sexta
    } else if (diasEstudoSemana === 3) {
      diasPadrao = [1, 3, 5]; // Segunda, quarta, sexta
    } else if (diasEstudoSemana === 2) {
      diasPadrao = [1, 4]; // Segunda e quinta
    } else {
      diasPadrao = [1]; // Apenas segunda
    }

    const { error } = await client.from('cronograma_semanas_dias').insert({
      cronograma_id: cronogramaId,
      dias_semana: diasPadrao,
    });

    if (error) {
      console.error('[CronogramaService] Erro ao criar distribuição padrão:', error);
      // Não lançar erro, apenas logar - a distribuição pode ser criada depois
    } else {
      console.log('[CronogramaService] Distribuição padrão criada:', diasPadrao);
    }
  }
}

export const cronogramaService = new CronogramaService();

