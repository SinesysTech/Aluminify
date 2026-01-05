'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function ProfessorSignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [empresaNome, setEmpresaNome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaNomeFromSlug, setEmpresaNomeFromSlug] = useState<string | null>(null);

  useEffect(() => {
    // Buscar empresa_id via empresa_slug se fornecido
    const empresaSlug = searchParams.get('empresa');
    if (empresaSlug) {
      fetchEmpresaBySlug(empresaSlug);
    }
  }, [searchParams]);

  async function fetchEmpresaBySlug(slug: string) {
    try {
      const response = await fetch(`/api/empresas/lookup?slug=${encodeURIComponent(slug)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Empresa não encontrada ou inativa');
        } else {
          setError('Erro ao buscar empresa');
        }
        return;
      }

      const data = await response.json();
      if (data) {
        setEmpresaId(data.id);
        setEmpresaNomeFromSlug(data.nome);
      }
    } catch (err) {
      console.error('Error fetching empresa:', err);
      setError('Erro ao buscar empresa');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (!fullName.trim()) {
      setError('Por favor, informe seu nome completo');
      return;
    }

    // Se empresa_slug foi fornecido, validar que empresa foi encontrada
    const empresaSlug = searchParams.get('empresa');
    if (empresaSlug && !empresaId) {
      setError('Empresa não encontrada. Verifique o link de cadastro.');
      return;
    }

    // Se não há empresa_id (cadastro novo), validar nome da empresa
    if (!empresaId && !empresaNome.trim()) {
      setError('Por favor, informe o nome da sua empresa');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Se empresa_id foi fornecido, usar fluxo normal de signup
      if (empresaId) {
        const userMetadata: Record<string, string> = {
          role: 'professor',
          full_name: fullName,
          empresa_id: empresaId,
        };

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userMetadata,
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error('Este email já está cadastrado');
          }
          throw new Error(signUpError.message);
        }

        if (!data.user) {
          throw new Error('Erro ao criar conta. Tente novamente.');
        }

        // Redirecionar para dashboard do professor
        router.push('/tobias');
        router.refresh();
      } else {
        // Se não há empresa_id, criar conta de professor COM empresa (apenas nome)
        // Usar endpoint que cria empresa automaticamente com apenas o nome
        const response = await fetch('/api/auth/signup-with-empresa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            fullName,
            empresaNome: empresaNome.trim(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar conta');
        }

        await response.json();
        
        // Aguardar um pouco para garantir que a trigger tenha criado o registro do professor
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fazer login automático após criar conta
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // Mesmo se login falhar, redirecionar para login
          router.push('/auth/professor/login');
          return;
        }

        // Aguardar mais um pouco para garantir que a sessão esteja atualizada
        await new Promise(resolve => setTimeout(resolve, 500));

        // Redirecionar para completar cadastro da empresa (primeiro login)
        router.push('/professor/empresa/completar');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {empresaNomeFromSlug && (
        <Alert>
          <AlertDescription>
            Cadastrando para: <strong>{empresaNomeFromSlug}</strong>
          </AlertDescription>
        </Alert>
      )}

      {!empresaId && (
        <div className="space-y-2">
          <Label htmlFor="empresaNome">Nome da Empresa</Label>
          <Input
            id="empresaNome"
            type="text"
            placeholder="Nome da sua empresa ou instituição"
            value={empresaNome}
            onChange={(e) => setEmpresaNome(e.target.value)}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Você poderá completar as demais informações da empresa após o primeiro login.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Seu nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu.email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta'
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link href="/auth/professor/login" className="text-primary hover:underline">
          Faça login
        </Link>
      </div>
    </form>
  );
}
