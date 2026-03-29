# 04 — Agent Persona Spec

## Objetivo da feature
Permitir que o usuário crie, edite e exporte a identidade conversacional de um agente de IA — incluindo tom, voz, personalidade, regras de comportamento e critérios de consistência — como um artefato de engenharia testável e versionável.

---

## Problema que resolve
- Agentes de IA com tom inconsistente entre interações.
- Personas definidas em texto livre sem estrutura, sem testes e sem critérios.
- Falta de especificação formal sobre o que o agente deve e não deve fazer.
- Dificuldade de alinhar expectativas entre quem projeta o agente e quem valida a saída.

---

## Casos de uso

| Caso | Descrição |
|---|---|
| Chatbot de suporte | Persona empática, formal, objetiva, que nunca inventa informação |
| Agente de vendas | Persona persuasiva, proativa, com limites éticos claros |
| Assistente interno | Persona técnica, direta, com vocabulário específico do negócio |
| Bot de onboarding | Persona acolhedora, paciente, com guias passo a passo |
| Agente especializado | Persona autoritativa em um domínio, com tom consultivo |

---

## Campos editáveis da persona

### Identidade
| Campo | Tipo | Exemplo |
|---|---|---|
| Nome interno | Text | "Aria" |
| Papel do agente | Text | "Assistente de suporte técnico" |
| Objetivo conversacional | Text | "Resolver dúvidas de clientes sobre configuração de produto" |
| Público-alvo | Text | "Usuários não técnicos do produto SaaS" |

### Tom e personalidade
| Campo | Tipo | Opções/Range |
|---|---|---|
| Tom principal | Select | Profissional, Amigável, Técnico, Consultivo, Empático |
| Tons secundários | Multi-select | Paciente, Encorajador, Direto, Didático, Neutro |
| Personalidade | Tags | Atencioso, Preciso, Proativo, Cauteloso, Acolhedor |
| Formalidade | Slider 1-5 | 1=Muito informal, 5=Muito formal |
| Empatia | Slider 1-5 | 1=Factual puro, 5=Altamente empático |
| Objetividade | Slider 1-5 | 1=Exploratório, 5=Direto ao ponto |
| Proatividade | Slider 1-5 | 1=Apenas responde, 5=Antecipa necessidades |

### Linguagem
| Campo | Tipo | Exemplo |
|---|---|---|
| Vocabulário preferido | Chips | "configuração", "passo a passo", "vamos resolver" |
| Vocabulário proibido | Chips | "óbvio", "simplesmente", "você deveria saber" |
| Estilo de saudação | Text | "Olá! Como posso ajudar hoje?" |
| Estilo de fechamento | Text | "Se precisar de mais alguma coisa, estou aqui." |
| Idioma principal | Select | Português BR, English, Español |

### Comportamento
| Campo | Tipo | Exemplo |
|---|---|---|
| Postura diante de incerteza | Select | Admitir limites / Oferecer alternativas / Escalar para humano |
| Comportamento sem contexto | Select | Pedir mais informação / Responder com ressalva / Recusar |
| Limites comportamentais | Lista editável | "Nunca inventar dados", "Nunca prometer prazos" |
| Regras de empatia | Text | "Reconhecer frustração antes de oferecer solução" |
| Regras de persuasão | Text (opcional) | "Sugerir upgrade apenas quando resolver problema real" |
| Regras de neutralidade | Text (opcional) | "Não comparar com concorrentes" |

---

## Modelo mental da persona

A persona é composta por três camadas:

```
┌──────────────────────────────┐
│        IDENTIDADE            │  Quem é o agente, para quem fala
├──────────────────────────────┤
│     TOM & PERSONALIDADE      │  Como fala, com que intensidade
├──────────────────────────────┤
│     REGRAS & LIMITES         │  O que deve/não deve fazer
└──────────────────────────────┘
```

Cada camada influencia a próxima. Identidade define o contexto, tom define a forma, regras definem os limites.

---

## Eixos de tom

```
Formal ━━━━━━━━━━●━━━━━━━━━━ Casual
Técnico ━━━━━━━━●━━━━━━━━━━━ Leigo
Empático ━━━●━━━━━━━━━━━━━━━ Factual
Proativo ━━━━━━━━━━━●━━━━━━━ Reativo
Direto ━━━━━━━━━━━━━●━━━━━━━ Detalhado
```

O usuário ajusta esses eixos via sliders. O sistema converte para instruções textuais.

---

## Eixos de personalidade

Personalidade é definida por tags selecionáveis. Tags são agrupadas por categoria:

- **Estilo**: Atencioso, Preciso, Criativo, Prático
- **Postura**: Proativo, Cauteloso, Resiliente, Paciente
- **Energia**: Entusiasmado, Calmo, Engajado, Reservado

O usuário seleciona 3-5 tags que definem a personalidade.

---

## Adaptação por canal

A persona deve ser adaptável ao canal de uso:

| Canal | Ajustes |
|---|---|
| Chatbot web | Respostas curtas, uso de emojis opcional |
| Suporte técnico | Respostas detalhadas, passos numerados |
| Onboarding | Tom acolhedor, marcos de progresso |
| Vendas | Tom consultivo, perguntas de descoberta |
| Interno | Tom direto, jargão técnico aceito |

O canal é selecionável e ajusta parâmetros de tom automaticamente.

---

## Exemplos de respostas coerentes

### Persona: Aria (Suporte Técnico)
- Tom: Profissional, Paciente
- Formalidade: 4/5
- Empatia: 4/5

**Exemplo correto**:
> "Entendo sua frustração com esse erro. Vamos resolver juntos — pode me dizer qual versão do sistema você está usando? Assim consigo indicar os passos exatos."

**Exemplo correto** (sem contexto):
> "Não encontrei informações sobre esse tema na documentação disponível. Posso encaminhar sua dúvida para o time especializado. Enquanto isso, posso ajudar com outra questão?"

---

## Exemplos de respostas incoerentes (anti-exemplos)

**Anti-exemplo** (tom quebrado):
> "Ah, isso é fácil. Só faz X e pronto." → Quebraria o tom paciente e profissional.

**Anti-exemplo** (limite violado):
> "Garanto que isso será corrigido na próxima versão." → Viola regra de nunca prometer prazos.

**Anti-exemplo** (vocabulário proibido):
> "Você deveria saber que isso é óbvio." → Usa vocabulário proibido.

**Anti-exemplo** (empatia ausente):
> "O erro acontece por configuração incorreta do seu lado." → Ignora regra de reconhecer frustração primeiro.

---

## Critérios de avaliação da consistência

| Critério | Peso | Método |
|---|---|---|
| Tom refletido no prompt final | Alto | Análise textual automática |
| Vocabulário proibido ausente | Alto | Verificação por keyword |
| Exemplos coerentes com persona | Médio | Comparação com exemplos de referência |
| Limites respeitados | Alto | Checklist automático |
| Formalidade consistente | Médio | Análise de registro linguístico |
| Empatia presente quando esperada | Médio | Detecção de padrões empáticos |

---

## Saídas geradas pela feature

1. **persona-spec.md**: Documento Markdown com toda a especificação da persona.
2. **system-prompt.md**: Prompt de sistema baseado na persona.
3. **few-shot-examples.md**: Exemplos coerentes com o tom.
4. **persona-checklist.md**: Checklist de validação de personalidade.
5. **persona.json**: Estrutura JSON exportável da persona.
