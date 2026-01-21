'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, UserCog, GraduationCap, Users, Shield, Briefcase, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/client'
import Link from 'next/link'
import type { RoleTipo } from '@/types/shared/entities/papel'

interface Usuario {
  id: string
  nomeCompleto: string
  email: string
  papelId: string
  papel?: {
    id: string
    nome: string
    tipo: RoleTipo
  }
  ativo: boolean
}

interface Papel {
  id: string
  nome: string
  tipo: RoleTipo
  descricao: string | null
  isSystem: boolean
}

interface Aluno {
  id: string
  fullName: string | null
  email: string
  status?: string
}

interface UserManagementProps {
  empresaId: string
}

// Mapeamento de tipos de papel para labels e ícones
const ROLE_CONFIG: Record<RoleTipo, { label: string; icon: React.ElementType; color: string }> = {
  professor: { label: 'Professor', icon: GraduationCap, color: 'text-blue-500 bg-blue-500/10' },
  professor_admin: { label: 'Professor Admin', icon: GraduationCap, color: 'text-purple-500 bg-purple-500/10' },
  staff: { label: 'Staff', icon: Briefcase, color: 'text-green-500 bg-green-500/10' },
  admin: { label: 'Administrador', icon: Shield, color: 'text-amber-500 bg-amber-500/10' },
  monitor: { label: 'Monitor', icon: BookOpen, color: 'text-cyan-500 bg-cyan-500/10' },
}

export function UserManagement({ empresaId }: UserManagementProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('equipe')
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // Usuarios (equipe) state
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [papeis, setPapeis] = useState<Papel[]>([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [usuarioDialogOpen, setUsuarioDialogOpen] = useState(false)
  const [usuarioForm, setUsuarioForm] = useState({
    email: '',
    nomeCompleto: '',
    password: '',
    papelId: '',
  })
  const [usuarioSearch, setUsuarioSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleTipo | 'all'>('all')

  // Alunos state
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loadingAlunos, setLoadingAlunos] = useState(true)
  const [alunoSearch, setAlunoSearch] = useState('')

  // Inicializar accessToken
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAccessToken(session?.access_token ?? null)
    })
  }, [])

  // Fetch papeis (roles)
  const fetchPapeis = useCallback(async () => {
    if (!accessToken) return
    try {
      const response = await fetch(`/api/empresas/${empresaId}/papeis`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPapeis(data)
      }
    } catch (error) {
      console.error('Error fetching papeis:', error)
    }
  }, [empresaId, accessToken])

  // Fetch usuarios (equipe)
  const fetchUsuarios = useCallback(async () => {
    if (!accessToken) return
    try {
      const response = await fetch(`/api/empresas/${empresaId}/usuarios`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar equipe',
        variant: 'destructive',
      })
    } finally {
      setLoadingUsuarios(false)
    }
  }, [empresaId, toast, accessToken])

  // Fetch alunos
  const fetchAlunos = useCallback(async () => {
    if (!accessToken) return
    try {
      const response = await fetch(`/api/empresas/${empresaId}/alunos`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAlunos(data)
      }
    } catch (error) {
      console.error('Error fetching alunos:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar alunos',
        variant: 'destructive',
      })
    } finally {
      setLoadingAlunos(false)
    }
  }, [empresaId, toast, accessToken])

  useEffect(() => {
    fetchPapeis()
    fetchUsuarios()
    fetchAlunos()
  }, [fetchPapeis, fetchUsuarios, fetchAlunos])

  // Create usuario
  async function handleCreateUsuario() {
    if (!accessToken) return
    try {
      const response = await fetch(`/api/empresas/${empresaId}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(usuarioForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar usuário')
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário criado com sucesso',
      })
      setUsuarioDialogOpen(false)
      setUsuarioForm({ email: '', nomeCompleto: '', password: '', papelId: '' })
      fetchUsuarios()
    } catch (error) {
      console.error('Error creating usuario:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar usuário',
        variant: 'destructive',
      })
    }
  }

  // Update usuario papel
  async function handleUpdatePapel(usuarioId: string, novoPapelId: string) {
    if (!accessToken) return
    try {
      const response = await fetch(`/api/empresas/${empresaId}/usuarios/${usuarioId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ papelId: novoPapelId }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar papel')
      }

      toast({
        title: 'Sucesso',
        description: 'Papel atualizado com sucesso',
      })
      fetchUsuarios()
    } catch (error) {
      console.error('Error updating papel:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar papel',
        variant: 'destructive',
      })
    }
  }

  // Filter functions
  const filteredUsuarios = usuarios.filter((u) => {
    const matchesSearch =
      u.nomeCompleto.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(usuarioSearch.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.papel?.tipo === roleFilter
    return matchesSearch && matchesRole
  })

  const filteredAlunos = alunos.filter(
    (a) =>
      a.fullName?.toLowerCase().includes(alunoSearch.toLowerCase()) ||
      a.email?.toLowerCase().includes(alunoSearch.toLowerCase())
  )

  // Administradores = usuarios com papel admin ou professor_admin
  const administradores = usuarios.filter(
    (u) => u.papel?.tipo === 'admin' || u.papel?.tipo === 'professor_admin'
  )

  // Get role config for a usuario
  const getRoleConfig = (tipo?: RoleTipo) => {
    if (!tipo) return ROLE_CONFIG.professor
    return ROLE_CONFIG[tipo] || ROLE_CONFIG.professor
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equipe" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Equipe</span>
            <Badge variant="secondary" className="ml-1">
              {usuarios.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="alunos" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Alunos</span>
            <Badge variant="secondary" className="ml-1">
              {alunos.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="administradores" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Administradores</span>
            <Badge variant="secondary" className="ml-1">
              {administradores.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Equipe Tab */}
        <TabsContent value="equipe" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar na equipe..."
                  value={usuarioSearch}
                  onChange={(e) => setUsuarioSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleTipo | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os papéis</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="professor_admin">Professor Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={usuarioDialogOpen} onOpenChange={setUsuarioDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Membro da Equipe</DialogTitle>
                  <DialogDescription>
                    Crie uma nova conta para um membro da equipe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={usuarioForm.email}
                      onChange={(e) =>
                        setUsuarioForm({ ...usuarioForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-nomeCompleto">Nome Completo</Label>
                    <Input
                      id="user-nomeCompleto"
                      value={usuarioForm.nomeCompleto}
                      onChange={(e) =>
                        setUsuarioForm({ ...usuarioForm, nomeCompleto: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Senha Temporária</Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={usuarioForm.password}
                      onChange={(e) =>
                        setUsuarioForm({ ...usuarioForm, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-papel">Papel</Label>
                    <Select
                      value={usuarioForm.papelId}
                      onValueChange={(v) => setUsuarioForm({ ...usuarioForm, papelId: v })}
                    >
                      <SelectTrigger id="user-papel">
                        <SelectValue placeholder="Selecione o papel" />
                      </SelectTrigger>
                      <SelectContent>
                        {papeis.map((papel) => (
                          <SelectItem key={papel.id} value={papel.id}>
                            <div className="flex items-center gap-2">
                              <span>{papel.nome}</span>
                              <span className="text-xs text-muted-foreground">
                                ({ROLE_CONFIG[papel.tipo]?.label || papel.tipo})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleCreateUsuario}
                    className="w-full"
                    disabled={!usuarioForm.email || !usuarioForm.nomeCompleto || !usuarioForm.password || !usuarioForm.papelId}
                  >
                    Criar Membro
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loadingUsuarios ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {usuarioSearch || roleFilter !== 'all'
                ? 'Nenhum membro encontrado'
                : 'Nenhum membro cadastrado'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsuarios.map((usuario) => {
                const roleConfig = getRoleConfig(usuario.papel?.tipo)
                const RoleIcon = roleConfig.icon
                return (
                  <div
                    key={usuario.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${roleConfig.color}`}>
                        <RoleIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {usuario.nomeCompleto}
                          <Badge variant="outline" className="text-xs">
                            {usuario.papel?.nome || 'Sem papel'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{usuario.email}</div>
                      </div>
                    </div>
                    <Select
                      value={usuario.papelId}
                      onValueChange={(v) => handleUpdatePapel(usuario.id, v)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {papeis.map((papel) => (
                          <SelectItem key={papel.id} value={papel.id}>
                            {papel.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Alunos Tab */}
        <TabsContent value="alunos" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alunos..."
                value={alunoSearch}
                onChange={(e) => setAlunoSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin/empresa/alunos">
                <UserCog className="h-4 w-4 mr-2" />
                Gerenciar Alunos
              </Link>
            </Button>
          </div>

          {loadingAlunos ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredAlunos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {alunoSearch ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAlunos.map((aluno) => (
                <div
                  key={aluno.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">{aluno.fullName || 'Sem nome'}</div>
                      <div className="text-sm text-muted-foreground">{aluno.email}</div>
                    </div>
                  </div>
                  <Badge variant={aluno.status === 'ativo' ? 'default' : 'secondary'}>
                    {aluno.status || 'Ativo'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Administradores Tab */}
        <TabsContent value="administradores" className="space-y-4 mt-4">
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              Administradores são membros da equipe com papéis de <strong>Administrador</strong> ou{' '}
              <strong>Professor Admin</strong>. Para alterar o papel de um membro, vá até a aba{' '}
              <strong>Equipe</strong> e selecione o novo papel.
            </p>
          </div>

          {administradores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum administrador cadastrado
            </div>
          ) : (
            <div className="space-y-2">
              {administradores.map((admin) => {
                const roleConfig = getRoleConfig(admin.papel?.tipo)
                const RoleIcon = roleConfig.icon
                return (
                  <div
                    key={admin.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${roleConfig.color}`}>
                        <RoleIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {admin.nomeCompleto}
                          <Badge
                            variant={admin.papel?.tipo === 'admin' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {admin.papel?.nome || 'Administrador'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </div>
                    </div>
                    <Select
                      value={admin.papelId}
                      onValueChange={(v) => handleUpdatePapel(admin.id, v)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {papeis.map((papel) => (
                          <SelectItem key={papel.id} value={papel.id}>
                            {papel.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
