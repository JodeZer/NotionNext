import { render, screen } from '@testing-library/react'
import HomePage from '@/themes/gitbook/components/HomePage'
import { useRouter } from 'next/router'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))
jest.mock('@/lib/config', () => ({ siteConfig: (key, fallback) => fallback }))
jest.mock('@/components/SmartLink', () => ({ href, children }) => <a href={href}>{children}</a>)

const props = {
  siteInfo: { title: 'My blog', description: 'LLM training and inference notes' },
  allNavPages: [{ id: 'gemm', title: 'GEMM derivation', href: '/article/gemm', summary: 'Matrix partitions and gradients.' }],
  allLinkPages: [{ type: 'Post', slug: 'article/gemm', href: '/article/gemm' }]
}
let replace
beforeEach(() => {
  replace = jest.fn().mockResolvedValue(true)
  useRouter.mockReturnValue({ replace })
})

it('renders a usable homepage without redirecting to a removed About page', () => {
  render(<HomePage {...props} />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My blog')
  expect(screen.getByRole('link', { name: 'GEMM derivation' })).toHaveAttribute('href', '/article/gemm')
  expect(screen.getByText('Matrix partitions and gradients.')).toBeVisible()
  expect(replace).not.toHaveBeenCalled()
})

it('continues to support a configured landing page that is published', () => {
  render(<HomePage {...props} allLinkPages={[{ type: 'Page', slug: 'about', href: '/about' }]} />)
  expect(replace).toHaveBeenCalledWith('/about')
})

it('does not redirect when there is no published content', () => {
  render(<HomePage siteInfo={props.siteInfo} />)
  expect(screen.getByRole('heading', { level: 1 })).toBeVisible()
  expect(replace).not.toHaveBeenCalled()
})
