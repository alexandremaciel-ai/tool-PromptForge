import { createClient } from "@supabase/supabase-js";

// Pegando do .env_local (Supabase Local) ou Produção
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Funções auxiliares tipadas para PromptForge
 */

export interface ProjectData {
  id?: string;
  name: string;
  objective?: string;
  spec?: Record<string, any>;
  persona?: Record<string, any>;
  final_prompt?: string;
  validation_score?: Record<string, any>;
}

/**
 * Cria um novo projeto nulo ou atualiza um existente 
 */
export async function saveProject(data: ProjectData) {
  if (data.id) {
    const { data: updated, error } = await supabase
      .from("projects")
      .update(data)
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } else {
    const { data: inserted, error } = await supabase
      .from("projects")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return inserted;
  }
}

/**
 * Insere um array de Chunks vetorizados (via Embedding providers como text-embedding-ada)
 */
export async function insertKnowledgeChunks(
  projectId: string, 
  chunks: { content: string, embedding: number[], metadata?: any }[]
) {
  const insertData = chunks.map((c) => ({
    project_id: projectId,
    content: c.content,
    embedding: c.embedding,
    metadata: c.metadata || {}
  }));

  const { error } = await supabase
    .from("knowledge_chunks")
    .insert(insertData);

  if (error) throw error;
}

/**
 * Faz a busca por paridade de Similaridade Coseno usando o banco Vetorial
 */
export async function matchKnowledge(projectId: string, queryEmbedding: number[], limit: number = 3) {
  const { data, error } = await supabase
    .rpc("match_knowledge_chunks", {
      query_embedding: queryEmbedding,
      match_count: limit,
      p_project_id: projectId
    });

  if (error) throw error;
  return data;
}

// ─── Saved Prompts ────────────────────────────────────────────────────────────

export interface SavedPromptData {
  id?: string;
  name: string;
  final_prompt: string;
  spec?: Record<string, unknown>;
  persona?: Record<string, unknown>;
  validation_score?: Record<string, unknown>;
  strategies?: string[];
  score?: number;
}

export interface SavedPromptRow extends SavedPromptData {
  id: string;
  created_at: string;
}

export async function savePrompt(data: SavedPromptData): Promise<SavedPromptRow> {
  const { data: inserted, error } = await supabase
    .from("saved_prompts")
    .insert({
      name: data.name,
      final_prompt: data.final_prompt,
      spec: data.spec ?? null,
      persona: data.persona ?? null,
      validation_score: data.validation_score ?? null,
      strategies: data.strategies ?? [],
      score: data.score ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return inserted as SavedPromptRow;
}

export async function listSavedPrompts(): Promise<SavedPromptRow[]> {
  const { data, error } = await supabase
    .from("saved_prompts")
    .select("id, name, score, strategies, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as SavedPromptRow[];
}

export async function getSavedPrompt(id: string): Promise<SavedPromptRow> {
  const { data, error } = await supabase
    .from("saved_prompts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as SavedPromptRow;
}

export async function deleteSavedPrompt(id: string): Promise<void> {
  const { error } = await supabase
    .from("saved_prompts")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

/**
 * Busca um projeto pelo ID
 */
export async function getProject(projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Busca os chunks de texto de um projeto (sem embeddings)
 */
export async function getProjectChunks(projectId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("knowledge_chunks")
    .select("content")
    .eq("project_id", projectId)
    .order("id");

  if (error) throw error;
  return (data || []).map((row: { content: string }) => row.content);
}

/**
 * Retorna os arquivos indexados de um projeto agrupados por nome,
 * com contagem de chunks por arquivo.
 */
export async function getProjectFiles(
  projectId: string
): Promise<{ filename: string; chunkCount: number }[]> {
  const { data, error } = await supabase
    .from("knowledge_chunks")
    .select("metadata")
    .eq("project_id", projectId);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    const filename: string = row.metadata?.filename || "Documento sem nome";
    counts[filename] = (counts[filename] || 0) + 1;
  }

  return Object.entries(counts).map(([filename, chunkCount]) => ({
    filename,
    chunkCount,
  }));
}

/**
 * Lista os projetos mais recentes (máx. 10)
 */
export async function listProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, objective, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

/**
 * Deleta todo o conhecimento atrelado a um ID de projeto
 */
export async function deleteProject(projectId: string) {
  // Limpa chunks manualmente pra garantir, embora se houver cascata apagaria automático
  await supabase.from("knowledge_chunks").delete().eq("project_id", projectId);
  
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) throw error;
}
