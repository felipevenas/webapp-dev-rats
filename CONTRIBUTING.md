# Contributing Guide 🤝

Thank you for your interest in contributing to **DevRats Web**! This document explains the development process so the interface stays consistent, accessible, and sustainable.

> **Golden rule:** DevRats verifies eligible activity, not learning. No contribution may expose source code, private commit messages, tokens, or data from third-party repositories. The API is the source of truth for authorization and progress.

---

## 🛠️ Development Environment

### Prerequisites

- **Node.js >= 22.12** (validated with Node 24).
- **npm >= 10**.
- The Spring Boot API (`api-dev-rats`) and PostgreSQL running for authenticated flows.

### Installation

```bash
git clone https://github.com/felipevenas/webapp-dev-rats.git
cd webapp-dev-rats
npm install
cp .env.example .env.local
npm run dev
```

The app starts at **http://localhost:5174**. In development, Vite proxies `/api` to `http://localhost:8080`.

To validate against another environment without changing build variables, set the following in `.env.local`:

```env
VITE_PROXY_API_TARGET=https://api.devrats.app
VITE_PROXY_WS_TARGET=wss://api.devrats.app
VITE_PROXY_ORIGIN=https://devrats.app
```

The defaults still point to the local backend. The proxy is used only when `VITE_API_BASE_URL` is empty and `VITE_WS_URL` is unset: if either points to an absolute URL, the frontend connects directly and bypasses the corresponding proxy. Clear both before using the variables above.

> Port `5173` is avoided because another local project commonly occupies it. For GitHub OAuth, the API must have `APP_FRONTEND_URL=http://localhost:5174` and the matching origin in `APP_CORS_ALLOWED_ORIGINS`.

Complete setup, architecture, and integration details are in [`README.md`](README.md).

---

## 🌿 Branches and Commits

We use **Trunk-Based Development** with short-lived branches created from `main` and merged through pull requests.

### Branch names

- `feat/feature-name`
- `bug/bug-name`
- `chore/task-name`
- `docs/document-name`
- `style/visual-adjustment`
- `refactor/refactoring-name`
- `test/test-name`

Examples: `feat/calendar-by-member`, `bug/refresh-on-reopen`, `style/softer-shadows`.

### Commits

Commit messages are written in **English** with conventional prefixes:

| Prefix | Use |
| --- | --- |
| `feat:` | New user-visible functionality |
| `fix:` | Behavior or layout fix |
| `refactor:` | Refactoring with no functional change |
| `docs:` | Documentation, README, or relevant comments |
| `test:` | Unit or integration tests |
| `style:` | Purely visual or formatting adjustment |
| `chore:` | Build, dependencies, CI/CD, or configuration |

Example: `feat: add status filter to the challenge list`.

---

## 🏛️ Architectural Guidelines

The organization is **feature-based**, with simple and explicit boundaries:

```
src/features/<feature>/
├── domain/   # types and pure rules, no React
├── data/     # API clients, server hooks, and query keys
└── ui/       # pages and presentational components
```

Rules:

1. **Pure domain.** `domain` does not import React, axios, hooks, or browser APIs.
2. **Isolated data.** HTTP calls live in `data` (or `core/http`); components must not scatter API URLs.
3. **Predictable UI.** Small components, explicit states (loading, empty, error, no permission), and no duplicated business rules.
4. **Design system.** Semantic tokens live in `src/styles`; avoid magic colors in markup.
5. **API contracts.** Types in `src/core/types/api.ts` mirror the backend; contract changes require UI and test updates.
6. **Session.** Access token in memory only; refresh in an HttpOnly cookie; never persist tokens in `localStorage`.
7. **No secrets in the frontend.** Everything in `VITE_*` is public. GitHub App credentials stay exclusively in the backend.
8. **Accessibility and responsiveness are part of the definition of done**, not optional polish.

---

## 🧪 Quality Gates

Run these before opening a pull request:

```bash
npm run lint        # oxlint
npm run typecheck   # TypeScript
npm test            # Vitest
npm run build       # production build
```

For UI changes, validate manually or with Playwright at **320, 360, 390, 768, 1024, 1280, and 1440 px**, in both light and dark themes. See [`docs/RESPONSIVE-QA.md`](docs/RESPONSIVE-QA.md).

Minimum UI checklist:

- No horizontal scrolling.
- Primary actions are visible and reachable on mobile.
- Visible focus, labels, and AA contrast.
- Loading, empty, error, and disconnected-integration states.
- No new console errors.

---

## 🔐 Security and Privacy

- Never expose tokens, cookies, keys, or private repository data.
- Do not log authentication payloads in logs or analytics.
- Do not rely on hiding buttons: the API validates permissions.
- Treat the login/invite `next` parameter as an internal path only.
- New dependencies require justification and a license/security review.
- Vulnerabilities must follow [`SECURITY.md`](SECURITY.md), never a public issue.

---

## 📬 Submitting a Pull Request

1. Create a short-lived branch from `main`.
2. Keep lint, types, tests, and build green.
3. Update [`CHANGELOG.md`](CHANGELOG.md) when the change is relevant to users.
4. Fill in the PR template with evidence and test steps.
5. For visual changes, attach mobile and desktop screenshots.
6. Wait for CI and review before merging (squash).

Changes to authentication, GitHub integration, permissions, invites, or privacy require explicit security attention in the PR.

---

## ✅ Definition of Done

- Behavior is described and tested.
- No responsiveness or accessibility regressions.
- Error and unavailable states are handled.
- Documentation and changelog are updated when applicable.
- CI is green and the PR is approved.
