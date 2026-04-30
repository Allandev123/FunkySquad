import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isAllowedAdminEmail } from '../lib/adminAllowedEmail'
import { supabase } from '../supabaseClient'

/**
 * Blocks /admin until Supabase session exists and email matches ADMIN_ALLOWED_EMAIL.
 * No admin UI is rendered until allowed (avoids flash). Wrong email → home; anon → /login.
 */
export default function RequireAdmin({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false

    async function verify() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (cancelled) return

      if (error || !session?.user) {
        setStatus('blocked')
        navigate('/login', { replace: true, state: { from: location.pathname } })
        return
      }

      if (!isAllowedAdminEmail(session.user.email)) {
        setStatus('blocked')
        navigate('/', { replace: true })
        return
      }

      setStatus('allowed')
    }

    void verify()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return

      if (!session?.user) {
        setStatus('blocked')
        navigate('/login', { replace: true })
        return
      }

      if (!isAllowedAdminEmail(session.user.email)) {
        setStatus('blocked')
        navigate('/', { replace: true })
        return
      }

      setStatus('allowed')
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [navigate, location.pathname])

  if (status !== 'allowed') {
    return (
      <div className="flex min-h-[min(70vh,32rem)] items-center justify-center text-sm text-zinc-500">
        Checking session…
      </div>
    )
  }

  return children
}
