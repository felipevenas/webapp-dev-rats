# Security Policy 🔒

**DevRats Web** is the interface for a platform that reads commit metadata from GitHub to validate consistency. Security and privacy are product pillars: no source code, private commit message, or GitHub token may reach the browser.

If you believe you have found a vulnerability, we appreciate responsible disclosure.

---

## Supported Versions

Only the latest version on `main` receives active security updates:

| Version | Supported |
| --- | --- |
| 0.1.x | :white_check_mark: |
| < 0.1.0 | :x: |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities publicly in open issues.**

1. Open a confidential report through **[Private Vulnerability Reporting](https://github.com/felipevenas/webapp-dev-rats/security/advisories/new)**.
2. If that feature is unavailable, contact the maintainer directly through [@felipevenas](https://github.com/felipevenas), without opening a public issue.
3. Describe the details, reproduction steps, potential impact, and any proof of concept (PoC).
4. We will respond within **48 business hours** with an assessment and mitigation plan.

---

## Frontend Security Scope

The following are considered high-priority vulnerabilities:

- **Token exposed in the browser**: access token persisted in `localStorage`/`sessionStorage`, refresh token readable by JavaScript, or GitHub token present in the bundle.
- **Secret in the bundle**: any credential in `VITE_*` variables or in `dist/` (`VITE_*` variables are public by definition).
- **XSS**: HTML/script injection through API responses, group names, feed messages, notification payloads, or URL parameters.
- **Authorization bypass by assumption**: destructive action performed only with UI logic, without corresponding API validation (the API is the source of truth).
- **Open redirect**: manipulation of the `next` parameter in login/invite to redirect to external domains.
- **Invite leakage**: unnecessary exposure of the invite token in logs, analytics, referrer, or history.
- **Privacy**: display of source code, private commit messages, or third-party repository data.
- **Vulnerable dependencies** with an impact on the build or runtime.
- **Session configuration**: refresh cookie without `HttpOnly`, inadequate `SameSite`, permissive CORS, or incorrect OAuth origin.

Backend vulnerabilities (`api-dev-rats`) should be reported through the same channel, identifying the affected component.

---

## Resolution Process

1. We confirm the report and classify its impact.
2. We prepare the fix in a controlled environment with tests.
3. We publish the fix on `main` and record it in `CHANGELOG.md`.
4. We credit the researcher, if desired, after the fix.

Thank you for helping keep DevRats secure.
