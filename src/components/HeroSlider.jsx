import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categorySectionId } from '../hooks/usePortfolioProjects'

/** Slide interval + Ken Burns duration (synced, linear zoom over full slide). */
const AUTO_MS = 5000
const CROSSFADE_S = 0.26
const KEN_BURNS_FROM = 1
const KEN_BURNS_TO = 1.065

const FALLBACK_SLIDE_ID = 'hero-fallback'
const LOADING_SLIDE_ID = 'hero-loading'
const FALLBACK_IMAGE_URL = '/hero-fallback.svg'

const LEFT_READ_OVERLAY = 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0))'

function truncateText(text, max = 200) {
  const t = (text ?? '').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

export function HeroSlider({ slides = [], loading = false, onViewProject }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false)
  const [heroReady, setHeroReady] = useState(false)

  const cappedInput = useMemo(() => (slides ?? []).slice(0, 8), [slides])

  const displaySlides = useMemo(() => {
    if (cappedInput.length > 0) return cappedInput
    if (loading) {
      return [
        {
          id: LOADING_SLIDE_ID,
          title: 'FunkySquadHD',
          description: 'Loading featured work…',
          image_url: FALLBACK_IMAGE_URL,
          category: 'Uncategorized',
        },
      ]
    }
    return [
      {
        id: FALLBACK_SLIDE_ID,
        title: 'FunkySquadHD',
        description:
          'Roblox environments, maps, and gameplay spaces — mark projects as Featured in admin to showcase them here.',
        image_url: FALLBACK_IMAGE_URL,
        category: 'Uncategorized',
      },
    ]
  }, [cappedInput, loading])

  const len = displaySlides.length
  const safeIndex = len ? Math.min(index, len - 1) : 0
  const current = len ? displaySlides[safeIndex] : null
  const isPromoSlide =
    current?.id === FALLBACK_SLIDE_ID ||
    current?.id === LOADING_SLIDE_ID

  useEffect(() => {
    void Promise.resolve().then(() => setIndex(0))
  }, [displaySlides])

  useEffect(() => {
    const id = requestAnimationFrame(() => setCrossfadeEnabled(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (!displaySlides.length) {
      void Promise.resolve().then(() => setHeroReady(false))
      return
    }
    if (!current?.image_url) return
    void Promise.resolve().then(() => setHeroReady(true))
  }, [displaySlides.length, current?.image_url])

  useEffect(() => {
    if (!displaySlides.length) return
    for (const slide of displaySlides) {
      const url = slide.image_url
      if (!url) continue
      const img = new Image()
      img.decoding = 'async'
      img.src = url
    }
  }, [displaySlides])

  useEffect(() => {
    if (!len) return
    const nextIdx = (safeIndex + 1) % len
    const nextUrl = displaySlides[nextIdx]?.image_url
    if (!nextUrl) return
    const img = new Image()
    img.decoding = 'async'
    img.src = nextUrl
  }, [displaySlides, len, safeIndex])

  useEffect(() => {
    if (paused || len <= 1) return
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % len)
    }, AUTO_MS)
    return () => window.clearInterval(timer)
  }, [paused, len])

  const go = (delta) => {
    if (!len) return
    setIndex((i) => (i + delta + len) % len)
  }

  const categoryHref = current ? `#${categorySectionId(current.category)}` : '#projects-hub'

  const allowSlideCrossfade = heroReady && crossfadeEnabled

  const crossfadeTransition = {
    duration: allowSlideCrossfade ? CROSSFADE_S : 0,
    ease: [0.22, 1, 0.36, 1],
  }

  const kenBurnsTransition = {
    duration: AUTO_MS / 1000,
    ease: 'linear',
  }

  const enableKenBurns = Boolean(current && !isPromoSlide)

  return (
    <section
      className="group relative isolate min-h-[420px] overflow-hidden md:min-h-[72vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <div className="relative h-[65vh] min-h-[420px] w-full md:h-[72vh]">
        <div className="absolute inset-0 bg-[#0c0a09]" aria-hidden />

        <AnimatePresence mode="sync" initial={false}>
          {current?.image_url ? (
            <motion.div
              key={current.id}
              className="absolute inset-0 will-change-[opacity]"
              initial={allowSlideCrossfade ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={crossfadeTransition}
            >
              <motion.div
                key={`ken-${current.id}`}
                className="flex h-full w-full items-center justify-center overflow-hidden will-change-transform"
                initial={{ scale: KEN_BURNS_FROM }}
                animate={{ scale: enableKenBurns ? KEN_BURNS_TO : KEN_BURNS_FROM }}
                transition={enableKenBurns ? kenBurnsTransition : { duration: 0 }}
              >
                <img
                  src={current.image_url}
                  alt={current.title ? `${current.title} hero` : 'Featured project'}
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                  className="h-full min-h-full w-full min-w-full object-cover object-center"
                  draggable={false}
                />
              </motion.div>
            </motion.div>
          ) : (
            <div key="hero-placeholder" className="absolute inset-0 bg-[#0c0a09]" aria-hidden />
          )}
        </AnimatePresence>

        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{ background: LEFT_READ_OVERLAY }}
          aria-hidden
        />

        <div className="absolute inset-0 z-[3] mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-10">
          <div className="max-w-xl sm:max-w-2xl lg:max-w-3xl">
            <AnimatePresence mode="wait" initial={false}>
              {current ? (
                <motion.div
                  key={current.id}
                  initial={allowSlideCrossfade ? { opacity: 0, x: -10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{
                    duration: allowSlideCrossfade ? 0.24 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {!isPromoSlide ? (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-400 sm:text-xs">
                      Featured
                    </p>
                  ) : (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">
                      {current.id === LOADING_SLIDE_ID ? 'Loading' : 'Portfolio'}
                    </p>
                  )}
                  <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {current.title}
                  </h1>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-zinc-200 sm:text-base lg:text-lg">
                    {truncateText(current.description, 280)}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href={isPromoSlide ? '#projects-hub' : categoryHref}
                      className="inline-flex rounded-full border border-white/25 bg-black/35 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:border-[#ff8c00]/60 hover:bg-black/45 sm:px-6 sm:py-3 sm:text-sm"
                      onClick={(e) => {
                        if (isPromoSlide) return
                        if (onViewProject) {
                          e.preventDefault()
                          onViewProject(current.id)
                        }
                      }}
                    >
                      View Project
                    </a>
                    <Link to="/contact" className="work-btn inline-flex text-xs sm:text-sm">
                      Work With Me
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {len > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.08] text-white/80 opacity-60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-[10px] transition-[opacity,background-color,border-color] duration-200 ease-in-out group-hover:opacity-100 hover:bg-white/[0.15] hover:border-white/[0.22]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                aria-hidden="true"
              >
                <path d="M14.5 5.5 8 12l6.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.08] text-white/80 opacity-60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-[10px] transition-[opacity,background-color,border-color] duration-200 ease-in-out group-hover:opacity-100 hover:bg-white/[0.15] hover:border-white/[0.22]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                aria-hidden="true"
              >
                <path d="M9.5 5.5 16 12l-6.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <div
              className="absolute bottom-[4.25rem] left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-[4.5rem]"
              role="tablist"
              aria-label="Slide indicators"
            >
              {displaySlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-selected={i === safeIndex}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all sm:h-2 ${
                    i === safeIndex ? 'w-6 bg-[#ff8c00] sm:w-7' : 'w-1.5 bg-white/35 hover:bg-white/55 sm:w-2'
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}

        <div className="pointer-events-none absolute bottom-5 left-0 z-10 flex w-full justify-center sm:bottom-6">
          <div className="scroll-indicator-float text-center text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs">
            <span>Scroll</span>
            <div className="mx-auto mt-2 h-6 w-px bg-zinc-500/90" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-b from-transparent to-black/40" />
      </div>
    </section>
  )
}
