import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categorySectionId } from '../hooks/usePortfolioProjects'

const AUTO_MS = 5200
const CROSSFADE_S = 0.38
const ZOOM_DURATION_S = 12

const LEFT_READ_OVERLAY = 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0))'

function truncateText(text, max = 200) {
  const t = (text ?? '').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

export function HeroSlider({ slides = [], loading = false, onViewProject }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  /** After mount: allow timed slide changes + crossfade opacity between slides. */
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false)
  /** Enables crossfade only after first hero URL has committed (keeps first paint instant). */
  const [heroReady, setHeroReady] = useState(false)

  const len = slides.length
  const safeIndex = len ? Math.min(index, len - 1) : 0
  const current = len ? slides[safeIndex] : null

  useEffect(() => {
    void Promise.resolve().then(() => setIndex(0))
  }, [slides])

  useEffect(() => {
    const id = requestAnimationFrame(() => setCrossfadeEnabled(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (!slides.length) {
      void Promise.resolve().then(() => setHeroReady(false))
      return
    }
    if (!current?.image_url) return
    void Promise.resolve().then(() => setHeroReady(true))
  }, [slides.length, current?.image_url])

  useEffect(() => {
    if (!slides?.length) return
    for (const slide of slides) {
      const url = slide.image_url
      if (!url) continue
      const img = new Image()
      img.decoding = 'async'
      img.src = url
    }
  }, [slides])

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

  return (
    <section
      className="relative isolate min-h-[420px] overflow-hidden md:min-h-[72vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <div className="relative h-[65vh] min-h-[420px] w-full md:h-[72vh]">
        <div className="absolute inset-0 bg-zinc-950" aria-hidden />

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
                className="h-full w-full will-change-transform"
                initial={{ scale: 1 }}
                animate={{ scale: 1.03 }}
                transition={{ duration: ZOOM_DURATION_S, ease: 'linear' }}
              >
                <img
                  src={current.image_url}
                  alt={current.title ? `${current.title} hero` : 'Featured project'}
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </motion.div>
          ) : (
            <div
              key="hero-placeholder"
              className="absolute inset-0 bg-zinc-950"
              aria-hidden
            />
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
                    duration: allowSlideCrossfade ? 0.28 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-400 sm:text-xs">
                    Featured
                  </p>
                  <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {current.title}
                  </h1>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-zinc-200 sm:text-base lg:text-lg">
                    {truncateText(current.description, 280)}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href={categoryHref}
                      className="inline-flex rounded-full border border-white/25 bg-black/35 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:border-[#ff8c00]/60 hover:bg-black/45 sm:px-6 sm:py-3 sm:text-sm"
                      onClick={(e) => {
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
              ) : (
                <motion.div
                  key="fallback-brand"
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0 }}
                >
                  <h1 className="text-3xl font-bold text-white sm:text-5xl lg:text-6xl">FunkySquadHD</h1>
                  <p className="mt-2 text-base text-zinc-200 sm:text-xl">Roblox Environment &amp; Game Developer</p>
                  <p className="mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
                    {loading
                      ? 'Loading featured work…'
                      : 'Mark projects as Featured in the admin panel to showcase them here.'}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="#projects-hub"
                      className="inline-flex rounded-full border border-white/25 bg-black/35 px-5 py-2.5 text-xs font-semibold text-white sm:px-6 sm:py-3 sm:text-sm"
                    >
                      View Projects
                    </a>
                    <Link to="/contact" className="work-btn inline-flex text-xs sm:text-sm">
                      Work With Me
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {len > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 p-2.5 text-white backdrop-blur-md transition hover:border-[#ff8c00]/40 hover:bg-black/50 sm:left-4 sm:p-3"
            >
              <span className="text-lg leading-none sm:text-xl">&#8249;</span>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 p-2.5 text-white backdrop-blur-md transition hover:border-[#ff8c00]/40 hover:bg-black/50 sm:right-4 sm:p-3"
            >
              <span className="text-lg leading-none sm:text-xl">&#8250;</span>
            </button>

            <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-20">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === safeIndex}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all sm:h-2.5 ${
                    i === safeIndex ? 'w-7 bg-[#ff8c00]' : 'w-2 bg-white/35 hover:bg-white/55 sm:w-2.5'
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}

        <motion.div
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs"
          animate={{ y: [0, 5, 0], opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span>Scroll</span>
          <div className="mx-auto mt-2 h-6 w-px bg-zinc-500/90" />
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-b from-transparent to-black/40" />
      </div>
    </section>
  )
}
