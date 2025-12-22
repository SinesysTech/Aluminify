'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/client';

interface Empresa {
  id: string;
  nome: string;
  slug: string;
  cnpj: string | null;
  emailContato: string | null;
  telefone: string | null;
  plano: 'basico' | 'profissional' | 'enterprise';
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Professor {
  id: string;
  email: string;
  nome_completo: string;
  is_admin: boolean;
  empresa_id: string;
  empresas?: {
    nome: string;
  };
  created_at: string;
}

interface Aluno {
  id: string;
  email: string;
  nomeCompleto: string | null;
  cpf: string | null;
  empresas: string[];
  cursos: Array<{
    id: string;
    nome: string;
    empresaId: string;
    empresaNome: string;
  }>;
  createdAt: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('empresas');
  const [openEmpresaDialog, setOpenEmpresaDialog] = useState(false);
  const [empresaForm, setEmpresaForm] = useState({
    nome: '',
    cnpj: '',
    emailContato: '',
    telefone: '',
    plano: 'basico' as 'basico' | 'profissional' | 'enterprise',
    primeiroAdminEmail: '',
    primeiroAdminNome: '',
    primeiroAdminPassword: '',
  });

  const fetchEmpresas = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/empresas', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.error || 'Erro ao carregar empresas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching empresas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar empresas',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchProfessores = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }

      const response = await fetch('/api/admin/all-users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfessores(data);
      }
    } catch (error) {
      console.error('Error fetching professores:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar professores',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchAlunos = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }

      const response = await fetch('/api/admin/all-students', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlunos(data);
      }
    } catch (error) {
      console.error('Error fetching alunos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar alunos',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEmpresas(),
        fetchProfessores(),
        fetchAlunos(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchEmpresas, fetchProfessores, fetchAlunos]);

  async function handleToggleEmpresaStatus(id: string, ativo: boolean) {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`/api/empresas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ativo: !ativo }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      toast({
        title: 'Sucesso',
        description: `Empresa ${!ativo ? 'ativada' : 'desativada'} com sucesso`,
      });
      fetchEmpresas();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status da empresa',
        variant: 'destructive',
      });
    }
  }

  async function handleCreateEmpresa() {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(empresaForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar empresa');
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso',
      });
      setOpenEmpresaDialog(false);
      setEmpresaForm({
        nome: '',
        cnpj: '',
        emailContato: '',
        telefone: '',
        plano: 'basico',
        primeiroAdminEmail: '',
        primeiroAdminNome: '',
        primeiroAdminPassword: '',
      });
      fetchEmpresas();
    } catch (error) {
      console.error('Error creating empresa:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar empresa',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Painel de Super Administração</CardTitle>
          <CardDescription>
            Gerencie todas as empresas, usuários e alunos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="empresas">
                Empresas ({empresas.length})
              </TabsTrigger>
              <TabsTrigger value="professores">
                Professores ({professores.length})
              </TabsTrigger>
              <TabsTrigger value="alunos">
                Alunos ({alunos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="empresas" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={openEmpresaDialog} onOpenChange={setOpenEmpresaDialog}>
                  <DialogTrigger asChild>
                    <Button>Nova Empresa</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Criar Nova Empresa</DialogTitle>
                      <DialogDescription>
                        Crie uma nova empresa e opcionalmente um administrador inicial
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome da Empresa *</Label>
                        <Input
                          id="nome"
                          value={empresaForm.nome}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, nome: e.target.value })}
                          placeholder="Nome da instituição"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          value={empresaForm.cnpj}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, cnpj: e.target.value })}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailContato">Email de Contato</Label>
                        <Input
                          id="emailContato"
                          type="email"
                          value={empresaForm.emailContato}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, emailContato: e.target.value })}
                          placeholder="contato@empresa.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={empresaForm.telefone}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, telefone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plano">Plano</Label>
                        <Select
                          value={empresaForm.plano}
                          onValueChange={(value: 'basico' | 'profissional' | 'enterprise') =>
                            setEmpresaForm({ ...empresaForm, plano: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basico">Básico</SelectItem>
                            <SelectItem value="profissional">Profissional</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="border-t pt-4 space-y-4">
                        <h3 className="font-medium">Administrador Inicial (Opcional)</h3>
                        <div className="space-y-2">
                          <Label htmlFor="primeiroAdminNome">Nome Completo</Label>
                          <Input
                            id="primeiroAdminNome"
                            value={empresaForm.primeiroAdminNome}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, primeiroAdminNome: e.target.value })}
                            placeholder="Nome do administrador"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primeiroAdminEmail">Email</Label>
                          <Input
                            id="primeiroAdminEmail"
                            type="email"
                            value={empresaForm.primeiroAdminEmail}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, primeiroAdminEmail: e.target.value })}
                            placeholder="admin@empresa.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primeiroAdminPassword">Senha Temporária</Label>
                          <Input
                            id="primeiroAdminPassword"
                            type="password"
                            value={empresaForm.primeiroAdminPassword}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, primeiroAdminPassword: e.target.value })}
                            placeholder="Senha temporária"
                          />
                        </div>
                      </div>
                      <Button onClick={handleCreateEmpresa} className="w-full">
                        Criar Empresa
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresas.map((empresa) => (
                      <TableRow key={empresa.id}>
                        <TableCell className="font-medium">{empresa.nome}</TableCell>
                        <TableCell>{empresa.cnpj || 'Não informado'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{empresa.plano}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={empresa.ativo ? 'default' : 'secondary'}>
                            {empresa.ativo ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(empresa.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleEmpresaStatus(empresa.id, empresa.ativo)}
                            >
                              {empresa.ativo ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Link href={`/admin/empresas/${empresa.id}`}>
                              <Button variant="outline" size="sm">
                                Ver Detalhes
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="professores" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professores.map((prof) => (
                      <TableRow key={prof.id}>
                        <TableCell className="font-medium">{prof.nome_completo}</TableCell>
                        <TableCell>{prof.email}</TableCell>
                        <TableCell>{(prof.empresas as any)?.nome || 'N/A'}</TableCell>
                        <TableCell>
                          {prof.is_admin ? (
                            <Badge variant="default">Sim</Badge>
                          ) : (
                            <Badge variant="secondary">Não</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(prof.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="alunos" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Empresas</TableHead>
                      <TableHead>Cursos</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alunos.map((aluno) => (
                      <TableRow key={aluno.id}>
                        <TableCell className="font-medium">
                          {aluno.nomeCompleto || 'Sem nome'}
                        </TableCell>
                        <TableCell>{aluno.email}</TableCell>
                        <TableCell>
                          {aluno.empresas.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {aluno.empresas.map((emp, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {emp}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {aluno.cursos.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {aluno.cursos.map((curso) => (
                                <Badge key={curso.id} variant="secondary" className="text-xs">
                                  {curso.nome}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            'Nenhum curso'
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(aluno.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

