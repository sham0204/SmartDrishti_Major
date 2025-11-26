# SmartDrishti - IoT Learning Platform

SmartDrishti is a hands-on IoT learning platform featuring two guided projects: a Water Level Detector and a Home Appliances Monitoring System. Learn sensors, actuators, cloud APIs, and dashboards in one friendly environment.

## Features

- User authentication (registration, login, logout)
- Two IoT projects with guided workflows:
  - Water Level Detection System
  - Home Appliances Monitoring System
- Project management system
- Admin panel for managing projects and users
- Responsive UI with Tailwind CSS
- Real-time data visualization
- Secure API endpoints with rate limiting
- PostgreSQL database with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (NeonDB recommended)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Rate limiting, input validation
- **Data Visualization**: Recharts

## Prerequisites

- Node.js 18+
- PostgreSQL database (NeonDB recommended)
- npm or yarn package manager

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smartdrishti
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit the `.env` file with your database connection string and JWT secret:
- `DATABASE_URL`: Your PostgreSQL connection string (ensure it includes `sslmode=require` for NeonDB)
- `JWT_SECRET`: A strong secret key for JWT token signing

### 4. Set Up the Database

Initialize the database schema:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Seed the database with initial data:

```bash
npm run prisma:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Apply database migrations
- `npm run prisma:seed` - Seed the database
- `npm run prisma:migrate:prod` - Apply migrations in production
- `npm run build:analyze` - Build with bundle analysis
- `npm run start:prod` - Start production server with custom server

## Project Structure

```
app/
  (auth)/          # Authentication routes
    login/
    register/
  api/             # API routes
    auth/
    project/
    user/
  dashboard/       # User dashboard
  projects/        # Project pages
    water-level/   # Water Level Detector project
    home-appliances/ # Home Appliances Monitoring System
components/
  ui/             # Reusable UI components
  navbar/         # Navigation bar
  profile/        # Profile components
lib/
  auth.js         # Authentication utilities
  prisma.js       # Prisma client instance
  validation.js   # Input validation utilities
  hooks.js        # Custom React hooks
  rateLimiter.js  # Rate limiting utilities
  rateLimitMiddleware.js  # Rate limiting middleware
prisma/
  schema.prisma   # Database schema
  seed.js         # Database seeding script
public/
  images/         # Static images
styles/
  globals.css     # Global CSS styles
```

## Main Projects

### 1. Water Level Detection System

Monitor and visualize tank water levels in real time. This project teaches:
- Ultrasonic sensor integration
- Data collection and storage
- Real-time visualization
- Cloud data synchronization

Features:
- Live water level monitoring dashboard
- Historical data visualization
- Manual and automatic data entry
- Threshold alerts

Access at: `/projects/water-level`

### 2. Home Appliances Monitoring System

Control LEDs and fans remotely via the cloud. This project teaches:
- Relay module control
- Remote device management
- State synchronization
- Web-controlled actuators

Features:
- Control panel for LEDs and fans
- Device state history tracking
- Real-time status updates
- Web and device-side control

Access at: `/projects/home-appliances`

## Authentication

The platform uses JWT tokens for authentication. Demo accounts are available on the landing page for testing purposes.

Default demo accounts:
- Admin: `admin` / `admin123`
- Users: `user1` / `user123` through `user5` / `user123`

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure HTTP headers

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## License

This project is licensed under the MIT License.