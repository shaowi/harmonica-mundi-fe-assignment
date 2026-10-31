import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import App from './App'
import { formatMoney } from './lib/format'
import { server } from './test/setup'

// Increase async timeout since mock API handlers have an intentional 500ms delay per request
configure({ asyncUtilTimeout: 4000 })

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

/**
 * Custom text matcher for money strings that normalizes whitespace and non-breaking spaces (U+00A0).
 * Prevents TestingLibraryElementError caused by Intl non-breaking space mismatches.
 */
function matchMoney(amount: number) {
  const formatted = formatMoney(amount).replace(/\u00a0/g, ' ')
  return (_: string, node: Element | null) => {
    const hasText = node?.textContent?.replace(/\u00a0/g, ' ') === formatted
    const childrenDontHaveText = Array.from(node?.children || []).every(
      (child) => child.textContent?.replace(/\u00a0/g, ' ') !== formatted,
    )
    return Boolean(hasText && childrenDontHaveText)
  }
}

describe('Dashboard', () => {
  it('renders customer greeting, total available, accounts, and transactions', async () => {
    renderApp()

    // Skeletons are displayed initially
    expect(
      screen.getByLabelText(/loading dashboard data/i),
    ).toBeInTheDocument()

    // Waits for dashboard data to load
    await waitFor(() => {
      expect(screen.getByText(/good evening, ava/i)).toBeInTheDocument()
    })

    // D3 - Total available balance (checking + savings only)
    expect(screen.getByText('Total available')).toBeInTheDocument()
    expect(screen.getByText(matchMoney(17120.55))).toBeInTheDocument()
    expect(
      screen.getByText('Across 2 deposit accounts'),
    ).toBeInTheDocument()

    // D4 - Accounts
    expect(screen.getByText('Everyday Checking')).toBeInTheDocument()
    expect(screen.getByText(matchMoney(4280.55))).toBeInTheDocument()
    expect(screen.getByText('Savings Plus')).toBeInTheDocument()
    expect(screen.getByText(matchMoney(12840))).toBeInTheDocument()
    expect(screen.getByText('Rewards Card')).toBeInTheDocument()
    expect(screen.getByText(matchMoney(-420.3))).toBeInTheDocument()
    expect(screen.getByText('Amount due')).toBeInTheDocument()

    // D5 - Recent transactions
    expect(screen.getByText('Recent transactions')).toBeInTheDocument()
    expect(screen.getByText('FairPrice Finest')).toBeInTheDocument()
    expect(screen.getByText(matchMoney(-86.4))).toBeInTheDocument()
    expect(screen.getByText('Grab')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()

    // Daily limit rail
    expect(screen.getByText('Daily limit')).toBeInTheDocument()
    expect(screen.getByText(matchMoney(5000))).toBeInTheDocument()
  })

  it('filters transactions by description or category and clears search', async () => {
    const user = userEvent.setup()
    renderApp()

    await waitFor(() => {
      expect(screen.getByText('FairPrice Finest')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search transactions')

    // Search by category "groceries"
    await user.type(searchInput, 'groceries')
    expect(screen.getByText('FairPrice Finest')).toBeInTheDocument()
    expect(screen.queryByText('Grab')).not.toBeInTheDocument()

    // Clear search using the clear button in the input
    const clearBtn = screen.getByTitle('Clear search')
    await user.click(clearBtn)
    expect(screen.getByText('Grab')).toBeInTheDocument()

    // Search with no matches
    await user.type(searchInput, 'xyznomatch')
    expect(
      screen.getByText('No transactions match your search.'),
    ).toBeInTheDocument()

    // Clear search from empty state
    const emptyStateClearBtn = screen.getByText('Clear search')
    await user.click(emptyStateClearBtn)
    expect(screen.getByText('FairPrice Finest')).toBeInTheDocument()
    expect(screen.getByText('Grab')).toBeInTheDocument()
  })

  it("shows error when dashboard request fails, and Retry loads it (E4.3)", async () => {
    const user = userEvent.setup()

    // Force an API error on accounts
    server.use(
      http.get('*/api/accounts', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
          { status: 500 },
        ),
      ),
    )

    renderApp()

    // Verify error state
    await waitFor(() => {
      expect(
        screen.getByText("We couldn't load your dashboard."),
      ).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    expect(retryBtn).toBeInTheDocument()

    // Reset handlers to restore working API responses
    server.resetHandlers()

    // Click Retry
    await user.click(retryBtn)

    // Verify dashboard successfully loads
    await waitFor(() => {
      expect(screen.getByText('Total available')).toBeInTheDocument()
      expect(screen.getByText(matchMoney(17120.55))).toBeInTheDocument()
    })
  })
})

describe('Transfer Flow', () => {
  it(
    'an amount over the balance shows the error and sends no request (E4.1)',
    async () => {
      const user = userEvent.setup()

      let transferRequestSent = false
      server.use(
        http.post('*/api/transfers', () => {
          transferRequestSent = true
          return HttpResponse.json({}, { status: 201 })
        }),
      )

      renderApp()

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Total available')).toBeInTheDocument()
      })

      // Click "New transfer" button
      const newTransferBtns = screen.getAllByRole('button', {
        name: /new transfer/i,
      })
      await user.click(newTransferBtns[0])

      // Dialog opens to Step 1: Recipient
      await waitFor(() => {
        expect(
          screen.getByText('Who are you sending to?'),
        ).toBeInTheDocument()
      })

      // Select payee (first payee Jamie Tan is default or click it)
      const jamieCard = await screen.findByText('Jamie Tan')
      await user.click(jamieCard)

      // Click Continue to go to Step 2
      const continueBtn = screen.getByRole('button', { name: /continue/i })
      await user.click(continueBtn)

      // Verify on Step 2: Amount
      await waitFor(() => {
        expect(screen.getByText('How much?')).toBeInTheDocument()
      })

      // Balance is 4,280.55. Enter 5000 (over available balance)
      const amountInput = screen.getByPlaceholderText('0.00')
      await user.type(amountInput, '5000')

      // Click Continue
      const step2ContinueBtn = screen.getByRole('button', { name: /continue/i })
      await user.click(step2ContinueBtn)

      // Expect the inline error message
      expect(
        screen.getByText(/Amount can't be more than your available balance/i),
      ).toBeInTheDocument()

      // No request was sent and still on Step 2
      expect(transferRequestSent).toBe(false)
      expect(screen.getByText('How much?')).toBeInTheDocument()
      expect(screen.queryByText('Check the details')).not.toBeInTheDocument()
    },
    15000,
  )

  it(
    'a successful transfer shows the success screen and the dashboard updates (E4.2)',
    async () => {
      const user = userEvent.setup()
      renderApp()

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Everyday Checking')).toBeInTheDocument()
        expect(screen.getByText(matchMoney(4280.55))).toBeInTheDocument()
      })

      // Click "New transfer"
      const newTransferBtns = screen.getAllByRole('button', {
        name: /new transfer/i,
      })
      await user.click(newTransferBtns[0])

      // Wait for dialog step 1
      await waitFor(() => {
        expect(
          screen.getByText('Who are you sending to?'),
        ).toBeInTheDocument()
      })

      // Select Jamie Tan
      const jamieCard = await screen.findByText('Jamie Tan')
      await user.click(jamieCard)
      await user.click(screen.getByRole('button', { name: /continue/i }))

      // Step 2: Amount
      await waitFor(() => {
        expect(screen.getByText('How much?')).toBeInTheDocument()
      })

      const amountInput = screen.getByPlaceholderText('0.00')
      await user.type(amountInput, '120')

      const noteInput = screen.getByPlaceholderText("What's this for?")
      await user.type(noteInput, 'Dinner')

      await user.click(screen.getByRole('button', { name: /continue/i }))

      // Step 3: Review
      await waitFor(() => {
        expect(screen.getByText('Check the details')).toBeInTheDocument()
      })
      expect(screen.getByText('Dinner')).toBeInTheDocument()

      // Confirm transfer
      const confirmBtn = screen.getByRole('button', {
        name: /confirm transfer/i,
      })
      await user.click(confirmBtn)

      // Success screen
      await waitFor(() => {
        expect(screen.getByText('Transfer sent')).toBeInTheDocument()
      })
      expect(screen.getByText(matchMoney(120))).toBeInTheDocument()
      expect(screen.getByText(/TRF-/i)).toBeInTheDocument()

      // Return to dashboard
      const backToDashboardBtn = screen.getByRole('button', {
        name: /back to dashboard/i,
      })
      await user.click(backToDashboardBtn)

      // Dialog is closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      // Dashboard shows updated Everyday Checking balance (4,280.55 - 120 = 4,160.55)
      await waitFor(() => {
        expect(screen.getByText(matchMoney(4160.55))).toBeInTheDocument()
      })

      // Dashboard shows new transaction
      expect(screen.getByText('Transfer to Jamie Tan')).toBeInTheDocument()
    },
    15000,
  )
})
