# Family Expense Tracker — ServiceNow Scoped Application

A personal/family finance tracking app built as a custom scoped application on a ServiceNow Personal Developer Instance (PDI). Built to demonstrate hands-on ServiceNow Application Developer (CAD) skills — data modeling, client/server scripting, GlideAjax, Business Rules, and Flow Designer automation — beyond what's covered by the CSA certification alone.

**Scope Identifier:** `x_2169755_family_0`

**Demo Video:** [Watch here](https://lnkd.in/p/gzPrGcar) 

---

## What It Does

Family members log daily expenses against a shared monthly budget. The app automatically:
- Validates expense entries in real time before they're even saved
- Rolls up spending totals and remaining balance on the parent budget
- Flags budget status (Within Budget / Warning / Exceeded) automatically
- Sends an email alert to everyone who logged an expense when a budget is exceeded

---

## Data Model

**Monthly Budget** (`x_2169755_family_0_monthly_budget`) — parent table

| Field | Type | Notes |
|---|---|---|
| `month_year` | String | e.g. "August 2026" |
| `allocated_budget` | Decimal | Total planned budget |
| `total_spent` | Decimal | Auto-calculated, read-only |
| `remaining_budget` | Decimal | Auto-calculated, read-only |
| `status` | Choice | Within Budget / Warning / Exceeded |

Includes a related list showing all linked Daily Expense records.

**Daily Expense** (`x_2169755_family_0_daily_expense`) — child table

| Field | Type | Notes |
|---|---|---|
| `monthly_budget` | Reference | → Monthly Budget |
| `expense_date` | Date | Auto-defaults to today on new records |
| `category` | Choice | Groceries, Utilities, Rent, Entertainment, Medical |
| `amount` | Decimal | Transaction amount |
| `spent_by` | Reference | → sys_user |
| `description` | String | |

---

## Features & Architecture

### Client Scripts (`/client-scripts`)
- **Set Default Date and User** (`onLoad`) — auto-populates `spent_by` and `expense_date` on new expense records.
- **Validate Positive Amount** (`onChange` on `amount`) — blocks non-positive values, then calls a GlideAjax Script Include asynchronously to check the entry against the remaining budget in real time and warn the user before they even save.

### Script Include (`/script-includes`)
- **`ExpenseBudgetAjax`** — client-callable, extends `AbstractAjaxProcessor`. Returns the live `remaining_budget` value for a given Monthly Budget record via `getRemainingBudget()`, so the client script can validate a new expense against the real-time remaining balance without a full page submit. Relies on the Business Rules above keeping `remaining_budget` accurate on every save.

### Business Rules (`/business-rules`)
- **`Calculate Monthly Total`** — Table: Daily Expense · When: After (Insert/Update/Delete). Recalculates `total_spent` and `remaining_budget` on the parent Monthly Budget whenever a child expense changes, and auto-evaluates status thresholds (Exceeded / Warning at ≤15% remaining / Within Budget). Handles reassignment between budgets and resets correctly when all expenses are deleted.
- **`Recalculate on Budget Change`** — Table: Monthly Budget · When: Before (Insert/Update) · Condition: `allocated_budget` changes. Recalculates `remaining_budget` and `status` directly on the Monthly Budget record when the allocated amount itself is edited — this covers the case where an admin increases or decreases the monthly cap after expenses already exist, which the first Business Rule alone wouldn't catch since it only reacts to changes on child Daily Expense records.

### Flow Designer (`/flow-designer`)
- **`Budget Exceeded Alert`** — triggers only when a budget's Status transitions into "Exceeded" (not on every subsequent save, to avoid duplicate emails). Looks up every Daily Expense record tied to the budget and emails each spender using native Look Up Records + For Each + Send Email actions — built declaratively, no scripting required.

### UI Policy
- Displays an error banner on the Monthly Budget form when Status = Exceeded.

---

## Bugs Found & Fixed

Documenting these because debugging methodology matters as much as the build itself:

1. **Silent field name mismatch** — the Business Rule and Script Include were both writing/reading `remaining_balance`, but the actual dictionary column was named `remaining_budget`. ServiceNow's `setValue()` fails silently on a non-existent field name (no error thrown), so the bug looked like a logic error when it was actually a naming typo. Caught by comparing dictionary "Column name" against the script.

2. **`GlideAggregate` returning an incorrect SUM** — while summing expense amounts for the rollup, `GlideAggregate` returned an inconsistent total that didn't match the actual sum of the underlying records (verified via a manual Background Script cross-check with a plain `GlideRecord` loop). Resolved by replacing `GlideAggregate` with a manual `GlideRecord` summation loop, which reliably returned the correct total.

3. **Duplicate-notification risk in Flow Designer** — the initial flow design would have re-fired the exceeded-budget email on every subsequent expense logged after a budget was already in "Exceeded" status. Fixed by configuring the trigger to fire only on the transition *into* the Exceeded condition, not on every match.

---

## Tech / Skills Demonstrated

`ServiceNow Scoped App Development` · `GlideRecord` · `GlideAggregate` · `GlideAjax` · `Business Rules` · `Client Scripts` · `Script Includes` · `Flow Designer` · `UI Policies` · `ACL fundamentals`

---

## Author 
Amal Krishna J
