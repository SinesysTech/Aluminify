'use client'

import * as React from 'react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'

type Disciplina = {
  id: string
  nome: string
}

type Frente = {
  id: string
  nome: string
  disciplina_id: string
}

type Modulo = {
  id: string
  nome: string
  numero_modulo: number | null
  frente_id: string
  aulas: Aula[]
}

type Aula = {
  id: string
  nome: string
  numero_aula: number | null
  tempo_estimado_minutos: number | null
  prioridade: number | null
}

type CSVRow = {
  modulo?: string
  'nome do modulo'?: string
  'Nome do Módulo'?: string
  aula?: string
  'nome da aula'?: string
  'Nome da Aula'?: string
  tempo?: string
  prioridade?: string
  disciplina?: string
  frente?: string
}

export default function ConteudosPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [disciplinas, setDisciplinas] = React.useState<Disciplina[]>([])
  const [disciplinaSelecionada, setDisciplinaSelecionada] = React.useState<string>('')
  const [frenteNome, setFrenteNome] = React.useState<string>('')
  const [arquivo, setArquivo] = React.useState<File | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isLoadingContent, setIsLoadingContent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [frentes, setFrentes] = React.useState<Frente[]>([])
  const [frenteSelecionada, setFrenteSelecionada] = React.useState<string>('')
  const [modulos, setModulos] = React.useState<Modulo[]>([])
  const [isProfessor, setIsProfessor] = React.useState<boolean | null>(null)

  // Verificar se o usuário é professor
  React.useEffect(() => {
    const checkProfessor = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data, error } = await supabase
          .from('professores')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Erro ao verificar professor:', error)
          setIsProfessor(false)
          return
        }

        setIsProfessor(!!data)
        if (!data) {
          setError('Acesso negado. Apenas professores podem acessar esta página.')
        }
      } catch (err) {
        console.error('Erro ao verificar permissões:', err)
        setIsProfessor(false)
      }
    }

    checkProfessor()
  }, [supabase, router])

  // Carregar disciplinas
  React.useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        const { data, error } = await supabase
          .from('disciplinas')
          .select('id, nome')
          .order('nome', { ascending: true })

        if (error) throw error
        setDisciplinas(data || [])
      } catch (err) {
        console.error('Erro ao carregar disciplinas:', err)
        setError('Erro ao carregar disciplinas')
      }
    }

    if (isProfessor) {
      fetchDisciplinas()
    }
  }, [supabase, isProfessor])

  // Carregar frentes quando disciplina for selecionada
  React.useEffect(() => {
    const fetchFrentes = async () => {
      if (!disciplinaSelecionada) {
        setFrentes([])
        setModulos([])
        return
      }

      try {
        setIsLoadingContent(true)
        const { data, error } = await supabase
          .from('frentes')
          .select('id, nome, disciplina_id')
          .eq('disciplina_id', disciplinaSelecionada)
          .order('nome', { ascending: true })

        if (error) throw error
        setFrentes(data || [])
      } catch (err) {
        console.error('Erro ao carregar frentes:', err)
        setError('Erro ao carregar frentes')
      } finally {
        setIsLoadingContent(false)
      }
    }

    fetchFrentes()
  }, [supabase, disciplinaSelecionada])

  // Carregar módulos e aulas quando frente for selecionada
  React.useEffect(() => {
    const fetchModulosEAulas = async () => {
      if (!frenteSelecionada) {
        setModulos([])
        return
      }

      try {
        setIsLoadingContent(true)
        const { data: modulosData, error: modulosError } = await supabase
          .from('modulos')
          .select('id, nome, numero_modulo, frente_id')
          .eq('frente_id', frenteSelecionada)
          .order('numero_modulo', { ascending: true })

        if (modulosError) throw modulosError

        if (modulosData && modulosData.length > 0) {
          // Buscar aulas para cada módulo
          const modulosComAulas = await Promise.all(
            modulosData.map(async (modulo) => {
              const { data: aulasData, error: aulasError } = await supabase
                .from('aulas')
                .select('id, nome, numero_aula, tempo_estimado_minutos, prioridade')
                .eq('modulo_id', modulo.id)
                .order('numero_aula', { ascending: true })

              if (aulasError) {
                console.error('Erro ao carregar aulas:', aulasError)
                return { ...modulo, aulas: [] }
              }

              return { ...modulo, aulas: aulasData || [] }
            })
          )

          setModulos(modulosComAulas)
        } else {
          setModulos([])
        }
      } catch (err) {
        console.error('Erro ao carregar módulos e aulas:', err)
        setError('Erro ao carregar conteúdo')
      } finally {
        setIsLoadingContent(false)
      }
    }

    fetchModulosEAulas()
  }, [supabase, frenteSelecionada])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        setError('Por favor, selecione um arquivo CSV ou XLSX')
        return
      }
      setArquivo(file)
      setError(null)
    }
  }

  const parseCSV = (file: File): Promise<CSVRow[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse<CSVRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`Erro ao processar CSV: ${results.errors[0].message}`))
            return
          }
          resolve(results.data)
        },
        error: (error) => {
          reject(error)
        },
      })
    })
  }

  const validateCSV = (rows: CSVRow[]): string | null => {
    if (rows.length === 0) {
      return 'O arquivo CSV está vazio'
    }

    const firstRow = rows[0]
    const hasModulo = !!(firstRow.modulo || firstRow['nome do modulo'] || firstRow['Nome do Módulo'])
    const hasAula = !!(firstRow.aula || firstRow['nome da aula'] || firstRow['Nome da Aula'])

    if (!hasModulo) {
      return 'O CSV deve conter uma coluna "Módulo" ou "Nome do Módulo"'
    }

    if (!hasAula) {
      return 'O CSV deve conter uma coluna "Aula" ou "Nome da Aula"'
    }

    return null
  }

  const transformCSVToJSON = (rows: CSVRow[]) => {
    const jsonData: Array<{
      modulo_numero: number
      modulo_nome: string
      aula_numero: number
      aula_nome: string
      tempo?: number | null
      prioridade?: number | null
    }> = []

    // Mapear números de módulo e aula para garantir sequência
    const moduloMap = new Map<string, number>()
    const aulaMap = new Map<string, number>()

    rows.forEach((row) => {
      const moduloNome = row['Nome do Módulo'] || row['nome do modulo'] || row.modulo || ''
      const aulaNome = row['Nome da Aula'] || row['nome da aula'] || row.aula || ''

      if (!moduloNome || !aulaNome) {
        return // Pular linhas incompletas
      }

      // Obter ou criar número do módulo
      let moduloNumero = moduloMap.get(moduloNome)
      if (moduloNumero === undefined) {
        moduloNumero = moduloMap.size + 1
        moduloMap.set(moduloNome, moduloNumero)
      }

      // Obter ou criar número da aula (dentro do módulo)
      const aulaKey = `${moduloNome}-${aulaNome}`
      let aulaNumero = aulaMap.get(aulaKey)
      if (aulaNumero === undefined) {
        // Contar quantas aulas já existem neste módulo
        const aulasNoModulo = Array.from(aulaMap.keys()).filter(k => k.startsWith(`${moduloNome}-`)).length
        aulaNumero = aulasNoModulo + 1
        aulaMap.set(aulaKey, aulaNumero)
      }

      const tempo = row.tempo ? parseInt(row.tempo, 10) : null
      const prioridade = row.prioridade ? parseInt(row.prioridade, 10) : null

      jsonData.push({
        modulo_numero: moduloNumero,
        modulo_nome: moduloNome,
        aula_numero: aulaNumero,
        aula_nome: aulaNome,
        tempo: tempo && !isNaN(tempo) ? tempo : null,
        prioridade: prioridade && !isNaN(prioridade) && prioridade >= 1 && prioridade <= 5 ? prioridade : null,
      })
    })

    return jsonData
  }

  const handleImport = async () => {
    if (!disciplinaSelecionada) {
      setError('Por favor, selecione uma disciplina')
      return
    }

    if (!frenteNome.trim()) {
      setError('Por favor, informe o nome da frente')
      return
    }

    if (!arquivo) {
      setError('Por favor, selecione um arquivo CSV')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      // Parse do CSV
      const csvRows = await parseCSV(arquivo)
      const validationError = validateCSV(csvRows)
      if (validationError) {
        setError(validationError)
        return
      }

      // Transformar em JSON
      const jsonData = transformCSVToJSON(csvRows)

      if (jsonData.length === 0) {
        setError('Nenhum dado válido encontrado no CSV')
        return
      }

      // Buscar nome da disciplina
      const disciplina = disciplinas.find(d => d.id === disciplinaSelecionada)
      if (!disciplina) {
        setError('Disciplina não encontrada')
        return
      }

      // Chamar RPC
      const { error: rpcError } = await supabase.rpc('importar_cronograma_aulas', {
        p_disciplina_nome: disciplina.nome,
        p_frente_nome: frenteNome.trim(),
        p_conteudo: jsonData,
      })

      if (rpcError) {
        throw rpcError
      }

      setSuccessMessage('Cronograma importado com sucesso!')
      setArquivo(null)
      
      // Resetar input de arquivo
      const fileInput = document.getElementById('csv-file') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

      // Recarregar conteúdo
      if (disciplinaSelecionada) {
        const { data: frentesData } = await supabase
          .from('frentes')
          .select('id, nome')
          .eq('disciplina_id', disciplinaSelecionada)
          .eq('nome', frenteNome.trim())
          .maybeSingle()

        if (frentesData) {
          setFrenteSelecionada(frentesData.id)
        }
      }
    } catch (err) {
      console.error('Erro ao importar:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao importar cronograma'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isProfessor === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Verificando permissões...</div>
      </div>
    )
  }

  if (isProfessor === false) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              {error || 'Apenas professores podem acessar esta página.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importar Conteúdo Programático</h1>
        <p className="text-muted-foreground">
          Faça upload de arquivos CSV para cadastrar ou atualizar o conteúdo programático
        </p>
      </div>

      {/* Card de Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>
            Selecione a disciplina, informe o nome da frente e faça upload do arquivo CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="disciplina">Disciplina</Label>
              <Select
                value={disciplinaSelecionada}
                onValueChange={(value) => {
                  setDisciplinaSelecionada(value)
                  setFrenteSelecionada('')
                  setModulos([])
                }}
              >
                <SelectTrigger id="disciplina">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map((disciplina) => (
                    <SelectItem key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frente">Nome da Frente</Label>
              <Input
                id="frente"
                placeholder="Ex: Frente A"
                value={frenteNome}
                onChange={(e) => setFrenteNome(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Arquivo CSV</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {arquivo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {arquivo.name}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              O arquivo deve conter colunas: Módulo (ou Nome do Módulo), Aula (ou Nome da Aula), Tempo (opcional), Prioridade (opcional, 1-5)
            </p>
          </div>

          <Button
            onClick={handleImport}
            disabled={isLoading || !disciplinaSelecionada || !frenteNome.trim() || !arquivo}
            className="w-full"
          >
            {isLoading ? (
              <>Processando...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar e Atualizar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Card de Visualização */}
      {disciplinaSelecionada && (
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Atual</CardTitle>
            <CardDescription>
              Visualize o conteúdo programático cadastrado para esta disciplina
            </CardDescription>
          </CardHeader>
          <CardContent>
            {frentes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma frente cadastrada para esta disciplina
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Selecione uma frente para visualizar:</Label>
                <Select
                  value={frenteSelecionada}
                  onValueChange={setFrenteSelecionada}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma frente" />
                  </SelectTrigger>
                  <SelectContent>
                    {frentes.map((frente) => (
                      <SelectItem key={frente.id} value={frente.id}>
                        {frente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isLoadingContent && (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            )}

            {!isLoadingContent && frenteSelecionada && modulos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum módulo cadastrado para esta frente
              </div>
            )}

            {!isLoadingContent && frenteSelecionada && modulos.length > 0 && (
              <div className="mt-4 space-y-2">
                {modulos.map((modulo) => {
                  const [isOpen, setIsOpen] = React.useState(false)
                  return (
                    <Collapsible key={modulo.id} open={isOpen} onOpenChange={setIsOpen}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-accent">
                        <div className="flex items-center gap-2">
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          <span className="font-medium">
                            Módulo {modulo.numero_modulo || 'N/A'}: {modulo.nome}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {modulo.aulas.length} aula{modulo.aulas.length !== 1 ? 's' : ''}
                        </span>
                      </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-20">Aula</TableHead>
                              <TableHead>Nome</TableHead>
                              <TableHead className="w-24">Tempo</TableHead>
                              <TableHead className="w-24">Prioridade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {modulo.aulas.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                  Nenhuma aula cadastrada
                                </TableCell>
                              </TableRow>
                            ) : (
                              modulo.aulas.map((aula) => (
                                <TableRow key={aula.id}>
                                  <TableCell>{aula.numero_aula || 'N/A'}</TableCell>
                                  <TableCell className="font-medium">{aula.nome}</TableCell>
                                  <TableCell>
                                    {aula.tempo_estimado_minutos
                                      ? `${aula.tempo_estimado_minutos} min`
                                      : '-'}
                                  </TableCell>
                                  <TableCell>
                                    {aula.prioridade ? (
                                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                        {aula.prioridade}
                                      </span>
                                    ) : (
                                      '-'
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

