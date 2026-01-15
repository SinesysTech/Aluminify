create table if not exists public.chat_conversation_history (
  conversation_id uuid primary key references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_conversation_history_user_conversation_idx
  on public.chat_conversation_history (user_id, conversation_id);

create or replace function public.set_chat_conversation_history_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_chat_conversation_history_updated_at
  before update on public.chat_conversation_history
  for each row execute function public.set_chat_conversation_history_updated_at();;
