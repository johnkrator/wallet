# Wallet Service MVP

## Description

**Wallet** is a minimal viable product (MVP) wallet service application designed to provide essential digital wallet
functionalities. Users can easily create accounts, fund their accounts, transfer funds to other users, and withdraw
funds from their accounts. The service ensures security by checking against the Lendsqr Adjutor Karma blacklist to
prevent blacklisted users from onboarding.

## Features

1. **User Account Management**
    - Create an account
    - Secure login and authentication

2. **Fund Account**
    - Add funds to the wallet account

3. **Transfer Funds**
    - Transfer funds to another user's account within the system

4. **Withdraw Funds**
    - Withdraw funds from the wallet account to an external bank account or payment gateway

5. **Blacklist Check**
    - Users with records in the Lendsqr Adjutor Karma blacklist are prevented from creating an account

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Knex.js as the query builder
- **Authentication**: JWT (JSON Web Token)
- **Third-Party Services**: Integration with Lendsqr Adjutor Karma API for blacklist verification

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)
- MySQL

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/wallet.git
   cd wallet
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up the database:**
    - Create a MySQL database and update the connection details in the `knexfile.js` or `db.js` configuration file.

4. **Run migrations:**
   ```sh
   npx knex migrate:latest
   ```

5. **Start the server:**
   ```sh
   npm start
   ```

### API Endpoints

1. **Create an Account**
    - **Endpoint**: `POST /api/register`
    - **Request Body**:
      ```json
      {
        "username": "string",
        "password": "string",
        "email": "string"
      }
      ```

2. **Fund Account**
    - **Endpoint**: `POST /api/fund`
    - **Request Body**:
      ```json
      {
        "userId": "string",
        "amount": "number"
      }
      ```

3. **Transfer Funds**
    - **Endpoint**: `POST /api/transfer`
    - **Request Body**:
      ```json
      {
        "fromUserId": "string",
        "toUserId": "string",
        "amount": "number"
      }
      ```

4. **Withdraw Funds**
    - **Endpoint**: `POST /api/withdraw`
    - **Request Body**:
      ```json
      {
        "userId": "string",
        "amount": "number",
        "bankAccount": "string"
      }
      ```

5. **Blacklist Check**
    - The service automatically checks the Lendsqr Adjutor Karma blacklist during account creation.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for review.

## License

This project is licensed under the MIT License.

---
