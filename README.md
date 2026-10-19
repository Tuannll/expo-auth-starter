<div align="center">

# 🔐 Expo Auth Starter

**A full-stack authentication starter for learning and building with Expo, Express, and PostgreSQL.**

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](mobile/package.json)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react&logoColor=black)](mobile/package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](server/package.json)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](server/package.json)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](compose.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E)](LICENSE)

**[🚀 Quick Start](#quick-start) • [✨ Features](#features) • [📦 API](#api) • [🛠️ Tech Details](#technical-details) • [❓ FAQ](#faq) • [⚠️ Security](#security)**

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
- Android emulator, iOS simulator on macOS, or physical device with compatible Expo Go version

> [!NOTE]
> The API and database run on your development computer. The Expo client runs on the emulator or device. Installing the mobile app does not install its backend.

### 1. Clone repository

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

Paste first value into `JWT_ACCESS_SECRET` and second into `JWT_REFRESH_SECRET` in `server/.env`. Never commit these values.

| File | Configure |
| --- | --- |
| `.env` | PostgreSQL username, password, database name, and host port |
| `server/.env` | Matching `DATABASE_URL`, JWT secrets, API port, and allowed web origins |
| `mobile/.env` | `EXPO_PUBLIC_API_URL` reachable from emulator or device |

If changing PostgreSQL credentials or port, update `server/.env` to match. URL-encode special characters in database password when constructing `DATABASE_URL`.

### 3. Install dependencies and initialize PostgreSQL

Run from repository root:

```bash
npm install
npm run db:generate --workspace=server
docker compose up -d --wait postgres
npm run db:migrate
```

Prisma generates database client; migration command creates database tables.

> [!TIP]
> Start Docker Desktop before running Compose. PostgreSQL data survives container restarts in `postgres-data` named volume.

### 4. Start API and mobile client

Terminal 1 (from repository root):

```bash
npm run dev:server
```

Terminal 2 (from repository root):

```bash
npm run dev:mobile
```

Use Expo CLI to open native emulator or connect Expo Go. Create account, verify authenticated home screen, then log out.

### 5. Set correct API address

Edit `mobile/.env` for target environment:

| Target | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Android Studio emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://localhost:3000` |
| Physical device | `http://YOUR_COMPUTER_LAN_IP:3000` |

For physical device, use same LAN as computer and allow inbound access to API port through local firewall. Restart Expo after changing environment values.

> [!WARNING]
> HTTP examples are for trusted local development only. Use HTTPS before sending credentials over untrusted network. Values prefixed with `EXPO_PUBLIC_` are bundled into client; never place server secrets there.

---

<a id="api"></a>
## 📦 API & Usage

API listens on port `3000` by default. Request and response bodies use JSON, except successful logout response.

| Method | Endpoint | Request | Success |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ email, password }` | `201` — user and token pair |
| `POST` | `/auth/login` | `{ email, password }` | `200` — user and token pair |
| `POST` | `/auth/refresh` | `{ refreshToken }` | `200` — user and replacement token pair |
| `POST` | `/auth/logout` | `{ refreshToken }` | `204` — no body |
| `GET` | `/auth/me` | `Authorization: Bearer <accessToken>` | `200` — user |

### Registration and login

Emails are trimmed and lowercased. Password validation requires **12–128 characters**.

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

After refresh, retain replacement refresh token. Previous token cannot be refreshed again.

Errors use `{ "error": "..." }`: `400` invalid input, `401` rejected authentication, `409` existing email, `500` internal error. Rate limiter returns `429`.

---

<a id="faq"></a>
## ❓ FAQ

<details>
<summary><b>Why does app fail to reach API?</b></summary>
<br/>

`localhost` on mobile device refers to phone itself, not host computer. Verify `EXPO_PUBLIC_API_URL`, API process status, LAN connection, and firewall settings. Expo development tunnel does not expose Express API automatically.
</details>

<details>
<summary><b>Does authentication work in browser?</b></summary>
<br/>

Not currently. Package exposes web script, but auth store invokes native SecureStore without browser storage adapter. Use Android or iOS for authentication flow. Browser implementation requires distinct session storage and security design.
</details>

<details>
<summary><b>Will app stay signed in after restart?</b></summary>
<br/>

App reads persisted refresh token and requests new session during startup. API must be reachable. Current restoration code clears stored token on any restoration error, including network failures.
</details>

<details>
<summary><b>Does logout immediately invalidate every access token?</b></summary>
<br/>

No. Logout revokes submitted refresh session and clears local auth state. Previously issued access token remains valid until expiry (default 15 minutes). Refresh tokens default to 7 days.
</details>

<details>
<summary><b>What do automated tests verify?</b></summary>
<br/>

Server tests verify token helpers and HTTP authentication flows via in-memory repository. Mobile tests verify refresh/retry helpers. Tests do not verify real PostgreSQL transactions, device SecureStore behavior, or complete native UI flow.
</details>

<details>
<summary><b>Can this be deployed as-is?</b></summary>
<br/>

No. Treat as starting template. Audit dependency advisories, token lifecycle behavior, database failover handling, and deployment configuration before handling production accounts. Review [Security & Limitations](#security).
</details>

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

Run from repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev:server` | Start API with automatic reload |
| `npm run dev:mobile` | Start Expo CLI |
| `npm run db:generate --workspace=server` | Generate Prisma client |
| `npm run db:migrate` | Apply development database migrations |
| `npm run lint` | Run mobile ESLint and server TypeScript checks |
| `npm test` | Run mobile and server test suites |

Server `lint` script runs TypeScript check. Tests execute with in-memory repository and do not require active PostgreSQL instance.

---

<a id="contributing"></a>
## 🤝 Contributing

1. Fork repository and create focused branch.
2. Keep changes small and add regression test for behavior changes.
3. Run `npm run lint` and `npm test` from root.
4. Describe change and verification in pull request.

Do not commit credentials, tokens, database dumps, or generated build directories.

---

<a id="security"></a>
## ⚠️ Security & Limitations

Starter includes password hashing, refresh-token hashes, JWT expiry, request validation, security headers, and configurable CORS. These measures do not make it production-ready.

Before handling production accounts:

- Enforce HTTPS, independently generated JWT secrets, and managed secret store.
- Audit dependency advisories and keep packages updated.
- Implement email verification, password reset flows, monitoring, and automated database backups.
- Note bcrypt **72-byte input limit**; current character limit does not enforce byte boundary.
- Make refresh-token revocation and replacement generation transactional (currently separate database operations).
- Test concurrent registration, refresh rotation, database failures, and session recovery against real infrastructure.
- Tune rate limiting for target workload. Current in-memory limiter restricts 20 requests per IP every 15 minutes across all `/auth` routes, including profile and refresh endpoints.
- Establish deliberate browser session architecture before enabling web authentication.

Environment files and dependency folders are excluded via `.gitignore`. Database persistence uses Docker named volume; `.gitignore` is not backup or secrets management system.

---

<a id="license"></a>
## 📄 License

Distributed under [MIT License](LICENSE).
