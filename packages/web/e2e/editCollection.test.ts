import { expect } from '@playwright/test'

import { test } from './test'

const PREMIUM_ALBUM =
  'proberTest/album/__do_not_delete__-probers-premium-album-edit'
const PUBLIC_ALBUM =
  'proberTest/album/__do_not_delete__-probers-public-album-edit'

// Skipping for now, can turn back on if we feel like it's critical path enough
// https://linear.app/audius/issue/INF-700/re-enable-editcollectiontestts-if-we-decide-its-critical-path
test.skip('Change premium album price', async ({ page }) => {
  await page.goto(PREMIUM_ALBUM)
  const unlockText = await page.getByText(/Users can unlock/i).textContent()

  // For this test we toggle the price between $1 and $2
  // So we check to see what value we're starting with
  const startingPrice = unlockText?.match(/\$([0-9]+)\./)?.[1] || '1'
  const newPrice = startingPrice === '1' ? '2' : '1'

  // Open Edit modal
  await page.getByRole('button', { name: 'Edit Collection' }).click()
  // Open access & sale modal
  await page.getByRole('button', { name: /access & sale/i }).click()

  // Assert all the correct buttons are enabled/disabled
  expect(await page.getByLabel(/hidden/i)).toBeDisabled()
  expect(await page.getByLabel(/premium/i)).toBeEnabled()
  expect(await page.getByLabel(/public/i)).toBeEnabled()
  // Update the price to $2
  await page.getByRole('textbox', { name: /album price/i }).fill(newPrice)
  await page
    .getByRole('button', {
      name: 'Save',
      exact: true
    })
    .click()
  // Make sure price tag updated
  await expect(page.getByTestId('price-display')).toContainText(newPrice)
  // save the modal
  await page
    .getByRole('button', {
      name: 'Save Changes',
      exact: true
    })
    .click()
  // Should show new price text
  await expect(
    page.getByText(new RegExp(`purchase of \\$${newPrice}`))
  ).toBeVisible()
})

// Skipping for now, can turn back on if we feel like it's critical path enough
test.skip('Cannot edit public album access to premium/hidden', async ({
  page
}) => {
  await page.goto(PUBLIC_ALBUM)
  // Open Edit modal
  await page.getByRole('button', { name: 'Edit Collection' }).click()
  // Open access & sale modal
  await page.getByRole('button', { name: /access & sale/i }).click()
  // Should have no options other than public

  expect(await page.getByLabel(/premium/i)).toBeDisabled()
  expect(await page.getByLabel(/hidden/i)).toBeDisabled()
  expect(await page.getByLabel(/public/i)).toBeEnabled()
})
