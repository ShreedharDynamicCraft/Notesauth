# Notes API Backend

Express.js API backend with PostgreSQL (Neon) and Clerk authentication for managing user-specific notes.

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual values:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `CLERK_SECRET_KEY`: Your Clerk secret key from the Clerk dashboard

3. Install dependencies:
   ```bash
   npm install
   ```

4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

5. Push database schema to Neon:
   ```bash
   npm run db:push
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

All endpoints require a valid Clerk JWT token in the Authorization header:
```
Authorization: Bearer <your-clerk-jwt-token>
```

### POST /api/notes
Create a new note for the authenticated user.

**Request Body:**
```json
{
  "title": "Note Title",
  "content": "Note content here..."
}
```

### GET /api/notes
Get all notes for the authenticated user, sorted by creation date (newest first).

### DELETE /api/notes/:id
Delete a specific note if the authenticated user owns it.

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── controllers/
│   │   └── notesController.ts
│   ├── middleware/
│   │   └── auth.ts        # Clerk JWT verification
│   ├── routes/
│   │   └── notes.ts       # Notes API routes
│   ├── lib/
│   │   └── prisma.ts      # Prisma client setup
│   └── index.ts           # Main application entry point
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```
