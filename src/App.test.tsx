import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import App from './App';
import { formatMoney } from './lib/format';
import { server } from './test/setup';

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

describe('Dashboard', () => {
  it('renders customer greeting, total available, accounts, and transactions', async () => {
    renderApp();

    // Skeletons are displayed initially
    expect(
      screen.getByLabelText(/loading dashboard data/i)
    ).toBeInTheDocument();

    // Waits for dashboard data to load
    await waitFor(() => {
      expect(screen.getByText(/good evening, ava/i)).toBeInTheDocument();
    });

    // D3 - Total available balance (checking + savings only)
    expect(screen.getByText('Total available')).toBeInTheDocument();
    expect(screen.getByText(formatMoney(17120.55))).toBeInTheDocument();
    expect(screen.getByText('Across 2 deposit accounts')).toBeInTheDocument();

    // D4 - Accounts
    expect(screen.getByText('Everyday Checking')).toBeInTheDocument();
    expect(screen.getByText(formatMoney(4280.55))).toBeInTheDocument();
    expect(screen.getByText('Savings Plus')).toBeInTheDocument();
    expect(screen.getByText(formatMoney(12840))).toBeInTheDocument();
    expect(screen.getByText('Rewards Card')).toBeInTheDocument();
    expect(screen.getByText(formatMoney(-420.3))).toBeInTheDocument();
    expect(screen.getByText('Amount due')).toBeInTheDocument();

    // D5 - Recent transactions
    expect(screen.getByText('Recent transactions')).toBeInTheDocument();
    expect(screen.getByText('FairPrice Finest')).toBeInTheDocument();
    expect(screen.getByText(formatMoney(-86.4))).toBeInTheDocument();
    expect(screen.getByText('Grab')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();

    // Daily limit rail
    expect(screen.getByText('Daily limit')).toBeInTheDocument();
    expect(screen.getByText(formatMoney(5000))).toBeInTheDocument();
  });

  it('filters transactions by description or category and clears search', async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('FairPrice Finest')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search transactions');

    // Search by category "groceries"
    await user.type(searchInput, 'groceries');
    expect(screen.getByText('FairPrice Finest')).toBeInTheDocument();
    expect(screen.queryByText('Grab')).not.toBeInTheDocument();

    // Clear search using the clear button in the input
    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    await user.click(clearBtn);
    expect(screen.getByText('Grab')).toBeInTheDocument();

    // Search with no matches
    await user.type(searchInput, 'xyznomatch');
    expect(
      screen.getByText('No transactions match your search.')
    ).toBeInTheDocument();

    // Clear search from empty state
    const emptyStateClearBtn = screen.getByRole('button', {
      name: 'Clear search'
    });
    await user.click(emptyStateClearBtn);
    expect(screen.getByText('FairPrice Finest')).toBeInTheDocument();
    expect(screen.getByText('Grab')).toBeInTheDocument();
  });

  it('shows error when dashboard request fails, and Retry loads it (E4.3)', async () => {
    const user = userEvent.setup();

    // Force an API error on accounts
    server.use(
      http.get('*/api/accounts', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
          { status: 500 }
        )
      )
    );

    renderApp();

    // Verify error state
    await waitFor(() => {
      expect(
        screen.getByText("We couldn't load your dashboard.")
      ).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Reset handlers to restore working API responses
    server.resetHandlers();

    // Click Retry
    await user.click(retryBtn);

    // Verify dashboard successfully loads
    await waitFor(() => {
      expect(screen.getByText('Total available')).toBeInTheDocument();
      expect(screen.getByText(formatMoney(17120.55))).toBeInTheDocument();
    });
  });
});
