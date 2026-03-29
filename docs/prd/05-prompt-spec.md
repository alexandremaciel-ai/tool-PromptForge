# 05 — Prompt Spec

## Filosofia
Todo prompt importante neste sistema nasce de especificação. Um prompt sem spec é texto improvisado. Um prompt com spec é artefato de engenharia.

---

## Como prompts nascem da spec

```
Conhecimento extraído
       ↓
  Objetivo do usuário
       ↓
  Spec de prompt (estruturada)
       ↓
  Persona do agente
       ↓
  Prompt final (spec + persona + conhecimento)
       ↓
  Validação
       ↓
  Export
```

O prompt final é a materialização de três artefatos:
1. A spec define **o que** o prompt deve fazer.
2. A persona define **como** o prompt deve se comportar.
3. O conhecimento define **com base em que** o prompt opera.

---

## Prompts do sistema

O PromptForge usa quatro prompts internos (meta-prompts) para operar:

### Prompt 1 — Gerador de Spec

| Atributo | Valor |
|---|---|
| **Nome** | `spec-generator` |
| **Objetivo** | Gerar especificação de prompt a partir de conhecimento extraído e objetivo do usuário |
| **Papel** | Engenheiro de prompt sênior |
| **Inputs** | `knowledge_chunks[]`, `user_objective` |
| **Contexto obrigatório** | Trechos extraídos do documento enviado |
| **Relação com persona** | Nenhuma (este prompt opera antes da persona) |
| **Regras** | Ser específico, evitar generalidades, declarar restrições |
| **Guardrails** | Não inventar informação além do conhecimento fornecido |
| **Formato de saída** | JSON estruturado com campos: `objective`, `inputs`, `required_context`, `constraints`, `guardrails`, `output_format` |

**Exemplo de entrada**:
```json
{
  "knowledge_chunks": ["...trechos de FAQ..."],
  "user_objective": "Criar agente de suporte para dúvidas frequentes"
}
```

**Exemplo de saída**:
```json
{
  "objective": "Responder dúvidas frequentes de clientes sobre configuração do produto",
  "inputs": ["pergunta do usuário"],
  "required_context": "Base de conhecimento da FAQ do produto",
  "constraints": ["Responder apenas sobre temas cobertos pela FAQ", "Não inventar funcionalidades"],
  "guardrails": ["Admitir quando não souber", "Sugerir contato humano quando necessário"],
  "output_format": "Resposta em texto natural, máximo 200 palavras"
}
```

**Critérios de sucesso**:
- Spec é específica ao domínio fornecido.
- Spec não contém informação inventada.
- Spec é acionável (pode gerar prompt funcional).

---

### Prompt 2 — Gerador de Persona

| Atributo | Valor |
|---|---|
| **Nome** | `persona-generator` |
| **Objetivo** | Sugerir persona de agente coerente com o conhecimento e a spec |
| **Papel** | Designer conversacional sênior |
| **Inputs** | `spec`, `knowledge_chunks[]`, `user_objective` |
| **Contexto obrigatório** | Spec gerada + conhecimento-fonte |
| **Relação com persona** | Este prompt GERA a persona, não a usa |
| **Regras** | Persona deve ser concreta, não genérica. Incluir exemplos e anti-exemplos. |
| **Guardrails** | Não gerar persona que contradiga a spec. Não usar adjetivos vazios. |
| **Formato de saída** | JSON estruturado com todos os campos da persona (ver 04-agent-persona-spec.md) |

**Critérios de sucesso**:
- Persona é coerente com o domínio.
- Tom sugerido é justificável.
- Exemplos são realistas.
- Anti-exemplos são úteis.

---

### Prompt 3 — Construtor de Prompt Final

| Atributo | Valor |
|---|---|
| **Nome** | `prompt-builder` |
| **Objetivo** | Gerar prompt final operacional combinando spec + persona + conhecimento |
| **Papel** | Arquiteto de prompts |
| **Inputs** | `spec`, `persona`, `knowledge_chunks[]` |
| **Contexto obrigatório** | Spec completa + persona completa + conhecimento relevante |
| **Relação com persona** | O prompt final INCORPORA a persona como system instructions |
| **Regras** | O prompt deve ser autocontido. Deve funcionar sem conhecimento prévio do operador. |
| **Guardrails** | Incluir limites da persona. Incluir formato de saída. Incluir regras de fallback. |
| **Formato de saída** | Markdown estruturado: System Prompt → Regras → Context → Guardrails → Output Format → Few-shot Examples |

**Estrutura da saída**:
```markdown
## System Prompt
[Instrução principal com identidade, papel e tom]

## Regras
[Lista de regras derivadas da spec e persona]

## Contexto
[Conhecimento relevante embedado]

## Guardrails
[Limites de comportamento]

## Formato de saída
[Como o agente deve formatar respostas]

## Exemplos
[2-3 exemplos few-shot coerentes com a persona]
```

**Critérios de sucesso**:
- Prompt reflete spec integralmente.
- Prompt reflete persona (tom, vocabulário, limites).
- Guardrails estão presentes.
- Exemplos são coerentes com tom definido.

---

### Prompt 4 — Validador de Consistência

| Atributo | Valor |
|---|---|
| **Nome** | `consistency-validator` |
| **Objetivo** | Validar que o prompt final é consistente com spec e persona |
| **Papel** | Auditor de qualidade de prompts |
| **Inputs** | `spec`, `persona`, `final_prompt` |
| **Contexto obrigatório** | Spec, persona e prompt final gerados |
| **Relação com persona** | Verifica se a persona está corretamente representada |
| **Regras** | Avaliar cada critério individualmente. Ser específico nas falhas. |
| **Guardrails** | Não aprovar automaticamente. Sempre apontar pelo menos um ponto de melhoria. |
| **Formato de saída** | JSON com checklist de critérios, score e sugestões |

**Exemplo de saída**:
```json
{
  "checks": [
    {"criterion": "Tom refletido", "pass": true, "note": ""},
    {"criterion": "Vocabulário proibido ausente", "pass": true, "note": ""},
    {"criterion": "Guardrails presentes", "pass": true, "note": ""},
    {"criterion": "Formato de saída definido", "pass": true, "note": ""},
    {"criterion": "Exemplos coerentes", "pass": false, "note": "Exemplo 2 usa tom informal inconsistente com formalidade 4/5"}
  ],
  "score": 80,
  "suggestions": ["Ajustar Exemplo 2 para manter formalidade consistente"]
}
```

**Critérios de sucesso**:
- Nenhum critério passa sem justificativa.
- Falhas apontam trechos específicos.
- Sugestões são acionáveis.

---

## Estratégia de versionamento

Cada prompt do sistema é armazenado com:
- Identificador: `{nome}-v{versão}` (ex: `spec-generator-v1`)
- Conteúdo: template completo
- Changelog: o que mudou na versão

No MVP, o versionamento é manual via arquivos no diretório `src/lib/prompts/`. Versionamento automatizado está fora de escopo.

---

## Relação entre prompts

```
spec-generator (P1)
      ↓ gera spec
persona-generator (P2)
      ↓ gera persona
prompt-builder (P3)
      ↓ gera prompt final
consistency-validator (P4)
      ↓ valida tudo
```

Cada prompt alimenta o próximo. A cadeia é linear e cada etapa produz artefato visualizável.

---

## Rubrica de qualidade de prompts

| Critério | Peso | Descrição |
|---|---|---|
| Especificidade | 25% | O prompt é específico ao domínio? |
| Completude | 20% | Todas as seções obrigatórias estão presentes? |
| Coerência com persona | 20% | Tom, vocabulário e limites são respeitados? |
| Guardrails | 15% | Limites estão explícitos? |
| Exemplos | 10% | Exemplos são realistas e coerentes? |
| Formato | 10% | O formato de saída está definido? |

---

## Casos limite

| Caso | Tratamento |
|---|---|
| Conhecimento vazio | Gerar spec genérica com aviso de que falta contexto |
| Objetivo vago | Pedir refinamento com sugestões concretas |
| Persona contraditória | Alertar na validação (ex: "Formalidade 5 com saudação 'E aí!'") |
| Prompt muito longo | Sugerir compactação, respeitando limites do modelo |
| Provider indisponível | Fallback automático, log do evento |
