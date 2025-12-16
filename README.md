# NovaCrust Core API Service


Every API request should have an 'idempotency-key' attached to the Header
The idempotency key helps prevent race conditions and maintain transaction integrity



## OVERVIEW

The NovaCrust API allows users to manage funding and inter-transfer between different accounts. This API uses NestJS, TypeORM and Typescript.

# Brief notes on how this system would scale in production
- Redis in a Distributed System is crucial for high performance and coordination across multiple application instances (load balanced servers). It can be used for caching and distributed locking. It can also be used to maintain idempotency of code across regions

- for the Database Scaling (eg PostgreSQL)
Sharding (Horizontal Partitioning): This is the ultimate scaling solution for massive transaction volume. Data is split across multiple independent database servers (shards). Wallets might be sharded by a hash of the wallet_id or user_id. The application logic or a proxy layer manages which shard to read from or write to.

- Queueing Systems (RabbitMQ/Kafka): As volume increases, incoming transfer requests can be placed into a message queue. A dedicated worker service processes these transactions sequentially and atomically. This decouples the API request from the processing, preventing API timeouts and managing database load peaks.

- Monitoring and Alerting: Robust monitoring (Prometheus, Grafana) is critical. Set alerts for low balances, high transaction failure rates, database latency spikes, and Redis memory usage.

- Security & Compliance: Ensure all data is encrypted at rest and in transit. Comply with relevant financial regulations.



NB: Documented my API in my ReadMe, had a crash on my PostMan

## TABLE OF CONTENTS

- [Overview](#overview)
    [Brief Note](#brief-notes-on-how-this-system-would-scale-in-production)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the API](#running-the-api)
- [Documentation](#documentation)
- [API Documentation](#a)
- [Error Handling](#error-handling)

## FEATURES

- Create Wallet
- Fund Wallet
- Transfer Between Wallets
- Fetch Wallet Details
- Error handling and validation
- Unit test

## Getting started with NovaCrust API

## PREREQUISITES

To be able to setup the project locally, you need to have the following installed and working properly:

- [Node.js v16.x or higher](https://nodejs.org/en/)
- NPM, Yarn or PNPM package manager
- [PostgreSQL v12.x or higher](https://www.postgresql.org/download/)
- [TypeORM for database interaction](https://typeorm.io/transactions)

## INSTALLATION

- Clone the repository:
  ```
  git clone https://github.com/cyrilchukwuebuka/backend-role-quick-test
  cd backend-role-quick-test
  ```
- Install dependencies:
  ```
  npm install
  ```
- Set up environment variables:
  ```
  cp .env.example .env
  ```
  - Example .env file:
    ```
      # APP
      APP_NAME
      APP_VERSION
      APP_PORT

      # jwt
      JWT_SECRET
      JWT_EXPIRE

      Database Setup
      - install postgres
      - Create a new database eg (novacrust) or use the default (postgres)
      - fill up your env variables

      DATABASE=postgres
      DATABASE_USERNAME=postgres
      DATABASE_PASSWORD=<password>
      DATABASE_PORT=5432
      DATABASE_HOST=localhost
      DATABASE_DBNAME=novacrust or postgress
    ```
- Run database migrations:
  ```
  npm run typeorm migration:run
  ```

## Running the API

- Start the server on development:
  ```
  npm run start:dev
  ```
- Start the server on test:
  ```
  npm run test:watch
  or
  npm run test
  ```
- The API will be running at http://localhost:5000. eg. PORT=5000

## Documentation

The API is documented using Swagger, and you can access the Swagger UI at the following endpoint:

- POSTMAN Documentation: http://localhost:5000/api

## API Documentation

- POSTMAN Documentation
baseurl = http://localhost:5000

Create Wallet = POST /api/v1/wallet
                DATA: { amount: number }

Fund Wallet = PATCH /api/v1/wallet
              DATA: {"amount": 1000, "sender_wallet_id": "a065d1f1-50a4-477a-a4b8-aea5daa29d08"}

Transfer Between Wallets = PATCH /api/v1/wallet/transfer
                            DATA: {"amount": 1000, "sender_wallet_id": "a065d1f1-50a4-477a-a4b8-aea5daa29d08", "receiver_wallet_id": "a065d1f1-50a4-477a-a4b8-aea5daa29d08"}

Fetch Wallet Details = GET  PATCH /api/v1/wallet/:id 


| HTTP Method | Endpoint                       | Description                       | Request Body/Query Parameters                                   | Example Response                                                                             |
| ----------- | ------------------------------ | --------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `POST`      | `/api/v1/wallet/transfer`           | Create Wallet                       | `{"amount": 1000}`              | `{"status": true,"message": "Wallet Created","data": {"balance": 1000,"id": "a065d1f1-50a4-477a-a4b8-aea5daa29d08","created_at": "2025-12-16T14:46:08.994Z","updated_at": "2025-12-16T14:46:08.994Z","version": 1,"currency": "USD"}                ` |
| `PATCH`     | `/api/v1/auth/change-password` | Fund Wallet | `{"amount": 1000, "sender_wallet_id": "a065d1f1-50a4-477a-a4b8-aea5daa29d08"}` | `{"status": true,"message": "Wallet Funded","data": {"wallet": {"id": "a065d1f1-50a4-477a-a4b8-aea5daa29d08","created_at": "2025-12-16T14:46:08.994Z","updated_at": "2025-12-16T14:53:02.878Z","version": 2,"currency": "USD","balance": 2000},"transactions": {"receiver_wallet_id": "a065d1f1-50a4-477a-a4b8-aea5daa29d08","type": "deposit","description": "Deposited 1000 into wallet a065d1f1-50a4-477a-a4b8-aea5daa29d08}","amount": 1000,"receiver_wallet": {"id": "a065d1f1-50a4-477a-a4b8-aea5daa29d08","created_at": "2025-12-16T14:46:08.994Z","updated_at": "2025-12-16T14:53:02.878Z","version": 2,"currency": "USD","balance": 2000},"sender_wallet_id": null,"id": "65e43e58-3d77-4537-92e9-69b4b33c5a13","created_at": "2025-12-16T14:53:02.878Z","updated_at": "2025-12-16T14:53:02.878Z","version": 1}}`       


## Error Handling

The API provides detailed error messages with corresponding HTTP status codes.

- 400: Bad Request – Validation errors or malformed requests
- 401: Unauthorized – Missing or invalid JWT token
- 404: Not Found – Resource not found
- 500: Internal Server Error – Server error
  Example Error Response:

  ```json
  {
    "success": false,
    "message": "Insufficient funds.",
    "statusCode": 400,
    "timestamp": "12/16/2025, 2:37:26 PM",
    "path": "/api/v1/wallet/transfer",
    "method": "PATCH"
  }
  ```
