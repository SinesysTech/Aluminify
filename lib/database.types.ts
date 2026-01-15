/* eslint-disable @typescript-eslint/no-explicit-any */
// Tipos do Supabase (schema) usados apenas para tipagem do client.
// Este projeto usa `Database` como parâmetro genérico do `create*Client`.
// Para evitar "inferência never" quando o schema não está disponível aqui,
// mantemos `Database` propositalmente permissivo.
// Se quiser tipagem completa (tabelas/colunas), regenere via Supabase CLI.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          cnpj: string | null;
          email_contato: string | null;
          telefone: string | null;
          logo_url: string | null;
          plano: "basico" | "profissional" | "enterprise";
          ativo: boolean;
          configuracoes: Json;
          created_at: string;
          updated_at: string;
          subdomain: string | null;
          dominio_customizado: string | null; // Added based on migration
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          cnpj?: string | null;
          email_contato?: string | null;
          telefone?: string | null;
          logo_url?: string | null;
          plano?: "basico" | "profissional" | "enterprise";
          ativo?: boolean;
          configuracoes?: Json;
          created_at?: string;
          updated_at?: string;
          subdomain?: string | null;
          dominio_customizado?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          slug?: string;
          cnpj?: string | null;
          email_contato?: string | null;
          telefone?: string | null;
          logo_url?: string | null;
          plano?: "basico" | "profissional" | "enterprise";
          ativo?: boolean;
          configuracoes?: Json;
          created_at?: string;
          updated_at?: string;
          subdomain?: string | null;
          dominio_customizado?: string | null;
        };
      };
      professores: {
        Row: {
          id: string;
          nome_completo: string;
          email: string;
          cpf: string | null;
          telefone: string | null;
          biografia: string | null;
          foto_url: string | null;
          especialidade: string | null;
          created_at: string;
          updated_at: string;
          empresa_id: string;
          is_admin: boolean; // Verified in schema dump
        };
        Insert: {
          id: string; // ID is required as it links to auth.users
          nome_completo: string;
          email: string;
          cpf?: string | null;
          telefone?: string | null;
          biografia?: string | null;
          foto_url?: string | null;
          especialidade?: string | null;
          created_at?: string;
          updated_at?: string;
          empresa_id: string;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          nome_completo?: string;
          email?: string;
          cpf?: string | null;
          telefone?: string | null;
          biografia?: string | null;
          foto_url?: string | null;
          especialidade?: string | null;
          created_at?: string;
          updated_at?: string;
          empresa_id?: string;
          is_admin?: boolean;
        };
      };
      // Adicione outras tabelas conforme necessário
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
