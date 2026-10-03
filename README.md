# ShopKart

ShopKart is a full-stack shopping application with customer authentication, a MongoDB product catalogue, and a persistent wishlist. The Express API uses Mongoose and JWTs stored in HTTP-only cookies. The React client uses React Router and Axios to browse and save products.

## Features

- Register and sign in to a customer account
- Hash passwords with bcrypt and authenticate using a signed JWT cookie
- Browse products from MongoDB, search by name, filter by category, and sort by price
- View product details
- Add and remove products from a customer-specific wishlist
- Toggle wishlist membership and show the backend wishlist count in the Navbar
- Loading, error, and empty states for catalogue and wishlist pages

## Tech stack

- **API:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Authentication:** bcrypt, JSON Web Tokens, HTTP-only cookies
- **Client:** React, React Router, Vite, Axios

## Project layout

```text
.
├── controllers/            # Customer, product, and wishlist request handlers
├── middlewares/            # JWT cookie authentication
├── models/                 # Customer and product schemas
├── routes/                 # Customer, product, and wishlist routes
├── utils/                  # JWT creation
├── index.js                # Express app and MongoDB connection
├── client/                 # Vite + React application
│   └── src/
│       ├── components/     # Navbar, product cards, and route guards
│       ├── pages/          # Login, register, home, products, details, wishlist
│       └── services/       # Axios API client and request helpers
├── scripts/seed-products.js # Optional sample product seeder
├── .env.example            # API environment template
└── client/.env.example     # Client environment template
```

## Requirements

- Node.js and npm
- A MongoDB database (local or MongoDB Atlas)

## Getting started

Install the API dependencies and create its environment file:

```bash
npm install
cp .env.example .env
```

Set `MONGO_URI` in `.env` to your MongoDB connection string and replace `JWT_SECRET` with a long, private random value.

Start the API from the repository root:

```bash
npm run dev
```

The API listens on `http://localhost:3002` by default. You can also use `npm start` to run it without nodemon.

In a second terminal, install and start the client:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The client sends requests with credentials enabled so the browser can store and send the authentication cookie.

### Optional sample products

The product listing reads from MongoDB. To insert the included sample products into the database, run this from the repository root:

```bash
npm run seed:products
```

The script inserts a sample product only when a product with the same name does not already exist. Products can also be added with `POST /products`.

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

All endpoints accept and return JSON. Protected endpoints use the `token` HTTP-only cookie set by a successful login. In Postman, log in first and keep the cookie enabled for subsequent requests. The browser client sends credentials automatically.

### Customer endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Check that the API is running |
| `POST` | `/customers/register` | No | Create a customer account |
| `POST` | `/customers/login` | No | Authenticate and set the `token` cookie |
| `GET` | `/customers/me` | Yes | Return the authenticated customer |
| `POST` | `/customers/logout` | Yes | Clear the authentication cookie |
| `PATCH` | `/customers/change-password` | Yes | Change the authenticated customer's password |

Registration requires `fullName`, `email`, `password`, and `phone`. Passwords must contain at least six characters. Login accepts `email` and `password`.

### Product endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/products` | No | Create a product |
| `GET` | `/products` | No | List products |
| `GET` | `/products/:id` | No | Get one product by MongoDB ID |

Create a product with:

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://example.com/keyboard.jpg",
  "stock": 10
}
```

The product schema requires `name`, `description`, `category`, `image`, `price`, and `stock`. Price must be greater than zero; stock cannot be negative. `createdAt` is generated automatically.

`GET /products` supports these query parameters:

| Query parameter | Example | Behavior |
| --- | --- | --- |
| `search` | `/products?search=keyboard` | Case-insensitive match against product name |
| `category` | `/products?category=Electronics` | Filter by exact category |
| `sort` | `/products?sort=price_asc` | Sort by price ascending; use `price_desc` for descending |

Parameters can be combined, for example `/products?search=phone&category=Electronics`.

### Wishlist endpoints

All wishlist endpoints are protected. The server identifies the customer from the authenticated session; clients do not send a `userId`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/wishlist/:productId` | Add a product; returns `409` if already saved |
| `GET` | `/wishlist` | Return the authenticated customer's populated wishlist and count |
| `DELETE` | `/wishlist/:productId` | Remove a saved product |
| `PATCH` | `/wishlist/:productId/toggle` | Toggle membership; response includes `saved: true` or `saved: false` |

The Customer document stores an array of Product ObjectId references. `GET /wishlist` populates product name, price, category, image, and stock. This keeps product information in the Product collection as the source of truth.

Common wishlist errors are `401` for missing/invalid authentication, `400` for an invalid product ID, `404` for a missing product or unsaved product removal, and `409` when adding a duplicate.

## Frontend routes

| Route | Page | Access |
| --- | --- | --- |
| `/login` | Sign in | Guests |
| `/register` | Create an account | Guests |
| `/home` | Customer home | Signed-in customers |
| `/products` | Product catalogue, search, and category filter | Signed-in customers |
| `/products/:id` | Product details | Signed-in customers |
| `/wishlist` | Saved products | Signed-in customers |

The Navbar fetches the wishlist count from `GET /wishlist` and refreshes it after wishlist changes. Product cards toggle save status without a page refresh. Wishlist and catalogue pages display loading, error, and empty states.

## HTTP responses

Responses include a JSON `success` flag. Common status codes are `400` for invalid input, `401` for missing/invalid authentication, `404` for a missing route or product, and `409` for duplicate customer email or duplicate wishlist addition.
