import { notFound } from 'next/navigation';
import { getDatabaseClient } from '@/app/shared/core/database/database';
import { TenantContextProvider } from './tenant-context';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant: tenantSlug } = await params;

  // Validate that tenant exists
  // Use admin client to bypass RLS - checking if tenant exists is not sensitive
  // and RLS on empresas table doesn't include alunos (only usuarios)
  const adminClient = getDatabaseClient();

  const { data: empresa, error } = await adminClient
    .from('empresas')
    .select('id, nome, slug')
    .eq('slug', tenantSlug)
    .eq('ativo', true)
    .maybeSingle();

  if (error || !empresa) {
    console.error('[TenantLayout] Tenant not found:', tenantSlug, error?.message);
    notFound();
  }

  return (
    <TenantContextProvider
      empresaId={empresa.id}
      empresaSlug={empresa.slug}
      empresaNome={empresa.nome}
    >
      {children}
    </TenantContextProvider>
  );
}
