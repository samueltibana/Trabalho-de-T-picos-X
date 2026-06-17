import { useState } from 'react'
import { useAuth } from '../store/AuthContext'

type AuthMode = 'login' | 'register'

export function AuthScreen() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result =
      mode === 'login' ? await login(username, password) : await register(username, password)

    if (!result.ok) setError(result.error ?? 'Erro desconhecido.')
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="duo-card w-full max-w-md animate-bounce-in p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-duo-green text-3xl shadow-[0_4px_0_#46a302]">
            🦉
          </div>
          <h1 className="text-2xl font-black text-duo-text">LinguaPath</h1>
          <p className="mt-1 text-sm text-duo-gray">
            {mode === 'login' ? 'Entre para salvar seu progresso' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-bold text-duo-text">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={32}
              required
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-duo-blue"
              placeholder="seu.usuario"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-bold text-duo-text">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={128}
              required
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 font-bold outline-none focus:border-duo-blue"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-duo-red">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="duo-btn duo-btn-green w-full disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
          className="mt-4 w-full text-center text-sm font-bold text-duo-blue hover:underline"
        >
          {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </button>

        <p className="mt-6 text-center text-xs text-duo-gray">
          Senhas armazenadas com hash PBKDF2 + salt. Tokens de sessão expiram automaticamente.
        </p>
      </div>
    </div>
  )
}
