import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import CONFIG from '../config'

export default function HomePage({ siteInfo, allNavPages = [], allLinkPages = [] }) {
  const router = useRouter()
  const index = String(siteConfig('GITBOOK_INDEX_PAGE', 'about', CONFIG) || '')
    .replace(/^\/+|\/+$/g, '')
  // allLinkPages contains published pages only. A removed landing page must
  // never send the homepage into the theme's 404 -> homepage redirect loop.
  const landingPage = index && allLinkPages.find(page =>
    [page.slug, page.href].some(path =>
      typeof path === 'string' && path.replace(/^\/+|\/+$/g, '') === index
    )
  )
  const target = landingPage && (landingPage.href || `/${landingPage.slug}`)
  const redirectPath = typeof target === 'string' && /^\/(?!\/)/.test(target)
    ? target
    : null

  useEffect(() => {
    if (redirectPath) {
      router.replace(redirectPath).catch(error => {
        console.warn('Unable to open the configured homepage', error)
      })
    }
  }, [redirectPath, router])

  return (
    <section className='py-12' aria-labelledby='blog-home-title'>
      <h1 id='blog-home-title' className='text-3xl dark:text-gray-300'>
        {siteInfo?.title}
      </h1>
      <p className='mt-4 mb-8 text-gray-600 dark:text-gray-400'>
        {siteInfo?.description}
      </p>
      <div className='space-y-8'>
        {allNavPages.map(post => (
          <article key={post.id || post.slug}>
            <h2 className='text-xl font-medium'>
              <SmartLink href={post.href || `/${post.slug}`}>
                {post.title}
              </SmartLink>
            </h2>
            {post.summary && (
              <p className='mt-2 leading-7 text-gray-600 dark:text-gray-400'>
                {post.summary}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
