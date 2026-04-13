# Taskforge Backend

A robust, production-grade RESTful API built with **Express.js** and **TypeScript**. This repository serves as the core engine for the Taskforge application, providing secure authentication, comprehensive task management, and rigorous data validation.

## 🚀 Technologies Used

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) (Object Modeling via [Mongoose](https://mongoosejs.com/))
- **Validation:** [Zod](https://zod.dev/)
- **Authentication:** JSON Web Tokens (JWT)
- **Containerization:** [Docker](https://www.docker.com/) & Docker Compose

## ✨ Key Features

- **Robust Layered Architecture:** Follows industry-standard Controller, Service, and Repository layers for maintainability and scalability.
- **Strict Data Validation:** Utilizes strict Zod schemas acting seamlessly alongside Express middlewares to sanitize and enforce payloads.
- **Task Management Engine:** Tracks task priority logic, status enumerations, rich tagging, and date tracking precisely securely scoped per user.
- **Secure Authentication:** Implementation of hashed passwords and JWT lifecycle management.
- **Production-Ready Security:** Automated API rate limiting, Helmet header protection, and 0.0.0.0 binding for optimal dockerized networking routing.

## 📂 Project Structure

```text
src/
├── config/         # System configurations & env loading
├── constants/      # Global enumerations (Statuses, Roles, Headers)
├── controllers/    # Route controllers directing HTTP requests
├── middlewares/    # Security, Error Catching, and Auth handlers
├── models/         # MongoDB Mongoose schemas
├── routes/         # Express endpoint definitions
├── services/       # Core business logic
├── types/          # Global TypeScript interfaces
├── utils/          # Helper classes and formatting logic
└── validators/     # Zod payload testing schemas
```

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Or simply Docker to run everything concurrently)

### 1. Installation

Clone the repository and install the Node dependencies natively:
```bash
npm install
```

### 2. Environment Variables

Create a visually matching `.env` file from the provided setup:
```bash
cp .env.example .env
```
Ensure configurations match your local development environment. 

### 3. Running the Server

**Using Docker (Recommended):**
Assuming you have a `docker-compose.yml` configured one tier up, boot the orchestrated stack mapping the Database cleanly via:
```bash
docker compose up -d
```
*(Optionally use `docker compose up -d --build backend` to actively force a rebuild).*

**Native Local Development Mode:**
To run the service natively with active TypeScript hot-reloading:
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

## 🔐 API Flow (Architecture)
1. **Router (`/routes`)** routes the incoming HTTP path.
2. **Middleware (`/middlewares`)** verifies User tokens and intercepts `Zod` validation schemas safely preventing malicious inputs early.
3. **Controller (`/controllers`)** extracts the safe payload and pipes it downstream.
4. **Service (`/services`)** processes the business calculations and database mutations.
5. JSON envelopes specifically formatted as `{ success, data, meta }` are piped flawlessly back up!
