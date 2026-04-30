import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Outlet } from 'react-router-dom'

const imageModules = import.meta.glob('/public/images/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const toTitleCase = (value) =>
  value
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

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
          <a href="/#extra-work" className="transition duration-300 hover:text-white">
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
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function PortfolioPage() {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    knifeLegends: false,
    saiyanRampage: false,
    sideProjects: false,
    extraWork: false,
  })

  const groupedImages = useMemo(() => {
    const allImages = Object.entries(imageModules).map(([filePath, src]) => {
      const fileName = filePath.split('/').pop() ?? 'untitled-image'
      const cleanName = fileName.replace(/\.[^/.]+$/, '')
      const normalizedName = cleanName.toLowerCase().replace(/[-_]+/g, ' ')

      return {
        id: filePath,
        title: toTitleCase(cleanName),
        subtitle: 'Click to preview',
        image: src,
        normalizedName,
        description: `Portfolio preview for ${toTitleCase(cleanName)}.`,
      }
    })

    const groups = {
      knifeLegends: [],
      saiyanRampage: [],
      extraWork: [],
      sideProjects: [],
    }

    allImages.forEach((item) => {
      if (item.normalizedName.includes('knife legends')) {
        groups.knifeLegends.push(item)
      } else if (item.normalizedName.includes('saiyan rampage')) {
        groups.saiyanRampage.push(item)
      } else if (item.normalizedName.includes('side') || item.normalizedName.includes('obby')) {
        groups.sideProjects.push(item)
      } else if (item.normalizedName.includes('extra')) {
        groups.extraWork.push(item)
      } else {
        groups.extraWork.push(item)
      }
    })

    return groups
  }, [])

  const galleryImages = useMemo(
    () => [
      ...groupedImages.knifeLegends,
      ...groupedImages.saiyanRampage,
      ...groupedImages.sideProjects,
      ...groupedImages.extraWork,
    ],
    [groupedImages],
  )

  const featuredWork = useMemo(
    () => [...groupedImages.knifeLegends.slice(0, 4), ...groupedImages.saiyanRampage.slice(0, 2)].slice(0, 6),
    [groupedImages],
  )

  const categorySections = useMemo(
    () => [
      {
        key: 'knifeLegends',
        title: 'Knife Legends',
        description: 'Environment & map design across multiple gameplay updates.',
        items: groupedImages.knifeLegends,
      },
      {
        key: 'saiyanRampage',
        title: 'Saiyan Rampage',
        description: 'Open-world combat spaces blending stylized terrain and futuristic zones.',
        items: groupedImages.saiyanRampage,
      },
      {
        key: 'sideProjects',
        title: 'Side Projects',
        description: 'Experimental Roblox projects focused on mechanics, pacing, and visual polish.',
        items: groupedImages.sideProjects,
      },
      {
        key: 'extraWork',
        title: 'Extra Work',
        description: 'Additional environments, prop studies, and supporting world-building pieces.',
        items: groupedImages.extraWork,
      },
    ],
    [groupedImages],
  )

  const imageIndexById = useMemo(() => {
    const indexMap = new Map()
    galleryImages.forEach((item, index) => {
      indexMap.set(item.id, index)
    })
    return indexMap
  }, [galleryImages])

  const selectedItem = selectedIndex !== null ? galleryImages[selectedIndex] : null

  const openModalForItem = (item) => {
    const index = imageIndexById.get(item.id)
    if (index !== undefined) {
      setSelectedIndex(index)
    }
  }

  const goToNextImage = () => {
    if (!galleryImages.length || selectedIndex === null) return
    setSelectedIndex((currentIndex) => ((currentIndex ?? 0) + 1) % galleryImages.length)
  }

  const goToPreviousImage = () => {
    if (!galleryImages.length || selectedIndex === null) return
    setSelectedIndex((currentIndex) => ((currentIndex ?? 0) - 1 + galleryImages.length) % galleryImages.length)
  }

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
  }, [selectedIndex, galleryImages.length])

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
        <section className="relative isolate overflow-hidden">
          <img
            src={groupedImages.knifeLegends[0]?.image || '/images/hero-town.png'}
            alt="Roblox environment showcase"
            className="h-[65vh] min-h-[420px] w-full scale-[1.03] object-cover md:h-[72vh]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/50 to-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
          <div className="absolute inset-0 mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-10">
            <div>
              <motion.h1
                className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                FunkySquadHD
              </motion.h1>
              <motion.p
                className="mt-2 text-lg text-zinc-200 sm:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                Roblox Environment &amp; Game Developer
              </motion.p>
              <motion.p
                className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                I design immersive maps, environments, and assets for Roblox experiences.
              </motion.p>
              <motion.div
                className="mt-6 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <a
                  href="#projects-hub"
                  className="inline-flex rounded-full border border-white/25 bg-black/35 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.03] hover:border-white/40"
                >
                  View Projects
                </a>
                <Link to="/contact" className="work-btn inline-flex">
                  WORK WITH ME
                </Link>
              </motion.div>
            </div>
          </div>
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-xs uppercase tracking-[0.2em] text-zinc-300"
            animate={{ y: [0, 6, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span>Scroll</span>
            <div className="mx-auto mt-2 h-6 w-px bg-zinc-300/80" />
          </motion.div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black" />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Featured Work</p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Selected Highlights</h2>
            <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredWork.slice(0, 6).map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-6 sm:p-8 lg:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">About Me</p>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              Roblox Environment Designer, 3D Modeler, Game Developer. I create immersive maps and assets for Roblox
              games, including projects like Knife Legends. Focused on quality, lighting, and gameplay-driven
              environments.
            </p>
          </div>
        </section>

        <section id="projects-hub" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Project Categories</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Explore By Project</h2>
          <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
            {categorySections.map((section) => (
              <article key={section.key} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
                <img
                  src={section.items[0]?.image || groupedImages.knifeLegends[0]?.image}
                  alt={section.title}
                  className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-2xl font-semibold text-white">{section.title}</h3>
                  <p className="mt-2 text-sm text-zinc-300">{section.description}</p>
                  <a
                    href={`#${section.key === 'extraWork' ? 'extra-work' : section.key}`}
                    className="mt-4 inline-flex rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:border-white/45 hover:bg-white/10"
                  >
                    View Category
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6 lg:px-10">
          {categorySections.map((section) => {
            const isExpanded = expandedSections[section.key]
            const visibleItems = isExpanded ? section.items : section.items.slice(0, 4)

            return (
              <div key={section.key} id={section.key === 'extraWork' ? 'extra-work' : section.key} className="border-t border-white/10 pt-10">
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

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-400">
        Feel free to reach out for collaborations or inquiries. <span className="text-zinc-200">FunkySquadHD</span>
      </footer>

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
                  {selectedIndex + 1} / {galleryImages.length}
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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Contact form submitted:', formData)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-zinc-200">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
        <section className="rounded-2xl border border-white/10 bg-[#151515] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Work With Me</h1>
              <p className="mt-5 max-w-md text-zinc-300">
                Interested in working together? Feel free to reach out.
              </p>
              <div className="mt-10 space-y-7 text-base sm:text-lg">
                <div>
                  <p className="navbar-font text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Email</p>
                  <a
                    href="mailto:rbx.funkybussiness@gmail.com"
                    className="mt-2 inline-block border-b border-white/30 pb-1 font-semibold text-zinc-100 transition hover:border-white hover:text-white"
                  >
                    rbx.funkybussiness@gmail.com
                  </a>
                </div>
                <div>
                  <p className="navbar-font text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Discord
                  </p>
                  <p className="mt-2 font-semibold text-zinc-100">@funkysquadhd</p>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <form className="w-full space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <label className="block">
                    <span className="navbar-font text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      First Name
                    </span>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-2 w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-lg text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white"
                      placeholder="First Name"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="navbar-font text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Last Name
                    </span>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-2 w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-lg text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white"
                      placeholder="Last Name"
                      required
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="navbar-font text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-lg text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white"
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className="block">
                  <span className="navbar-font text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Message
                  </span>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={7}
                    className="mt-2 w-full resize-y border-0 border-b border-white/20 bg-transparent px-0 py-3 text-lg text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white"
                    placeholder="Tell me about your project..."
                    required
                  />
                </label>

                <button type="submit" className="work-btn inline-flex">
                  SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export { Layout, PortfolioPage, ContactPage }
