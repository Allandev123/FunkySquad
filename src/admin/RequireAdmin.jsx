import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

/**
 * Blocks /admin until Supabase reports a signed-in user (JWT validated via getUser).
 * Redirects anonymous visitors to /admin/login (covers direct URL entry).
 */
export default function RequireAdmin({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false

    async function verify() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (cancelled) return
      if (error || !user) {
        navigate('/admin/login', { replace: true, state: { from: location.pathname } })
        setStatus('anon')
        return
      }
      setStatus('authed')
    }

    void verify()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      if (!session?.user) {
        setStatus('anon')
        navigate('/admin/login', { replace: true })
        return
      }
      setStatus('authed')
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [navigate, location.pathname])

  if (status !== 'authed') {
    return (
      <div className="flex min-h-[min(70vh,32rem)] items-center justify-center text-sm text-zinc-500">
        Verifying session…
      </div>
    )
  }

  return children
}
