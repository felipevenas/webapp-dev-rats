# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### 🚀 Added

- Friendship system: search by @username, requests with accept, decline, and cancel, plus removal with confirmation.
- Public profile at `/app/users/:username` with bio, location, website, level, stack, friend count, and friendship status.
- Online, away, and offline presence with a heartbeat every 60 seconds only while the tab is visible.
- `FRIEND_REQUEST` and `FRIEND_REQUEST_ACCEPTED` social notifications with inline accept/decline actions in the alert center.
- Friends item in the sidebar and mobile bottom nav, with a pending-request badge.
- Shortcut to the public profile and a friendship button in the group participant list.
- Network count and shortcut on the profile.
- **Real-time chat**: conversation list, private thread, and group chat with optimistic sending and text, image, voice, and document messages.
- **WebSocket/STOMP**: token-authenticated connection, reconnect with backoff, automatic renewal when the token expires, connection indicator, and typing indicator.
- **Attachments**: upload progress, image preview with lightbox, audio player, document card, and transparent renewal of presigned URLs.
- **Unread state**: badge in the sidebar and bottom-nav Conversations item, updated by event and by refetch.
- **Shortcuts**: “Message” button on the friend card, “Chat” button on the group page, and the `/app/chat/:conversationId` route.
- **Mobile**: thread fills the viewport, hides the bottom nav, composer respects the safe area, and the list includes search.
- **Group chat access**: dedicated button beside the group tabs, full-width on mobile, resolving or creating the conversation and opening the thread.
- **Chat skeletons**: list, thread, and composer have loading states that mirror the real layout (avatar, alternating bubbles, and message field), with no blank screen.
- **Password recovery**: confirmation with the submitted destination, link validity, spam guidance, and an option to send to another e-mail.
- **Reset link**: token read from the fragment (`#token=...`) with query fallback, inline invalid/expired state, and a CTA to request another link.
- **Local token**: development block shown only when `import.meta.env.DEV` is true and the backend returns `resetToken`.
- Individual alert deletion in the notification center.
- Group deletion by the creator, with name confirmation and participant notification.
- Interactive post-registration onboarding with profile, GitHub, challenge, and invite.
- Standardized pagination in repository and notification lists.
- Fixed Brasilia timezone in new accounts and challenges.
- Login with e-mail or username.
- New profile fields: bio, location, website, level, and stack.
- Display of the commits that validated each day.
- Profile picture with upload and GitHub fallback.

### 🎨 Changed

- Mobile navigation replaces the Alerts shortcut with Conversations; the alert bell remains in the header.
- Conversation and message caches are reconciled by `clientMessageId` and WebSocket events, without invalidating the whole thread on every message.
- Chat: the two-column layout (list + thread) now starts at `xl`; below that, the thread fills the screen with a back button, avoiding a cramped thread at 1024 px.
- Chat: image and document attachments share a single menu on mobile, freeing space for the message field at 320 px.
- Alert center rewritten to support inline actions without nested buttons.
- Profile banner with the photo at the top, information below, and group cards in the upper-right corner.
- Authentication side panel with compact visual identity and no scrolling.
- Simplified left side of authentication, with no graphic elements and no scrolling.
- Standardized copy without em dashes and authentication centered in the viewport.
- Softer shadows on cards, modals, and floating surfaces.

### 🐛 Fixed

- Chat: conversation list used content width and left an empty strip on mobile; it now fills 100% of the column.
- Chat: thread overflowed the viewport at 390 px because of the textarea and composer buttons' intrinsic `min-width`; containers received `min-w-0`.
- Chat: the chat route exceeded the viewport by 56 px (`min-h-dvh` + header) and created vertical scroll with a displaced composer; the shell now closes at `100dvh`.
- Chat: the message field did not grow while typing; it now expands up to 128 px and scrolls internally without hiding text.
- Chat: composer placeholder was clipped at 320 px; text reduced to “Message…” and the send button received `shrink-0`.
- Scroll: the reset hash (`#token=...`) is not a valid CSS selector and broke `ScrollToTop`; element lookup now uses `getElementById`.
- Horizontal overflow in filters and two-column layouts on small screens.
- Challenge tabs and bottom navigation overlapping content on mobile.
- Oversized calendar cells on tablets.
- Modal footers with the primary action out of the expected position.
- Invite link pointing to another development port.
- Invite expiration date displayed in UTC instead of the local timezone.
- Public invite preview blocked by a backend security rule.

### 🧪 Tests

- Password-recovery schemas cover invalid e-mail, weak password, and mismatched confirmation.
- Domain tests for message merge/idempotency, day grouping, attachment rules, and WebSocket URL derivation.
- Unit tests for dates/timezone, password policy, and wizard validation (20 tests).

### 📝 Documentation

- Standardized English README with architecture, session security, environment reference, routes, governance, and license.
- English contribution guide, security policy, code of conduct, changelog, and GitHub collaboration templates.
- Direct cross-links between the frontend and backend repositories.
- README standardized with landing screenshot, badges, architecture, governance, and license.
- Repository description and topics aligned with the DevRats ecosystem.
- `devrats.app` domain configuration: `/api` rewrite to `https://api.devrats.app`, canonical/OG at `https://devrats.app`, and `VITE_WS_URL=wss://api.devrats.app/ws` for WebSocket.
- `docs/PR-CHAT.md` documents deployment with a custom domain and the separation between same-origin REST and direct WebSocket.

### ⚠️ Known Limitations

- v1 accepts one attachment per message and has no editing, search, reactions, replies, or calls.
- Without a distributed broker, real-time works on a single API instance.
- No end-to-end encryption and no push notification.
- `SELECTED_REPOSITORIES` requires a GitHub App configured in the backend; without credentials the UI shows the integration as unavailable.
- The API feed is aggregated by group and does not include the event author; the UI presents it as “Challenge activity”.
- The API does not re-display an invite token after creation: the full link must be copied when generated.
- The API has no received-invite inbox; entry happens exclusively through a link.
- The avatar comes from GitHub or initials; there is no upload in this MVP client.

## [0.1.0] - 2026-10-29

### 🚀 Added

- Public landing page with a “terminal arcade” visual direction, real product preview, verification modes, and FAQ.
- Complete authentication: registration, login, password recovery, and reset, with a password policy mirroring the backend.
- Session with access token in memory, HttpOnly refresh, single-flight renewal, and restoration after reload.
- Onboarding with GitHub connection, first challenge creation, and group invite.
- Dashboard with progress by group, streak, ranking, integration status, and shortcuts.
- Challenge list with state filters and search.
- Five-step creation wizard: group, rules, window, repositories, and review.
- Group page with overview, ranking, calendar, activity feed, and completed/cancelled challenge state.
- Activity calendar with per-day status, keyboard navigation, member selection, and timezone adaptation.
- Ranking with progress, streak, last valid day, user highlight, and winner podium.
- Final result with winner, valid days, decisive day, and sharing.
- Profile with name/timezone editing, notification preferences, LGPD export, and account deletion.
- GitHub integration with status, permissions, synchronization, disconnect, and repository catalog.
- Private invites with validity, use limit, revocation, and a public acceptance page.
- Notification center with individual and bulk marking.
- Loading, empty, error, no-permission, offline, disconnected-integration, and pending-processing states.
- Dark (default) and light themes, persisted with a toggle in the top bar, sidebar, landing page, and authentication.
- Design system with semantic tokens, accessible components, and `prefers-reduced-motion` support.
- Responsive QA with Playwright at 320, 360, 390, 768, 1024, 1280, and 1440 px, documented in `docs/RESPONSIVE-QA.md`.
- Unit tests for dates/timezone, password policy, and wizard validation (20 tests).
- Governance: CI, PR/issue templates, code of conduct, security policy, license, changelog, editorconfig, and labels.

### 🐛 Fixed

- Horizontal overflow in filters and two-column layouts on small screens.
- Challenge tabs and bottom navigation overlapping content on mobile.
- Oversized calendar cells on tablets.
- Modal footers with the primary action out of the expected position.
- Invite link pointing to another development port.
- Invite expiration date displayed in UTC instead of the local timezone.
- Public invite preview blocked by a backend security rule.

### 🔐 Security

- No token is persisted in the browser.
- Secrets remain exclusively in the backend; `VITE_*` variables are treated as public.
- Protected routes with session restoration and `next` restricted to internal paths.
- Documented security scope and private disclosure channel.
