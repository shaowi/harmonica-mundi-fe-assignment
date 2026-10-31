import { z } from 'zod';
import { formatMoney } from '../../lib/format';

export interface TransferValidationContext {
  availableBalance: number;
  remainingDailyLimit: number;
}

export function createTransferSchema(ctx: TransferValidationContext) {
  const { availableBalance, remainingDailyLimit } = ctx;

  return z
    .object({
      recipientType: z.enum(['saved', 'new']),
      payeeId: z.string(),
      newRecipient: z.object({
        name: z.string(),
        accountNumber: z.string(),
        bank: z.string()
      }),
      fromAccountId: z.string().min(1, 'Choose an account to transfer from.'),
      amount: z
        .string()
        .trim()
        .min(1, 'Enter an amount.')
        .refine((val) => {
          const num = Number(val);
          return !Number.isNaN(num) && num >= 1.0;
        }, 'Enter an amount of at least SGD 1.00.')
        .refine((val) => {
          return /^\d+(\.\d{1,2})?$/.test(val.trim());
        }, 'Use at most 2 decimal places.')
        .refine(
          (val) => {
            const num = Number(val);
            return Number.isNaN(num) || num <= availableBalance;
          },
          `Amount can't be more than your available balance (${formatMoney(availableBalance)}).`
        )
        .refine(
          (val) => {
            const num = Number(val);
            return Number.isNaN(num) || num <= remainingDailyLimit;
          },
          `This transfer exceeds your remaining daily limit (${formatMoney(remainingDailyLimit)}).`
        ),
      note: z.string().max(50, 'Keep the note to 50 characters or fewer.')
    })
    .superRefine((data, refinementCtx) => {
      if (data.recipientType === 'saved') {
        if (!data.payeeId || data.payeeId.trim() === '') {
          refinementCtx.addIssue({
            code: 'custom',
            message: 'Choose a payee to send to.',
            path: ['payeeId']
          });
        }
      } else {
        const nr = data.newRecipient;
        const name = nr.name.trim();
        const accountNumber = nr.accountNumber.trim();
        const bank = nr.bank.trim();

        if (name.length < 2 || name.length > 50) {
          refinementCtx.addIssue({
            code: 'custom',
            message: 'Enter a recipient name (2–50 characters).',
            path: ['newRecipient', 'name']
          });
        }

        if (!/^\d{8}$/.test(accountNumber)) {
          refinementCtx.addIssue({
            code: 'custom',
            message: 'Enter a valid 8-digit account number.',
            path: ['newRecipient', 'accountNumber']
          });
        }

        if (!bank || bank.length < 2) {
          refinementCtx.addIssue({
            code: 'custom',
            message: 'Choose a bank.',
            path: ['newRecipient', 'bank']
          });
        }
      }
    });
}

export type TransferFormValues = z.infer<
  ReturnType<typeof createTransferSchema>
>;
