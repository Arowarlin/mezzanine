const BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  issues?: Array<{ campo: string; mensaje: string }>

  constructor(status: number, message: string, issues?: Array<{ campo: string; mensaje: string }>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.issues = issues
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const isFormData = body instanceof FormData

  const response = await fetch(`${BASE}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  if (response.status === 204) return undefined as T

  const data = (await response.json().catch(() => ({}))) as {
    error?: string
    issues?: Array<{ campo: string; mensaje: string }>
  }

  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? 'The operation could not be completed', data.issues)
  }

  return data as T
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.issues && error.issues.length > 0) {
      return error.issues.map((issue) => issue.mensaje).join('. ')
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
