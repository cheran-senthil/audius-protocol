import { Buffer } from 'buffer'

import 'setimmediate'
import processBrowser from 'process/browser'
import { hydrateRoot } from 'react-dom/client'
import type { PageContextClient } from 'vike/types'

import { isMobile as getIsMobile } from 'utils/clientUtil'

import '../index.css'
import { checkIsCrawler } from './util'

// @ts-ignore
window.global ||= window
// @ts-ignore
window.Buffer = Buffer
window.process = { ...processBrowser, env: process.env }

// Set this to false to turn off client hydration
// Useful for testing the SSR output
const HYDRATE_CLIENT = true

export default async function render(
  pageContext: PageContextClient & {
    userAgent: string
  }
) {
  const { userAgent } = pageContext
  const isCrawler = checkIsCrawler(userAgent)
  const isMobile = getIsMobile()

  if (HYDRATE_CLIENT && !isCrawler) {
    const { RootWithProviders } = await import('./RootWithProviders')
    hydrateRoot(
      document.getElementById('root') as HTMLElement,
      <RootWithProviders isServerSide={false} isMobile={isMobile} />
    )
  }
}
