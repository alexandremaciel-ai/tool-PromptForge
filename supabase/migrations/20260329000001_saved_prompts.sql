-- Tabela de Prompts Salvos pelo Usuário
-- Armazena prompts validados com nome, artefatos completos e estratégias usadas.

CREATE TABLE IF NOT EXISTS public.saved_prompts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  final_prompt text NOT NULL,
  spec        jsonb,
  persona     jsonb,
  validation_score jsonb,
  strategies  jsonb DEFAULT '[]'::jsonb,   -- array de strategy IDs usados
  score       integer DEFAULT 0,            -- cache do score para listagem rápida
  created_at  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS saved_prompts_created_at_idx
  ON public.saved_prompts (created_at DESC);
