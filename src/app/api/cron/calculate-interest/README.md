# Interest Calculation Cron Job

This cron job automatically calculates interest on active credits in the system.

## Functionality

The cron job runs daily and performs the following operations:

1. Checks all active credits in the database
2. For each credit, determines if today is the day to apply monthly interest
3. If applicable, adds the calculated interest amount to the credit's `interestAmount` field

## Interest Application Logic

Interest is applied on a monthly basis, specifically one day after the monthly anniversary date of the credit's start date. For example:

-    Credit created on January 12: Interest applied on February 13, March 13, April 13, etc.
-    Credit created on January 15: Interest applied on February 16, March 16, April 16, etc.

### Handling Month-End Cases

For credits created near the end of a month (days 29, 30, 31), the following rules apply:

-    If the next month doesn't have that day (e.g., February doesn't have 30 or 31), interest is applied on the 1st day of the following month.

Examples:

-    Credit created on January 30: Interest applied on March 1 (after February), April 1 (after March 31), etc.
-    Credit created on January 31: Interest applied on March 1, April 1, May 1, etc.

## Interest Calculation

The interest amount is calculated as:

```
interestAmount = Math.floor(credit.totalAmount * (credit.interestRate / 100))
```

Where:

-    `totalAmount` is the total credit amount
-    `interestRate` is the interest rate percentage (e.g., 5 for 5%)

## Security

The cron job is secured with an authorization token (`CRON_SECRET`) which must be provided in the request header.

## Deployment

This cron job is designed to work with Vercel's scheduled jobs feature. Configure it to run daily at your preferred time.

## Environment Variables

-    `CRON_SECRET`: Secret token for authorizing cron job requests. Must be set in your Vercel environment variables.

## Related Files

-    `src/db/schema.ts`: Contains the database schema for credits
-    `src/app/api/cron/calculate-interest/route.ts`: Contains the cron job implementation
