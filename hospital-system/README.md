# Hospital Management System

A comprehensive Next.js hospital management system with multi-role support, appointment booking, queue management, and real-time dashboards.

## 🚀 Features

### Authentication & Roles
- **Credentials-based login** via NextAuth/Auth.js
- **Multi-role support**: PATIENT, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, ADMIN
- **Protected routing** with role-based redirects
- **Optional 2FA** with OTP/backup code validation
- **Unified secrets** for middleware, auth, and 2FA

### Core Functionality
- **Patient Management**: Registration, dashboard, medical records
- **Doctor Management**: Dashboard, queue management, appointments
- **Appointment System**: Scheduling, token codes, status tracking
- **Queue Management**: Real-time queue, wait time estimation, position tracking
- **Medical Records**: Diagnosis, treatment, prescriptions

### Technical Stack
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth/Auth.js v5 with credentials provider
- **Internationalization**: next-intl for multi-language support

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB (running as replica set)
- Docker (optional, for containerized setup)

### 1. Install Dependencies
```bash
cd hospital-system
npm install
```

### 2. Environment Setup
Copy `.env.local` and configure:
```env
DATABASE_URL="mongodb://localhost:27017/hospital?replicaSet=rs0"
AUTH_SECRET=your-super-secret-auth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. MongoDB Setup

#### Option A: Local MongoDB (Recommended for Development)
```bash
# Start MongoDB as replica set
mongod --replSet rs0 --port 27017

# Initialize replica set (in new terminal)
npm run db:init-replica-set
```

#### Option B: Docker Setup
```bash
# Start MongoDB with Docker
docker-compose up -d

# Initialize replica set
npm run db:init-replica-set:docker
```

#### Option C: MongoDB Atlas
- Create a free MongoDB Atlas cluster
- Update `DATABASE_URL` with your Atlas connection string

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

## 🎯 Demo Accounts

After seeding, use these accounts to test the system:

### Admin
- **Email**: admin@hospital.com
- **Password**: password123

### Doctors
- **Dr. John Smith**: dr.smith@hospital.com
- **Dr. Sarah Jones**: dr.jones@hospital.com
- **Password**: password123

### Staff
- **Nurse**: nurse.wilson@hospital.com
- **Receptionist**: reception@hospital.com
- **Pharmacist**: pharmacy@hospital.com
- **Lab Tech**: lab@hospital.com
- **Password**: password123

### Patients
- **Alice Johnson**: patient1@email.com
- **Bob Williams**: patient2@email.com
- **Carol Davis**: patient3@email.com
- **Password**: password123

## 🏥 Queue Smoke Test Setup

The seed script creates a realistic queue scenario:
- **Dr. Smith**: 7 patients (1 IN_CONSULTATION, 6 WAITING)
- **Dr. Jones**: 7 patients (1 IN_CONSULTATION, 6 WAITING)
- **Token Codes**: AA1001-AA1007 (Dr. Smith), BB2001-BB2007 (Dr. Jones)

## 📁 Project Structure

```
hospital-system/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Internationalization routes
│   │   └── (auth)/            # Authentication routes
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── appointments/       # Appointment management
│   │   ├── queue/             # Queue management
│   │   ├── doctor/            # Doctor endpoints
│   │   └── patient/           # Patient endpoints
├── components/                  # React components
│   └── ui/                   # shadcn/ui components
├── lib/                       # Utility libraries
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client
│   ├── two-factor.ts         # 2FA implementation
│   └── utils.ts              # Utility functions
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Demo data seeding
├── scripts/                   # Helper scripts
│   └── init-replica-set.ts   # MongoDB replica set setup
├── docker-compose.yml          # Docker configuration
└── middleware.ts              # Route protection middleware
```

## 🔧 Available Scripts

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                   # Start production server

# Database
npm run db:generate            # Generate Prisma client
npm run db:push                # Push schema to database
npm run db:seed                # Seed demo data
npm run db:studio              # Open Prisma Studio

# MongoDB Setup
npm run db:init-replica-set     # Initialize local replica set
npm run db:init-replica-set:docker  # Initialize Docker replica set
```

## 🎨 UI Components

Built with shadcn/ui for consistent, accessible design:
- Modern, clean interface
- Responsive design
- Dark mode support
- Accessibility compliant

## 🔐 Security Features

- **Role-based access control** with middleware protection
- **Input validation** using Zod schemas
- **Password hashing** with bcryptjs
- **Two-factor authentication** support
- **CSRF protection** via NextAuth
- **Secure session management**

## 📊 Key Features

### Real-time Queue Management
- Live queue status updates
- Estimated wait time calculations
- Position tracking
- Token-based identification

### Appointment System
- Automated token generation
- Conflict detection
- Status tracking
- Historical records

### Dashboard Analytics
- Patient statistics
- Doctor performance metrics
- Queue analytics
- Appointment trends

## 🐛 Troubleshooting

### MongoDB Replica Set Issues
If you encounter Prisma error P2031:
```bash
# Ensure MongoDB is running as replica set
mongod --replSet rs0

# Re-initialize if needed
npm run db:init-replica-set
```

### Build Issues on Windows
The project uses `--webpack` flag for Windows compatibility:
```bash
npm run dev  # Uses webpack by default
```

### TypeScript Errors
Some TypeScript errors are expected before dependencies are installed:
```bash
npm install  # Resolves most import/type errors
```

## 🚀 Deployment

### Environment Variables
Ensure these are set in production:
- `DATABASE_URL` - MongoDB connection string
- `AUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Application URL

### Build Process
```bash
npm run build
npm run start
```

## 📝 Development Notes

- The project uses MongoDB with replica sets for transaction support
- All API routes include proper error handling and validation
- Middleware handles role-based routing automatically
- Queue calculations use 15-minute average consultation time
- Demo data includes realistic scenarios for testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
