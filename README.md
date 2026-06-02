# Plastik ERP — Frontend

Multi-tenant SaaS ERP frontend for plastic manufacturing companies.

## Apps

| App | Port | Description |
|---|---|---|
| `@erp/tenant` | 3000 | Tenant ERP Panel |
| `@erp/platform` | 3001 | Platform Admin Panel |

## Packages

| Package | Description |
|---|---|
| `@erp/ui` | Shared UI component library |
| `@erp/api-client` | Axios-based API service layer |
| `@erp/hooks` | Shared React hooks + Zustand stores |
| `@erp/utils` | Utility functions (cn, currency, date) |
| `@erp/i18n` | i18next config + locale files (tr/en/ar) |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start tenant app
pnpm dev:tenant

# Start platform app
pnpm dev:platform

# Start both
pnpm dev
```

## Rules

See `CLAUDE.md` for all coding rules and architecture decisions.
See `FRONTEND_ARCHITECTURE.md` for detailed architecture documentation.

## Stack

React 18 · TypeScript 5 · Vite 5 · TailwindCSS · TanStack Query · TanStack Router · Zustand · React Hook Form · Zod · i18next (tr/en/ar RTL)
