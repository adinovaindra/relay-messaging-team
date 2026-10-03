# Relay

Relay is a full-stack 1-on-1 messaging application designed for simple team communication.

## Live Demo

[Relay Messaging Team](https://relay-messaging-team-production.up.railway.app)

## Screenshots

### Login

![Relay Login Light](public/screenshots/sign-in-light.png)

![Relay Login Dark](public/screenshots/sign-in-dark.png)

![Relay Register Light](public/screenshots/sign-up-light.png)

![Relay Register Dark](public/screenshots/sign-up-dark.png)

## Features

### Core Features

- User registration
- Login and logout
- Protected chat access
- 1-on-1 conversations
- Send and receive text messages
- Persistent messages across refresh and re-login
- Conversation list with:
  - counterpart name
  - latest message preview
  - timestamp
- Server-side conversation authorization

### User Experience

- Light and dark mode
- Persistent theme preference
- Responsive layout for desktop and mobile
- Automatic message scrolling
- Calendar date separators for message history
- Conversation ordering based on latest message activity
- Clear empty and error states

Realtime messaging is intentionally not included. The application uses a simple request/response architecture suitable for its current scope.

## Tech Stack

- **Next.js 16.3.6** — full-stack React framework and App Router
- **React 19.2.8**
- **TypeScript**
- **PostgreSQL 15** — relational database
- **Prisma 5.22** — ORM and type-safe database access
- **JWT (`jsonwebtoken`)** — authentication
- **bcryptjs** — password hashing
- **Zod** — request validation
- **Docker Compose** — local PostgreSQL development
- **Railway** — production application and database hosting

## Architecture

Relay uses a single Next.js application for both the user interface and server-side API logic.

This keeps the architecture simple while allowing authentication, authorization, validation, and database operations to remain close to the application layer.

High-level request flow:

```text
Browser
   │
   ▼
Next.js UI
   │
   ▼
API / Server-side Logic
   │
   ├── Authentication
   ├── Input Validation
   └── Authorization
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
```

For protected operations, the application follows this general flow:

```text
request
   ↓
authenticate
   ↓
derive authenticated user ID
   ↓
validate input
   ↓
authorize relationship
   ↓
database action
   ↓
response
```

The application intentionally avoids a separate frontend/backend deployment because the current feature set does not require that additional infrastructure.

## Authentication & Authorization

Authentication uses JWT stored in an **HttpOnly cookie**.

Passwords are hashed using bcrypt before being stored in the database.

### Authentication

- User credentials are validated on the server.
- Password hashes are never returned to the client.
- Protected operations require an authenticated user.
- Logout removes the authentication cookie.
- Authentication state is derived server-side from the JWT.

### Authorization

Conversation access is based on the authenticated user's relationship with the conversation.

A client-provided `userId` or `senderId` is not treated as authoritative identity.

For message creation, the sender is derived from the authenticated user rather than accepting the sender identity from the request body.

The authorization model can be summarized as:

```text
Authenticated User
       │
       ▼
Conversation Participant?
       │
   ┌───┴───┐
  Yes      No
   │        │
   ▼        ▼
Allow      Deny
```

This ensures that authentication and resource ownership are handled by the server rather than relying on client-side state.

### JWT Trade-off

The authentication implementation is intentionally stateless.

Logout removes the browser's authentication cookie, but there is no server-side JWT blacklist or session table.

As a result, a previously issued JWT that has been compromised would remain valid until its expiration time.

This trade-off keeps the authentication architecture small and avoids introducing additional session infrastructure for the current application scope.

## Database Design

Relay uses PostgreSQL with Prisma.

The relational model consists of four main tables:

```text
users
  │
  ├── messages
  │
  └── conversation_participants
              │
              ▼
        conversations
              │
              └── messages
```

### `users`

Stores registered user accounts.

- `id`
- `name`
- `email`
- `password_hash`
- `created_at`

### `conversations`

Represents a 1-on-1 conversation.

- `id`
- `created_at`
- `updated_at`

### `conversation_participants`

Connects users to conversations.

- `conversation_id`
- `user_id`

The composite primary key prevents duplicate participant records for the same conversation/user relationship.

### `messages`

Stores messages belonging to conversations.

- `id`
- `conversation_id`
- `sender_id`
- `content`
- `created_at`

Foreign keys maintain relationship integrity, while indexes support common conversation and message queries.

## API Overview

The application exposes server-side API routes through the Next.js App Router.

### Authentication

| Method | Endpoint             | Purpose                                               |
| ------ | -------------------- | ----------------------------------------------------- |
| POST   | `/api/auth/register` | Register a new user                                   |
| POST   | `/api/auth/login`    | Authenticate a user                                   |
| POST   | `/api/auth/logout`   | Clear the authentication cookie                       |
| GET    | `/api/auth/me`       | Retrieve the authenticated user's session information |

### Conversations & Messages

| Method     | Endpoint                                       | Purpose                                         |
| ---------- | ---------------------------------------------- | ----------------------------------------------- |
| GET / POST | `/api/conversations`                           | Retrieve or create conversations                |
| GET / POST | `/api/conversations/[conversationId]/messages` | Retrieve or send messages within a conversation |

### Users

| Method | Endpoint     | Purpose                                              |
| ------ | ------------ | ---------------------------------------------------- |
| GET    | `/api/users` | Retrieve users available for starting a conversation |

All protected operations perform authentication and authorization on the server.

## Key Engineering Decisions

### Keep the frontend and backend in one application

Next.js provides both the UI layer and server-side Route Handlers required by Relay.

Keeping them together reduces deployment and infrastructure complexity while remaining appropriate for the application's scope.

### PostgreSQL for relational data

The application contains strongly related entities:

```text
User
  ↕
Conversation Participant
  ↕
Conversation
  ↕
Message
```

PostgreSQL provides foreign keys, constraints, and transactional support that fit this relational structure well.

### Prisma for database access

Prisma provides type-safe database access and keeps the database schema and application relationships explicit.

For a relatively small application, it also reduces database-access boilerplate.

### JWT authentication

JWT provides a compact authentication mechanism for protected application resources.

Storing the token in an HttpOnly cookie prevents normal client-side JavaScript from directly accessing the authentication token.

### Server-side authorization

Authorization is enforced on the server instead of relying on client-side checks.

This is particularly important for conversations and messages because a user should only be able to access resources they are authorized to access.

### Avoid unnecessary infrastructure

Relay intentionally does not introduce Redis, microservices, or a separate backend service.

The current application does not require that additional complexity to provide its core functionality.

## AI-Assisted Development

AI coding tools were used as a development assistant during the project for:

- implementation guidance
- debugging assistance
- code review
- exploring implementation approaches
- identifying potential edge cases
- documentation drafting

Generated suggestions were reviewed against the actual codebase before being incorporated.

The architecture and implementation remain intentionally simple and understandable so that the project can be maintained and explained independently of the AI tools used during development.

## Local Development

### Prerequisites

- Node.js
- npm
- Docker Desktop / Docker Engine
- Git

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd relay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example`.

Example:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_local_password
POSTGRES_DB=relay
DATABASE_URL=postgresql://postgres:your_local_password@localhost:5432/relay
JWT_SECRET=your_long_random_secret
```

Do not commit `.env` to the repository.

### 4. Start PostgreSQL

```bash
docker compose up -d
```

### 5. Apply the database migration

```bash
npx prisma migrate dev
```

### 6. Seed demo users

```bash
npx prisma db seed
```

The development seed creates two demo users:

| Name  | Email               | Password      |
| ----- | ------------------- | ------------- |
| Alice | `alice@example.com` | `password123` |
| Bob   | `bob@example.com`   | `password123` |

These credentials are intended for local/demo development only.

### 7. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Useful Commands

### Application

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Database

```bash
npx prisma migrate dev
npx prisma db seed
```

## Environment Variables

Relay requires the following environment variables:

| Variable            | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `POSTGRES_USER`     | PostgreSQL username used by Docker Compose |
| `POSTGRES_PASSWORD` | PostgreSQL password used by Docker Compose |
| `POSTGRES_DB`       | PostgreSQL database name                   |
| `DATABASE_URL`      | Prisma database connection string          |
| `JWT_SECRET`        | Secret used to sign authentication tokens  |

Production secrets should be configured through the hosting provider's environment variable system and must not be committed to Git or exposed to client-side code.

## Deployment

Relay can be deployed as a single Next.js application backed by a managed PostgreSQL database.

The production deployment uses:

```text
Next.js Application
       │
       ▼
Railway
       │
       └── PostgreSQL
```

Production environment variables are configured through the hosting platform:

```text
DATABASE_URL
JWT_SECRET
```

The application and database are kept within the same deployment environment to keep infrastructure straightforward for the current project scope.

### Deployment Reasoning

**Next.js**

- Provides both the UI and server-side application layer.
- Supports the App Router and Route Handlers used by Relay.
- Avoids unnecessary frontend/backend separation.

**PostgreSQL**

- Fits the relational structure of users, conversations, participants, and messages.
- Provides relational constraints and transactional support.
- Is suitable for authorization-sensitive application data.

**Prisma**

- Provides type-safe database access.
- Makes the database schema explicit.
- Reduces database-access boilerplate.

**JWT**

- Provides a lightweight authentication mechanism.
- Keeps authentication implementation relatively small.
- Is stored in an HttpOnly cookie.

**Railway**

- Provides a straightforward deployment environment for the application and PostgreSQL database.
- Reduces infrastructure complexity for a small full-stack application.

## Project Structure

```text
src/
  app/
    api/
      auth/
        login/
        logout/
        me/
        register/
      conversations/
        [conversationId]/
          messages/
      users/
    chat/
    login/
    register/
    layout.tsx
    globals.css

  lib/
    api-error.ts
    auth.ts
    authorization.ts
    conversations.ts
    errors.ts
    messages.ts
    prisma.ts
    users.ts

prisma/
  migrations/
  schema.prisma
  seed.ts

compose.yaml
.env.example
package.json
```

## Future Improvements

Potential future improvements include:

- Realtime messaging
- Unread message indicators
- Message search
- Online presence
- Additional mobile UX improvements
- More granular notification preferences

These features are intentionally outside the current core implementation so the application can remain focused and maintainable.

---

## License

This project is intended as a personal developer portfolio project.
