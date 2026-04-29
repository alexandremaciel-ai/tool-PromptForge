# 02 — User Flow

## Flow overview

```
[Upload] → [Extraction] → [Spec] → [Persona] → [Prompt] → [Validation] → [Export]
                                                    ↑
                                         [Provider Config]
```

The flow is linear with a lateral layer of provider configuration accessible at any time.

---

## Main end-to-end flow

### Step 1 — Landing and initial configuration
**Screen**: Main screen (single-page application with progressive sections)

1. User opens the application.
2. System checks if providers are configured.
3. If no provider configured → displays configuration banner with clear CTA.
4. If provider configured → displays active provider indicator in the header.
5. User can open the provider configuration side panel at any time.

**Input**: None  
**Output**: Resolved provider state  

---

### Step 2 — Knowledge upload
**Section**: Upload area (drag & drop + file selection button)

1. User drags or selects files (PDF, TXT, MD).
2. System validates type and size (max. 10 MB per file, max. 3 files).
3. System displays file card: name, type, size, icon.
4. System starts text extraction and shows progress bar.
5. After extraction, system displays preview of extracted excerpts with chunk count.

**Input**: File(s)  
**Output**: Extracted text + metadata + chunks  

**Error**: Invalid file → message: "Unsupported format. Use PDF, TXT, or MD."  
**Error**: File too large → message: "File exceeds the 10 MB limit."  
**Error**: Extraction failure → message: "Could not extract text from this file. Check if the PDF contains selectable text."  

**Empty state**: "Drag a file or click to select. Accepted formats: PDF, TXT, Markdown."  

---

### Step 3 — Objective definition
**Section**: Text field with clear label

1. System suggests an objective based on the extracted content.
2. User can accept the suggestion or edit freely.
3. Required field to proceed.

**Input**: Free text describing the prompt objective  
**Output**: Defined objective  

**Example suggestion**: "Create a support agent that answers frequently asked questions based on the submitted documentation."

---

### Step 4 — Spec generation ✨ (wow moment #1)
**Section**: Generated spec card with progressive loading

1. User clicks "Generate Spec".
2. System sends knowledge + objective to the active provider.
3. Loading: skeleton with pulse animation while generating.
4. System displays structured spec:
   - Prompt objective
   - Expected inputs
   - Required context
   - Constraints
   - Guardrails
   - Expected output format
5. User can edit any spec field.
6. Active provider indicator visible during generation.

**Input**: Extracted knowledge + objective  
**Output**: Editable prompt spec  

**Loading**: Skeleton with sections appearing progressively.  
**Provider error**: "Could not connect to provider [name]. Trying fallback..." → tries alternative provider → if it fails: "No provider available. Check your configuration."  

---

### Step 5 — Persona creation ✨ (wow moment #2)
**Section**: Visual persona panel with interactive fields

1. System suggests persona based on knowledge and spec.
2. User views and edits:
   - Agent name
   - Role
   - Main tone (visual selector: Formal ↔ Casual)
   - Personality (selectable tags)
   - Formality (slider 1–5)
   - Empathy (slider 1–5)
   - Objectivity (slider 1–5)
   - Preferred vocabulary (editable chips)
   - Prohibited vocabulary (editable chips)
   - Stance on uncertainty (dropdown)
   - Behavioral limits (editable list)
3. Examples section: system generates examples of good and bad responses based on persona.
4. User can edit examples.

**Input**: Spec + knowledge  
**Output**: Fully specified persona  

**Empty state**: "Define your agent's identity. The system will suggest a persona based on the knowledge and spec."  

---

### Step 6 — Final prompt generation ✨ (wow moment #3)
**Section**: Generated prompt card with syntax highlighting

1. User clicks "Generate Final Prompt".
2. System combines spec + persona + knowledge.
3. Loading: skeleton with animation.
4. System displays formatted final prompt:
   - Complete system prompt
   - Integrated guardrails
   - Few-shot examples derived from persona
   - References to source knowledge
5. Active provider indicator.
6. User can copy, edit, or regenerate.

**Input**: Spec + persona + knowledge  
**Output**: Final prompt ready for use  

---

### Step 7 — Validation
**Section**: Validation card with visual indicators

1. System runs consistency checklist automatically:
   - Persona reflected in prompt? ✅/❌
   - Guardrails present? ✅/❌
   - Output format defined? ✅/❌
   - Examples consistent with tone? ✅/❌
   - Behavioral limits respected? ✅/❌
   - Prohibited vocabulary absent? ✅/❌
2. Overall score: percentage or A/B/C grade.
3. Improvement suggestions, when applicable.

**Input**: Final prompt + persona + spec  
**Output**: Validation report  

---

### Step 8 — Export
**Section**: Export buttons

1. User chooses format: Markdown or JSON.
2. System generates file with all artifacts:
   - Spec
   - Persona
   - Final prompt
   - Validation
3. Automatic download.

**Input**: Generated artifacts  
**Output**: .md or .json file  

---

## Side flow — Provider configuration

Accessible at any time via the gear icon in the header.

1. User opens side panel/modal for configuration.
2. Views list of providers with status:
   - OpenRouter: ✅ Configured / ⚠️ Not configured
   - Anthropic: ✅ Configured / ⚠️ Not configured
   - MiniMax: ✅ Configured / ⚠️ Not configured
   - Claude Subscription: ✅ Available / ⚠️ Unavailable
3. For each provider, can enter API key (masked on frontend).
4. Can select default provider and fallback provider.
5. Can test connection.
6. Save.

**Note**: API keys are sent to the backend and never stored on the frontend.

---

## Interface states

| State | Behavior |
|---|---|
| Empty | Guidance message with CTA |
| Loading | Skeleton with pulse animation |
| Success | Content displayed with smooth transition |
| Error | Red message with suggested action |
| No provider | Yellow banner with link to configuration |
| Active fallback | Badge indicating "Using [provider] (fallback)" |

---

## Wow moments

| # | Moment | Description |
|---|---|---|
| 1 | Spec appears | Knowledge becomes a structured specification in seconds |
| 2 | Persona takes shape | Sliders, tags, and examples bring the agent to life |
| 3 | Final prompt emerges | Everything connects into a professional ready-to-use prompt |
| 4 | Validation confirms | Green checklist shows everything is coherent |
| 5 | Instant export | Artifacts ready to use in the real world |
