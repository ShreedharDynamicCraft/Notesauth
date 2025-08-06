import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { notesApi, type Note } from '../services/api';
import { EditNoteModal } from './EditNoteModal';
import toast from 'react-hot-toast';

export const NoteDetailView = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNote = async () => {
    if (!noteId) {
      navigate('/');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        navigate('/');
        return;
      }

      const notes = await notesApi.getNotes(token);
      const foundNote = notes.find(n => n.id === noteId);
      
      if (!foundNote) {
        toast.error('Note not found');
        navigate('/');
        return;
      }

      setNote(foundNote);
    } catch (error) {
      console.error('Error fetching note:', error);
      toast.error('Failed to load note');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!note || !confirm('Are you sure you want to delete this note?')) return;

    setIsDeleting(true);
    
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await notesApi.deleteNote(note.id, token);
      toast.success('Note deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNoteUpdated = () => {
    fetchNote(); // Refresh note after update
    setIsEditModalOpen(false);
  };

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-karbon-light">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-karbon-blue"></div>
            <p className="mt-4 text-lg font-medium text-karbon-gray">Loading note...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-karbon-light">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="text-center py-16">
            <p className="text-xl text-karbon-gray">Note not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-karbon-light">
        {/* Header */}
        <div className="gradient-bg shadow-lg border-b border-karbon-slate">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Notes</span>
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                
                <button
                  onClick={handleDeleteNote}
                  disabled={isDeleting}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Note Content */}
        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Note Header */}
            <div className="p-8 border-b border-gray-100">
              <h1 className="text-3xl font-bold text-karbon-navy mb-4 leading-tight">
                {note.title}
              </h1>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Created: {new Date(note.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  
                  {note.updatedAt !== note.createdAt && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Updated: {new Date(note.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {note.content.replace(/<[^>]*>/g, '').length} characters
                </span>
              </div>
            </div>

            {/* Note Content */}
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-karbon-gray leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditNoteModal
          note={note}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onNoteUpdated={handleNoteUpdated}
        />
      )}
    </>
  );
};
