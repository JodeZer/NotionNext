/** Build a static discovery fallback using public, unprotected content only. */
function buildSitemapText(link, pages = []) {
  const base = String(link || '').trim().replace(/\/+$/, '')
  const site = new URL(base)
  if (!['http:', 'https:'].includes(site.protocol)) {
    throw new Error('Sitemap requires an HTTP(S) site URL')
  }

  const urls = new Set([`${base}/`])
  for (const page of pages) {
    if (
      !page ||
      page.status !== 'Published' ||
      !['Post', 'Page'].includes(page.type) ||
      page.password ||
      !page.slug
    ) continue

    const slug = String(page.slug).trim()
    if (!slug || slug.startsWith('#')) continue
    try {
      const url = /^(https?:)?\/\//i.test(slug)
        ? new URL(slug, `${base}/`)
        : new URL(`${base}/${slug.replace(/^\/+/, '')}`)
      if (url.origin !== site.origin) continue
      url.hash = ''
      urls.add(url.href)
    } catch {
      // Invalid links must not make the discovery file unreadable.
    }
  }
  return `${Array.from(urls).join('\n')}\n`
}

module.exports = { buildSitemapText }
