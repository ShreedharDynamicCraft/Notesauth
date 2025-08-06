import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://notesauth-kn8k.vercel.app';

// Debug logging for environment variables
console.log('🔍 API Service Configuration:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  Resolved_API_URL: API_BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('⚠️ VITE_API_BASE_URL not found in environment variables, using fallback URL');
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title: string;
  content: string;
}

export const notesApi = {
  async createNote(data: CreateNoteData, token: string): Promise<Note> {
    const response = await api.post('/api/notes', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getNotes(token: string): Promise<Note[]> {
    const response = await api.get('/api/notes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateNote(id: string, data: UpdateNoteData, token: string): Promise<Note> {
    const response = await api.put(`/api/notes/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteNote(id: string, token: string): Promise<void> {
    await api.delete(`/api/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
