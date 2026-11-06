import { getBaseLayoutByTheme, DynamicLayout } from '@/themes/theme'
import { renderToStaticMarkup } from 'react-dom/server.node'

jest.mock('@/blog.config', () => ({
  __esModule: true,
  default: { THEME: 'gitbook' },
  LAYOUT_MAPPINGS: {}
}))
jest.mock('next/config', () => () => ({ publicRuntimeConfig: { THEMES: ['gitbook'] } }))
jest.mock('@/lib/utils', () => ({
  getQueryParam: () => null,
  getQueryVariable: () => null,
  isBrowser: false
}))
jest.mock('@/themes/gitbook', () => ({
  LayoutBase: ({ children }) => <main>{children}</main>,
  LayoutIndex: () => <a href='/article/gemm'>GEMM derivation</a>,
  LayoutSlug: ({ post }) => <article>{post.title}</article>
}))

it.each(['LayoutIndex', 'LayoutSlug'])(
  'includes %s content in the first server render without waiting for dynamic imports', layoutName => {
    const BaseLayout = getBaseLayoutByTheme('gitbook')
    const html = renderToStaticMarkup(
      <BaseLayout>
        <DynamicLayout theme='gitbook' layoutName={layoutName} post={{ title: 'GEMM derivation' }} />
      </BaseLayout>
    )
    expect(html).toContain('GEMM derivation')
    expect(html).toMatch(/<main>.+<\/main>/)
  }
)
