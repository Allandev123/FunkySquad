import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { HeroSlider } from './components/HeroSlider'
import { usePortfolioProjects } from './hooks/usePortfolioProjects'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [pathname])

  return null
}

function ScrollTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300)
    }

    toggleVisibility()
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-5 right-5 z-[1000] cursor-pointer rounded-full border-none bg-[#ff8c00] px-3.5 py-2.5 text-lg font-semibold leading-none text-black shadow-[0_0_10px_rgba(0,0,0,0.5)] transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
    >
      ↑
    </button>
  )
}

const footerNavLinkClass =
  'text-sm text-zinc-400 transition-colors duration-200 hover:text-[#ff8c00] hover:underline hover:decoration-[#ff8c00]/50 hover:underline-offset-4'

function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-gradient-to-b from-[#0d0d0d] via-[#0a0a0a] to-[#050505]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-11 lg:px-10 lg:py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12 lg:gap-16">
          <div className="md:pr-4">
            <p className="navbar-font text-lg font-semibold tracking-wide text-white">FunkySquadHD</p>
            <p className="mt-2 text-sm font-medium text-zinc-400">Roblox Environment &amp; Game Developer</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              Worlds, maps, and gameplay spaces — built for clarity, mood, and performance.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Navigate</p>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Footer">
              <a href="/#about" className={footerNavLinkClass}>
                About
              </a>
              <a href="/#projects-hub" className={footerNavLinkClass}>
                Projects
              </a>
              <a href="/#portfolio-sections" className={footerNavLinkClass}>
                Assets
              </a>
              <Link to="/contact" className={footerNavLinkClass}>
                Discord
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Discord</p>
            <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-zinc-400">
              Commissions and collaborations — reach me on Discord.
            </p>
            <Link to="/contact" className={`${footerNavLinkClass} mt-5 inline-block font-medium text-[#ff8c00]`}>
              @funkysquadhd →
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-white/[0.05] pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-xs text-zinc-600">© 2026 FunkySquadHD</p>
          <p className="text-xs text-zinc-500">
            Discord <span className="font-medium text-zinc-400">@funkysquadhd</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-lg">
      <nav className="navbar-font mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 md:py-6 lg:px-10">
        <Link to="/" className="text-xl font-semibold tracking-wide text-white md:text-2xl">
          FunkySquadHD
        </Link>
        <div className="flex items-center gap-8 text-base font-medium tracking-wide text-zinc-300">
          <a href="/#about" className="transition hover:text-white">
            About
          </a>
          <a href="/#projects-hub" className="transition duration-300 hover:text-white">
            Projects
          </a>
          <a href="/#portfolio-sections" className="transition duration-300 hover:text-white">
            Assets
          </a>
        </div>
        <Link to="/contact" className="work-btn hidden text-sm sm:inline-flex">
          WORK WITH ME
        </Link>
      </nav>
    </header>
  )
}

function Layout() {
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin') || pathname === '/login'

  return (
    <>
      <ScrollToTop />
      <Navbar />
      {isAdminRoute ? (
        <div className="bg-[#0b0b0b] pt-6 pb-12 sm:pt-8">
          <Outlet />
        </div>
      ) : (
        <>
          <Outlet />
          <SiteFooter />
        </>
      )}
      <ScrollTopButton />
    </>
  )
}

function PortfolioPage() {
  const { loading, error, galleryItems, categorySections, featuredWork, featuredHeroProjects } =
    usePortfolioProjects()

  const [selectedIndex, setSelectedIndex] = useState(null)
  const [expandedSections, setExpandedSections] = useState({})

  useEffect(() => {
    void Promise.resolve().then(() => {
      setExpandedSections((previous) => {
        const next = { ...previous }
        const keys = new Set(categorySections.map((section) => section.key))
        for (const section of categorySections) {
          if (!(section.key in next)) next[section.key] = false
        }
        for (const key of Object.keys(next)) {
          if (!keys.has(key)) delete next[key]
        }
        return next
      })
    })
  }, [categorySections])

  useEffect(() => {
    void Promise.resolve().then(() => {
      setSelectedIndex((idx) => {
        if (idx === null) return null
        if (galleryItems.length === 0) return null
        return Math.min(idx, galleryItems.length - 1)
      })
    })
  }, [galleryItems.length])

  const imageIndexById = useMemo(() => {
    const indexMap = new Map()
    galleryItems.forEach((item, index) => {
      indexMap.set(item.id, index)
    })
    return indexMap
  }, [galleryItems])

  const openHeroProjectModal = useCallback(
    (id) => {
      const idx = imageIndexById.get(id)
      if (idx !== undefined) setSelectedIndex(idx)
    },
    [imageIndexById],
  )

  const selectedItem = selectedIndex !== null ? galleryItems[selectedIndex] : null

  const openModalForItem = (item) => {
    const index = imageIndexById.get(item.id)
    if (index !== undefined) {
      setSelectedIndex(index)
    }
  }

  const goToNextImage = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || galleryItems.length === 0) return currentIndex
      return (currentIndex + 1) % galleryItems.length
    })
  }, [galleryItems.length])

  const goToPreviousImage = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || galleryItems.length === 0) return currentIndex
      return (currentIndex - 1 + galleryItems.length) % galleryItems.length
    })
  }, [galleryItems.length])

  const toggleSectionExpansion = (sectionKey) => {
    setExpandedSections((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }))
  }

  useEffect(() => {
    const handleModalKeys = (event) => {
      if (selectedIndex === null) return
      if (event.key === 'Escape') {
        setSelectedIndex(null)
      }
      if (event.key === 'ArrowRight') {
        goToNextImage()
      }
      if (event.key === 'ArrowLeft') {
        goToPreviousImage()
      }
    }
    window.addEventListener('keydown', handleModalKeys)
    return () => window.removeEventListener('keydown', handleModalKeys)
  }, [selectedIndex, goToNextImage, goToPreviousImage])

  const ProjectCard = ({ item, compact = false }) => (
    <motion.button
      type="button"
      onClick={() => openModalForItem(item)}
      className={`group relative overflow-hidden rounded-xl border border-white/10 bg-[#171717] text-left ${
        compact ? 'aspect-[16/10]' : 'aspect-[16/11]'
      }`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <motion.img
        src={item.image}
        alt={item.title}
        className="h-full w-full object-cover"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-4 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:p-5">
        <p className="text-lg font-semibold text-white">{item.title}</p>
        <p className="text-sm text-zinc-300">{item.subtitle}</p>
      </div>
    </motion.button>
  )

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-zinc-200">
      <main>
        {error && (
          <div className="border-b border-red-500/25 bg-red-950/40 px-4 py-2 text-center text-sm text-red-200">
            Could not load portfolio: {error}
          </div>
        )}
        <HeroSlider
          slides={featuredHeroProjects}
          loading={loading}
          onViewProject={openHeroProjectModal}
        />

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Featured Work</p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Selected Highlights</h2>
            <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`featured-skeleton-${index}`}
                      className="aspect-[16/11] animate-pulse rounded-xl bg-zinc-800/80"
                    />
                  ))
                : featuredWork.map((item) => <ProjectCard key={item.id} item={item} />)}
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-[100px] mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-10"
        >
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-6 sm:p-8 lg:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">About Me</p>
            <div className="mt-6 max-w-4xl space-y-5 text-sm leading-relaxed text-zinc-300 sm:text-base">
              <p>
                I&apos;m an environment artist focused on Roblox — building worlds players actually want to spend time
                in. My work sits at the intersection of layout, mood, and readability: maps that feel intentional,
                spaces that support gameplay, and lighting that sells the scene without fighting it.
              </p>
              <p>
                Most of my projects fall into full environment builds, gameplay-forward spaces, and polish passes on
                maps and hubs — everything from blockout and set dressing to optimization passes so experiences stay
                smooth on real hardware.
              </p>
              <p>
                Knife Legends is one of the standout collaborations in my portfolio — a project where strong visual
                identity and clear spatial design had to work together at scale. I care about systems too: sensible
                workflows, assets that are easy to iterate on, and visuals that hold up when content changes.
              </p>
              <p>
                If you&apos;re looking for someone who can think like both an artist and a builder — composition and
                craft, but also performance and player flow — I&apos;d love to hear what you&apos;re shipping next.
              </p>
            </div>
          </div>
        </section>

        <section
          id="projects-hub"
          className="scroll-mt-[100px] mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Project Categories</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Explore By Project</h2>
          <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={`hub-skeleton-${index}`} className="h-56 animate-pulse rounded-2xl bg-zinc-800/60" />
                ))
              : categorySections.map((section) => (
                  <article
                    key={section.key}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111]"
                  >
                    {section.items[0]?.image ? (
                      <img
                        src={section.items[0].image}
                        alt={section.title}
                        className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center bg-zinc-900 text-sm text-zinc-600">
                        No preview
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="text-2xl font-semibold text-white">{section.title}</h3>
                      <p className="mt-2 text-sm text-zinc-300">{section.description}</p>
                      <a
                        href={`#${section.key}`}
                        className="mt-4 inline-flex rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:border-white/45 hover:bg-white/10"
                      >
                        View Category
                      </a>
                    </div>
                  </article>
                ))}
          </div>
        </section>

        <section
          id="portfolio-sections"
          className="scroll-mt-[100px] mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6 lg:px-10"
        >
          {categorySections.map((section) => {
            const isExpanded = expandedSections[section.key]
            const visibleItems = isExpanded ? section.items : section.items.slice(0, 4)

            return (
              <div
                key={section.key}
                id={section.key}
                className="scroll-mt-[100px] border-t border-white/10 pt-10"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold text-white sm:text-3xl">{section.title}</h2>
                  {section.items.length > 4 && (
                    <button
                      type="button"
                      onClick={() => toggleSectionExpansion(section.key)}
                      className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/40 hover:text-white"
                    >
                      {isExpanded ? 'Show Less' : 'View More'}
                    </button>
                  )}
                </div>
                {visibleItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleItems.map((item) => (
                      <ProjectCard key={item.id} item={item} compact />
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400">No items in this category yet.</p>
                )}
              </div>
            )
          })}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-orange-500/30 bg-[#121212] p-8 shadow-[0_0_30px_rgba(255,122,0,0.08)] sm:p-12">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Work With Me</h2>
            <p className="mt-3 max-w-xl text-zinc-300">
              Interested in working together? Let&apos;s build something great.
            </p>
            <Link to="/contact" className="work-btn mt-7 inline-flex">
              Contact Me
            </Link>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#151515]"
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="group relative">
                <img src={selectedItem.image} alt={selectedItem.title} className="max-h-[70vh] w-full object-cover" />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-black/40 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-black/40 to-transparent" />
                <button
                  type="button"
                  onClick={goToPreviousImage}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-lg text-white/80 opacity-50 backdrop-blur-sm transition duration-200 group-hover:opacity-80 hover:scale-105 hover:opacity-100 sm:p-3"
                  aria-label="Previous image"
                >
                  &#x2039;
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-lg text-white/80 opacity-50 backdrop-blur-sm transition duration-200 group-hover:opacity-80 hover:scale-105 hover:opacity-100 sm:p-3"
                  aria-label="Next image"
                >
                  &#x203A;
                </button>
              </div>
              <div className="space-y-2 p-5 sm:p-6">
                <p className="text-2xl font-semibold text-white">{selectedItem.title}</p>
                <p className="text-zinc-300">{selectedItem.subtitle}</p>
                <p className="text-sm text-zinc-400">{selectedItem.description}</p>
                <p className="pt-1 text-xs text-zinc-500">
                  {selectedIndex + 1} / {galleryItems.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-zinc-200">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
        <section className="rounded-2xl border border-white/10 bg-[#151515] p-8 sm:p-12 lg:p-14">
          <div className="mx-auto max-w-xl">
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Discord</h1>
            <p className="mt-4 text-zinc-400">
              Commissions and collaborations — reach me here; it&apos;s the fastest way to get in touch.
            </p>

            <div className="mt-10 rounded-xl border border-white/[0.08] bg-zinc-950/40 px-6 py-8 sm:px-8">
              <p className="navbar-font text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Discord</p>
              <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-[#ff8c00] sm:text-3xl">
                @funkysquadhd
              </p>
              <p className="mt-3 text-sm text-zinc-500">
                Copy the handle and send a friend request or DM on Discord.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export { Layout, Navbar, PortfolioPage, ContactPage }
