import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import notesRoutes from './routes/notes';
import userRoutes from './routes/user';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

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

// Only start server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel
export default app;
