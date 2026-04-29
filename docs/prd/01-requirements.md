# 01 — Requirements

## System objective
Allow a user to transform raw knowledge into operational prompt engineering artifacts, including specifications, agent personas, final prompts with guardrails, validations, and exports — using configurable model providers with fallback.

---

## Functional requirements

### FR01 — Knowledge ingestion
- The system must accept file uploads in PDF, TXT, and Markdown formats.
- The system must extract text from uploaded files.
- The system must segment text into predictable chunks.
- The system must display immediate feedback on the upload (file name, size, status).
- The system must display extracted excerpts for transparency.

### FR02 — Prompt spec generation
- The system must generate a prompt specification from the extracted knowledge.
- The spec must contain: objective, inputs, required context, constraints, guardrails, and output format.
- The user must be able to edit the generated spec before proceeding.

### FR03 — Agent persona creation
- The system must allow persona creation and editing with the following minimum fields:
  - Internal name
  - Agent role
  - Conversational objective
  - Target audience
  - Main tone and secondary tones
  - Personality
  - Formality level (scale 1–5)
  - Empathy level (scale 1–5)
  - Objectivity level (scale 1–5)
  - Preferred vocabulary
  - Prohibited vocabulary
  - Stance on uncertainty
  - Behavioral limits
  - Response examples (good and bad)
- The system must be able to suggest a persona automatically based on extracted knowledge.
- The user must be able to adjust the suggested persona.

### FR04 — Final prompt generation
- The system must generate a final prompt linked to the spec and persona.
- The generated prompt must contain: role, objective, rules, context, guardrails, output format, and few-shot examples.
- The system must indicate which knowledge excerpts support the prompt.

### FR05 — Validation and score
- The system must display at least one validation of the generated prompt.
- Accepted options: consistency checklist, quality score, or list of satisfied guardrails.
- The validation must verify coherence between persona and prompt.

### FR06 — Provider configuration
- The system must allow provider configuration: OpenRouter, Anthropic, MiniMax.
- The system must support the optional `claude-subscription` mode.
- The system must allow provider selection per stage or globally.
- The system must display the active provider.
- The system must execute fallback when the primary provider fails.
- The system must display a clear message when no provider is configured.

### FR07 — Export
- The system must export artifacts in Markdown.
- The system must export artifacts in JSON.
- The export must include: spec, persona, final prompt, and validation.

### FR08 — Runtime indication
- The interface must show which provider/runtime is active at each moment.
- The interface must indicate fallback when it occurs.

---

## Non-functional requirements

### NFR01 — Performance
- Spec generation must start in less than 3 seconds after submission.
- File upload must accept up to 10 MB per file.
- The interface must provide loading feedback during generation.

### NFR02 — Security
- Secrets must never be exposed on the frontend.
- Authenticated calls to providers must go through the backend.
- The project must include `.env.example` without real keys.
- The system must function with at least one configured provider.

### NFR03 — Usability
- The interface must be usable without a manual.
- The main flow must be completable in less than 5 clicks after upload.
- Loading, error, and empty states must have explicit visual treatment.

### NFR04 — Portability
- The application must run with Docker and docker-compose.
- The local bootstrap must require only `docker-compose up`.
- The application must work on macOS and Linux.

### NFR05 — Maintainability
- Modular code with clear separation between frontend, backend, and provider layer.
- Descriptive file and function names.
- No unnecessary abstractions.

---

## Constraints
- No user authentication in the MVP.
- No long-term persistence — data exists during the session.
- No cloud deployment — local execution only.
- Maximum of 3 files per upload session.
- The `claude-subscription` mode is optional and not guaranteed.

---

## Acceptance criteria

| Criterion | Condition |
|---|---|
| Upload works | PDF, TXT, and MD are accepted and text is extracted |
| Spec is generated | Spec contains objective, inputs, constraints, and format |
| Persona is creatable | All minimum fields are editable |
| Final prompt is generated | Prompt reflects spec + persona |
| Validation exists | At least one validation mechanism works |
| Provider is configurable | At least one provider works via API key |
| Fallback works | System tries alternative provider on failure |
| Export works | Markdown and JSON are generated correctly |
| Docker runs | `docker-compose up` starts the application |

---

## Main use cases

### UC01 — Generate prompt from document
**Actor**: Prompt engineer  
**Pre-condition**: At least one provider configured  
**Flow**: Upload → Extraction → Spec → Persona → Prompt → Validation → Export  
**Post-condition**: Exportable artifacts generated  

### UC02 — Create agent persona
**Actor**: Conversational designer  
**Pre-condition**: Knowledge extracted or manually entered  
**Flow**: Define persona fields → Generate persona-spec → Generate system prompt → Validate consistency  
**Post-condition**: Persona specified with examples and anti-examples  

### UC03 — Configure provider
**Actor**: Technical user  
**Pre-condition**: At least one API key available  
**Flow**: Access configuration → Enter API key → Select provider → Test connection → Save  
**Post-condition**: Active provider displayed in the interface  

### UC04 — Export artifacts
**Actor**: Any user  
**Pre-condition**: Final prompt generated  
**Flow**: Select format → Export  
**Post-condition**: MD or JSON file downloaded  

---

## Explicit assumptions
1. The user has at least one API key from one of the supported providers.
2. Submitted documents are in Portuguese or English.
3. The local environment has Docker installed.
4. The user has basic familiarity with generative AI concepts.
5. An internet connection is available for API calls to providers.
6. The providers' models support generation in Brazilian Portuguese.
7. Output quality depends directly on the quality of the submitted knowledge.
