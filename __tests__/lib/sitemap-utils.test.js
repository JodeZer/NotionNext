import {
  buildSitemapLoc,
  buildPublicSitemapFields,
  createSiteUrl,
  normalizeSitemapBaseUrl,
  normalizeSitemapLocale,
  normalizeSiteUrl,
  toSitemapDateString
} from '@/lib/sitemap-utils'

describe('sitemap-utils', () => {
  describe('buildPublicSitemapFields', () => {
    it('includes public content with its actual edit date and deduplicates URLs', () => {
      expect(buildPublicSitemapFields('https://example.com', [
        { type: 'Post', status: 'Published', slug: 'article/中文', publishDay: '2025-10-01', lastEditedDate: '2026-11-06T01:00:00Z' },
        { type: 'Post', status: 'Published', slug: 'article/中文', lastEditedDate: '2026-11-01' },
        { type: 'Page', status: 'Published', slug: 'links' }
      ])).toEqual([
        { loc: 'https://example.com', lastmod: '2026-11-06' },
        { loc: 'https://example.com/article/%E4%B8%AD%E6%96%87', lastmod: '2026-11-06' },
        { loc: 'https://example.com/links' }
      ])
    })

    it('excludes unpublished, protected, non-content and off-site URLs', () => {
      const pages = [
        { type: 'Page', status: 'Draft', slug: 'about' },
        { type: 'Post', status: 'Invisible', slug: 'hidden' },
        { type: 'Post', status: 'Published', password: 'hash', slug: 'locked' },
        { type: 'Menu', status: 'Published', slug: 'menu' },
        { type: 'Post', status: 'Published', slug: '#section' },
        { type: 'Post', status: 'Published', slug: 'https://external.com/article' }
      ]
      expect(buildPublicSitemapFields('https://example.com', pages)).toEqual([{ loc: 'https://example.com' }])
    })

    it('supports locale prefixes and omits invalid modification dates', () => {
      expect(buildPublicSitemapFields('https://example.com/', [
        { type: 'Post', status: 'Published', slug: 'article/test', publishDay: 'invalid' }
      ], 'zh')).toEqual([
        { loc: 'https://example.com/zh' },
        { loc: 'https://example.com/zh/article/test' }
      ])
    })
  })

  describe('normalizeSitemapBaseUrl', () => {
    it('trims and removes trailing slashes', () => {
      expect(normalizeSitemapBaseUrl(' https://example.com/// ')).toBe(
        'https://example.com'
      )
    })

    it('returns empty string for non-string values', () => {
      expect(normalizeSitemapBaseUrl(null)).toBe('')
      expect(normalizeSitemapBaseUrl(undefined)).toBe('')
    })
  })

  describe('normalizeSiteUrl', () => {
    it('shares the same base URL normalization for non-sitemap callers', () => {
      expect(normalizeSiteUrl(' https://example.com/// ')).toBe(
        'https://example.com'
      )
    })
  })

  describe('normalizeSitemapLocale', () => {
    it('normalizes locale prefix with leading slash', () => {
      expect(normalizeSitemapLocale('zh')).toBe('/zh')
      expect(normalizeSitemapLocale('/en')).toBe('/en')
    })

    it('returns empty string for empty values', () => {
      expect(normalizeSitemapLocale('')).toBe('')
      expect(normalizeSitemapLocale(null)).toBe('')
    })
  })

  describe('buildSitemapLoc', () => {
    const baseUrl = 'https://example.com'

    it('builds locale home URL when slug is empty', () => {
      expect(
        buildSitemapLoc({
          baseUrl,
          locale: 'zh'
        })
      ).toBe('https://example.com/zh')
    })

    it('builds URL for relative slug', () => {
      expect(
        buildSitemapLoc({
          baseUrl,
          locale: 'zh',
          slug: '/post/hello'
        })
      ).toBe('https://example.com/zh/post/hello')
    })

    it('returns null for external absolute URL', () => {
      expect(
        buildSitemapLoc({
          baseUrl,
          slug: 'https://external.com/page'
        })
      ).toBeNull()
    })

    it('keeps absolute URL when it points to the same host', () => {
      expect(
        buildSitemapLoc({
          baseUrl,
          slug: 'https://example.com/path/to/page'
        })
      ).toBe('https://example.com/path/to/page')
    })

    it('returns null for invalid absolute URL', () => {
      expect(
        buildSitemapLoc({
          baseUrl,
          slug: 'https://'
        })
      ).toBeNull()
    })
  })

  describe('createSiteUrl', () => {
    const baseUrl = 'https://example.com'

    it('builds a site URL with exactly one slash', () => {
      expect(createSiteUrl(`${baseUrl}/`, '/post/hello')).toBe(
        'https://example.com/post/hello'
      )
    })

    it('returns the normalized site URL when slug is empty', () => {
      expect(createSiteUrl(`${baseUrl}/`, '')).toBe('https://example.com')
    })

    it('returns null for anchor-only slugs', () => {
      expect(createSiteUrl(baseUrl, '#')).toBeNull()
    })

    it('keeps same-host absolute URLs', () => {
      expect(createSiteUrl(baseUrl, 'https://example.com/about')).toBe(
        'https://example.com/about'
      )
    })

    it('drops cross-host absolute URLs', () => {
      expect(createSiteUrl(baseUrl, 'https://external.com/about')).toBeNull()
    })
  })

  describe('toSitemapDateString', () => {
    it('formats valid date to YYYY-MM-DD', () => {
      expect(toSitemapDateString('2026-02-21T12:34:56.000Z')).toBe(
        '2026-02-21'
      )
    })

    it('falls back when date is invalid', () => {
      expect(toSitemapDateString('not-a-date', '2026-01-01')).toBe(
        '2026-01-01'
      )
    })
  })
})
