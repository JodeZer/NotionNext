const isAbsoluteHttpUrl = value =>
  typeof value === 'string' && /^(https?:)?\/\//i.test(value.trim())

export const normalizeSitemapBaseUrl = link => {
  if (typeof link !== 'string') return ''
  return link.trim().replace(/\/+$/, '')
}

export const normalizeSitemapLocale = locale => {
  if (!locale) return ''
  const value = String(locale).trim()
  if (!value) return ''
  return value.startsWith('/') ? value : `/${value}`
}

export const toSitemapDateString = (
  dateInput,
  fallbackDate = new Date().toISOString().split('T')[0]
) => {
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) {
    return fallbackDate
  }
  return date.toISOString().split('T')[0]
}

export const buildSitemapLoc = ({
  baseUrl,
  locale = '',
  slug
} = {}) => {
  const normalizedBaseUrl = normalizeSitemapBaseUrl(baseUrl)
  if (!normalizedBaseUrl) return null

  const normalizedLocale = normalizeSitemapLocale(locale)

  if (slug === undefined || slug === null || slug === '') {
    return `${normalizedBaseUrl}${normalizedLocale}`
  }

  const rawSlug = String(slug).trim()
  if (!rawSlug || rawSlug === '#') {
    return null
  }

  if (isAbsoluteHttpUrl(rawSlug)) {
    try {
      const targetUrl = new URL(rawSlug, normalizedBaseUrl)
      const siteUrl = new URL(normalizedBaseUrl)

      // sitemap 仅收录本站链接，避免外链混入
      if (targetUrl.hostname !== siteUrl.hostname) {
        return null
      }

      return targetUrl.toString().replace(/\/+$/, '')
    } catch (error) {
      return null
    }
  }

  const normalizedSlug = rawSlug.replace(/^\/+/, '')
  if (!normalizedSlug) {
    return `${normalizedBaseUrl}${normalizedLocale}`
  }

  return `${normalizedBaseUrl}${normalizedLocale}/${normalizedSlug}`
}

export const normalizeSiteUrl = normalizeSitemapBaseUrl

export const createSiteUrl = (baseUrl, slug) =>
  buildSitemapLoc({ baseUrl, slug })

/** Include canonical public content and use content edits for lastmod. */
export const buildPublicSitemapFields = (link, pages = [], locale = '') => {
  const baseUrl = normalizeSitemapBaseUrl(link)
  let site
  try {
    site = new URL(baseUrl)
    if (!['http:', 'https:'].includes(site.protocol)) return []
  } catch {
    return []
  }

  const home = buildSitemapLoc({ baseUrl, locale })
  const fields = new Map([[home, { loc: home }]])
  for (const post of pages) {
    if (
      post?.status !== 'Published' ||
      !['Post', 'Page'].includes(post?.type) ||
      post.password ||
      !post.slug || String(post.slug).trim().startsWith('#')
    ) continue

    try {
      const rawLoc = buildSitemapLoc({ baseUrl, locale, slug: post.slug })
      if (!rawLoc) continue
      const url = new URL(rawLoc)
      if (url.origin !== site.origin) continue
      url.hash = ''
      const loc = url.href.replace(/\/+$/, '')
      const lastmod = [post.lastEditedDate, post.lastEditedTime, post.publishDate, post.publishDay]
        .filter(Boolean)
        .map(value => toSitemapDateString(value, null))
        .find(Boolean)
      const existing = fields.get(loc)
      if (!existing || (lastmod && (!existing.lastmod || lastmod > existing.lastmod))) {
        fields.set(loc, { loc, ...(lastmod ? { lastmod } : {}) })
      }
    } catch {
      // A malformed content URL must not break the whole sitemap.
    }
  }

  const contentDates = Array.from(fields.values()).map(field => field.lastmod).filter(Boolean)
  if (contentDates.length) fields.get(home).lastmod = contentDates.sort().at(-1)
  return Array.from(fields.values())
}
