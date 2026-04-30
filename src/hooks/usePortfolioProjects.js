import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAllProjectsResilient, fetchFeaturedHeroResilient } from '../lib/projectsFetch'
import { supabase } from '../supabaseClient'

/** Map DB row → UI item (supports relative `/images/...` and full Supabase/storage URLs). */
export function mapProjectToGalleryItem(row) {
  const order = Number(row.order_index ?? 0)
  const categoryRaw = row.category?.trim()
  return {
    id: row.id,
    title: row.title ?? '',
    subtitle: 'Click to preview',
    image: row.image_url ?? '',
    description: row.description ?? '',
    category: categoryRaw ? categoryRaw : 'Uncategorized',
    order_index: Number.isFinite(order) ? order : 0,
  }
}

export function categorySectionId(title) {
  const slug = (title ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  return slug ? `category-${slug}` : 'category-uncategorized'
}

function buildCategorySections(items) {
  const byCat = new Map()
  for (const item of items) {
    const cat = item.category
    if (!byCat.has(cat)) byCat.set(cat, [])
    byCat.get(cat).push(item)
  }

  const sections = []
  for (const [title, catItems] of byCat.entries()) {
    const sortedItems = [...catItems].sort((a, b) => a.order_index - b.order_index)
    const minOrder = sortedItems.length ? Math.min(...sortedItems.map((i) => i.order_index)) : 0
    sections.push({
      key: categorySectionId(title),
      title,
      description: `${sortedItems.length} project${sortedItems.length === 1 ? '' : 's'}`,
      items: sortedItems,
      minOrder,
    })
  }

  sections.sort((a, b) => a.minOrder - b.minOrder || a.title.localeCompare(b.title))
  return sections
}

const FEATURED_HERO_LIMIT = 8

export function usePortfolioProjects() {
  const [rows, setRows] = useState([])
  const [featuredRows, setFeaturedRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [allResult, featuredResult] = await Promise.all([
        fetchAllProjectsResilient(),
        fetchFeaturedHeroResilient(FEATURED_HERO_LIMIT),
      ])

      setRows(allResult.data)
      setFeaturedRows(featuredResult.data ?? [])

      if (allResult.data.length === 0 && allResult.error) {
        setError(allResult.error.message ?? 'Failed to load projects')
      } else {
        setError(null)
      }

      const featuredCount = featuredResult.data?.length ?? 0
      console.log(
        `[portfolio] Loaded ${allResult.data.length} project(s), ${featuredCount} featured for hero (fallback level ${allResult.fallbackLevel ?? 0}).`,
      )
    } catch (err) {
      console.error('[portfolio] Unexpected fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load projects')
      setFeaturedRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void Promise.resolve().then(async () => {
      if (cancelled) return
      await loadProjects()
    })

    const channel = supabase
      .channel('portfolio-projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          void loadProjects()
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[portfolio] Realtime unavailable; data refreshes on tab focus or reload.')
        }
      })

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadProjects()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [loadProjects])

  const galleryItems = useMemo(() => rows.map(mapProjectToGalleryItem), [rows])

  const categorySections = useMemo(() => buildCategorySections(galleryItems), [galleryItems])

  const featuredWork = useMemo(() => galleryItems.slice(0, 6), [galleryItems])

  const featuredHeroProjects = useMemo(
    () =>
      featuredRows.map((row) => ({
        id: row.id,
        title: row.title ?? '',
        description: row.description ?? '',
        image_url: row.image_url ?? '',
        category: row.category?.trim() ? row.category : 'Uncategorized',
      })),
    [featuredRows],
  )

  return {
    loading,
    error,
    refetch: loadProjects,
    galleryItems,
    categorySections,
    featuredWork,
    featuredHeroProjects,
  }
}
