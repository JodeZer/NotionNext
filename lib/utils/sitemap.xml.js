import BLOG from '@/blog.config'
import fs from 'fs'
import { siteConfig } from '../config'
import { buildSitemapText } from '../sitemap-text.cjs'
import { buildPublicSitemapFields, normalizeSitemapBaseUrl } from '../sitemap-utils'
/**
 * 生成站点地图
 * @param {*} param0
 */
export function generateSitemapXml({ allPages, NOTION_CONFIG }) {
  const link = normalizeSitemapBaseUrl(siteConfig('LINK', BLOG.LINK, NOTION_CONFIG))
  const urls = buildPublicSitemapFields(link, allPages)
  const xml = createSitemapXml(urls)
  // A static text sitemap can be fetched without a serverless/Notion request.
  const text = buildSitemapText(link, allPages)
  try {
    fs.writeFileSync('sitemap.xml', xml)
    fs.writeFileSync('./public/sitemap.xml', xml)
    fs.writeFileSync('./public/sitemap.txt', text)
  } catch (error) {
    console.warn('无法写入文件', error)
  }
}

/**
 * 生成站点地图
 * @param {*} urls
 * @returns
 */
function createSitemapXml(urls) {
  const escapeXml = value => String(value).replace(/[<>&"']/g, char => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  })[char])
  let urlsXml = ''
  urls.forEach(u => {
    urlsXml += `<url>
    <loc>${escapeXml(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    </url>
    `
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${urlsXml}
    </urlset>
    `
}
