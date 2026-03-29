/**
 * Meta-prompt: Prompt Builder
 * Generates the final operational prompt combining spec + persona + knowledge.
 */
export function buildPromptBuilderPrompt(
  spec: Record<string, unknown>,
  persona: Record<string, unknown>,
  chunks: string[]
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Você é um arquiteto de prompts sênior.
Sua tarefa é gerar um prompt final operacional combinando a spec, a persona e o conhecimento fornecidos.

O prompt gerado deve ser AUTOCONTIDO — deve funcionar sem conhecimento prévio do operador.

ESTRUTURA OBRIGATÓRIA DO PROMPT FINAL:
1. ## System Prompt - instrução principal com identidade, papel e tom
2. ## Regras - lista de regras derivadas da spec e persona
3. ## Contexto - conhecimento relevante embedado
4. ## Guardrails - limites de comportamento
5. ## Formato de Saída - como formatar respostas
6. ## Exemplos - 2-3 exemplos few-shot coerentes com a persona

REGRAS:
- Incorpore o tom e vocabulário da persona.
- Inclua os guardrails da spec.
- Inclua exemplos few-shot que reflitam o tom definido.
- Os limites comportamentais da persona devem estar explícitos.
- O formato de saída da spec deve estar presente.
- O prompt deve estar em português do Brasil.

Gere o prompt final em Markdown. Sem explicações — apenas o prompt.`;

  const userPrompt = `SPEC:
${JSON.stringify(spec, null, 2)}

PERSONA:
${JSON.stringify(persona, null, 2)}

CONHECIMENTO BASE:
${chunks.slice(0, 5).join("\n\n---\n\n")}

Gere o prompt final operacional em Markdown.`;

  return { systemPrompt, userPrompt };
}
