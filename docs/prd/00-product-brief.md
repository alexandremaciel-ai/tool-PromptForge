# 00 — Product Brief

## Provisional name
**PromptForge** — Specification-Driven Prompt Engineering

---

## Problem it solves
Teams building AI agents and chatbots face three recurring problems:

1. **Ad-hoc prompts**: prompts created without specification, quality criteria, or traceability.
2. **Persona as decoration**: tone, voice, and conversational behavior are treated as loose text, not as testable artifacts.
3. **Single-provider coupling**: generation logic tied to a specific vendor, making fallback and comparison difficult.

The result is rework, tone inconsistency, fragile prompts, and operational dependency on a single provider.

---

## Target audience
- Product managers and product engineers designing AI agents.
- Prompt engineers and conversational designers.
- Technical teams that need to operationalize internal knowledge into structured prompts.
- Decision makers who want to see, in minutes, what AI can do with company knowledge.

---

## Value proposition
PromptForge transforms raw knowledge (PDFs, documents, Markdown) into ready-to-use operational artifacts:
- Prompt specifications with guardrails and evaluation criteria.
- Agent personas with tone, voice, personality, and consistency rules.
- Final prompts linked to the spec and persona.
- Multi-provider configuration with fallback.
- Export in Markdown and JSON.

**In less than 60 seconds**, the user sees knowledge turn into a professional prompt with a defined persona.

---

## Value demonstration (wow factor)
1. The user uploads a company FAQ PDF.
2. The system extracts knowledge, generates a prompt spec, and suggests a coherent persona.
3. The user visually adjusts tone, personality, and agent rules.
4. The system generates the final prompt, linked to the spec and persona, with guardrails and examples.
5. The user exports everything as a reusable artifact.
6. The entire flow shows which provider is active and allows switching in real time.

**Desired feeling**: "This already saves me hours of work."

---

## Demo differentiators
- **Spec-Driven**: prompts originate from specification, not improvisation.
- **Persona as an engineering artifact**: tone and voice are specified, versioned, and testable.
- **Real multi-provider**: provider abstraction with fallback, not a loose API key field.
- **Visible chain**: the user sees each transformation step (knowledge → spec → persona → prompt → validation → export).

---

## MVP scope

### In scope
- File upload (PDF, TXT, MD).
- Text extraction and chunking.
- Prompt spec generation from extracted knowledge.
- Agent persona creation and editing (tone, voice, personality, rules).
- Final prompt generation linked to spec and persona.
- Minimum validation (quality score or consistency checklist).
- Provider configuration (OpenRouter, Anthropic, MiniMax).
- Optional `claude-subscription` mode.
- Fallback between providers.
- Visual indication of the active provider/runtime.
- Export in Markdown and JSON.
- Local execution via Docker.

### Out of scope
- Production vector database (Pinecone, Weaviate, etc.) — use only if it adds demonstrable value.
- User authentication.
- Multi-tenancy.
- Cloud deployment.
- Prompt version history with diff.
- Integration with Slack, WhatsApp, or external channels.
- Model fine-tuning.
- Billing or per-provider cost control.

---

## Demo success criteria
1. **Functional**: the full flow runs from upload to export without breaking.
2. **Fast**: value appears in less than 60 seconds after upload.
3. **Visual**: the interface communicates work transformation and looks like a real product.
4. **Multi-provider**: works with at least one configured provider, shows fallback.
5. **Strong persona**: the agent persona is perceived as a core feature, not a detail.
6. **Exportable**: generated artifacts are reusable outside the application.
7. **Recordable**: the demo is good enough for a short demonstration video.
