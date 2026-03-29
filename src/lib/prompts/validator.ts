/**
 * Meta-prompt: Consistency Validator
 * Validates that the final prompt is consistent with spec and persona.
 */
export function buildValidatorPrompt(
  spec: Record<string, unknown>,
  persona: Record<string, unknown>,
  finalPrompt: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Você é um auditor de qualidade de prompts.
Sua tarefa é validar que o prompt final é consistente com a spec e a persona fornecidas.

CRITÉRIOS DE AVALIAÇÃO:
1. Tom refletido - o prompt reflete o tom definido na persona?
2. Vocabulário proibido ausente - nenhuma palavra proibida aparece?
3. Guardrails presentes - os guardrails da spec estão no prompt?
4. Formato de saída definido - o formato está especificado?
5. Exemplos coerentes - os exemplos refletem o tom da persona?
6. Limites respeitados - os limites comportamentais estão explícitos?

REGRAS:
- Avalie CADA critério individualmente.
- Seja ESPECÍFICO nas falhas — cite trechos.
- Não aprove automaticamente.
- Sempre sugira pelo menos UM ponto de melhoria.

FORMATO DE SAÍDA (JSON):
{
  "checks": [
    {"criterion": "nome do critério", "pass": true/false, "note": "observação específica"}
  ],
  "score": 0-100,
  "suggestions": ["sugestão acionável de melhoria"]
}

Responda APENAS com o JSON.`;

  const userPrompt = `SPEC:
${JSON.stringify(spec, null, 2)}

PERSONA:
${JSON.stringify(persona, null, 2)}

PROMPT FINAL:
${finalPrompt}

Valide a consistência e retorne o JSON.`;

  return { systemPrompt, userPrompt };
}
