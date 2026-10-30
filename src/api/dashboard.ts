import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';
import type {
  Account,
  AccountsResponse,
  Customer,
  CustomerResponse,
  Transaction,
  TransactionsResponse
} from './types';

export async function fetchCustomer(): Promise<Customer> {
  const data = await apiFetch<CustomerResponse>('/api/customer');
  return data.customer;
}

export async function fetchAccounts(): Promise<Account[]> {
  const data = await apiFetch<AccountsResponse>('/api/accounts');
  return data.accounts;
}

export async function fetchTransactions(limit = 8): Promise<Transaction[]> {
  const data = await apiFetch<TransactionsResponse>(
    `/api/transactions?limit=${limit}`
  );
  return data.transactions;
}

export function useDashboardData() {
  const customerQuery = useQuery({
    queryKey: ['customer'],
    queryFn: fetchCustomer
  });

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions', { limit: 8 }],
    queryFn: () => fetchTransactions(8)
  });

  const isPending =
    customerQuery.isPending ||
    accountsQuery.isPending ||
    transactionsQuery.isPending;

  const isError =
    customerQuery.isError || accountsQuery.isError || transactionsQuery.isError;

  const error =
    customerQuery.error ?? accountsQuery.error ?? transactionsQuery.error;

  const refetch = async () => {
    await Promise.all([
      customerQuery.refetch(),
      accountsQuery.refetch(),
      transactionsQuery.refetch()
    ]);
  };

  const accounts = accountsQuery.data ?? [];
  const depositAccounts = accounts.filter((acc) => acc.type !== 'credit'); // Credit accounts are not included in the total available balance (D3)
  const totalAvailable = depositAccounts.reduce(
    (sum, acc) => sum + acc.balance,
    0
  );

  const customer = customerQuery.data;
  const remainingDailyLimit = customer
    ? Math.max(0, customer.dailyTransferLimit - customer.transferredToday)
    : 0;

  return {
    customer,
    accounts,
    depositAccounts,
    totalAvailable,
    remainingDailyLimit,
    transactions: transactionsQuery.data ?? [],
    isPending,
    isError,
    error,
    refetch,
    // Provide individual query references if needed
    customerQuery,
    accountsQuery,
    transactionsQuery
  };
}
