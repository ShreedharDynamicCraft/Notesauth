# Notes Dashboard - Frontend

A clean, user-friendly React app for managing personal notes with Clerk authentication.

## Features

- **Clerk Authentication**: Secure sign-in/sign-out with JWT tokens
- **User Dashboard**: Display user name/email after login
- **Create Notes**: Simple form with title and content fields
- **View Notes**: List all user notes in a clean grid layout
- **Delete Notes**: Remove notes with confirmation
- **Toast Notifications**: Real-time feedback for all actions
- **Responsive Design**: Works on desktop and mobile devices

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your actual values:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:5000)

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Sign In**: Click "Sign In" to authenticate with Clerk
2. **Create Notes**: Fill out the form and click "Create Note"
3. **View Notes**: All your notes appear in the grid below
4. **Delete Notes**: Click the "✕" button and confirm deletion
5. **Sign Out**: Click "Sign Out" in the header

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Clerk** for authentication
- **Axios** for API calls
- **React Hot Toast** for notifications

## API Integration

The app connects to the Express.js backend at `/api/notes` with these endpoints:
- `POST /api/notes` - Create a new note
- `GET /api/notes` - Get all user notes
- `DELETE /api/notes/:id` - Delete a specific note

All requests include the Clerk JWT token in the Authorization header.

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx      # Main dashboard layout
│   ├── UserProfile.tsx    # User info and sign out
│   ├── NoteForm.tsx       # Create note form
│   └── NotesList.tsx      # Display notes grid
├── services/
│   └── api.ts             # API service with Axios
├── App.tsx                # Main app with Clerk provider
└── main.tsx               # React entry point
```
