/**
 * Seeds public.projects via the anon key. If you see "permission denied for table projects",
 * run the SQL in scripts/supabase-projects-dev-permissions.sql in the Supabase SQL Editor
 * (dev-only grants/RLS — replace with auth-based policies before production).
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { projects as manualProjects } from './portfolio-data.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'])

function ensureSupabaseEnv() {
  const url = process.env.VITE_SUPABASE_URL?.trim()
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()

  const missing = []
  if (!url) missing.push('VITE_SUPABASE_URL')
  if (!anonKey) missing.push('VITE_SUPABASE_ANON_KEY')

  if (missing.length > 0) {
    throw new Error(
      `[seed] Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Add them to a .env file in the project root (see Vite naming: VITE_*) or export them before running: node seed.js',
    )
  }

  return { url, anonKey }
}

function toTitleCase(value) {
  return value
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function categoryFromNormalizedName(normalizedName) {
  if (normalizedName.includes('knife legends')) return 'Knife Legends'
  if (normalizedName.includes('saiyan rampage')) return 'Saiyan Rampage'
  if (normalizedName.includes('side') || normalizedName.includes('obby')) return 'Side Projects'
  if (normalizedName.includes('extra')) return 'Extra Work'
  return 'Extra Work'
}

function buildProjectsFromPublicImages() {
  const imagesDir = path.join(__dirname, 'public', 'images')
  if (!fs.existsSync(imagesDir)) {
    console.warn(`[seed] No folder at ${imagesDir}; add images or set entries in portfolio-data.js`)
    return []
  }

  const files = fs.readdirSync(imagesDir).filter((name) => {
    const ext = path.extname(name).toLowerCase()
    return IMAGE_EXTENSIONS.has(ext)
  })

  const rows = files.map((fileName) => {
    const cleanName = fileName.replace(/\.[^/.]+$/, '')
    const normalizedName = cleanName.toLowerCase().replace(/[-_]+/g, ' ')
    const title = toTitleCase(cleanName)
    const category = categoryFromNormalizedName(normalizedName)
    return {
      title,
      description: `Portfolio preview for ${title}.`,
      image_url: `/images/${fileName}`,
      category,
      normalizedCategory: category,
      fileName,
    }
  })

  const categoryOrder = ['Knife Legends', 'Saiyan Rampage', 'Side Projects', 'Extra Work']
  const byCategory = new Map(categoryOrder.map((c) => [c, []]))
  for (const row of rows) {
    const bucket = byCategory.get(row.normalizedCategory)
    if (bucket) bucket.push(row)
  }

  for (const [, list] of byCategory) {
    list.sort((a, b) => a.fileName.localeCompare(b.fileName))
  }

  const projects = []
  for (const category of categoryOrder) {
    const list = byCategory.get(category) ?? []
    list.forEach((item, index) => {
      projects.push({
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        category,
        order_index: index + 1,
        is_featured: false,
      })
    })
  }

  return projects
}

async function main() {
  ensureSupabaseEnv()

  console.log(
    '[seed] Environment variables loaded: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (using process.env, not import.meta.env).',
  )

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL.trim(),
    process.env.VITE_SUPABASE_ANON_KEY.trim(),
  )

  const projects =
    manualProjects.length > 0 ? structuredClone(manualProjects) : buildProjectsFromPublicImages()

  if (!projects.length) {
    console.error('[seed] No projects to insert. Add files under public/images or populate portfolio-data.js.')
    process.exit(1)
  }

  const { data: existingRows, error: selectError } = await supabase.from('projects').select('title')

  if (selectError) {
    console.error('[seed] Error reading existing projects:', selectError.message)
    process.exit(1)
  }

  const existingTitles = new Set((existingRows ?? []).map((row) => row.title))
  const toInsert = projects.filter((p) => !existingTitles.has(p.title))

  const skipped = projects.length - toInsert.length
  if (skipped > 0) {
    console.log(`[seed] Skipping ${skipped} row(s) with titles already in Supabase`)
  }

  if (!toInsert.length) {
    console.log('[seed] Success: nothing new to insert; database already contains these titles.')
    return
  }

  const { data, error } = await supabase.from('projects').insert(toInsert).select()

  if (error) {
    console.error('[seed] Insert error:', error.message, error)
    process.exit(1)
  }

  console.log(`[seed] Success: inserted ${data?.length ?? toInsert.length} row(s) into "projects".`)
}

main().catch((err) => {
  console.error('[seed] Fatal error:', err instanceof Error ? err.message : err)
  process.exit(1)
})
