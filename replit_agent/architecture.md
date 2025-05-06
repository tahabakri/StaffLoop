# StaffSnap Architecture

## Overview

StaffSnap is a web application designed to help event organizers manage staff and track attendance using facial recognition technology. The application follows a modern full-stack architecture with a React frontend and Node.js/Express backend. It uses PostgreSQL for data storage and includes features like staff check-in with facial recognition, event management, and attendance reporting.

## System Architecture

StaffSnap follows a client-server architecture with distinct frontend and backend components:

1. **Frontend**: React-based single-page application (SPA) built with Vite
2. **Backend**: Express.js server handling API requests and server-side logic
3. **Database**: PostgreSQL database with Drizzle ORM for type-safe database access
4. **Authentication**: Session-based authentication with Passport.js
5. **Styling**: Tailwind CSS with shadcn/ui component library

The application implements a monorepo structure with shared code between client and server. The codebase is organized into the following main directories:

- `/client`: Frontend React application
- `/server`: Backend Express application
- `/shared`: Shared types and schemas used by both client and server

## Key Components

### Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: React Query for server state and local React state for UI
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui (based on Radix UI primitives) with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation

The frontend is structured into the following main parts:

1. **Pages**: Route-specific components (`/client/src/pages/`)
2. **Components**: Reusable UI components (`/client/src/components/`)
3. **Hooks**: Custom React hooks for shared logic (`/client/src/hooks/`)
4. **Lib**: Utility functions and service modules (`/client/src/lib/`)

### Backend

- **Framework**: Express.js with TypeScript
- **API**: RESTful API endpoints for client-server communication
- **Authentication**: Passport.js with session-based auth
- **File Storage**: Multer for handling file uploads (e.g., profile images)
- **Database Access**: Custom storage interface with database operations

The backend architecture follows these patterns:

1. **Route Handlers**: Express routes for handling HTTP requests
2. **Storage Layer**: Abstraction for database access
3. **Authentication Middleware**: Protect routes based on user roles
4. **Static Serving**: Serve compiled frontend assets in production

### Database Schema

The database schema includes the following main entities:

1. **Users**: Store user accounts with different roles (organizer, staff, admin)
2. **Events**: Event information managed by organizers
3. **StaffAssignments**: Link staff to events
4. **CheckIns**: Record staff attendance with timestamps and location data
5. **OnboardingSurveys**: Collect initial setup information from organizers

The schema is defined using Drizzle ORM with TypeScript types and Zod validation schemas for type safety throughout the application.

### Authentication and Authorization

- **User Authentication**: Email/password for organizers, phone number for staff
- **Session Management**: Express sessions stored in PostgreSQL
- **Authorization**: Role-based access control (organizer, staff, admin)
- **Password Security**: Scrypt for secure password hashing

## Data Flow

### Staff Check-in Flow

1. Staff member logs in with phone number
2. Camera captures staff member's face
3. Image is sent to server with location data
4. Server verifies staff assignment to event
5. Server processes facial recognition and records check-in
6. User receives confirmation of successful check-in

### Event Management Flow

1. Organizer creates new event with details
2. Organizer assigns staff to event (individually or via CSV upload)
3. Staff receive notification about assignment
4. On event day, staff check in using facial recognition
5. Organizer monitors real-time attendance
6. Organizer generates reports after event

## External Dependencies

### Frontend Dependencies

- **@radix-ui**: Accessible UI primitives
- **@tanstack/react-query**: Data fetching and caching
- **@hookform/resolvers**: Form validation
- **class-variance-authority**: Component styling variants
- **lucide-react**: Icon library
- **tailwindcss**: Utility-first CSS framework

### Backend Dependencies

- **express**: Web server framework
- **passport**: Authentication middleware
- **multer**: File upload handling
- **drizzle-orm**: Type-safe database toolkit
- **zod**: Schema validation
- **express-session**: Session management

### External Services

- **Stripe**: Payment processing (integration visible in dependencies)
- **Neon Database**: PostgreSQL provider (indicated by `@neondatabase/serverless`)

## Deployment Strategy

The application is configured for deployment on Replit with the following characteristics:

1. **Development Mode**: Uses `tsx` for fast development with TypeScript
2. **Production Build**:
   - Frontend: Vite builds optimized static assets
   - Backend: ESBuild bundles server code into a single file
   - Assets served by Express static middleware

3. **Database**: PostgreSQL database connection via environment variables

4. **Environment Configuration**:
   - Different configurations for development and production
   - Environment variables for sensitive information
   - Automatic provisioning through Replit's configuration

5. **Scaling**: The deployment target is set to "autoscale" in the Replit configuration

The build process compiles both frontend and backend code into a `/dist` directory, with frontend assets in `/dist/public` and the server entry point at `/dist/index.js`.