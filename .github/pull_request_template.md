# Pull Request Description

Include a summary of the changes, the problem or feature addressed, and the expected impact on the user experience.

---

## Type of Change

- [ ] 🚀 New feature (`feature`)
- [ ] 🐞 Bug fix (`bug fix`)
- [ ] 🔧 Refactoring with no functional change (`refactor`)
- [ ] 📝 Documentation (`docs`)
- [ ] 🎨 Style / UI / responsiveness (`style`)
- [ ] ⚙️ Infrastructure, CI/CD, or dependencies (`chore`)
- [ ] 🔒 Security, privacy, or accessibility (`security` / `a11y`)

## How Was It Tested?

Describe the validations performed and how to reproduce them locally.

- [ ] **Lint:** `npm run lint` with no errors.
- [ ] **Types:** `npm run typecheck` with no errors.
- [ ] **Tests:** `npm test` passed.
- [ ] **Build:** `npm run build` completed.
- [ ] **Responsiveness:** validated at 320, 360, 390, 768, 1024, 1280, and 1440 px.
- [ ] **Themes:** validated light and dark.
- [ ] **Console:** no new React, network, or accessibility errors.
- [ ] **Affected flow:** authentication, registration, profile, challenge, invite, progress, or integration was tested.
- [ ] Other tests performed:

## Visual Evidence

*If applicable, paste screenshots (mobile and desktop) or GIFs demonstrating the change.*

## Checklist

- [ ] My code follows the feature-based architecture (`domain`, `data`, `ui`).
- [ ] I self-reviewed and removed dead or experimental code.
- [ ] No token, cookie, or secret was persisted in the browser or bundle.
- [ ] No private commit message, source code, or third-party data is displayed.
- [ ] I considered loading, empty, error, and no-permission states.
- [ ] The interface keeps AA contrast, visible focus, and keyboard navigation.
- [ ] I updated [`README.md`](https://github.com/felipevenas/webapp-dev-rats/blob/main/README.md), [`docs/RESPONSIVE-QA.md`](https://github.com/felipevenas/webapp-dev-rats/blob/main/docs/RESPONSIVE-QA.md), and [`CHANGELOG.md`](https://github.com/felipevenas/webapp-dev-rats/blob/main/CHANGELOG.md) when applicable.
