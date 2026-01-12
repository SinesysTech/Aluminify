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
  | Json[]

export type Database = any

