import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { notesApi, type CreateNoteData } from '../services/api';
import { RichTextEditor } from './RichTextEditor';
import toast from 'react-hot-toast';

interface NoteFormProps {
  onNoteCreated: () => void;
}

export const NoteForm = ({ onNoteCreated }: NoteFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strip HTML tags for validation
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    
    if (!title.trim() || !textContent) {
      toast.error('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const noteData: CreateNoteData = {
        title: title.trim(),
        content: content.trim()
      };

      await notesApi.createNote(noteData, token);
      
      setTitle('');
      setContent('');
      toast.success('Note created successfully');
      onNoteCreated();
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl note-card-shadow border border-gray-100">
      <h3 className="text-xl font-semibold text-karbon-navy mb-6 tracking-tight">
        Create New Note
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-karbon-blue focus:ring-0 focus:outline-none transition-colors bg-gray-50 focus:bg-white font-medium"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your note content here..."
            className="border-2 border-gray-200 rounded-xl focus-within:border-karbon-blue transition-colors"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full gradient-btn text-white py-3.5 px-6 rounded-xl font-semibold hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating...
            </div>
          ) : (
            'Create Note'
          )}
        </button>
      </form>
    </div>
  );
};
