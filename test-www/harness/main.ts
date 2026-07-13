import { runVisualHarness } from '../../test/visual'

void runVisualHarness().catch((error: unknown) => {
  console.error(error)
  const message = error instanceof Error ? error.message : String(error)
  document.querySelector<HTMLDivElement>('#status')!.textContent =
    `FAIL: ${message}`
  document.title = 'FAIL — three-pixel-font visual tests'
  document.documentElement.dataset.visualState = 'failed'
})
