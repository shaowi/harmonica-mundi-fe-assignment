import { apiFetch } from './client'
import type {
  CreateTransferRequest,
  Payee,
  PayeesResponse,
  TransferResponse,
} from './types'

export async function fetchPayees(): Promise<Payee[]> {
  const data = await apiFetch<PayeesResponse>('/api/payees')
  return data.payees
}

export async function submitTransfer(
  request: CreateTransferRequest,
): Promise<TransferResponse> {
  return apiFetch<TransferResponse>('/api/transfers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
}

