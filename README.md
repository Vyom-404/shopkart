# ShopKart

ShopKart is a small full-stack customer authentication application. The Express API stores customers in MongoDB and issues JWTs in an HTTP-only cookie. The React client provides registration, login, and a protected home page.

## Features

- Register customers with a name, email, phone number, and password
- Hash passwords with bcrypt before saving them
- Log in and authenticate requests with a signed JWT cookie
- View the signed-in customer's profile and log out
- Change a password while authenticated
- React client for the login, registration, and home flows

## Tech stack

- **API:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Authentication:** bcrypt, JSON Web Tokens, HTTP-only cookies
- **Client:** React, React Router, Vite, Axios

## Project layout

```text
.
├── controllers/            # Customer request handlers
├── middlewares/            # JWT cookie authentication
├── models/                 # Mongoose customer model
├── routes/                 # Customer API routes
├── utils/                  # JWT creation
├── index.js                # Express app and MongoDB connection
├── client/                 # Vite + React application
│   └── src/
│       ├── components/     # Shared UI and protected-route components
│       ├── pages/          # Login, registration, and home pages
│       └── services/       # Axios API client
├── .env.example            # API environment template
└── client/.env.example     # Client environment template
```

## Requirements

- Node.js and npm
- A MongoDB database (local or MongoDB Atlas)

## Getting started

Run the API from the repository root:

```bash
npm install
cp .env.example .env
```

Set `MONGO_URI` in `.env` to your MongoDB connection string and replace `JWT_SECRET` with a long, private random value. The API reads the configuration described below and connects to MongoDB before it starts listening.

Start the API in development mode:

```bash
npm run dev
```

Or start it without nodemon:

```bash
npm start
```

By default the API listens on `http://localhost:3002`.

In a second terminal, install and start the client:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The client sends requests with credentials enabled so the browser can store and send the authentication cookie.

## Environment variables

### API (`.env`)

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | API listening port | `3002` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/shopkart` |
| `JWT_SECRET` | Secret used to sign and verify JWTs | Use a long, random private value |
| `JWT_EXPIRES_IN` | JWT lifetime (optional; defaults to `7d`) | `7d` |
| `NODE_ENV` | Runtime mode; enables secure cookies in production | `development` |
| `CLIENT_URL` | Allowed browser origin for credentialed CORS | `http://localhost:5173` |

### Client (`client/.env`)

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the API | `http://localhost:3002` |

Do not commit `.env` files or put production secrets in the client environment. Variables prefixed with `VITE_` are exposed to the browser.

## API

All customer endpoints are prefixed with `/customers`. Request and response bodies use JSON. Protected endpoints require the `token` cookie set by a successful login.

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Check that the API is running |
| `POST` | `/customers/register` | No | Create a customer account |
| `POST` | `/customers/login` | No | Authenticate and set the `token` cookie |
| `GET` | `/customers/me` | Yes | Return the authenticated customer |
| `POST` | `/customers/logout` | Yes | Clear the authentication cookie |
| `PATCH` | `/customers/change-password` | Yes | Change the authenticated customer's password |

### Register

`POST /customers/register`

```json
{
  "fullName": "Jordan Lee",
  "email": "jordan@example.com",
  "password": "example-password",
  "phone": "9876543210"
}
```

All fields are required and the password must be at least 6 characters. A successful request returns `201`; an existing email returns `409`. Passwords are hashed before storage and are never included in customer responses.

### Login

`POST /customers/login`

```json
{
  "email": "jordan@example.com",
  "password": "example-password"
}
```

A successful request sets a JWT in an HTTP-only cookie named `token`. The cookie uses `SameSite=Lax` and is marked `Secure` when `NODE_ENV=production`. Invalid credentials return `401`.

### Profile, logout, and password change

- `GET /customers/me` returns the authenticated customer's profile.
- `POST /customers/logout` clears the `token` cookie.
- `PATCH /customers/change-password` accepts `{ "oldPassword": "...", "newPassword": "..." }`. The new password must be at least 6 characters.

For browser requests from a different origin, keep `CLIENT_URL` set to the client origin and ensure the client uses the correct `VITE_API_URL`. Requests must include credentials for cookie authentication.

## HTTP responses

Responses include a JSON `success` flag and a message for errors. Common status codes are `400` for invalid or missing input, `401` for invalid credentials or missing/invalid authentication, `404` for an unknown route, and `409` for an already registered email.
