# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 14 credit management system (in Spanish) for managing loans, payments, and clients. Built with TypeScript, Drizzle ORM, Turso (remote SQLite), NextAuth v5, and shadcn/ui components.

## Development Commands

```bash
# Development
pnpm dev              # Start dev server at http://localhost:3000

# Build & Production
pnpm build            # Build for production
pnpm start            # Run production server
pnpm lint             # Run ESLint

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
- Can accept new interest charges to add to existing interestAmount
- Does NOT modify nextPaymentDate

**Full Payment** (`createFullPayment`)
- Pays off entire remaining balance
- Sets: nextPaymentDate = NULL, totalAmount = 0, interestAmount = 0
- Marks credit as completed

### Date Handling & Monthly Anniversaries

**Key utility**: `getNextPaymentDate()` in `src/lib/utils.ts`
- Uses date-fns library
- Preserves month-end anniversary logic
- Example: Credit started Jan 31 → next payment Feb 28/29 → Mar 31
- Handles edge cases for months with different day counts

### Automated Interest Calculation

**Cron job**: `/api/cron/calculate-interest`
- Secured with Bearer token (CRON_SECRET env variable)
- Runs: Daily via Vercel scheduled jobs
- Logic: Adds monthly interest one day after credit anniversary
- Formula: `Math.floor(totalAmount * (interestRate / 100))`
- See: `src/app/api/cron/calculate-interest/README.md` for details

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
