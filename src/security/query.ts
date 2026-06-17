/**
 * Utilitário para consultas parametrizadas.
 * Nunca concatene entrada do usuário diretamente em SQL ou URLs de API.
 */

export interface QueryParam {
  name: string
  value: string | number | boolean
}

const SAFE_PARAM = /^[a-zA-Z0-9_-]+$/

export function assertSafeIdentifier(name: string): void {
  if (!SAFE_PARAM.test(name)) {
    throw new Error(`Identificador inválido para query: ${name}`)
  }
}

export function buildParameterizedQuery(
  baseSql: string,
  params: QueryParam[],
): { sql: string; values: (string | number | boolean)[] } {
  let sql = baseSql
  const values: (string | number | boolean)[] = []

  params.forEach((param, index) => {
    assertSafeIdentifier(param.name)
    const placeholder = `$${index + 1}`
    sql = sql.replace(`:${param.name}`, placeholder)
    values.push(param.value)
  })

  return { sql, values }
}

export function buildSafeApiUrl(
  baseUrl: string,
  path: string,
  queryParams?: QueryParam[],
): string {
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)
  queryParams?.forEach(({ name, value }) => {
    assertSafeIdentifier(name)
    url.searchParams.set(name, String(value))
  })
  return url.toString()
}
