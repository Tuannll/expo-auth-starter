<div align="center">

# Expo Auth Starter

**A full-stack authentication starter for learning and building with Expo, Express, and PostgreSQL.**

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square&logo=expo&logoColor=white)](mobile/package.json)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat-square&logo=react&logoColor=black)](mobile/package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](server/package.json)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](server/package.json)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white)](compose.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

**[Quick Start](#quick-start) · [API](#api) · [FAQ](#faq) · [Technical Details](#technical-details) · [Security](#security)**

</div>

> [!IMPORTANT]
> This repository is a local-development starter, not a production-ready authentication service. The native mobile client uses Expo SecureStore; browser authentication is not implemented.

---

<a id="features"></a>
## ✨ Features

| Area | Included |
| --- | --- |
| **Account flow** | Email/password registration, login, authenticated home screen, and logout |
| **Forms** | React Hook Form with reusable input fields, password confirmation, and submission feedback |
| **Navigation** | Expo Router protected routes with a session-restoration loading screen |
| **Client state** | Zustand for the current user and in-memory access token |
| **Token storage** | Native SecureStore persistence for the refresh token |
| **Backend auth** | bcrypt password hashes, JWT access tokens, and rotating refresh tokens |
| **Database** | Prisma schema and initial migration for users and refresh sessions |
| **API middleware** | Zod request validation, Helmet, configurable CORS, and rate limiting |
| **Local infrastructure** | Docker Compose for PostgreSQL with a health check and persistent volume |
| **Tests** | Vitest API tests with an in-memory repository and focused mobile API-helper tests |

---

<a id="quick-start"></a>
## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** and npm
- **Docker Desktop**, running with Linux containers
- An Android emulator, an iOS simulator on macOS, or a physical device with a compatible Expo Go version

> [!NOTE]
> The API and database run on your development computer. The Expo client runs on the emulator or device. Installing the mobile app does not install its backend.

### 1. Clone the repository

```bash
git clone https://github.com/Tuannll/expo-auth-starter.git
cd expo-auth-starter
```

### 2. Configure environment files

macOS / Linux / Git Bash:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp mobile/.env.example mobile/.env
```

PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
Copy-Item mobile/.env.example mobile/.env
```

Generate two independent JWT secrets:

```bash
node -e "const { randomBytes } = require('node:crypto'); console.log(randomBytes(48).toString('hex')); console.log(randomBytes(48).toString('hex'))"
```

Paste the first value into `JWT_ACCESS_SECRET` and the second into `JWT_REFRESH_SECRET` in `server/.env`. Never commit these values.

| File | Configure |
| --- | --- |
| `.env` | PostgreSQL username, password, database name, and host port |
| `server/.env` | Matching `DATABASE_URL`, JWT secrets, API port, and allowed web origins |
| `mobile/.env` | `EXPO_PUBLIC_API_URL` reachable from your emulator or device |

If you change PostgreSQL credentials or its port, update `server/.env` to match. URL-encode special characters in the database password when constructing `DATABASE_URL`.

### 3. Install dependencies and initialize PostgreSQL

Run from the repository root:

```bash
npm install
npm run db:generate --workspace=server
docker compose up -d --wait postgres
npm run db:migrate
```

The root package uses npm workspaces to install both `mobile/` and `server/`. Prisma generates the database client; the migration command creates the database tables.

> [!TIP]
> Start Docker Desktop before running Compose. PostgreSQL data survives container restarts in the `postgres-data` named volume.

### 4. Start the API and mobile client

In the first terminal, from the repository root:

```bash
npm run dev:server
```

In a second terminal, from the same root:

```bash
npm run dev:mobile
```

Use Expo CLI to open a native emulator or connect Expo Go. Create an account, inspect the authenticated home screen, then log out.

### 5. Set the correct API address

Edit `mobile/.env` for your target:

| Target | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Android Studio emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://localhost:3000` |
| Physical device | `http://YOUR_COMPUTER_LAN_IP:3000` |

For a physical device, use the same LAN as your computer and allow inbound access to the API port through your local firewall. Restart Expo after changing environment values.

> [!WARNING]
> HTTP examples are for trusted local development only. Use HTTPS before sending credentials over an untrusted network. Values prefixed with `EXPO_PUBLIC_` are bundled into the client; never put server secrets there.

---

<a id="api"></a>
## 📦 API & Usage

The API listens on port `3000` by default. Request and response bodies use JSON, except the successful logout response.

| Method | Endpoint | Request | Success |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ email, password }` | `201` — user and token pair |
| `POST` | `/auth/login` | `{ email, password }` | `200` — user and token pair |
| `POST` | `/auth/refresh` | `{ refreshToken }` | `200` — user and replacement token pair |
| `POST` | `/auth/logout` | `{ refreshToken }` | `204` — no body |
| `GET` | `/auth/me` | `Authorization: Bearer <accessToken>` | `200` — user |

### Registration and login

Emails are trimmed and lowercased. Password validation currently requires **12–128 characters**.

```json
{
  "email": "person@example.com",
  "password": "correct-horse-battery-staple"
}
```

Successful authentication returns:

```json
{
  "user": {
    "id": "<user-id>",
    "email": "person@example.com"
  },
  "tokens": {
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>"
  }
}
```

### Refresh and logout

```json
{
  "refreshToken": "<refresh-token>"
}
```

After a refresh, keep the replacement refresh token. The previous token cannot be refreshed again.

Errors use `{ "error": "..." }`, with `400` for invalid input, `401` for rejected authentication, `409` for an existing email, and `500` for an internal error. The rate limiter returns `429`; its response format differs from the JSON error handler.

---

<a id="faq"></a>
## ❓ FAQ

### Why does the app fail to reach the API?

`localhost` on a phone refers to the phone, not your computer. Check `EXPO_PUBLIC_API_URL`, the API process, your LAN connection, and firewall settings. Expo's development tunnel does not expose the Express API automatically.

### Does authentication work in a browser?

Not currently. The package exposes a web command, but the authentication store calls native SecureStore without a browser storage adapter. Use Android or iOS for the authentication flow. A browser implementation needs its own session-storage and security design.

### Will the app stay signed in after a restart?

The app reads its persisted refresh token and requests a new session during startup. The API must be reachable. The current restoration code clears the stored token on any restoration error, including a network failure.

### Does logout immediately invalidate every access token?

No. Logout revokes the submitted refresh session and clears local authentication state. An already-issued access token remains valid until its expiry, which defaults to 15 minutes. Refresh tokens default to seven days.

### What do the automated tests verify?

Server tests exercise token helpers and HTTP authentication flows using an in-memory repository. Mobile tests exercise refresh/retry helpers. These tests do not verify real PostgreSQL transactions, SecureStore behavior on a device, or the complete native UI flow.

### Can this be deployed as-is?

Treat it as a starting point. Review dependency advisories, token lifecycle behavior, database failure handling, and deployment configuration before using real accounts. See [Security & Limitations](#security).

---

<a id="technical-details"></a>
## 🛠️ Technical Details

### Stack

| Layer | Technology |
| --- | --- |
| Native client | Expo SDK 54, React Native 0.81.5, React 19.1 |
| Navigation and forms | Expo Router 6, React Hook Form 7 |
| State and persistence | Zustand 5, Expo SecureStore |
| API | Express 5, TypeScript 5.9, Zod 4 |
| Authentication | bcrypt 6, JSON Web Tokens |
| Database | PostgreSQL 17, Prisma 6 |
| Testing | Vitest 3, Supertest 7 |

### Project structure

```text
expo-auth-starter/
├── mobile/
│   ├── app/                  # Authentication and protected screens
│   ├── components/ui/        # Shared form field
│   ├── services/             # HTTP helpers and tests
│   ├── store/                # Zustand authentication state
│   └── .env.example          # Public API address
├── server/
│   ├── prisma/               # Database schema and migration
│   ├── src/                  # Express app, auth services, token logic
│   ├── test/                 # HTTP and token tests
│   └── .env.example          # Database and JWT configuration
├── compose.yaml              # Local PostgreSQL
├── .env.example              # Compose configuration
├── package.json              # Workspace scripts
└── LICENSE
```

### Scripts

Run from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev:server` | Start the API with automatic reload |
| `npm run dev:mobile` | Start Expo CLI |
| `npm run db:generate --workspace=server` | Generate the Prisma client |
| `npm run db:migrate` | Apply development database migrations |
| `npm run lint` | Run mobile ESLint and server TypeScript checks |
| `npm test` | Run mobile and server test suites |

The server `lint` script is a TypeScript check, not a separate ESLint pass. Tests use an in-memory repository and do not need PostgreSQL running.

---

<a id="contributing"></a>
## 🤝 Contributing

1. Fork the repository and create a focused branch.
2. Keep changes small and add a regression test for behavior changes.
3. Run `npm run lint` and `npm test` from the root.
4. Describe the change and its verification in your pull request.

Do not include credentials, tokens, database dumps, or generated dependency folders.

---

<a id="security"></a>
## ⚠️ Security & Limitations

This starter includes password hashing, refresh-token hashes, JWT expiry, request validation, security headers, and configurable CORS. These measures do not make it production-ready.

Before handling real accounts:

- Use HTTPS, independently generated JWT secrets, and a managed secrets system.
- Review dependency advisories and keep packages updated.
- Add email verification, password reset, monitoring, and database backups.
- Review bcrypt's **72-byte input limit**; the current character limit does not enforce that byte limit.
- Make refresh-token consumption and replacement creation transactional. They are currently separate database operations.
- Test concurrent registration, refresh rotation, database failures, and session restoration against real infrastructure.
- Review rate limiting for your deployment. The current in-memory limiter allows 20 requests per IP every 15 minutes across all `/auth` routes, including profile and refresh requests.
- Add a deliberate browser session design before enabling web authentication.

Environment files and dependency folders are excluded from Git. Database persistence uses a Docker named volume; `.gitignore` is not a backup or secrets-management system.

---

<a id="license"></a>
## 📄 License

Distributed under the [MIT License](LICENSE).
