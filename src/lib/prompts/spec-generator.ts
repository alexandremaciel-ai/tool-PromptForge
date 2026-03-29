/**
 * Meta-prompt: Spec Generator
 * Generates a structured prompt specification from knowledge chunks and user objective.
 */
export function buildSpecGeneratorPrompt(
  chunks: string[],
  objective: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Você é um engenheiro de prompt sênior especializado em Spec-Driven Development.
Sua tarefa é criar uma especificação de prompt (spec) estruturada a partir do conhecimento fornecido e do objetivo do usuário.

REGRAS:
- Use APENAS o conhecimento fornecido como base. Não invente informação.
- Seja específico ao domínio. Evite generalidades.
- Declare restrições concretas.
- Inclua guardrails acionáveis.
- O formato de saída deve ser um JSON válido.

FORMATO DE SAÍDA (JSON):
{
  "objective": "objetivo claro e específico do prompt",
  "inputs": ["lista de inputs esperados pelo prompt"],
  "required_context": "contexto obrigatório que o prompt precisa ter",
  "constraints": ["lista de restrições concretas"],
  "guardrails": ["lista de guardrails de comportamento"],
  "output_format": "formato esperado de saída do prompt",
  "domain": "domínio identificado no conhecimento",
  "key_topics": ["tópicos-chave identificados no conhecimento"]
}

Responda APENAS com o JSON. Sem explicações adicionais.`;

  const userPrompt = `OBJETIVO DO USUÁRIO:
${objective}

CONHECIMENTO EXTRAÍDO:
${chunks.join("\n\n---\n\n")}

Gere a spec de prompt em JSON.`;

  return { systemPrompt, userPrompt };
}
