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
