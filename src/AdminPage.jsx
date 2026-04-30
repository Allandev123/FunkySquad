import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  formatMbFraction,
  getProjectImagesBucket,
  MAX_PROJECT_IMAGE_BYTES,
  uploadProjectImageToStorage,
  validateProjectImageFile,
} from './lib/adminImageUpload'
import { fetchAdminProjectsResilient } from './lib/projectsFetch'
import { supabase } from './supabaseClient'

const PAGE_SIZE = 15

const INITIAL_IMAGE_UPLOAD_STATE = {
  uploading: false,
  error: null,
  success: null,
  selectedLabel: null,
  warnLarge: false,
}

const EMPTY_FORM = {
  title: '',
  description: '',
  image_url: '',
  category: '',
  order_index: 1,
  is_featured: false,
}

/** @typedef {'title' | 'category' | 'hero' | 'order'} AdminSortKey */

/**
 * @param {unknown} a
 * @param {unknown} b
 * @param {AdminSortKey} key
 * @param {'asc' | 'desc'} dir
 */
function compareProjectsForSort(a, b, key, dir) {
  const mult = dir === 'asc' ? 1 : -1
  let cmp
  switch (key) {
    case 'title':
      cmp = (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
      break
    case 'category':
      cmp = (a.category ?? '').localeCompare(b.category ?? '', undefined, { sensitivity: 'base' })
      break
    case 'hero': {
      const bv = Number(Boolean(b.is_featured))
      const av = Number(Boolean(a.is_featured))
      cmp = bv - av
      break
    }
    case 'order': {
      const ao = Number(a.order_index ?? 0)
      const bo = Number(b.order_index ?? 0)
      cmp = (Number.isFinite(ao) ? ao : 0) - (Number.isFinite(bo) ? bo : 0)
      break
    }
    default:
      cmp = 0
  }
  if (cmp !== 0) return cmp * mult
  return String(a.id ?? '').localeCompare(String(b.id ?? ''))
}

function SortableTh({ label, columnKey, activeKey, sortDir, onSort, align = 'left', tabular = false }) {
  const active = activeKey === columnKey
  const ariaSort = active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
  const justify = align === 'center' ? 'justify-center' : 'justify-start'

  return (
    <th scope="col" className="px-4 py-2 font-medium" aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={`-mx-1 flex w-full min-w-0 items-center gap-1.5 rounded-md px-1 py-1.5 transition-colors hover:bg-white/[0.04] hover:text-zinc-300 ${justify} ${align === 'center' ? 'text-center' : 'text-left'} ${tabular ? 'tabular-nums' : ''} ${
          active ? 'text-[#ff8c00]' : 'text-zinc-500'
        }`}
      >
        <span className="uppercase tracking-wide">{label}</span>
        {active ? (
          <span className="text-base leading-none text-[#ff8c00]" aria-hidden>
            {sortDir === 'asc' ? '↑' : '↓'}
          </span>
        ) : null}
        <span className="sr-only">
          {active
            ? sortDir === 'asc'
              ? ', sorted ascending'
              : ', sorted descending'
            : ', activate to sort ascending'}
        </span>
      </button>
    </th>
  )
}

function ThumbnailCell({ src, alt }) {
  const [broken, setBroken] = useState(false)

  if (!src || broken) {
    return (
      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-md bg-zinc-800/80 text-[10px] text-zinc-500">
        —
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      onError={() => setBroken(true)}
      className="h-[72px] w-[72px] shrink-0 rounded-md border border-white/[0.06] bg-zinc-900 object-cover"
    />
  )
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionEmail, setSessionEmail] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(/** @type {AdminSortKey} */ ('order'))
  const [sortDir, setSortDir] = useState(/** @type {'asc' | 'desc'} */ ('asc'))

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM }))

  const [savingModal, setSavingModal] = useState(false)
  const [deletingById, setDeletingById] = useState({})
  const [imageUpload, setImageUpload] = useState(INITIAL_IMAGE_UPLOAD_STATE)
  const imageFileInputRef = useRef(null)

  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionEmail(user?.email ?? null)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  useEffect(() => {
    let isMounted = true

    void Promise.resolve().then(async () => {
      if (!isMounted) return
      setLoading(true)
      try {
        const { data, error } = await fetchAdminProjectsResilient()

        if (isMounted) {
          setProjects(data ?? [])
        }

        if (error) {
          console.error('[admin] Could not load projects after all fallbacks:', error.message ?? error)
        } else {
          console.log(`[admin] Loaded ${data?.length ?? 0} project(s).`)
        }
      } catch (error) {
        console.error('[admin] Unexpected fetch error:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => {
      const title = (p.title ?? '').toLowerCase()
      const category = (p.category ?? '').toLowerCase()
      return title.includes(q) || category.includes(q)
    })
  }, [projects, searchQuery])

  const sortedFilteredProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => compareProjectsForSort(a, b, sortKey, sortDir))
  }, [filteredProjects, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedFilteredProjects.length / PAGE_SIZE))
  const effectivePage = Math.min(Math.max(1, page), totalPages)

  const paginatedProjects = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE
    return sortedFilteredProjects.slice(start, start + PAGE_SIZE)
  }, [sortedFilteredProjects, effectivePage])

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
      setPage(1)
    }
  }

  const resetImageUploadUi = () => {
    setImageUpload(INITIAL_IMAGE_UPLOAD_STATE)
    if (imageFileInputRef.current) imageFileInputRef.current.value = ''
  }

  const openCreateModal = () => {
    setModalMode('create')
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    resetImageUploadUi()
    setModalOpen(true)
  }

  const openEditModal = (project) => {
    setModalMode('edit')
    setEditingId(project.id)
    setForm({
      title: project.title ?? '',
      description: project.description ?? '',
      image_url: project.image_url ?? '',
      category: project.category ?? '',
      order_index: project.order_index ?? 1,
      is_featured: Boolean(project.is_featured),
    })
    resetImageUploadUi()
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSavingModal(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    resetImageUploadUi()
  }

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  useEffect(() => {
    if (!imageUpload.success) return
    const timer = window.setTimeout(() => {
      setImageUpload((s) => (s.success ? { ...s, success: null } : s))
    }, 3500)
    return () => window.clearTimeout(timer)
  }, [imageUpload.success])

  const handleImageFileChange = async (event) => {
    const input = event.target
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    const validation = validateProjectImageFile(file)
    if (!validation.ok) {
      setImageUpload({
        ...INITIAL_IMAGE_UPLOAD_STATE,
        error: validation.error,
      })
      console.error('[admin] Image validation failed:', validation.error)
      return
    }

    const selectedLabel = `${formatMbFraction(file.size)} MB / ${formatMbFraction(MAX_PROJECT_IMAGE_BYTES)} MB`
    setImageUpload({
      uploading: true,
      error: null,
      success: null,
      selectedLabel,
      warnLarge: validation.warnLarge,
    })

    const bucket = getProjectImagesBucket()
    const { url, error } = await uploadProjectImageToStorage(file, bucket)

    if (error || !url) {
      setImageUpload({
        uploading: false,
        error: error ?? 'Upload failed',
        success: null,
        selectedLabel,
        warnLarge: validation.warnLarge,
      })
      console.error('[admin] Image upload failed:', error)
      return
    }

    updateForm('image_url', url)
    setImageUpload({
      uploading: false,
      error: null,
      success: 'Image uploaded.',
      selectedLabel,
      warnLarge: validation.warnLarge,
    })
    console.log('[admin] Image uploaded:', url)
  }

  const handleModalSave = async () => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      category: form.category.trim(),
      order_index: Number.parseInt(String(form.order_index), 10) || 0,
      is_featured: Boolean(form.is_featured),
    }

    if (!payload.title || !payload.image_url || !payload.category) {
      console.error('[admin] Missing required fields (title, image path, category).')
      return
    }

    setSavingModal(true)

    try {
      if (modalMode === 'create') {
        const { data, error } = await supabase
          .from('projects')
          .insert(payload)
          .select('id, title, description, image_url, category, order_index, is_featured')
          .single()

        if (error) {
          console.error('[admin] Failed to insert project:', error)
          return
        }

        setProjects((previous) => [...previous, data].sort((a, b) => a.order_index - b.order_index))
        console.log(`[admin] Added project ${data.id}.`)
      } else if (editingId) {
        const { data, error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingId)
          .select('id, title, description, image_url, category, order_index, is_featured')
          .single()

        if (error) {
          console.error(`[admin] Failed to update project ${editingId}:`, error)
          return
        }

        setProjects((previous) =>
          previous.map((p) => (p.id === editingId ? data : p)).sort((a, b) => a.order_index - b.order_index),
        )
        console.log(`[admin] Updated project ${editingId}.`)
      }

      closeModal()
    } catch (error) {
      console.error('[admin] Unexpected save error:', error)
    } finally {
      setSavingModal(false)
    }
  }

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return

    setDeletingById((previous) => ({ ...previous, [projectId]: true }))

    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId)
      if (error) {
        console.error(`[admin] Failed to delete project ${projectId}:`, error)
        return
      }

      setProjects((previous) => previous.filter((project) => project.id !== projectId))
      console.log(`[admin] Deleted project ${projectId}.`)
    } catch (error) {
      console.error(`[admin] Unexpected delete error for project ${projectId}:`, error)
    } finally {
      setDeletingById((previous) => ({ ...previous, [projectId]: false }))
    }
  }

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]:
        field === 'order_index'
          ? Number.parseInt(String(value), 10) || 0
          : field === 'is_featured'
            ? Boolean(value)
            : value,
    }))
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-zinc-100">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">CMS</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Projects</h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Manage <span className="text-zinc-400">projects</span> in Supabase — compact list, edit in modal.
            </p>
            {sessionEmail ? (
              <p className="mt-2 text-xs text-zinc-600" title="Signed-in account">
                Signed in as {sessionEmail}
              </p>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search title or category…"
              className="w-full rounded-lg border border-white/[0.08] bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-orange-500/40 sm:w-64"
              aria-label="Search projects"
            />
            <button
              type="button"
              onClick={openCreateModal}
              className="shrink-0 rounded-lg bg-[#ff8c00] px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
              Add Project
            </button>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="shrink-0 rounded-lg border border-white/[0.12] px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-zinc-200"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-zinc-950/40">
          {loading ? (
            <p className="px-4 py-12 text-center text-sm text-zinc-500">Loading projects…</p>
          ) : filteredProjects.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-zinc-500">
              {projects.length === 0 ? 'No projects yet.' : 'No matches for your search.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    <th className="px-4 py-3 pl-5 font-medium">Preview</th>
                    <SortableTh
                      label="Title"
                      columnKey="title"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                      align="left"
                    />
                    <SortableTh
                      label="Category"
                      columnKey="category"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                      align="left"
                    />
                    <SortableTh
                      label="Hero"
                      columnKey="hero"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                      align="center"
                    />
                    <SortableTh
                      label="Order"
                      columnKey="order"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                      align="left"
                      tabular
                    />
                    <th className="px-4 py-3 pr-5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.map((project) => {
                    const isDeleting = Boolean(deletingById[project.id])
                    return (
                      <tr
                        key={project.id}
                        className="border-b border-white/[0.04] transition-colors last:border-b-0 hover:bg-white/[0.03]"
                      >
                        <td className="py-2.5 pl-5">
                          <ThumbnailCell src={project.image_url} alt={project.title} />
                        </td>
                        <td className="max-w-[220px] px-4 py-2.5">
                          <span className="line-clamp-2 font-medium text-zinc-100" title={project.title}>
                            {project.title || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">{project.category || '—'}</td>
                        <td className="px-4 py-2.5 text-center text-zinc-400">
                          {project.is_featured ? (
                            <span className="text-[#ff8c00]" title="Featured in hero">
                              ★
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-zinc-400">{project.order_index ?? '—'}</td>
                        <td className="px-4 py-2.5 pr-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(project)}
                              disabled={isDeleting}
                              className="rounded-md border border-white/[0.1] bg-transparent px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProject(project.id)}
                              disabled={isDeleting}
                              className="rounded-md border border-red-500/25 px-2.5 py-1 text-xs font-medium text-red-400/90 transition hover:bg-red-500/10 disabled:opacity-50"
                            >
                              {isDeleting ? '…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && filteredProjects.length > 0 && (
          <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
            <span>
              Showing {(effectivePage - 1) * PAGE_SIZE + 1}–
              {Math.min(effectivePage * PAGE_SIZE, sortedFilteredProjects.length)} of {sortedFilteredProjects.length}
              {searchQuery.trim() ? ` (filtered from ${projects.length})` : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={effectivePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-white/[0.08] px-3 py-1.5 text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="tabular-nums text-zinc-600">
                {effectivePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={effectivePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-white/[0.08] px-3 py-1.5 text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </footer>
        )}
      </main>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            role="presentation"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-modal-title"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-white/[0.08] bg-[#131313] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
                <h2 id="admin-modal-title" className="text-base font-semibold text-white">
                  {modalMode === 'create' ? 'New project' : 'Edit project'}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 px-5 py-5">
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500/35"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Category</span>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500/35"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.08] bg-zinc-950/40 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_featured)}
                    onChange={(e) => updateForm('is_featured', e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-orange-500 focus:ring-orange-500/40"
                  />
                  <span className="text-sm text-zinc-300">
                    Featured — show in homepage hero slideshow (max ~8, ordered by index)
                  </span>
                </label>
                <div className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Image path / URL
                  </span>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => updateForm('image_url', e.target.value)}
                    placeholder="/images/example.png or Supabase public URL"
                    disabled={imageUpload.uploading}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500/35 disabled:opacity-50"
                  />
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="sr-only"
                    aria-hidden
                    tabIndex={-1}
                    onChange={handleImageFileChange}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => imageFileInputRef.current?.click()}
                      disabled={imageUpload.uploading}
                      className="rounded-lg border border-white/[0.12] bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-100 transition hover:border-[#ff8c00]/50 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {imageUpload.uploading
                        ? 'Uploading…'
                        : form.image_url.trim()
                          ? 'Replace Image'
                          : 'Upload Image'}
                    </button>
                    {imageUpload.selectedLabel ? (
                      <span className="text-xs tabular-nums text-zinc-500">{imageUpload.selectedLabel}</span>
                    ) : null}
                  </div>
                  {imageUpload.warnLarge ? (
                    <p className="mt-2 text-xs text-amber-400/90">
                      Large image (&gt;3MB) — upload may take longer.
                    </p>
                  ) : null}
                  {imageUpload.error ? (
                    <p className="mt-2 text-xs text-red-400">{imageUpload.error}</p>
                  ) : null}
                  {imageUpload.success ? (
                    <p className="mt-2 text-xs text-emerald-400">{imageUpload.success}</p>
                  ) : null}
                  <p className="mt-1.5 text-[11px] text-zinc-600">
                    JPG, PNG, WebP · max 5MB · stored in Supabase bucket{' '}
                    <code className="rounded bg-zinc-800 px-1">{getProjectImagesBucket()}</code>
                  </p>
                  {form.image_url.trim() ? (
                    <div className="mt-3 flex items-start gap-3">
                      <img
                        src={form.image_url}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-md border border-white/[0.08] bg-zinc-900 object-cover"
                      />
                      <span className="text-[11px] leading-snug text-zinc-500">Preview uses the path above.</span>
                    </div>
                  ) : null}
                </div>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Description</span>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    className="mt-1.5 w-full resize-y rounded-lg border border-white/[0.08] bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500/35"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Order index</span>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={(e) => updateForm('order_index', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-zinc-950/60 px-3 py-2 text-sm tabular-nums text-zinc-100 outline-none focus:border-orange-500/35"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-white/[0.1] px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleModalSave}
                  disabled={savingModal || imageUpload.uploading}
                  className="rounded-lg bg-[#ff8c00] px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
                >
                  {savingModal ? 'Saving…' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
