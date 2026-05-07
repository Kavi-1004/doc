---
name: testing-docmanager
description: Test DocManager ERP-lite end-to-end. Use when verifying UI, API, or workflow changes in the DocManager application.
---

# Testing DocManager ERP-lite

## Environment Setup

### PostgreSQL (if not already running)
```bash
sudo apt-get update -qq && sudo apt-get install -y -qq postgresql postgresql-client
sudo pg_ctlcluster 14 main start
sudo -u postgres psql -c "CREATE USER devuser WITH PASSWORD 'devpass' CREATEDB;" || true
sudo -u postgres psql -c "CREATE DATABASE docmanager OWNER devuser;" || true
```

### .env File
```bash
cd /home/ubuntu/repos/Test
cp .env.example .env
# Update DATABASE_URL to: postgresql://devuser:devpass@localhost:5432/docmanager
# Update NEXTAUTH_SECRET to any non-empty string
```

### Database Schema & Seed
```bash
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts  # Note: `prisma db seed` is not configured; run seed script directly
```

### Dev Server
```bash
npm run dev
# Runs on http://localhost:3000
```

### Database
- PostgreSQL must be running on localhost:5432
- Database: `docmanager`, User: `devuser`, Password: `devpass`
- Run `npx prisma db push` if schema changes, then `npx tsx prisma/seed.ts` for test data

### Login Credentials
- Admin: `admin@docmanager.com` / `admin123`
- Role-based access: admin has full access, user role has restricted access

## Devin Secrets Needed
- No secrets required for local testing — all credentials are dev-only defaults
- For email testing: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (optional — app gracefully handles missing SMTP config)

## UI/UX Testing Checklist

When testing visual/UI changes:
1. **Maximize browser window** before recording: `sudo apt-get install -y wmctrl 2>/dev/null; wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`
2. **Login page** (`/login`): Check background styling, branding elements, form card appearance, error/loading states
3. **Sidebar**: Check logo/branding area, active navigation state styling, hover effects on all nav items including logout
4. **Dashboard** (`/`): Check metric cards and quick action buttons for hover effects, animations, and transitions
5. **List pages** (`/companies`, `/customers`, `/quotations`, `/purchase-orders`, `/delivery-orders`, `/invoices`): Check empty states for descriptive text and CTA buttons
6. **Settings** (`/settings`): Click "Save Settings" to verify success confirmation styling
7. Use the **zoom** action on computer tool to capture fine details (hover states, icons, small text)
8. Test hover effects by using `mouse_move` to the target element and taking a screenshot

## Key Testing Workflows

### 1. Quotation PDF Export
- Navigate to `/quotations` and click the green download icon
- PDF opens in new tab via `/api/quotations/{id}/pdf`
- Verify: company header, customer details, items table, totals, footer
- Uses `@react-pdf/renderer` server-side — no browser PDF engine needed

### 2. PO File Upload
- Navigate to `/purchase-orders` → "Upload PO"
- **Important**: The quotation dropdown only shows quotations with `status=SENT`
- If dropdown is empty, change quotation status: either use "Save & Send" button in quotation editor, or run:
  ```sql
  UPDATE "Quotation" SET status = 'SENT' WHERE "quotationNumber" = 'ACME-Q-...';
  ```
- File picker accepts: PDF, PNG, JPG, DOC, DOCX (max 10MB)
- After selecting a file, filename should appear in green text
- Upload directory: `/home/ubuntu/repos/Test/uploads` (gitignored)

### 3. Email Dialog
- Open quotation editor (`/quotations/{id}/edit`) → click "Email" button in toolbar
- "Email" and "PDF" buttons only appear when editing an existing quotation (not on `/quotations/new`)
- Dialog pre-fills customer email from the database
- Without SMTP configured, sending will return an informative error (not a crash)

### 4. Invoice PDF Export
- Requires: Company → Customer → Quotation → Delivery Order → Invoice (full workflow)
- Navigate to `/invoices` and click download PDF icon
- Verify: INVOICE header, invoice number, items, totals, payment details section, DO reference

### 5. Full Document Workflow
1. Create Company (with short code like "ACME")
2. Create Customer
3. Create Quotation (split-screen editor with live preview)
4. Send Quotation (changes status to SENT)
5. Upload PO (linked to SENT quotation)
6. Create Delivery Order (linked to quotation)
7. Create Invoice (linked to DO)

## Document ID Format
- Quotation: `COMPANYSHORT-Q-YYYYMMDD-###` (e.g., ACME-Q-20260501-001)
- Delivery Order: `COMPANYSHORT-DO-YYYYMMDD-###`
- Invoice: `COMPANYSHORT-I-YYYYMMDD-###`
- Revisions append `-R1`, `-R2`, etc.

## Known Gotchas
- The base branch is `base`, not `main` or `master`
- Next.js 16 has breaking changes — read docs in `node_modules/next/dist/docs/` before modifying code
- "middleware" file convention is deprecated in favor of "proxy" (warning is pre-existing, not a bug)
- Quotation calculations: Subtotal - Discount + Tax = Grand Total
- `prisma db seed` is NOT configured — use `npx tsx prisma/seed.ts` directly to seed data
- File uploads use the Web API `FormData`, not multer middleware directly — the upload route handles `request.formData()`
- For Playwright-based file input testing, use CDP at `http://localhost:29229` and `setInputFiles()` on the hidden file input
- Playwright may need to be installed globally: `npm install -g playwright`, then use `NODE_PATH` to resolve it
- When signing out to test login page, click the "Sign out" button at the bottom of the sidebar
