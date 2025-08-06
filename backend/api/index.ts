import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import notesRoutes from '../src/routes/notes';
import userRoutes from '../src/routes/user';

dotenv.config();

const app = express();

app.use(cors());
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
