# Tailor CRM

Tailor CRM is a fullstack CRM system for an atelier/tailoring business.

The project helps manage:

- clients
- orders
- fittings
- client measurements
- order statuses
- basic CRM dashboard data

## Tech Stack

### Frontend

- React
- Vite
- CSS
- Context API
- Fetch API

### Backend

- Node.js
- Express
- Prisma
- SQLite for local development

## Project Structure

```text
TailorCRM/
  src/
    api/
    components/
    context/
    data/
    pages/
    utils/

  backend/
    prisma/
    src/
      db/
      routes/
      server.js

      Environment Variables
Frontend

Create a .env file in the project root:

VITE_API_URL=http://localhost:4000/api

You can use .env.example as a template.

Backend

Create a .env file inside the backend folder:

PORT=4000
CLIENT_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"

You can use backend/.env.example as a template.

Installation

Install frontend dependencies:

npm install

Install backend dependencies:

cd backend
npm install
Database Setup

From the backend folder, run:

npx prisma generate
npx prisma migrate dev
Run the Project
Start backend
cd backend
npm run dev

Backend runs on:

http://localhost:4000
Start frontend

In another terminal, from the project root:

npm run dev

Frontend runs on:

http://localhost:5173
API Routes
Health
GET /api/health
Clients
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
Orders
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
PATCH  /api/orders/:id/status
DELETE /api/orders/:id
Fittings
GET    /api/fittings
POST   /api/fittings
GET    /api/fittings/:id
PUT    /api/fittings/:id
PATCH  /api/fittings/:id/status
DELETE /api/fittings/:id
Current Status

The project currently supports:

client CRUD
order CRUD
fitting CRUD
persistent backend database
frontend connected to backend API
toast notifications
loading and error states
environment variable configuration
Next Steps

Planned improvements:

PostgreSQL database
authentication
user roles
payments
calendar view
production deployment