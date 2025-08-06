import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
