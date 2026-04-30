import { supabase } from '../supabaseClient'

/**
 * Fetch all projects with fallbacks when optional columns (e.g. order_index) are missing.
 * Never throws — returns best-effort data and optional error if every attempt fails.
 */
export async function fetchAllProjectsResilient() {
  const attempts = [
    () =>
      supabase
        .from('projects')
        .select('id, title, description, image_url, category, order_index, created_at')
        .order('order_index', { ascending: true }),
    () =>
      supabase
        .from('projects')
        .select('id, title, description, image_url, category, created_at')
        .order('created_at', { ascending: true }),
    () => supabase.from('projects').select('id, title, description, image_url, category'),
  ]

  let lastError = null
  for (let i = 0; i < attempts.length; i += 1) {
    const { data, error } = await attempts[i]()
    if (!error) {
      if (i > 0) {
        console.warn(`[projectsFetch] Loaded ${data?.length ?? 0} row(s) using fallback strategy ${i + 1}.`)
      }
      return { data: data ?? [], error: null, fallbackLevel: i }
    }
    lastError = error
    console.warn(`[projectsFetch] Attempt ${i + 1} failed (${error.message}); retrying with safer query.`)
  }

  console.error('[projectsFetch] All project fetch attempts failed.', lastError?.message)
  return { data: [], error: lastError, fallbackLevel: attempts.length }
}

/**
 * Featured hero rows — same pattern; empty array if is_featured filter unsupported.
 */
export async function fetchFeaturedHeroResilient(limit = 8) {
  const attempts = [
    () =>
      supabase
        .from('projects')
        .select('id, title, description, image_url, category, order_index')
        .eq('is_featured', true)
        .order('order_index', { ascending: true })
        .limit(limit),
    () =>
      supabase
        .from('projects')
        .select('id, title, description, image_url, category, created_at')
        .eq('is_featured', true)
        .order('created_at', { ascending: true })
        .limit(limit),
    () =>
      supabase
        .from('projects')
        .select('id, title, description, image_url, category, created_at')
        .eq('is_featured', true)
        .limit(limit),
  ]

  let lastError = null
  for (let i = 0; i < attempts.length; i += 1) {
    const { data, error } = await attempts[i]()
    if (!error) {
      if (i > 0) {
        console.warn(`[projectsFetch] Featured hero used fallback strategy ${i + 1}.`)
      }
      return { data: data ?? [], error: null }
    }
    lastError = error
    console.warn(`[projectsFetch] Featured attempt ${i + 1} failed (${error.message}); retrying.`)
  }

  console.warn('[projectsFetch] Featured hero unavailable:', lastError?.message)
  return { data: [], error: lastError }
}

/** Admin table — keeps UI usable without order_index / optional columns. */
export async function fetchAdminProjectsResilient() {
  const attempts = [
    () =>
      supabase
        .from('projects')
        .select('id, title, description, image_url, category, order_index, is_featured, created_at')
        .order('order_index', { ascending: true }),
    () =>
      supabase
        .from('projects')
        .select('id, title, description, image_url, category, created_at, is_featured')
        .order('created_at', { ascending: true }),
    () => supabase.from('projects').select('id, title, description, image_url, category, created_at, is_featured'),
    () =>
      supabase
        .from('projects')
        .select('id, title, description, image_url, category, created_at')
        .order('created_at', { ascending: true }),
    () => supabase.from('projects').select('id, title, description, image_url, category, created_at'),
    () => supabase.from('projects').select('id, title, description, image_url, category'),
  ]

  let lastError = null
  for (let i = 0; i < attempts.length; i += 1) {
    const { data, error } = await attempts[i]()
    if (!error) {
      const normalized = (data ?? []).map((row) => ({
        ...row,
        order_index: row.order_index ?? 0,
        is_featured: row.is_featured ?? false,
      }))
      if (i > 0) {
        console.warn(`[projectsFetch] Admin list used fallback strategy ${i + 1}.`)
      }
      return { data: normalized, error: null }
    }
    lastError = error
    console.warn(`[projectsFetch] Admin fetch attempt ${i + 1} failed (${error.message}); retrying.`)
  }

  console.error('[projectsFetch] Admin could not load projects.', lastError?.message)
  return { data: [], error: lastError }
}
