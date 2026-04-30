import { supabase } from '../supabaseClient'

export const MAX_PROJECT_IMAGE_BYTES = 5 * 1024 * 1024
export const WARN_PROJECT_IMAGE_BYTES = 3 * 1024 * 1024

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function extensionLooksAllowed(fileName) {
  return /\.(jpe?g|png|webp)$/i.test(fileName ?? '')
}

/** Human-readable size for UI */
export function formatMbFraction(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2)
}

export function validateProjectImageFile(file) {
  if (!(file instanceof File)) {
    return { ok: false, error: 'Invalid file.', warnLarge: false }
  }

  const typeOk = ALLOWED_TYPES.has(file.type) || (!file.type && extensionLooksAllowed(file.name))
  if (!typeOk) {
    return { ok: false, error: 'Only JPG, PNG, or WebP images are allowed.', warnLarge: false }
  }

  if (file.size > MAX_PROJECT_IMAGE_BYTES) {
    return { ok: false, error: 'Image must be under 5MB', warnLarge: false }
  }

  const warnLarge = file.size > WARN_PROJECT_IMAGE_BYTES
  return { ok: true, error: null, warnLarge }
}

export function getProjectImagesBucket() {
  return import.meta.env.VITE_SUPABASE_PROJECT_IMAGES_BUCKET?.trim() || 'project-images'
}

/**
 * Upload to Supabase Storage (public bucket). Configure bucket + RLS in Supabase dashboard.
 * @returns {{ url: string | null, error: string | null }}
 */
export async function uploadProjectImageToStorage(file, bucket = getProjectImagesBucket()) {
  const rawExt = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt.replace('jpeg', 'jpg') : 'jpg'
  const path = `uploads/${crypto.randomUUID()}.${safeExt}`

  const contentType =
    file.type && ALLOWED_TYPES.has(file.type)
      ? file.type
      : safeExt === 'jpg'
        ? 'image/jpeg'
        : `image/${safeExt}`

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType,
  })

  if (uploadError) {
    return { url: null, error: uploadError.message || 'Upload failed' }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  const url = data?.publicUrl ?? null
  if (!url) return { url: null, error: 'Could not resolve public URL for uploaded image.' }

  return { url, error: null }
}
