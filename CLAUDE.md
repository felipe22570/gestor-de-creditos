# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 credit management system (in Spanish) for managing loans, payments, and clients. Built with TypeScript, React 19, Drizzle ORM, Turso (remote SQLite), NextAuth v5 (beta.30), and shadcn/ui components.

## Development Commands

```bash
# Development
pnpm dev              # Start dev server at http://localhost:3000

# Build & Production
pnpm build            # Build for production
pnpm start            # Run production server
pnpm lint             # Run ESLint

# Testing (Vitest 4)
pnpm test             # Watch mode
pnpm test:run         # Single run (CI)

# Git hooks
# Husky pre-commit hook runs on every commit (configured in .husky/pre-commit)

# Database (Drizzle)
pnpm drizzle-kit generate  # Generate migrations from schema changes
pnpm drizzle-kit migrate   # Apply migrations to database
pnpm drizzle-kit studio    # Open Drizzle Studio (DB GUI)
```

## Architecture Overview

### Database Schema

The system uses SQLite (via Turso) with three core tables defined in `src/db/schema.ts`:

**users** - Loan officers/admins who manage credits
- Fields: id, name, email (unique), password (bcrypt), phone, balance
- Represents the authenticated admin users

**credits** - Individual loan records
- Links to: users.id (adminId foreign key)
- Client info: clientCardId, clientName, clientPhone
- Product: productName
- Financial: initialAmount, interestRate, interestAmount, totalAmount
- Dates: startDate, modifiedDate, nextPaymentDate
- Optional: numPayments
- **Status is derived**, not stored:
  - Active: nextPaymentDate NOT NULL
  - Due: nextPaymentDate < current timestamp
  - Completed: nextPaymentDate IS NULL AND totalAmount = 0

**payments** - Payment transaction records
- Links to: users.id (adminId), credits.id (creditId)
- Fields: amountPaid, paymentType (CAPITAL | INTEREST), startDate
- Maintains audit trail of all credit payments

### Authentication Flow (NextAuth v5)

Configuration in `src/auth.config.ts`:
- Provider: Credentials (email/password)
- Password hashing: bcryptjs with 10 rounds
- Session callback: Fetches fresh user data from DB and enriches session
- Type augmentation in `@types/next-auth.d.ts` extends session with user profile

Protected routes:
- `/dashboard` layout checks session, redirects to `/login` if missing
- Auth pages redirect to `/dashboard` if session exists

### Server Actions Pattern

All server actions in `src/lib/actions/` follow this pattern:

```typescript
"use server";
import { auth } from "@/auth.config";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function actionName(data: ActionData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  try {
    // Database operation
    const result = await db.insert(table).values(data);
    revalidatePath("/dashboard");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error al procesar la solicitud");
  }
}
```

**Key server action files:**
- `admin.ts` - Authentication and user management
- `credit.ts` - Credit CRUD operations with filtered fetches (active, due, completed)
- `payment.ts` - Payment processing with three types: capital, interest, full

### Credit State Management

Credits don't have an explicit status column. State is computed:

**Active Credits**: `nextPaymentDate IS NOT NULL`
- Fetched by: `fetchActiveCredits(adminId)`

**Due Credits**: `nextPaymentDate < current timestamp`
- Fetched by: `fetchCreditsDue(adminId)`

**Completed Credits**: `nextPaymentDate IS NULL AND totalAmount = 0`
- Fetched by: `fetchCompletedCredits(adminId)`

### Payment Types & Business Logic

Three payment types handled differently in `src/lib/actions/payment.ts`:

**Capital Payment** (`createCapitalPayment`)
- Reduces principal (totalAmount)
- Updates nextPaymentDate using `getNextPaymentDate()` utility
- Preserves monthly anniversary, handles month-end edge cases

**Interest Payment** (`createInterestPayment`)
- Pays down interestAmount only
- Advances `nextPaymentDate` by one month (same as capital payment)
- `addNewInterest: boolean` parameter: if true, recalculates and sets new interestAmount for next month; if false, clears interestAmount to 0

**Full Payment** (`createFullPayment`)
- Pays off entire remaining balance: `amountPaid = totalAmount + interestAmount`
- Sets: nextPaymentDate = NULL, totalAmount = 0, interestAmount = 0
- Marks credit as completed

**Delete Payment** (`deletePayment`)
- Reverses a payment and restores credit state atomically via `db.transaction()`
- CAPITAL deletion: restores `totalAmount`, recalculates `nextPaymentDate`
- INTEREST deletion: restores `interestAmount`, recalculates `nextPaymentDate`
- FULL deletion: restores capital (initialAmount minus remaining CAPITAL payments), restores interest, recalculates `nextPaymentDate`
- `nextPaymentDate` is always recomputed from scratch using `recalculateNextPaymentDate(startDate, remainingPaymentCount)`

> All payment mutations (create and delete) run inside `db.transaction()` for atomicity.

### Date Handling & Monthly Anniversaries

**Key utilities** in `src/lib/utils.ts`:

**`getNextPaymentDate(paymentDate, startDate?)`**
- Advances one month from `paymentDate`, preserving the original day-of-month from `startDate` to prevent drift
- If the result is still in the past (overdue credit), keeps advancing month-by-month until the date is in the future
- Handles month-end edge cases (e.g. Jan 31 → Feb 28/29 → Mar 31)

**`recalculateNextPaymentDate(startDate, paymentCount)`**
- Recomputes `nextPaymentDate` from scratch: `startDate + (paymentCount + 1) months`
- Used when deleting a payment to restore the correct date without drift
- `+1` because the first `nextPaymentDate` at credit creation is already `startDate + 1 month`

**`isMonthlyAnniversaryPlusOne(startDate, currentDate)`**
- Returns true if `currentDate` is exactly one day after the monthly anniversary of `startDate`
- Used by the cron job to determine when to charge monthly interest
- Handles month-end edge cases (e.g. Jan 31 anniversary triggers on Mar 1)

**`calculateInterest(totalAmount, interestRate)`**
- Formula: `Math.floor(totalAmount * (interestRate / 100))`

### Automated Interest Calculation

**Cron job**: `/api/cron/calculate-interest`
- Secured with Bearer token (CRON_SECRET env variable)
- Runs: Daily via Vercel scheduled jobs
- Logic: Calls `isMonthlyAnniversaryPlusOne()` per credit; if true, adds interest via `calculateInterest()`
- Formula: `Math.floor(totalAmount * (interestRate / 100))`
- See: `src/app/api/cron/calculate-interest/README.md` for details

### Test Suite

Unit tests in `src/lib/__tests__/` (Vitest 4, jsdom environment):

| File | What it covers |
|---|---|
| `calculate-interest.test.ts` | `calculateInterest()` utility |
| `credit-lifecycle.test.ts` | Full credit state transitions |
| `cron-interest.test.ts` | Cron interest calculation logic |
| `format-cop.test.ts` | `formatCOP()` currency formatting |
| `get-next-payment-date.test.ts` | `getNextPaymentDate()` edge cases |
| `is-monthly-anniversary.test.ts` | `isMonthlyAnniversaryPlusOne()` edge cases |
| `payment-deletion.test.ts` | `deletePayment()` reversal logic |
| `payment-validation.test.ts` | Payment validation (amounts, credit state) |
| `recalculate-next-payment-date.test.ts` | `recalculateNextPaymentDate()` |

Config: `vitest.config.ts` — uses `@vitejs/plugin-react`, `vite-tsconfig-paths`, setup file imports `@testing-library/jest-dom`.

### Component Architecture

**Server Components** (default)
- Dashboard pages that fetch data
- Examples: `/dashboard/credits-active/page.tsx`

**Client Components** ("use client")
- Modals and interactive forms
- Located in: `src/components/modals/`
- Pattern: useState for form, useRouter().refresh() after mutations, useToast() for feedback

**Key modals:**
- `add-new-credit.tsx` - Create new credit
- `edit-credit.tsx` - Update credit details
- `payment.tsx` - Capital payment modal
- `payment-interest.tsx` - Interest payment modal
- `payment-full.tsx` - Full payoff modal
- `view-payments.tsx` - View payment history for a credit
- `print-invoice-modal.tsx` - Print receipt functionality

### Application Routes

```
/
├── (auth)/                    # Auth pages group (redirects authenticated users)
│   ├── login/
│   └── register/
├── dashboard/                 # Protected routes (requires auth)
│   ├── page.tsx              # Home/welcome
│   ├── layout.tsx            # Auth check + Sidebar navigation
│   ├── credits-active/       # Active loans (nextPaymentDate NOT NULL)
│   ├── credits-due/          # Overdue loans (nextPaymentDate < now)
│   ├── credits-completed/    # Paid-off loans (nextPaymentDate NULL)
│   └── payments/             # Payment transaction history
```

### Type Safety

TypeScript with strict mode enabled. Key type locations:
- `/src/types/` - Custom interfaces (UserAdmin, CreditRequest, PaymentRequest)
- Drizzle ORM provides inferred types for Credit, Payment, User schemas
- `/@types/next-auth.d.ts` - NextAuth session type augmentation

### Styling System

- Tailwind CSS with utility-first approach
- Shadcn/ui component library in `src/components/ui/`
- Radix UI primitives for accessibility
- Custom utilities:
  - `cn()` for conditional className merging
  - `formatCOP()` for Colombian Peso currency formatting

## Next.js 15+/16 Breaking Changes

- **`params` and `searchParams` are async** in pages and layouts — always `await` them:
  ```typescript
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  ```
- **`headers()`, `cookies()`, `searchParams()`** are also async in Route Handlers and Server Actions.

## Important Patterns to Follow

1. **All user-facing text must be in Spanish**
2. **Currency formatting**: Always use `formatCOP()` from `src/lib/utils.ts`
3. **Cascade deletes**: Deleting a credit must also delete all associated payments
4. **Session enrichment**: Auth callback fetches latest balance on each request
5. **Date preservation**: Use `getNextPaymentDate()` to maintain monthly anniversary logic
6. **No status fields**: Credit state is always derived from nextPaymentDate and totalAmount
7. **Revalidation**: Call `revalidatePath()` after mutations in server actions
8. **Error handling**: Wrap DB operations in try-catch, throw Spanish error messages

## Environment Variables

Required in `.env`:
```bash
DATABASE_URL=          # Turso database URL
DATABASE_AUTH_TOKEN=   # Turso auth token
AUTH_SECRET=          # NextAuth secret (generate with openssl rand -base64 32)
CRON_SECRET=          # Bearer token for cron job
```

## Database Migrations

Schema changes require Drizzle migrations:
1. Modify `src/db/schema.ts`
2. Run `pnpm drizzle-kit generate` to create migration
3. Review migration SQL in `drizzle/migrations/`
4. Run `pnpm drizzle-kit migrate` to apply
5. Turso configuration in `drizzle.config.ts`

## Common Development Workflows

**Adding a new credit field:**
1. Update schema in `src/db/schema.ts`
2. Generate and apply migration
3. Update TypeScript types in `src/types/`
4. Modify server actions in `src/lib/actions/credit.ts`
5. Update forms in modals components
6. Update table columns in dashboard pages

**Creating a new dashboard page:**
1. Add page in `src/app/dashboard/your-page/page.tsx`
2. Create server action to fetch data
3. Build client component with table using TanStack React Table
4. Add navigation link to `src/components/dashboard/sidebar.tsx`
5. Use existing patterns from credits-active or payments pages

**Adding a new payment type:**
1. Extend `paymentType` in schema (add to union type)
2. Create new server action in `src/lib/actions/payment.ts`
3. Build modal component in `src/components/modals/`
4. Add action button to credit table columns
5. Consider impact on credit state transitions
