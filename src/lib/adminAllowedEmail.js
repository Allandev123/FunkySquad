/** Only this Supabase Auth email may open /admin (client guard; pair with RLS in Supabase). */
export const ADMIN_ALLOWED_EMAIL = 'test@admin.com'

export function isAllowedAdminEmail(email) {
  return (email ?? '').trim().toLowerCase() === ADMIN_ALLOWED_EMAIL.toLowerCase()
}
