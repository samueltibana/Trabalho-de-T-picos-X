# LinguaPath — Flashcards de Idiomas

App gamificado de flashcards estilo Duolingo, construído com React e Tailwind CSS.

## Funcionalidades

- **Tabuleiro de progresso** com unidades e lições desbloqueáveis
- **Sistema de vidas** (corações) — erro remove 1 vida
- **XP, níveis e sequência diária**
- **Missões diárias** com barra de progresso
- **Flashcards** com dificuldade crescente:
  - Múltipla escolha (PT → EN e EN → PT)
  - Digitação de resposta
  - Modo reverso (mais difícil)
- **Persistência** do progresso via localStorage

## MOB-03 — Flashcards com repetição espaçada

| Requisito | Implementação |
|-----------|---------------|
| Criar flashcard (frente, verso, exemplo) | Aba **Criar** → `CreateFlashcardForm` |
| Sessão diária com acertei/errei | Aba **Revisão** → `DailyReviewSession` |
| Algoritmo SRS | `src/utils/srs.ts` — erro: 1 dia · acertos: 3 → 7 → 14 → 28… dias |
| Estatísticas | Aba **Stats** — acertos, erros, pendentes, gráfico 14 dias |
| Persistência offline | `localStorage` por usuário (`linguapath-deck:{username}`) |

O **Caminho** gamificado (lições fixas) permanece como modo extra; o MOB-03 usa flashcards criados pelo usuário.

## Segurança

Consulte [SECURITY.md](./SECURITY.md) para o checklist completo:

- Validação de entradas (respostas, login, progresso)
- Proteção contra injeção (SQL/XSS) e queries parametrizadas
- Senhas com PBKDF2 + salt; tokens HMAC com expiração
- Controle de acesso por papéis (`user` / `admin`)
- Segredos via `.env` (copie de `.env.example`)
- Logger que não expõe dados sensíveis

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

## Scripts

| Comando         | Descrição              |
|-----------------|------------------------|
| `npm run dev`   | Servidor de desenvolvimento |
| `npm run build` | Build de produção      |
| `npm run preview` | Preview do build     |

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
