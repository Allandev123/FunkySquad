/** Canonical section order on the portfolio (matches project.category values). */
export const PROJECT_CATEGORY_ORDER = [
  'Knife Legends',
  'Saiyan Rampage',
  'Side Projects',
  'Extra Work',
]

const ORDER_INDEX = new Map(PROJECT_CATEGORY_ORDER.map((title, index) => [title, index]))

const UNKNOWN_RANK = PROJECT_CATEGORY_ORDER.length

/**
 * Sort category sections: predefined order first, unknown titles last (alphabetically).
 * Does not mutate items inside sections.
 *
 * @param {{ title: string }[]} sections
 */
export function sortSectionsByProjectCategoryOrder(sections) {
  return [...sections].sort((a, b) => {
    const ta = (a.title ?? '').trim()
    const tb = (b.title ?? '').trim()
    const ia = ORDER_INDEX.has(ta) ? ORDER_INDEX.get(ta) : UNKNOWN_RANK
    const ib = ORDER_INDEX.has(tb) ? ORDER_INDEX.get(tb) : UNKNOWN_RANK
    if (ia !== ib) return ia - ib
    return ta.localeCompare(tb)
  })
}
