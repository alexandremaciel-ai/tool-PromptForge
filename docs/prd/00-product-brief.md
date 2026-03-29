# 00 — Product Brief

## Nome provisório
**PromptForge** — Engenharia de Prompt Orientada por Especificação

---

## Problema que resolve
Equipes que constroem agentes de IA e chatbots sofrem com três problemas recorrentes:

1. **Prompts improvisados**: prompts criados ad hoc, sem especificação, sem critérios de qualidade e sem rastreabilidade.
2. **Persona como decoração**: tom, voz e comportamento conversacional são tratados como texto solto, não como artefatos testáveis.
3. **Acoplamento a um único provider**: lógica de geração amarrada a um vendor específico, dificultando fallback e comparação.

O resultado é retrabalho, inconsistência de tom, prompts frágeis e dependência operacional de um único fornecedor.

---

## Público-alvo
- Product managers e product engineers que projetam agentes de IA.
- Prompt engineers e designers conversacionais.
- Times técnicos que precisam operacionalizar conhecimento interno em prompts estruturados.
- Decisores que querem ver, em minutos, o que IA pode fazer com o conhecimento da empresa.

---

## Proposta de valor
PromptForge transforma conhecimento bruto (PDFs, documentos, Markdown) em artefatos operacionais prontos para uso:
- Especificações de prompt com guardrails e critérios de avaliação.
- Personas de agente com tom, voz, personalidade e regras de consistência.
- Prompts finais vinculados à spec e à persona.
- Configuração multi-provider com fallback.
- Exportação em Markdown e JSON.

**Em menos de 60 segundos**, o usuário vê conhecimento virar um prompt profissional com persona definida.

---

## Demonstração de valor (wow factor)
1. O usuário faz upload de um PDF de FAQ da empresa.
2. O sistema extrai conhecimento, gera uma spec de prompt e sugere uma persona coerente.
3. O usuário ajusta tom, personalidade e regras do agente visualmente.
4. O sistema gera o prompt final, vinculado à spec e à persona, com guardrails e exemplos.
5. O usuário exporta tudo como artefato reutilizável.
6. Todo o fluxo mostra qual provider está ativo e permite trocar em tempo real.

**Sensação desejada**: "Isso já me poupa horas de trabalho."

---

## Diferencial da demo
- **Spec-Driven**: prompts nascem de especificação, não de improviso.
- **Persona como artefato de engenharia**: tom e voz são especificados, versionados e testáveis.
- **Multi-provider real**: abstração de provider com fallback, não um campo solto de API key.
- **Cadeia visível**: o usuário vê cada etapa da transformação (conhecimento → spec → persona → prompt → validação → export).

---

## Escopo do MVP

### Dentro do escopo
- Upload de arquivos (PDF, TXT, MD).
- Extração e chunking de texto.
- Geração de spec de prompt a partir do conhecimento extraído.
- Criação e edição de persona do agente (tom, voz, personalidade, regras).
- Geração de prompt final vinculado à spec e persona.
- Validação mínima (score de qualidade ou checklist de consistência).
- Configuração de provider (OpenRouter, Anthropic, MiniMax).
- Modo opcional `claude-subscription`.
- Fallback entre providers.
- Indicação visual do provider/runtime ativo.
- Export em Markdown e JSON.
- Execução local via Docker.

### Fora do escopo
- Banco vetorial em produção (Pinecone, Weaviate, etc.) — usar apenas se agregar valor demonstrável.
- Autenticação de usuários.
- Multi-tenancy.
- Deploy em cloud.
- Histórico de versões de prompts com diff.
- Integração com Slack, WhatsApp ou canais externos.
- Fine-tuning de modelos.
- Billing ou controle de custos por provider.

---

## Critérios de sucesso da demo
1. **Funcional**: o fluxo completo roda do upload ao export sem quebrar.
2. **Rápido**: o valor aparece em menos de 60 segundos após o upload.
3. **Visual**: a interface comunica transformação de trabalho e parece produto real.
4. **Multi-provider**: funciona com pelo menos um provider configurado, mostra fallback.
5. **Persona forte**: a persona do agente é percebida como feature central, não detalhe.
6. **Exportável**: artefatos gerados são reutilizáveis fora da aplicação.
7. **Gravável**: a demo está boa o suficiente para um vídeo curto de demonstração.
