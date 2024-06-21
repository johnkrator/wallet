#Postman Documentation
https://documenter.getpostman.com/view/18462993/2sA3XV8yyE

# Lendsqr Fintech Solution

Welcome to the Lendsqr fintech solution, a platform designed for financial transactions and user management.

## Table of Contents

1. [Introduction](#introduction)
2. [Setup Instructions](#setup-instructions)
3. [Folder Structure](#folder-structure)
4. [Endpoints](#endpoints)
5. [Middleware](#middleware)
6. [Database](#database)
7. [Error Handling](#error-handling)
8. [Environment Variables](#environment-variables)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [License](#license)

## Introduction

Lendsqr is a fintech application built on Node.js and Express.js, designed to facilitate financial transactions such as
deposits, withdrawals, transfers, and manage user information securely.

## Setup Instructions

To run the Lendsqr application locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd lendsqr-fintech
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory with the following variables:

   ```plaintext
   PORT=3000
   JWT_SECRET=your_jwt_secret
   DATABASE_URL=your_database_connection_string
   ```

4. **Start the server:**

   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000` by default.

## Folder Structure

```
lendsqr-fintech/
│
├── controllers/
│   ├── transaction.controllers.ts
│   ├── users/
│       ├── onboarding.controller.ts
│       ├── user.controller.ts
│
├── db/
│   ├── dbConnection.ts
│   ├── migrations/
│   ├── seeds/
│
├── helpers/
│   ├── middlewares/
│       ├── authMiddleware.ts
│       ├── errorMiddleware.ts
│
├── routes/
│   ├── transaction.routes.ts
│   ├── users/
│       ├── onboarding.routes.ts
│       ├── users.routes.ts
│
├── .env
├── app.ts
└── README.md
```

## Endpoints

### Authentication and User Management

- **POST /api/v1/auth/register**
    - Register a new user.
- **POST /api/v1/auth/verify-email**
    - Verify user's email after registration.
- **POST /api/v1/auth/login**
    - User login.

### User Management

- **GET /api/v1/users/**
    - Get all users.
- **GET /api/v1/users/me**
    - Get current user's profile.
- **GET /api/v1/users/:id**
    - Get user by ID.
- **PUT /api/v1/users/:id**
    - Update user information.
- **DELETE /api/v1/users/:id**
    - Delete user.

### Wallet and Transaction Management

- **POST /api/v1/wallets/deposit**
    - Deposit funds into the user's wallet.
- **POST /api/v1/wallets/withdraw**
    - Withdraw funds from the user's wallet.
- **POST /api/v1/wallets/transfer**
    - Transfer funds between wallets.
- **GET /api/v1/wallets/:walletId**
    - Get transactions for a specific wallet.

## Middleware

- **authenticate**: Ensures that API endpoints are accessed by authenticated users only.
- **errorMiddleware**: Handles errors globally and provides appropriate responses.

## Database

The application uses a relational database managed through Knex.js for schema migrations and queries. Database
connection details are configured in `dbConnection.ts`.

## Error Handling

Errors are handled centrally using middleware (`errorMiddleware.ts`). HTTP responses include appropriate status codes
and error messages for ease of debugging and client-side error handling.

## Environment Variables

- **PORT**: Port number for the server to listen on.
- **JWT_SECRET**: Secret key for JWT token generation and verification.
- **DATABASE_URL**: Connection string for the database.

## Deployment

For deployment, ensure that environment variables are properly configured on your hosting provider. Use a process
manager like PM2 or Docker for containerization to manage the application in production environments.

## Contributing

Contributions to the Lendsqr fintech solution are welcome! Fork the repository, create your branch, commit your changes,
and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
