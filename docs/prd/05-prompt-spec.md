# 05 — Prompt Spec

## Philosophy
Every important prompt in this system originates from specification. A prompt without a spec is improvised text. A prompt with a spec is an engineering artifact.

---

## How prompts originate from the spec

```
Extracted knowledge
       ↓
  User objective
       ↓
  Prompt spec (structured)
       ↓
  Agent persona
       ↓
  Final prompt (spec + persona + knowledge)
       ↓
  Validation
       ↓
  Export
```

The final prompt is the materialization of three artifacts:
1. The spec defines **what** the prompt should do.
2. The persona defines **how** the prompt should behave.
3. The knowledge defines **based on what** the prompt operates.

---

## System prompts

PromptForge uses four internal prompts (meta-prompts) to operate:

### Prompt 1 — Spec Generator

| Attribute | Value |
|---|---|
| **Name** | `spec-generator` |
| **Objective** | Generate a prompt specification from extracted knowledge and user objective |
| **Role** | Senior prompt engineer |
| **Inputs** | `knowledge_chunks[]`, `user_objective` |
| **Required context** | Excerpts extracted from the submitted document |
| **Relation to persona** | None (this prompt operates before the persona) |
| **Rules** | Be specific, avoid generalities, declare constraints |
| **Guardrails** | Do not fabricate information beyond the provided knowledge |
| **Output format** | Structured JSON with fields: `objective`, `inputs`, `required_context`, `constraints`, `guardrails`, `output_format` |

**Input example**:
```json
{
  "knowledge_chunks": ["...FAQ excerpts..."],
  "user_objective": "Create a support agent for frequently asked questions"
}
```

**Output example**:
```json
{
  "objective": "Answer customer frequent questions about product configuration",
  "inputs": ["user question"],
  "required_context": "Product FAQ knowledge base",
  "constraints": ["Answer only topics covered by the FAQ", "Do not fabricate features"],
  "guardrails": ["Admit when unsure", "Suggest human contact when necessary"],
  "output_format": "Natural text response, maximum 200 words"
}
```

**Success criteria**:
- Spec is specific to the provided domain.
- Spec contains no fabricated information.
- Spec is actionable (can generate a functional prompt).

---

### Prompt 2 — Persona Generator

| Attribute | Value |
|---|---|
| **Name** | `persona-generator` |
| **Objective** | Suggest an agent persona coherent with the knowledge and spec |
| **Role** | Senior conversational designer |
| **Inputs** | `spec`, `knowledge_chunks[]`, `user_objective` |
| **Required context** | Generated spec + source knowledge |
| **Relation to persona** | This prompt GENERATES the persona, it does not use it |
| **Rules** | Persona must be concrete, not generic. Include examples and anti-examples. |
| **Guardrails** | Do not generate a persona that contradicts the spec. Do not use empty adjectives. |
| **Output format** | Structured JSON with all persona fields (see 04-agent-persona-spec.md) |

**Success criteria**:
- Persona is coherent with the domain.
- Suggested tone is justifiable.
- Examples are realistic.
- Anti-examples are useful.

---

### Prompt 3 — Final Prompt Builder

| Attribute | Value |
|---|---|
| **Name** | `prompt-builder` |
| **Objective** | Generate an operational final prompt combining spec + persona + knowledge |
| **Role** | Prompt architect |
| **Inputs** | `spec`, `persona`, `knowledge_chunks[]` |
| **Required context** | Full spec + full persona + relevant knowledge |
| **Relation to persona** | The final prompt INCORPORATES the persona as system instructions |
| **Rules** | The prompt must be self-contained. Must work without prior knowledge from the operator. |
| **Guardrails** | Include persona limits. Include output format. Include fallback rules. |
| **Output format** | Structured Markdown: System Prompt → Rules → Context → Guardrails → Output Format → Few-shot Examples |

**Output structure**:
```markdown
## System Prompt
[Main instruction with identity, role, and tone]

## Rules
[List of rules derived from spec and persona]

## Context
[Embedded relevant knowledge]

## Guardrails
[Behavioral limits]

## Output Format
[How the agent should format responses]

## Examples
[2–3 few-shot examples coherent with the persona]
```

**Success criteria**:
- Prompt fully reflects spec.
- Prompt reflects persona (tone, vocabulary, limits).
- Guardrails are present.
- Examples are coherent with the defined tone.

---

### Prompt 4 — Consistency Validator

| Attribute | Value |
|---|---|
| **Name** | `consistency-validator` |
| **Objective** | Validate that the final prompt is consistent with spec and persona |
| **Role** | Prompt quality auditor |
| **Inputs** | `spec`, `persona`, `final_prompt` |
| **Required context** | Generated spec, persona, and final prompt |
| **Relation to persona** | Verifies whether the persona is correctly represented |
| **Rules** | Evaluate each criterion individually. Be specific about failures. |
| **Guardrails** | Do not automatically approve. Always point out at least one improvement area. |
| **Output format** | JSON with criteria checklist, score, and suggestions |

**Output example**:
```json
{
  "checks": [
    {"criterion": "Tone reflected", "pass": true, "note": ""},
    {"criterion": "Prohibited vocabulary absent", "pass": true, "note": ""},
    {"criterion": "Guardrails present", "pass": true, "note": ""},
    {"criterion": "Output format defined", "pass": true, "note": ""},
    {"criterion": "Coherent examples", "pass": false, "note": "Example 2 uses informal tone inconsistent with formality 4/5"}
  ],
  "score": 80,
  "suggestions": ["Adjust Example 2 to maintain consistent formality"]
}
```

**Success criteria**:
- No criterion passes without justification.
- Failures point to specific excerpts.
- Suggestions are actionable.

---

## Versioning strategy

Each system prompt is stored with:
- Identifier: `{name}-v{version}` (e.g., `spec-generator-v1`)
- Content: full template
- Changelog: what changed in the version

In the MVP, versioning is manual via files in the `src/lib/prompts/` directory. Automated versioning is out of scope.

---

## Relationship between prompts

```
spec-generator (P1)
      ↓ generates spec
persona-generator (P2)
      ↓ generates persona
prompt-builder (P3)
      ↓ generates final prompt
consistency-validator (P4)
      ↓ validates everything
```

Each prompt feeds the next. The chain is linear and each step produces a viewable artifact.

---

## Prompt quality rubric

| Criterion | Weight | Description |
|---|---|---|
| Specificity | 25% | Is the prompt specific to the domain? |
| Completeness | 20% | Are all required sections present? |
| Persona coherence | 20% | Are tone, vocabulary, and limits respected? |
| Guardrails | 15% | Are limits explicit? |
| Examples | 10% | Are examples realistic and coherent? |
| Format | 10% | Is the output format defined? |

---

## Edge cases

| Case | Treatment |
|---|---|
| Empty knowledge | Generate generic spec with warning that context is missing |
| Vague objective | Request refinement with concrete suggestions |
| Contradictory persona | Alert in validation (e.g., "Formality 5 with greeting 'Hey!'") |
| Prompt too long | Suggest compaction, respecting model limits |
| Provider unavailable | Automatic fallback, event log |
