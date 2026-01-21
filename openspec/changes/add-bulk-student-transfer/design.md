# Design: Transferencia em Massa de Alunos

## Context

O sistema Aluminify possui estrutura hierarquica para gestao de alunos:

```
Empresa (Tenant)
├── Cursos (com empresa_id)
│   └── Turmas (opcional, com curso_id)
├── Alunos (com empresa_id)
│   ├── alunos_cursos (N:N - aluno vinculado ao curso)
│   └── alunos_turmas (N:N - aluno vinculado a turma, com status)
└── Matriculas (registro detalhado com datas de acesso)
```

### Niveis de Encapsulamento
1. **Nivel 1**: Organizacao trabalha so com cursos (curso = turma)
2. **Nivel 2**: Organizacao trabalha com cursos + turmas

## Goals / Non-Goals

### Goals
- Permitir selecao em massa de alunos (10, 20, 30, todos)
- Transferir multiplos alunos entre cursos de forma atomica
- Transferir multiplos alunos entre turmas do mesmo curso
- Fornecer feedback detalhado do resultado (sucesso/falha por aluno)
- Manter isolamento multi-tenant via RLS existente

### Non-Goals
- Transferencia entre organizacoes (empresas diferentes)
- Transferencia automatica baseada em regras
- Historico detalhado de transferencias (audit log)
- Notificacoes automaticas aos alunos transferidos

## Decisions

### 1. Processamento em Batch

**Decisao**: Processar transferencias em lotes de 10 alunos.

**Razao**: Seguir padrao existente em `student-import.service.ts` que ja usa batches para evitar timeouts e garantir atomicidade parcial.

### 2. Usar Tabelas Existentes

**Decisao**: Nao criar novas tabelas. Usar `alunos_cursos` e `alunos_turmas` existentes.

**Razao**: Estrutura ja suporta o caso de uso. Adicionar tabelas seria over-engineering.

### 3. Status Configuravel para Turma Origem

**Decisao**: Permitir escolher status do registro antigo em `alunos_turmas`: `concluido`, `cancelado`, ou `trancado`.

**Razao**: Diferentes cenarios de negocio requerem diferentes status (transferencia planejada vs. urgente vs. administrativa).

### 4. RLS para Isolamento

**Decisao**: Usar cliente Supabase autenticado (nao admin) para operacoes.

**Razao**: RLS existente em `alunos`, `cursos`, `turmas`, `alunos_cursos`, `alunos_turmas` ja garante isolamento por `empresa_id`. Nenhuma policy nova necessaria.

### 5. Resposta Multi-Status

**Decisao**: Retornar resultado detalhado por aluno, mesmo em caso de falha parcial.

```typescript
interface BulkTransferResult {
  total: number;
  success: number;
  failed: number;
  results: {
    studentId: string;
    status: 'success' | 'failed' | 'skipped';
    message?: string;
  }[];
}
```

**Razao**: Admin precisa saber exatamente quais alunos foram transferidos e quais falharam para tomar acoes corretivas.

## Fluxo de Transferencia

```
Usuario seleciona alunos na tabela
         │
         ▼
Clica em "Transferir" na barra de acoes
         │
         ▼
Dialog abre com opcoes:
├── Tipo: Curso ou Turma
├── Destino: Lista de cursos/turmas disponiveis
└── Status origem (se turma): concluido/cancelado/trancado
         │
         ▼
Usuario confirma transferencia
         │
         ▼
API processa em batches de 10
         │
         ▼
Retorna resultado detalhado
         │
         ▼
UI exibe resumo e atualiza lista
```

## Risks / Trade-offs

| Risco | Mitigacao |
|-------|-----------|
| Timeout em transferencias grandes (100+ alunos) | Processamento em batches de 10 |
| Falha parcial deixa dados inconsistentes | Transacao por batch, resultado detalhado |
| Usuario seleciona alunos errados | Confirmacao com lista de nomes antes de executar |
| Transferencia para turma de outro curso | Validacao no backend antes de executar |

## API Schemas

### POST /api/student/bulk-transfer/course

```typescript
// Request
interface BulkTransferCourseRequest {
  studentIds: string[];           // Max 100
  sourceCourseId: string;
  targetCourseId: string;
  options?: {
    preserveEnrollmentDates?: boolean;
    updateMatriculas?: boolean;
  };
}

// Response: BulkTransferResult
```

### POST /api/student/bulk-transfer/turma

```typescript
// Request
interface BulkTransferTurmaRequest {
  studentIds: string[];           // Max 100
  sourceTurmaId: string;
  targetTurmaId: string;          // Must be same course
  sourceStatusOnTransfer?: 'concluido' | 'cancelado' | 'trancado';
}

// Response: BulkTransferResult
```

## Migration Plan

Nenhuma migracao necessaria. Alteracoes sao puramente aditivas:
- Novos arquivos de servico/repositorio
- Novos endpoints de API
- Novos componentes de UI

**Rollback**: Remover arquivos criados. Nenhum dado afetado.

## Open Questions

Nenhuma questao aberta - requisitos foram clarificados com o usuario.
