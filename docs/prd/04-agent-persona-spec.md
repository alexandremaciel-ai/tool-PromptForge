# 04 — Agent Persona Spec

## Feature objective
Allow the user to create, edit, and export the conversational identity of an AI agent — including tone, voice, personality, behavioral rules, and consistency criteria — as a testable and versionable engineering artifact.

---

## Problem it solves
- AI agents with inconsistent tone across interactions.
- Personas defined in loose text without structure, tests, or criteria.
- Lack of formal specification about what the agent should and should not do.
- Difficulty aligning expectations between those who design the agent and those who validate the output.

---

## Use cases

| Case | Description |
|---|---|
| Support chatbot | Empathetic, formal, objective persona that never fabricates information |
| Sales agent | Persuasive, proactive persona with clear ethical limits |
| Internal assistant | Technical, direct persona with business-specific vocabulary |
| Onboarding bot | Welcoming, patient persona with step-by-step guides |
| Specialized agent | Authoritative persona in a domain, with consultative tone |

---

## Editable persona fields

### Identity
| Field | Type | Example |
|---|---|---|
| Internal name | Text | "Aria" |
| Agent role | Text | "Technical support assistant" |
| Conversational objective | Text | "Resolve customer questions about product configuration" |
| Target audience | Text | "Non-technical users of the SaaS product" |

### Tone and personality
| Field | Type | Options/Range |
|---|---|---|
| Main tone | Select | Professional, Friendly, Technical, Consultative, Empathetic |
| Secondary tones | Multi-select | Patient, Encouraging, Direct, Didactic, Neutral |
| Personality | Tags | Attentive, Precise, Proactive, Cautious, Welcoming |
| Formality | Slider 1–5 | 1=Very informal, 5=Very formal |
| Empathy | Slider 1–5 | 1=Pure factual, 5=Highly empathetic |
| Objectivity | Slider 1–5 | 1=Exploratory, 5=Straight to the point |
| Proactivity | Slider 1–5 | 1=Only responds, 5=Anticipates needs |

### Language
| Field | Type | Example |
|---|---|---|
| Preferred vocabulary | Chips | "configuration", "step by step", "let's fix this" |
| Prohibited vocabulary | Chips | "obvious", "simply", "you should know" |
| Greeting style | Text | "Hello! How can I help you today?" |
| Closing style | Text | "If you need anything else, I'm here." |
| Primary language | Select | English, Português BR, Español |

### Behavior
| Field | Type | Example |
|---|---|---|
| Stance on uncertainty | Select | Admit limits / Offer alternatives / Escalate to human |
| Behavior without context | Select | Ask for more information / Answer with caveat / Decline |
| Behavioral limits | Editable list | "Never fabricate data", "Never promise deadlines" |
| Empathy rules | Text | "Acknowledge frustration before offering a solution" |
| Persuasion rules | Text (optional) | "Suggest upgrade only when it solves a real problem" |
| Neutrality rules | Text (optional) | "Do not compare with competitors" |

---

## Persona mental model

The persona is composed of three layers:

```
┌──────────────────────────────┐
│          IDENTITY            │  Who the agent is, who it speaks to
├──────────────────────────────┤
│     TONE & PERSONALITY       │  How it speaks, with what intensity
├──────────────────────────────┤
│      RULES & LIMITS          │  What it should/should not do
└──────────────────────────────┘
```

Each layer influences the next. Identity defines the context, tone defines the form, rules define the limits.

---

## Tone axes

```
Formal ━━━━━━━━━━●━━━━━━━━━━ Casual
Technical ━━━━━━━━●━━━━━━━━━━━ Layman
Empathetic ━━━●━━━━━━━━━━━━━━━ Factual
Proactive ━━━━━━━━━━━●━━━━━━━ Reactive
Direct ━━━━━━━━━━━━━●━━━━━━━ Detailed
```

The user adjusts these axes via sliders. The system converts them to textual instructions.

---

## Personality axes

Personality is defined by selectable tags. Tags are grouped by category:

- **Style**: Attentive, Precise, Creative, Practical
- **Posture**: Proactive, Cautious, Resilient, Patient
- **Energy**: Enthusiastic, Calm, Engaged, Reserved

The user selects 3–5 tags that define the personality.

---

## Channel adaptation

The persona must be adaptable to the channel of use:

| Channel | Adjustments |
|---|---|
| Web chatbot | Short responses, optional emoji use |
| Technical support | Detailed responses, numbered steps |
| Onboarding | Welcoming tone, progress milestones |
| Sales | Consultative tone, discovery questions |
| Internal | Direct tone, technical jargon accepted |

The channel is selectable and automatically adjusts tone parameters.

---

## Examples of coherent responses

### Persona: Aria (Technical Support)
- Tone: Professional, Patient
- Formality: 4/5
- Empathy: 4/5

**Correct example**:
> "I understand your frustration with this error. Let's solve it together — can you tell me which version of the system you're using? That way I can give you the exact steps."

**Correct example** (without context):
> "I couldn't find information about this topic in the available documentation. I can forward your question to the specialized team. In the meantime, can I help with anything else?"

---

## Examples of incoherent responses (anti-examples)

**Anti-example** (broken tone):
> "Ah, that's easy. Just do X and you're done." → Would break the patient and professional tone.

**Anti-example** (limit violated):
> "I guarantee this will be fixed in the next version." → Violates the rule of never promising deadlines.

**Anti-example** (prohibited vocabulary):
> "You should know that this is obvious." → Uses prohibited vocabulary.

**Anti-example** (absent empathy):
> "The error occurs due to incorrect configuration on your end." → Ignores the rule of acknowledging frustration first.

---

## Consistency evaluation criteria

| Criterion | Weight | Method |
|---|---|---|
| Tone reflected in final prompt | High | Automatic textual analysis |
| Prohibited vocabulary absent | High | Keyword verification |
| Examples coherent with persona | Medium | Comparison with reference examples |
| Limits respected | High | Automatic checklist |
| Consistent formality | Medium | Linguistic register analysis |
| Empathy present when expected | Medium | Empathetic pattern detection |

---

## Outputs generated by the feature

1. **persona-spec.md**: Markdown document with the full persona specification.
2. **system-prompt.md**: System prompt based on the persona.
3. **few-shot-examples.md**: Examples coherent with the tone.
4. **persona-checklist.md**: Personality validation checklist.
5. **persona.json**: Exportable JSON structure of the persona.
