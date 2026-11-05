import fs from 'fs'
import { generateSitemapXml } from '@/lib/utils/sitemap.xml'
import { siteConfig } from '@/lib/config'

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, defaultVal, extendConfig = {}) => {
    if (key === 'LINK' && extendConfig?.LINK) {
      return extendConfig.LINK
    }
    return defaultVal
  })
}))

describe('generateSitemapXml', () => {
  beforeEach(() => {
    siteConfig.mockClear()
  })

  it('does not generate invalid duplicated-domain URLs for external links', () => {
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})

    generateSitemapXml({
      NOTION_CONFIG: {
        LINK: 'https://example.com/'
      },
      allPages: [
        {
          type: 'Post',
          status: 'Published',
          slug: '/hello-world',
          publishDay: '2026-02-20'
        },
        {
          type: 'Post',
          status: 'Published',
          slug: 'https://external.com/landing',
          publishDay: '2026-02-20'
        },
        {
          type: 'Page',
          status: 'Published',
          slug: 'https://example.com/internal/page',
          publishDay: 'invalid-date'
        }
      ]
    })

    expect(writeSpy).toHaveBeenCalledTimes(3)

    const xml = writeSpy.mock.calls[0][1]
    expect(xml).toContain('<loc>https://example.com/hello-world</loc>')
    expect(xml).toContain('<loc>https://example.com/internal/page</loc>')
    expect(xml).not.toContain('<loc>https://external.com/landing</loc>')
    expect(xml).not.toContain('https://example.com/https://external.com/landing')
    expect(xml).not.toContain('Invalid Date')
    expect(writeSpy.mock.calls[2][0]).toBe('./public/sitemap.txt')
    expect(writeSpy.mock.calls[2][1]).toBe(
      'https://example.com/\nhttps://example.com/hello-world\nhttps://example.com/internal/page\n'
    )

    writeSpy.mockRestore()
  })
})
