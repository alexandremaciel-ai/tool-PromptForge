-- Habilita a extensão de vetores
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de Projetos/Sessões (Armazena os metadados brutos e artefatos finais)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'Novo Projeto',
  objective text,
  spec jsonb,
  persona jsonb,
  final_prompt text,
  validation_score jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Knowledge Chunks (Os fragmentos dos PDFs/arquivos com seus embeddings)
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  content text NOT NULL, -- O texto cru extraído do chunk
  embedding vector(1536), -- 1536 dimensões é padrão para a maioria dos embeddings OpenAI ou Anthropic 
  metadata jsonb DEFAULT '{}'::jsonb, -- Para guardar nome do arquivo, página, etc.
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexação otimizada para os Vetores (usando HNSW)
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx 
ON public.knowledge_chunks USING hnsw (embedding vector_cosine_ops);

-- Cria uma Função SQL (RPC) para fazer a Busca por Similaridade
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 5, /* Retorna os 5 melhores chunks */
  p_project_id uuid DEFAULT NULL
) 
RETURNS TABLE (
  id uuid,
  project_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.project_id,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  WHERE p_project_id IS NULL OR kc.project_id = p_project_id
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
