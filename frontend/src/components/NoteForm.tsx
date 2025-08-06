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
    
    if (!textContent) {
      toast.error('Please add some content to your note');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Generate timestamp title if no title provided
      let finalTitle = title.trim();
      let showTimestampNotification = false;
      
      if (!finalTitle) {
        const now = new Date();
        finalTitle = now.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        showTimestampNotification = true;
      }

      const noteData: CreateNoteData = {
        title: finalTitle,
        content: content.trim()
      };

      await notesApi.createNote(noteData, token);
      
      setTitle('');
      setContent('');
      
      if (showTimestampNotification) {
        toast.success('Note saved with timestamp title', {
          duration: 4000,
          icon: '⏰'
        });
      } else {
        toast.success('Note created successfully');
      }
      
      onNoteCreated();
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl note-card-shadow transition-colors h-[480px] flex flex-col" style={{ 
      backgroundColor: 'var(--card-bg)', 
      border: '1px solid var(--border-primary)' 
    }}>
      <h3 className="text-xl font-semibold mb-4 tracking-tight transition-colors flex-shrink-0" style={{ 
        color: 'var(--text-primary)' 
      }}>
        Create New Note
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3 flex flex-col flex-1 min-h-0">
        <div className="flex-shrink-0">
          <input
            type="text"
            placeholder="Note title (optional - will use timestamp if empty)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:border-karbon-blue dark:focus:border-blue-400 focus:ring-0 focus:outline-none transition-colors font-medium"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex-1 flex flex-col min-h-0">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your note content here..."
            className="border-2 rounded-xl focus-within:border-karbon-blue dark:focus-within:border-blue-400 transition-colors h-[300px]"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full gradient-btn text-white py-3 px-6 rounded-xl font-semibold hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0"
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
