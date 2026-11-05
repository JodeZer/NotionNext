const { test } = require('node:test')
const assert = require('node:assert/strict')
const { buildSitemapText } = require('../../lib/sitemap-text.cjs')

test('lists the homepage and deduplicated public content with encoded URLs', () => {
  const content = buildSitemapText('https://blog.example.com/', [
    { type: 'Post', status: 'Published', slug: 'article/中文' },
    { type: 'Post', status: 'Published', slug: '/article/中文' },
    { type: 'Page', status: 'Published', slug: 'links' }
  ])
  assert.deepEqual(content.trim().split('\n'), [
    'https://blog.example.com/',
    'https://blog.example.com/article/%E4%B8%AD%E6%96%87',
    'https://blog.example.com/links'
  ])
})

test('excludes drafts, hidden or protected pages, menus, and external URLs', () => {
  const pages = [
    { type: 'Page', status: 'Draft', slug: 'about' },
    { type: 'Post', status: 'Invisible', slug: 'hidden' },
    { type: 'Post', status: 'Published', slug: 'private', password: 'secret' },
    { type: 'Menu', status: 'Published', slug: 'menu' },
    { type: 'Page', status: 'Published', slug: 'https://external.example/' },
    { type: 'Page', status: 'Published', slug: '//external.example/' },
    { type: 'Page', status: 'Published', slug: '#section' }
  ]
  assert.equal(buildSitemapText('https://blog.example.com', pages), 'https://blog.example.com/\n')
})

test('rejects a missing or non-HTTP site URL', () => {
  assert.throws(() => buildSitemapText(''))
  assert.throws(() => buildSitemapText('file:///tmp/blog'))
})
