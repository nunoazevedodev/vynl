/**
 * Login no Spotify com PKCE (sem servidor). Os tokens ficam só neste navegador.
 * O endereço de retorno precisa estar cadastrado no app do Spotify for Developers.
 */
export const REDIRECT_URI = `http://127.0.0.1:${location.port || '5173'}/callback.html`
const SCOPES = ['streaming', 'user-read-email', 'user-read-private', 'user-read-playback-state', 'user-modify-playback-state']
const KEY = 'vynl.spotify'

interface Tokens {
  access: string
  refresh: string
  expires: number
}

const load = (): Tokens | null => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null')
  } catch {
    return null
  }
}
const save = (t: Tokens | null) => {
  try {
    if (t) localStorage.setItem(KEY, JSON.stringify(t))
    else localStorage.removeItem(KEY)
  } catch {
    /* sem storage */
  }
}

export const isLoggedIn = () => !!load()
export const logout = () => save(null)

function randomString(n = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(n)), (x) => chars[x % chars.length]).join('')
}

async function challenge(verifier: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function login(clientId: string) {
  const verifier = randomString()
  sessionStorage.setItem('vynl.pkce', verifier)
  sessionStorage.setItem('vynl.clientId', clientId)
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: await challenge(verifier),
  })
  location.href = `https://accounts.spotify.com/authorize?${params}`
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })
  if (!res.ok) throw new Error(`Spotify recusou o login (${res.status}).`)
  const j = (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number }
  const prev = load()
  const t = { access: j.access_token, refresh: j.refresh_token ?? prev?.refresh ?? '', expires: Date.now() + (j.expires_in - 60) * 1000 }
  save(t)
  return t
}

/** Se a página voltou do Spotify com ?code=, troca pelo token e limpa a URL. */
export async function handleRedirect(): Promise<'ok' | 'error' | null> {
  const url = new URL(location.href)
  const code = url.searchParams.get('code')
  const err = url.searchParams.get('error')
  if (!code && !err) return null
  history.replaceState(null, '', url.pathname)
  if (err) return 'error'
  const verifier = sessionStorage.getItem('vynl.pkce')
  const clientId = sessionStorage.getItem('vynl.clientId')
  if (!verifier || !clientId) return 'error'
  try {
    await tokenRequest({ grant_type: 'authorization_code', code: code!, redirect_uri: REDIRECT_URI, client_id: clientId, code_verifier: verifier })
    return 'ok'
  } catch {
    return 'error'
  }
}

/** Token válido (renova automaticamente quando expira). */
export async function getToken(clientId: string): Promise<string | null> {
  const t = load()
  if (!t) return null
  if (Date.now() < t.expires) return t.access
  try {
    return (await tokenRequest({ grant_type: 'refresh_token', refresh_token: t.refresh, client_id: clientId })).access
  } catch {
    save(null)
    return null
  }
}
