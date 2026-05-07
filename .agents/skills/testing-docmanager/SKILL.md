---
name: testing-docmanager
description: End-to-end testing of the DocManager quotation application. Use when verifying CRUD operations for Companies, Customers, Quotations, Purchase Orders, Delivery Orders, Invoices, and User Management.
---

# Testing DocManager Application

## Prerequisites

1. PostgreSQL running with database `docmanager`
2. Dev server running: `npm run dev` (port 3000)
3. Database seeded: `npx prisma db seed`
4. Default admin login: `admin@docmanager.com` / `admin123`

## Test Order (Important)

Modules have data dependencies. Test in this order:

1. **Companies** - Create first (needed by Quotations, DOs, Invoices)
2. **Customers** - Create second (needed by Quotations, DOs, Invoices)
3. **Quotations** - Requires company + customer. Must be SENT status for PO linking.
4. **Purchase Orders** - Requires a SENT quotation to link to
5. **Delivery Orders** - Requires company + customer (optionally linked to APPROVED quotation)
6. **Invoices** - Requires company + customer (optionally linked to DO)
7. **User Management** - Independent, can be tested anytime

## Key Testing Details

### Companies (`/companies`)
- CRUD via inline form (Add Company button toggles form)
- Required fields: Name, ShortCode
- ShortCode auto-uppercases
- Tax Rate affects quotation tax auto-fill
- Logo upload uses `/api/upload` endpoint

### Customers (`/customers`)
- CRUD via inline form
- Required field: Name only
- Optional: contactPerson, email, phone, address, taxId

### Quotations (`/quotations`)
- New quotation at `/quotations/new` using QuotationEditor component
- Has **live preview** panel on the right side (desktop)
- Quotation number auto-generated: `{SHORTCODE}-Q-{YYYYMMDD}-{###}`
- Tax rate auto-fills from selected company's taxRate
- "Save Draft" keeps status DRAFT
- "Save & Send" changes status to SENT
- After first save, redirects to `/quotations/{id}/edit`
- PDF, Email, Print buttons only appear on edit page (after save)
- Verify totals: subtotal = sum(qty * unitPrice), tax = (subtotal - discount) * taxRate/100

### Purchase Orders (`/purchase-orders`)
- "Upload PO" button opens form
- Quotation dropdown only shows SENT quotations
- File upload is optional (uses `/api/upload`)
- PO number is optional text field

### Delivery Orders (`/delivery-orders`)
- New DO at `/delivery-orders/new`
- Can optionally link to an APPROVED quotation (auto-fills items)
- Required: company + customer
- DO number auto-generated: `{SHORTCODE}-DO-{YYYYMMDD}-{###}`

### Invoices (`/invoices`)
- New invoice at `/invoices/new`
- Can optionally link to a delivery order (auto-fills items from linked quotation)
- Has discount ($) and tax rate (%) fields
- Verify calculation: grandTotal = subtotal - discount + (subtotal - discount) * taxRate/100
- Invoice number auto-generated: `{SHORTCODE}-I-{YYYYMMDD}-{###}`
- Invoice list shows status dropdown (Unpaid/Paid/etc.)

### User Management (`/users`)
- CRUD via inline form
- Role dropdown fetches from `/api/roles` (Admin, User)
- Active toggle (boolean)
- Password field: required on create, optional on edit ("leave blank to keep current")
- Self-deletion is prevented by the API
- Requires `users:read` / `users:write` permissions (admin role has these)

## Common Issues

- **Port 3000 in use**: Kill existing process before starting dev server
- **Prisma client errors**: Run `npx prisma generate` then restart dev server
- **Empty dropdowns**: Make sure prerequisite data exists (e.g., companies/customers before quotations)
- **PO quotation dropdown empty**: Quotation must be in SENT status
- **Date input format**: Use MM/DD/YYYY format in browser date inputs

## Not Testable Without Config

- Email sending (requires SMTP in .env: EMAIL_HOST, EMAIL_USER, EMAIL_PASS)
- PDF generation (works but requires reviewing downloaded file)
- File uploads (requires actual files and `/api/upload` endpoint with storage config)
