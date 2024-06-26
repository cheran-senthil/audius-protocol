import { Page, expect, test as base } from '@playwright/test'
import { getUser } from './data'

const SSR_HYDRATE_TIMEOUT = 60 * 1000

/**
 * The initial page load is slow because we need to wait for the
 * JS to hydrate, which takes a while. These wrappers wait until a specific
 * client-only element is mounted before considering the navigation complete.
 */
export const test = base.extend<{}>({
  page: async ({ page, context }, use) => {
    const baseGoTo = page.goto.bind(page)
    page.goto = async (
      url: Parameters<Page['goto']>[0],
      options: Parameters<Page['goto']>[1] = {}
    ) => {
      console.log('Go to', url)
      const response = await baseGoTo(url, { waitUntil: 'load', ...options })
      await expect(page.getByTestId('app-hydrated')).toBeAttached({
        timeout: options.timeout ?? SSR_HYDRATE_TIMEOUT
      })
      return response
    }

    const baseReload = page.reload.bind(page)
    page.reload = async (options: Parameters<Page['reload']>[0]) => {
      const timeout = options?.timeout ?? 60 * 1000
      const reponse = await baseReload(options)
      await expect(page.getByTestId('app-hydrated')).toBeAttached({
        timeout
      })
      return reponse
    }
    await use(page)
  }
})

// TODO: Remove this and fix bug in upload that doesn't wait for user
export const waitForUser = async (page: Page) => {
  const { name } = getUser()
  await expect(page.getByRole('link', { name })).toBeVisible({
    timeout: 15 * 1000
  })
}
