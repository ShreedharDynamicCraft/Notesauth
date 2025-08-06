# Notes App with OAuth Authentication

A modern, full-stack notes application with OAuth authentication, rich text editing, and image support. Built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Features

### Core Features
- **OAuth Authentication**: Seamless login with Google, GitHub, and LinkedIn via Clerk
- **Rich Text Editor**: Advanced text formatting with TipTap editor
- **Image Support**: Upload and embed images directly into notes (up to 50MB)
- **Real-time Updates**: Instant saving and synchronization
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **User Management**: Automatic user creation and profile management

### Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **Modern React**: Built with React 19 and latest hooks
- **Clean Architecture**: Modular component structure with separation of concerns
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance Optimized**: Lazy loading and optimized bundle size

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   │   ├── SSOCallback.tsx
│   │   │   ├── SignInOptions.tsx
│   │   │   └── AuthenticatedWrapper.tsx
│   │   ├── shared/         # Reusable components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── AppContent.tsx  # Main app content
│   │   └── NotesList.tsx   # Notes management
│   ├── config/             # Configuration files
│   │   ├── app.ts          # App configuration
│   │   ├── oauth.tsx       # OAuth provider settings
│   │   └── auth.ts         # Auth type definitions
│   ├── services/           # API services
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── package.json
```

### Backend (Node.js + Express + TypeScript)
```
backend/
├── src/
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Authentication & validation
│   │   └── auth.ts         # Clerk OAuth middleware
│   ├── services/           # Business logic
│   │   └── userService.ts  # User management
│   ├── routes/             # API route definitions
│   └── index.ts            # Server entry point
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
└── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Clerk account for OAuth authentication

### 1. Clone Repository
```bash
git clone <repository-url>
cd "Karbon business"
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create `.env` file in the backend directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/notes_db"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"
CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key"

# Server Configuration
PORT=5001
NODE_ENV=development
```

#### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (if you prefer)
npm run db:migrate
```

#### Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
Create `.env.local` file in the frontend directory:
```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key"

# API Configuration
VITE_API_URL="http://localhost:5001"
```

#### Start Frontend Server
```bash
# Development mode
npm run dev

# Build for production
npm run build
npm run preview
```

### 4. Clerk OAuth Configuration

1. **Create Clerk Application**:
   - Go to [clerk.com](https://clerk.com) and create a new application
   - Enable OAuth providers: Google, GitHub, LinkedIn

2. **Configure OAuth Providers**:
   - **Google**: Set up Google OAuth in Google Cloud Console
   - **GitHub**: Create OAuth app in GitHub Developer Settings
   - **LinkedIn**: Set up LinkedIn OAuth in LinkedIn Developer Portal

3. **Set Redirect URLs**:
   - Development: `http://localhost:5173/register-newUser`
   - Production: `https://yourdomain.com/register-newUser`

4. **Copy Keys**:
   - Copy publishable key to frontend `.env.local`
   - Copy secret key to backend `.env`

## 🔧 Technology Stack

### Frontend Technologies
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **TipTap**: Rich text editor with extensibility
- **Clerk React**: OAuth authentication library
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing
- **React Hot Toast**: User notifications

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server development
- **Prisma**: Modern database toolkit and ORM
- **PostgreSQL**: Relational database
- **Clerk SDK**: Server-side authentication
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### DevOps & Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Nodemon**: Development auto-restart
- **ts-node**: TypeScript execution
- **Git**: Version control

## 🔐 OAuth Implementation Approach

### Authentication Flow
1. **User Initiates Login**: User clicks on OAuth provider (Google/GitHub/LinkedIn)
2. **Clerk Handles OAuth**: Clerk manages the OAuth flow with the selected provider
3. **Token Generation**: Clerk generates JWT token upon successful authentication
4. **Custom Callback**: User is redirected to `/register-newUser` route
5. **Auto User Creation**: Backend automatically creates user record if it doesn't exist
6. **Session Management**: Clerk manages user sessions and token refresh

### Key Implementation Details

#### Frontend Authentication
```typescript
// Clean authentication wrapper
const AuthenticatedWrapper = () => {
  const { isLoaded, userId } = useAuth();
  
  if (!isLoaded) return <LoadingSpinner />;
  if (!userId) return <SignInOptions />;
  
  return <AppContent />;
};
```

#### Backend Middleware
```typescript
// Auto-creating user middleware
export const authenticateUser = async (req, res, next) => {
  // 1. Verify JWT token
  // 2. Fetch user data from Clerk API
  // 3. Check if user exists in database
  // 4. Auto-create user if not exists
  // 5. Attach user to request object
};
```

#### Custom SSO Callback
- **Route**: `/register-newUser` (instead of generic `/sso-callback`)
- **Purpose**: Provides better user experience and clearer intent
- **Functionality**: Handles post-authentication user setup

## 🚧 Challenges Faced & Solutions

### 1. **Large File Uploads (PayloadTooLargeError)**
- **Challenge**: Default Express body parser limited file uploads
- **Solution**: Increased body parser limits to 50MB for base64-encoded images
```typescript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### 2. **User Registration Flow**
- **Challenge**: Users weren't being automatically created in database
- **Solution**: Implemented auto-user creation in authentication middleware
- **Benefit**: Seamless user experience without manual registration

### 3. **Component Architecture**
- **Challenge**: Large, monolithic `App.tsx` file was difficult to maintain
- **Solution**: Split into modular components with clear responsibilities
- **Result**: Better maintainability and testability

### 4. **TypeScript Error Management**
- **Challenge**: Multiple TypeScript compilation errors across the codebase
- **Solution**: Systematic cleanup of unused variables, proper type definitions
- **Result**: Zero TypeScript errors, improved code quality

### 5. **OAuth Provider Configuration**
- **Challenge**: Managing multiple OAuth providers with consistent UI/UX
- **Solution**: Created unified configuration system with provider-specific styling
```typescript
export const OAUTH_PROVIDERS = {
  google: { name: 'Google', color: 'bg-red-500', icon: GoogleIcon },
  github: { name: 'GitHub', color: 'bg-gray-800', icon: GitHubIcon },
  linkedin: { name: 'LinkedIn', color: 'bg-blue-600', icon: LinkedInIcon }
};
```

## 🎯 Key Decisions & Rationale

### Backend Choice: Node.js + Express + TypeScript
- **Why**: Unified JavaScript/TypeScript ecosystem
- **Benefits**: Code sharing between frontend/backend, rich ecosystem
- **Alternative Considered**: Python FastAPI, but chose JS for consistency

### Database Choice: PostgreSQL + Prisma
- **Why**: ACID compliance, JSON support, mature ecosystem
- **Benefits**: Type-safe database queries, automatic migrations
- **Alternative Considered**: MongoDB, but chose relational for data consistency

### Authentication: Clerk vs Custom
- **Why**: Clerk provides enterprise-grade OAuth with minimal setup
- **Benefits**: Security, compliance, multiple providers, session management
- **Alternative Considered**: Auth0, Firebase Auth, but Clerk had better DX

### Frontend Framework: React 19 + Vite
- **Why**: Latest React features, fast development experience
- **Benefits**: Concurrent features, better performance, modern tooling
- **Alternative Considered**: Next.js, but Vite provided simpler deployment

### Styling: Tailwind CSS
- **Why**: Utility-first approach, rapid development
- **Benefits**: Consistent design, small bundle size, responsive design
- **Alternative Considered**: Styled Components, but Tailwind is more maintainable

### Rich Text Editor: TipTap
- **Why**: Modern, extensible, headless editor
- **Benefits**: TypeScript support, plugin architecture, modern React patterns
- **Alternative Considered**: Quill, Draft.js, but TipTap had better React integration

## 🔄 Development Workflow

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration for consistent code style
- Error-free compilation required
- Component-based architecture

### Database Management
- Prisma migrations for schema changes
- Type-safe database queries
- Automatic client generation

### Environment Management
- Separate configurations for development/production
- Environment variable validation
- Secure credential management

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/verify` - Verify JWT token and create/update user

### Notes Endpoints
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update existing note
- `DELETE /api/notes/:id` - Delete note

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend Deployment (Railway/Heroku)
```bash
npm run build
# Set environment variables
# Deploy to platform
```

### Database Deployment
- Use managed PostgreSQL (Railway, Supabase, or AWS RDS)
- Run migrations in production environment
- Set up connection pooling for better performance

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using modern web technologies
