# ShopKart — Customer Authentication Service

Backend for Engineering Lab 01 (ShopKart). Provides secure customer registration,
login, profile and logout using JWT stored in an **HttpOnly cookie**.

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- bcrypt (password hashing)
- jsonwebtoken + cookie-parser (sessions)

## Project Structure (MVC)

```text
backend/
├── controllers/
│   └── customer.controller.js
├── models/
│   └── customer.model.js
├── routes/
│   └── customer.routes.js
├── middlewares/
│   └── auth.middleware.js
├── utils/
│   └── generateToken.js
├── index.js
├── package.json
├── .env
└── .env.example
```

## Setup

```bash
cd backend
npm install
```

Create your `.env` from `.env.example` and make sure MongoDB is running, then start:

```bash
npm run dev   # development (nodemon)
# or
npm start     # production
```

## API Summary

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/customers/register` | No | Register a new customer |
| POST | `/customers/login` | No | Login and set an HttpOnly JWT cookie |
| GET | `/customers/me` | Yes | Get the authenticated customer profile |
| POST | `/customers/logout` | Yes | Clear the auth cookie |
| PATCH | `/customers/change-password` | Yes | Change password (bonus) |

### Register

`POST /customers/register`

```json
{
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "password": "john123",
  "phone": "9876543210"
}
```

- Returns `400` if a field is missing or the password is shorter than 6 characters.
- Returns `409` if the email is already registered.
- The password is stored as a **bcrypt hash** and never returned.

### Login

`POST /customers/login`

```json
{
  "email": "john@gmail.com",
  "password": "john123"
}
```

- Returns `401` for invalid credentials (generic message, does not reveal which field was wrong).
- On success, a JWT is set in an HttpOnly cookie named `token`.

### My Profile

`GET /customers/me` — requires the auth cookie. Returns the customer without password.

### Logout

`POST /customers/logout` — clears the `token` cookie.

## Notes for TAs / Students

- Test all endpoints with Postman; cookies are handled automatically by the client.
- Passwords are hashed with bcrypt (salt rounds = 10) via a Mongoose `pre('save')` hook.
- Protected routes read and verify the JWT from the cookie, then attach the customer to `req.user`.
