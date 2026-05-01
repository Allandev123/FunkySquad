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

const CONTACT_EMAIL = 'rbx.funkybussiness@gmail.com'
const DISCORD_HANDLE = '@funkysquadhd'
const PROFILE_IMAGE_SRC = '/images/FunkySquadYT.jpg'

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
              I build worlds, maps, and gameplay spaces.
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
                Contact
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Contact</p>
            <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-zinc-400">
              Discord or email — details on the contact page.
            </p>
            <Link to="/contact" className={`${footerNavLinkClass} mt-5 inline-block font-medium text-[#ff8c00]`}>
              Get in touch →
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-white/[0.05] pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-xs text-zinc-600">© 2026 FunkySquadHD</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span>
              Discord <span className="font-medium text-zinc-400">{DISCORD_HANDLE}</span>
            </span>
            <span className="hidden text-zinc-700 sm:inline" aria-hidden>
              ·
            </span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-zinc-400 transition-colors hover:text-[#ff8c00]"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <nav className="navbar-font mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 md:py-6 lg:px-10">
        <Link to="/" className="group inline-flex items-center gap-2.5 no-underline">
          <img
            src="/favicon/favicon-96x96.png"
            alt="FunkySquadHD logo"
            className="h-7 w-7 rounded-md object-contain transition-opacity duration-200 group-hover:opacity-85"
          />
          <span className="text-lg font-semibold tracking-wide text-white transition-colors duration-200 group-hover:text-[#ff8c00] md:text-2xl">
            FunkySquadHD
          </span>
        </Link>
        <div className="hidden items-center gap-8 text-base font-medium tracking-wide text-zinc-300 md:flex">
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
        <Link to="/contact" className="work-btn hidden text-sm md:inline-flex">
          WORK WITH ME
        </Link>

        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-100 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 md:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-[2px] w-5 bg-current transition-all duration-300 ${
                mobileMenuOpen ? 'top-[7px] rotate-45' : ''
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-[2px] w-5 bg-current transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-[2px] w-5 bg-current transition-all duration-300 ${
                mobileMenuOpen ? 'top-[7px] -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-t border-white/10 bg-[#0b0b0b]/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 sm:px-6">
              <a
                href="/#about"
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-3.5 text-base font-medium text-zinc-200 transition hover:bg-white/5 hover:text-white"
              >
                About
              </a>
              <a
                href="/#projects-hub"
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-3.5 text-base font-medium text-zinc-200 transition hover:bg-white/5 hover:text-white"
              >
                Projects
              </a>
              <a
                href="/#portfolio-sections"
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-3.5 text-base font-medium text-zinc-200 transition hover:bg-white/5 hover:text-white"
              >
                Assets
              </a>
              <Link to="/contact" onClick={closeMobileMenu} className="work-btn mt-2 inline-flex justify-center text-sm">
                WORK WITH ME
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [lightboxImageLoaded, setLightboxImageLoaded] = useState(false)

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

  useEffect(() => {
    setLightboxImageLoaded(false)
  }, [selectedItem?.image])

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
            <div className="mt-6 flex flex-col items-center gap-5 sm:items-start sm:gap-6 md:flex-row md:items-start">
              <img
                src={PROFILE_IMAGE_SRC}
                alt="Omar / FunkySquadHD profile"
                onError={(event) => {
                  event.currentTarget.src = '/hero-fallback.svg'
                }}
                className="h-[88px] w-[88px] shrink-0 rounded-full border border-[#ff8c00]/45 object-cover shadow-[0_0_22px_rgba(255,140,0,0.2)] sm:h-24 sm:w-24"
              />
              <div className="max-w-4xl space-y-5 text-sm leading-relaxed text-zinc-300 sm:text-base">
                <p className="text-base font-semibold text-zinc-100 sm:text-lg">
                  Hi, I&apos;m Funky, also known as FunkySquadHD on{' '}
                  <a
                    href="https://www.youtube.com/channel/UCDYCph3O3BlykIi2uegyEnA"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#ff8c00] transition-all duration-200 hover:brightness-110 hover:underline hover:decoration-[#ff8c00]/70 hover:underline-offset-4"
                  >
                    YouTube
                  </a>
                  .
                </p>
                <p>
                  I work on environment and map design. I&apos;ve worked on games like{' '}
                  <a
                    href="https://www.roblox.com/games/114135183048839/KNIFE-LEGENDS"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#ff8c00] transition-all duration-200 hover:brightness-110 hover:underline hover:decoration-[#ff8c00]/70 hover:underline-offset-4"
                  >
                    Knife Legends
                  </a>{' '}
                  and <span className="font-medium text-zinc-100">Saiyan Rampage</span>, focusing on building maps.
                </p>
                <p>
                  I&apos;ve also made side projects like Escape the Evil Reaper Obby, along with other smaller builds
                  you can check out in my{' '}
                  <a
                    href="/#portfolio-sections"
                    className="text-[#ff8c00] transition-all duration-200 hover:brightness-110 hover:underline hover:decoration-[#ff8c00]/70 hover:underline-offset-4"
                  >
                    portfolio
                  </a>
                  .
                </p>
                <p>
                  I&apos;ve been creating content on{' '}
                  <a
                    href="https://www.youtube.com/channel/UCDYCph3O3BlykIi2uegyEnA"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#ff8c00] transition-all duration-200 hover:brightness-110 hover:underline hover:decoration-[#ff8c00]/70 hover:underline-offset-4"
                  >
                    YouTube
                  </a>{' '}
                  since 2016, and I&apos;m constantly improving with every project.
                </p>
              </div>
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
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  onLoad={() => setLightboxImageLoaded(true)}
                  className="max-h-[70vh] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-black/40 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-black/40 to-transparent" />
                <button
                  type="button"
                  onClick={goToPreviousImage}
                  className={`absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.08] text-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-[10px] transition-[opacity,background-color,border-color] duration-200 ease-in-out hover:bg-white/[0.15] hover:border-white/[0.22] ${
                    lightboxImageLoaded
                      ? 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
                      : 'opacity-0 pointer-events-none'
                  }`}
                  aria-label="Previous image"
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
                  onClick={goToNextImage}
                  className={`absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.08] text-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-[10px] transition-[opacity,background-color,border-color] duration-200 ease-in-out hover:bg-white/[0.15] hover:border-white/[0.22] ${
                    lightboxImageLoaded
                      ? 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
                      : 'opacity-0 pointer-events-none'
                  }`}
                  aria-label="Next image"
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
              </div>
              <div className="space-y-2 p-5 sm:p-6">
                <p className="text-2xl font-semibold text-white">{selectedItem.title}</p>
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
  const { loading, galleryItems } = usePortfolioProjects()
  const [copiedDiscord, setCopiedDiscord] = useState(false)

  const teaserProjects = useMemo(() => {
    return [...galleryItems]
      .filter((p) => p.image?.trim())
      .sort((a, b) => a.order_index - b.order_index)
      .slice(0, 3)
  }, [galleryItems])

  const copyDiscord = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(DISCORD_HANDLE)
      setCopiedDiscord(true)
      window.setTimeout(() => setCopiedDiscord(false), 2200)
    } catch {
      window.prompt('Copy my Discord username:', DISCORD_HANDLE)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-zinc-200">
      <main>
        <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#121212] via-[#0f0f0f] to-[#0b0b0b]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8c00]">Hire / collaborate</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Work With Me
            </h1>
            <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
              <p>I build Roblox maps and environments that look good and run smoothly.</p>
              <p>
                I&apos;ve worked on projects like{' '}
                <a
                  href="https://www.roblox.com/games/114135183048839/KNIFE-LEGENDS"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ff8c00] transition-all duration-200 hover:brightness-110 hover:underline hover:decoration-[#ff8c00]/70 hover:underline-offset-4"
                >
                  Knife Legends
                </a>
                , and I&apos;m open to new collaborations.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button type="button" onClick={() => void copyDiscord()} className="work-btn inline-flex justify-center">
                {copiedDiscord ? 'Copied — paste in Discord' : 'Message on Discord'}
              </button>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="navbar-font inline-flex justify-center rounded-full border border-[#ff8c00]/45 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#ff8c00] shadow-[0_0_20px_rgba(255,140,0,0.12)] transition hover:border-[#ff8c00]/70 hover:bg-[#ff8c00]/10"
              >
                Email Me
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Reach out</p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Pick what works best for you</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => void copyDiscord()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  void copyDiscord()
                }
              }}
              className="cursor-pointer rounded-2xl border border-[#ff8c00]/50 bg-gradient-to-br from-[#1b1208] to-[#171717] p-7 text-left shadow-[0_0_35px_rgba(255,140,0,0.12)] outline-none transition hover:border-[#ff8c00]/70 hover:shadow-[0_0_45px_rgba(255,140,0,0.16)] focus-visible:ring-2 focus-visible:ring-[#ff8c00]/50 sm:p-9"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff8c00]">Primary — Discord</p>
              <p className="mt-4 font-mono text-2xl font-semibold text-white sm:text-3xl">{DISCORD_HANDLE}</p>
              <p className="mt-3 text-sm text-zinc-500">
                {copiedDiscord
                  ? 'Copied. Open Discord and paste into Add Friend or a DM.'
                  : 'Click to copy my username and message me on Discord. Fastest way to reach me.'}
              </p>
              <p className="mt-4 text-xs text-zinc-600">
                <a
                  href="https://discord.com/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 underline-offset-2 transition hover:text-[#ff8c00] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open Discord in browser →
                </a>
              </p>
            </div>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="block rounded-2xl border border-white/10 bg-[#151515] p-6 text-left transition hover:border-white/[0.16] hover:bg-[#181818] sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Email</p>
              <p className="mt-4 break-all font-mono text-lg font-semibold text-[#ff8c00] sm:text-xl">{CONTACT_EMAIL}</p>
              <p className="mt-3 text-sm text-zinc-500">Best for longer messages or project details.</p>
            </a>
          </div>
        </section>

        <section className="border-y border-white/[0.05] bg-[#0e0e0e]/80">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Recent Work</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Featured snapshots</h2>
              </div>
              <a href="/#portfolio-sections" className="work-btn inline-flex shrink-0 self-start sm:self-auto">
                View Projects
              </a>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={`teaser-sk-${i}`} className="aspect-[16/10] animate-pulse rounded-xl bg-zinc-800/80" />
                  ))
                : teaserProjects.map((item) => (
                    <a
                      key={item.id}
                      href="/#portfolio-sections"
                      className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-zinc-900"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3">
                        <p className="truncate text-sm font-medium text-white">{item.title}</p>
                      </div>
                    </a>
                  ))}
            </div>
            {!loading && teaserProjects.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">Add projects in the portfolio to show previews here.</p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}

export { Layout, Navbar, PortfolioPage, ContactPage }
