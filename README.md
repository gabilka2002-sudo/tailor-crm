# Tailor CRM

Tailor CRM is a fullstack CRM system for an atelier / tailoring business.

The project helps manage clients, orders, fittings, payments, deadlines and basic atelier workflow.

## Features

- Client management
- Order management
- Fitting management
- Client measurements
- Order statuses
- Payment tracking
- Paid amount tracking
- Remaining amount calculation
- Payment status tracking
- Dashboard statistics
- Financial dashboard cards
- Search, filters and sorting
- CSV export
- Toast notifications
- Loading and error states
- Backend API
- Persistent database storage

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
      adapters.js
      crmApi.js

    components/
      AppState.jsx
      ClientsPreview.jsx
      EmptyState.jsx
      Header.jsx
      Modal.jsx
      OrdersTable.jsx
      QuickActions.jsx
      RightPanel.jsx
      Sidebar.jsx
      StatsCards.jsx
      Toast.jsx

    context/
      CrmContext.jsx
      ToastContext.jsx

    data/
    pages/
      Clients.jsx
      Dashboard.jsx
      Fittings.jsx
      Orders.jsx
      Settings.jsx

    utils/
      dateUtils.js
      validators.js

  backend/
    prisma/
      schema.prisma
      migrations/

    scripts/
      seed.js

    src/
      db/
        prisma.js

      routes/
        clients.routes.js
        fittings.routes.js
        health.routes.js
        orders.routes.js

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
Seed Demo Data

To fill the database with demo clients, orders, payments and fittings, run from the backend folder:

npm run seed

This will create demo data for:

clients
orders
paid amounts
payment statuses
fittings
measurements
Run the Project
Start backend

From the backend folder:

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
PATCH  /api/orders/:id/payment
DELETE /api/orders/:id
Fittings
GET    /api/fittings
POST   /api/fittings
GET    /api/fittings/:id
PUT    /api/fittings/:id
PATCH  /api/fittings/:id/status
DELETE /api/fittings/:id
Order Payment Fields

Each order supports payment tracking:

price          full order price
paidAmount     amount already paid by the client
remainingAmount calculated on the frontend
paymentStatus  Не оплачено / Частично оплачено / Оплачено

Example order data:

{
  "orderNumber": "#001",
  "product": "Свадебное платье",
  "price": 2400,
  "paidAmount": 1000,
  "paymentStatus": "Частично оплачено",
  "status": "Примерка"
}
Dashboard

The dashboard currently shows:

total clients
active orders
completed orders
overdue orders
planned fittings
total order value
total paid amount
remaining amount
unpaid orders count
latest orders
recent clients
quick actions
right panel with useful CRM insights
Current Status

The project currently supports:

client CRUD
order CRUD
fitting CRUD
payment tracking
financial dashboard stats
persistent backend database
frontend connected to backend API
demo seed data
toast notifications
loading and error states
environment variable configuration
CSV export
Development Notes

The project started with localStorage for fast frontend prototyping.

Now the main data flow is:

React frontend
  ↓
crmApi.js
  ↓
Express backend API
  ↓
Prisma
  ↓
SQLite database

The frontend uses adapters to transform backend data into UI-friendly data.

Example:

Backend order:
price: 2400
paidAmount: 1000

Frontend order:
price: "2400 €"
paidAmount: "1000 €"
remainingAmount: "1400 €"
Next Steps

Planned improvements:

PostgreSQL database
authentication
user roles
better order table layout
better responsive UI
calendar view
database backup
production deployment
final demo presentation for atelier