# JWT Auth API

A simple Node.js + Express REST API with JWT authentication. No database needed — users are stored in memory.

## Setup

```bash
npm install
npm start
```

Server runs on: http://localhost:5000

---

## Routes

| Method | URL        | Auth needed? | Description              |
|--------|------------|--------------|--------------------------|
| GET    | /          | No           | Health check             |
| POST   | /register  | No           | Register a new user      |
| POST   | /login     | No           | Login and get JWT token  |
| GET    | /profile   | Yes (Bearer) | Your decoded token info  |
| GET    | /users     | Yes (Bearer) | List all registered users|

---

## How to test in Postman

### Step 1 — Register
- Method: POST
- URL: http://localhost:5000/register
- Body → raw → JSON:
```json
{
  "name": "Rahim",
  "email": "rahim@gmail.com",
  "password": "123456"
}
```

### Step 2 — Login
- Method: POST
- URL: http://localhost:5000/login
- Body → raw → JSON:
```json
{
  "email": "rahim@gmail.com",
  "password": "123456"
}
```
- Copy the `token` from the response.

### Step 3 — Access protected route
- Method: GET
- URL: http://localhost:5000/profile
- Headers:
  - Key: Authorization
  - Value: Bearer <paste_your_token_here>

---

## How JWT works (quick summary)

1. User logs in → server checks credentials → creates a signed token
2. Token is sent back to the client
3. Client sends token in every request header: `Authorization: Bearer <token>`
4. Server verifies the token → if valid, allows access

---

## Packages used

- `express` — web server
- `jsonwebtoken` — create and verify JWT tokens
- `bcryptjs` — hash and compare passwords
