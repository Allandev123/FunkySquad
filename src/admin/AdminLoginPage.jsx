import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ADMIN_ALLOWED_EMAIL, isAllowedAdminEmail } from '../lib/adminAllowedEmail'
import { supabase } from '../supabaseClient'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bootChecking, setBootChecking] = useState(true)

  useEffect(() => {
    let cancelled = false
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session?.user && isAllowedAdminEmail(session.user.email)) {
        const dest =
          typeof location.state?.from === 'string' &&
          location.state.from.startsWith('/admin') &&
          location.state.from !== '/login'
            ? location.state.from
            : '/admin'
        navigate(dest, { replace: true })
        return
      }
      if (session?.user && !isAllowedAdminEmail(session.user.email)) {
        navigate('/', { replace: true })
        return
      }
      setBootChecking(false)
    })
    return () => {
      cancelled = true
    }
  }, [navigate, location.state?.from])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signError) {
        setError(signError.message ?? 'Sign-in failed')
        return
      }
      const signedEmail = signData?.user?.email ?? signData?.session?.user?.email
      if (!isAllowedAdminEmail(signedEmail)) {
        await supabase.auth.signOut()
        setError(`Only ${ADMIN_ALLOWED_EMAIL} may access admin.`)
        return
      }
      const dest =
        typeof location.state?.from === 'string' &&
        location.state.from.startsWith('/admin') &&
        location.state.from !== '/login'
          ? location.state.from
          : '/admin'
      navigate(dest, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  if (bootChecking) {
    return (
      <div className="flex min-h-[min(70vh,32rem)] items-center justify-center text-sm text-zinc-500">
        Checking session…
      </div>
    )
  }

  return (
    <div className="px-4 py-8 text-zinc-100 sm:py-12">
      <div className="mx-auto w-full max-w-sm pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">CMS</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Admin sign in</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sign in as <span className="text-zinc-400">{ADMIN_ALLOWED_EMAIL}</span> (admin only).
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-orange-500/40"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-orange-500/40"
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#ff8c00] py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-600">
          <Link to="/" className="text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}
