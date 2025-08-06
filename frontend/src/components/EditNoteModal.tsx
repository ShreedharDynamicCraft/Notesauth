import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { notesApi, type UpdateNoteData, type Note } from '../services/api';
import { RichTextEditor } from './RichTextEditor';
import toast from 'react-hot-toast';

interface EditNoteModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onNoteUpdated: () => void;
}

export const EditNoteModal = ({ note, isOpen, onClose, onNoteUpdated }: EditNoteModalProps) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
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

      const updateData: UpdateNoteData = {
        title: title.trim(),
        content: content.trim()
      };

      await notesApi.updateNote(note.id, updateData, token);
      
      toast.success('Note updated successfully');
      onNoteUpdated();
      onClose();
    } catch (error) {
      toast.error('Failed to update note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle(note.title);
    setContent(note.content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-karbon-navy tracking-tight">
            Edit Note
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-karbon-blue focus:ring-0 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
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
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 gradient-btn text-white px-4 py-3 rounded-xl font-semibold hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
