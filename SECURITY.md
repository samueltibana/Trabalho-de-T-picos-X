# Checklist básico de segurança — LinguaPath

Este documento descreve como o projeto atende ao checklist de segurança solicitado.

## 1. Validação das entradas

| Entrada | Onde | Medida |
|---------|------|--------|
| Respostas do flashcard | `FlashcardLesson` | `validateAnswerInput()` — tamanho máximo, sanitização, bloqueio de padrões maliciosos |
| Usuário / senha | `AuthScreen` | `validateUsername()`, `validatePassword()` |
| Progresso (localStorage) | `parseGameState()` | Schema validation, clamp de números, allowlist de IDs de lição |
| IDs de lição | `GameContext`, `App` | `validateLessonId()` — regex estrita `lesson-X-Y` |
| Resultados de lição | `GameContext` | `validateLessonResult()` — limites de score, XP e estrelas |

Arquivos: `src/security/validation.ts`, `src/security/storage.ts`

## 2. Proteção contra injeção

**SQL injection:** o app não usa banco SQL no frontend. Para integrações futuras:

- `src/security/query.ts` — consultas **parametrizadas** (`buildParameterizedQuery`, `buildSafeApiUrl`)
- Nunca concatenar entrada do usuário em SQL ou URLs
- `detectInjectionAttempt()` bloqueia padrões SQL/XSS em entradas de texto

**XSS:** sanitização remove `<`, `>`, caracteres de controle; React escapa output por padrão.

## 3. Senhas, tokens e controle de acesso

### Senhas (hash + salt)
- **PBKDF2** com SHA-256, 120.000 iterações (`src/security/password.ts`)
- Salt aleatório de 16 bytes por usuário
- Apenas `passwordHash` + `salt` são persistidos — **nunca a senha em texto plano**
- Comparação com `timingSafeEqual` (timing-safe)

### Tokens com expiração
- Token HMAC-SHA256 assinado com `VITE_SESSION_SECRET` (`src/security/token.ts`)
- Expiração configurável via `VITE_SESSION_TTL_HOURS` (padrão: 24 h)
- Armazenado em `sessionStorage` (não persiste após fechar aba)
- Validação de assinatura + `expiresAt` em cada restauração de sessão

### Controle de acesso
- Papéis: `user` e `admin` (`src/security/accessControl.ts`)
- Permissões: `game:play`, `game:save`, `game:refill-hearts`, `admin:manage`
- Admins definidos via `VITE_ADMIN_USERS` (variável de ambiente)
- Ações do jogo verificam `can(permission)` antes de executar

## 4. Segredos fora do repositório

| Arquivo | Função |
|---------|--------|
| `.env` | Segredos reais (gitignored) |
| `.env.example` | Template sem valores sensíveis |
| `src/config/env.ts` | Leitura centralizada de variáveis |

Variáveis:
- `VITE_SESSION_SECRET` — segredo de assinatura de tokens
- `VITE_SESSION_TTL_HOURS` — TTL do token
- `VITE_ADMIN_USERS` — lista de admins
- `VITE_API_BASE_URL` — URL da API futura

> **Nota:** variáveis `VITE_*` são incluídas no bundle do cliente. Em produção real, segredos críticos devem ficar **apenas no backend**. O frontend usa estas variáveis para demonstrar o padrão; o README documenta a limitação.

## 5. Logs e dados pessoais

- Logger seguro em `src/security/logger.ts`
- Campos sensíveis (`password`, `token`, `email`, `cpf`, etc.) são substituídos por `[REDACTED]`
- Senhas **nunca** aparecem em logs
- Logs de login registram apenas username (sem senha)
- Strings longas truncadas em logs de debug
- Em produção, logs `debug` são suprimidos

## Configuração recomendada

```bash
cp .env.example .env
# Edite .env com segredo forte (mín. 32 caracteres aleatórios)
```

## Limitações conhecidas (frontend-only)

1. Autenticação client-side é adequada para demo/acadêmico; produção exige **backend** com JWT HttpOnly, rate limiting e bcrypt/argon2 no servidor.
2. `localStorage` pode ser manipulado pelo usuário — mitigado por validação de schema ao carregar.
3. `VITE_SESSION_SECRET` no bundle não é segredo real em produção — mover assinatura de tokens para o servidor.
