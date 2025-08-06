import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import notesRoutes from '../src/routes/notes';
import userRoutes from '../src/routes/user';

dotenv.config();

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: [
    'http://localhost:5173', // Development
    'http://localhost:3000', // Alternative dev port
    'https://notesauthapp-frontend.vercel.app', // Production frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Increase body parser limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Notes API Backend is running!', 
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      notes: '/api/notes',
      user: '/api/user'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/notes', notesRoutes);
app.use('/api/user', userRoutes);

// Export the Express app as a Vercel function
export default app;
