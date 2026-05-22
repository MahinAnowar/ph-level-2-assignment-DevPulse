# 🚼 DevPulse API

> **Internal Tech Issue & Feature Tracker** — a backend REST API that lets software teams report bugs, suggest features, and coordinate resolutions.

---

## 🔗 Live URL

**Base URL:** `https://ph-level-2-assignment-dev-pulse.vercel.app/`

---

## ✨ Features

- 🔐 **JWT authentication** — secure signup & login
- 👥 **Role-based authorization** — `contributor` and `maintainer` roles
- 🐛 **Full issue management** — create, list, view, update, and delete issues
- 🔎 **Filtering & sorting** — list issues by `type`, `status`, and creation date
- 🔒 **Secure passwords** — hashed with bcrypt, never returned in any response
- 🧱 **Modular architecture** — clean separation of routes, controllers, services, and models
- 🛡️ **Centralized error handling** — consistent, predictable JSON responses
- 🗄️ **Raw SQL** — native `pg` driver only; no ORM, no query builders, no JOINs

---

## 🛠️ Tech Stack

| Layer        | Technology                |
| ------------ | ------------------------- |
| Runtime      | Node.js                   |
| Language     | TypeScript (strict mode)  |
| Framework    | Express.js                |
| Database     | PostgreSQL (NeonDB)       |
| DB Driver    | `pg` (native, raw SQL)    |
| Auth         | bcrypt + jsonwebtoken     |
| Deployment   | Vercel                    |

---

## 📁 Project Structure

```
.
├── api/
│   └── index.ts            # Vercel serverless entry point
├── src/
│   ├── config/             # Database connection & schema setup
│   │   ├── db.ts
│   │   └── initDb.ts
│   ├── middleware/         # Auth, role checks, error handling
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   └── errorHandler.ts
│   ├── modules/            # Feature modules
│   │   ├── auth/           # signup, login
│   │   └── issues/         # issue CRUD
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # Reusable helpers (JWT, bcrypt, responses…)
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Local development server
├── .env.example
├── tsconfig.json
└── vercel.json
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v24 or higher) and npm
- A PostgreSQL database (e.g. a free [NeonDB](https://neon.tech) project)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/MahinAnowar/ph-level-2-assignment-DevPulse.git
   cd ph-level-2-assignment-DevPulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root (use `.env.example` as a template):
   ```env
   PORT=5000
   DATABASE_URL=your-postgresql-connection-string
   JWT_SECRET=your-long-random-secret
   JWT_EXPIRES_IN=7d
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The required database tables are created automatically on first startup.

### Available Scripts

| Script           | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start the server with hot reload     |
| `npm run build`  | Compile TypeScript to `dist/`        |
| `npm start`      | Run the compiled production build    |

---

## 🔑 Authentication

Most issue-related actions require a JWT. After logging in, send the returned
token in the `Authorization` header:

```
Authorization: <your_jwt_token>
```

---

## 📡 API Endpoints

### Auth Module

| Method | Endpoint            | Access | Description                         |
| ------ | ------------------- | ------ | ----------------------------------- |
| POST   | `/api/auth/signup`  | Public | Register a new user account         |
| POST   | `/api/auth/login`   | Public | Authenticate and receive a JWT      |

### Issues Module

| Method | Endpoint           | Access                                            | Description                          |
| ------ | ------------------ | ------------------------------------------------- | ------------------------------------ |
| POST   | `/api/issues`      | Authenticated                                     | Create a new issue                   |
| GET    | `/api/issues`      | Public                                            | List all issues (filter/sort)        |
| GET    | `/api/issues/:id`  | Public                                            | Get a single issue by id             |
| PATCH  | `/api/issues/:id`  | Maintainer (any) / Contributor (own & `open`)     | Update an issue                      |
| DELETE | `/api/issues/:id`  | Maintainer only                                   | Delete an issue                      |

**Query parameters for `GET /api/issues`:**

| Param    | Values                              | Default  |
| -------- | ----------------------------------- | -------- |
| `sort`   | `newest`, `oldest`                  | `newest` |
| `type`   | `bug`, `feature_request`            | (none)   |
| `status` | `open`, `in_progress`, `resolved`   | (none)   |

---

## 🗄️ Database Schema

### Table: `users`

| Column       | Type        | Notes                                            |
| ------------ | ----------- | ------------------------------------------------ |
| `id`         | SERIAL      | Primary key                                      |
| `name`       | VARCHAR     | Required                                         |
| `email`      | VARCHAR     | Required, unique                                 |
| `password`   | VARCHAR     | Required, bcrypt-hashed, never returned          |
| `role`       | VARCHAR     | `contributor` or `maintainer` (default `contributor`) |
| `created_at` | TIMESTAMPTZ | Set automatically on insert                      |
| `updated_at` | TIMESTAMPTZ | Refreshed automatically on update                |

### Table: `issues`

| Column        | Type        | Notes                                              |
| ------------- | ----------- | -------------------------------------------------- |
| `id`          | SERIAL      | Primary key                                        |
| `title`       | VARCHAR(150)| Required, max 150 characters                       |
| `description` | TEXT        | Required, min 20 characters                        |
| `type`        | VARCHAR     | `bug` or `feature_request`                         |
| `status`      | VARCHAR     | `open`, `in_progress`, `resolved` (default `open`) |
| `reporter_id` | INTEGER     | References the reporting user                      |
| `created_at`  | TIMESTAMPTZ | Set automatically on insert                        |
| `updated_at`  | TIMESTAMPTZ | Refreshed automatically on update                  |

---

## 📋 Response Format

**Success**
```json
{
  "success": true,
  "message": "Operation description",
  "data": { }
}
```

**Error**
```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

---

## 🚀 Deployment

This API is deployed on **Vercel** as a serverless function. The required
environment variables (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`) are
configured in the Vercel project settings.

---

**Built with clean, secure, and well-documented code. 🚀**
