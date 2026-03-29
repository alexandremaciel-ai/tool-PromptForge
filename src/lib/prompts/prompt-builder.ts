import { PROMPT_STRATEGIES } from "./strategies";

/**
 * Meta-prompt: Prompt Builder
 * Generates the final operational prompt combining spec + persona + knowledge + active strategies.
 */
export function buildPromptBuilderPrompt(
  spec: Record<string, unknown>,
  persona: Record<string, unknown>,
  chunks: string[],
  selectedStrategyIds: string[] = []
): { systemPrompt: string; userPrompt: string } {

  // Resolve instruções das estratégias selecionadas
  const activeStrategies = PROMPT_STRATEGIES.filter((s) =>
    selectedStrategyIds.includes(s.id)
  );

  const strategiesBlock =
    activeStrategies.length > 0
      ? `\n\nESTRATÉGIAS AVANÇADAS A IMPLEMENTAR OBRIGATORIAMENTE:
O prompt final DEVE incorporar explicitamente cada uma das seguintes estratégias. Não mencione os nomes das estratégias diretamente — traduza-as em seções, regras e instruções concretas dentro do prompt.

${activeStrategies
  .map((s, i) => `${i + 1}. **${s.name}**\n${s.instruction}`)
  .join("\n\n")}`
      : "";

  const systemPrompt = `Você é um arquiteto de prompts sênior especializado em segurança e robustez.
Sua tarefa é gerar um prompt final operacional combinando spec, persona, conhecimento${activeStrategies.length > 0 ? " e estratégias avançadas de segurança" : ""}.

O prompt gerado deve ser AUTOCONTIDO — deve funcionar sem conhecimento prévio do operador.

ESTRUTURA OBRIGATÓRIA DO PROMPT FINAL:
1. ## Identidade & Papel — quem é o agente, tom e domínio
2. ## Regras Operacionais — regras derivadas da spec e persona${activeStrategies.length > 0 ? "\n3. ## Segurança & Guardrails — instruções de segurança das estratégias ativas" : "\n3. ## Guardrails — limites de comportamento"}
4. ## Contexto de Conhecimento — conhecimento relevante embedado
5. ## Formato de Saída — como estruturar respostas
6. ## Exemplos — 2-3 exemplos few-shot coerentes com a persona${strategiesBlock}

REGRAS GERAIS:
- Incorpore o tom e vocabulário da persona em todo o texto
- Inclua os guardrails definidos na spec
- Os exemplos few-shot devem refletir o tom e as restrições definidas
- O prompt deve estar em português do Brasil
- Gere apenas o prompt — sem explicações, sem comentários externos ao prompt

Gere o prompt final em Markdown.`;

  const userPrompt = `SPEC:
${JSON.stringify(spec, null, 2)}

PERSONA:
${JSON.stringify(persona, null, 2)}

CONHECIMENTO BASE:
${chunks.slice(0, 5).join("\n\n---\n\n")}${
    activeStrategies.length > 0
      ? `\n\nESTRATÉGIAS ATIVAS (${activeStrategies.length}):\n${activeStrategies.map((s) => `- ${s.name}`).join("\n")}`
      : ""
  }

Gere o prompt final operacional em Markdown.`;

  return { systemPrompt, userPrompt };
}
