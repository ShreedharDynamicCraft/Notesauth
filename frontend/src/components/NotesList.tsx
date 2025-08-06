import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { notesApi, type Note } from '../services/api';
import { EditNoteModal } from './EditNoteModal';
import toast from 'react-hot-toast';

interface NotesListProps {
  refreshTrigger: number;
  searchQuery: string;
}

export const NotesList = ({ refreshTrigger, searchQuery }: NotesListProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'length'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const MAX_PREVIEW_LENGTH = 120; // Characters to show in preview

  const truncateContent = (content: string, maxLength: number) => {
    // Strip HTML tags for length calculation
    const textContent = content.replace(/<[^>]*>/g, '');
    if (textContent.length <= maxLength) return content;
    
    // Find a good breaking point in the HTML
    let truncated = '';
    let textLength = 0;
    const htmlRegex = /<[^>]*>|[^<]+/g;
    let match;
    
    while ((match = htmlRegex.exec(content)) !== null && textLength < maxLength) {
      if (match[0].startsWith('<')) {
        // It's an HTML tag, add it as-is
        truncated += match[0];
      } else {
        // It's text content
        const remaining = maxLength - textLength;
        if (match[0].length <= remaining) {
          truncated += match[0];
          textLength += match[0].length;
        } else {
          truncated += match[0].substring(0, remaining) + '...';
          textLength = maxLength;
        }
      }
    }
    
    return truncated + '...';
  };

  const toggleExpanded = (noteId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const sortNotes = (notesToSort: Note[]) => {
    return [...notesToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'length':
          comparison = a.content.length - b.content.length;
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filterNotes = (notesToFilter: Note[]) => {
    if (!searchQuery.trim()) {
      return notesToFilter;
    }
    
    const query = searchQuery.toLowerCase();
    return notesToFilter.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  };

  const fetchNotes = async (retries = 3) => {
    try {
      const token = await getToken();
      if (!token) {
        if (retries > 0) {
          setTimeout(() => fetchNotes(retries - 1), 1000);
          return;
        }
        throw new Error('Unable to get authentication token');
      }

      const userNotes = await notesApi.getNotes(token);
      setNotes(userNotes);
      
      // Only show success toast once per session and only on initial load
      if (isLoading && !sessionStorage.getItem('hasShownNotesLoadedToast')) {
        toast.success('Notes loaded successfully');
        sessionStorage.setItem('hasShownNotesLoadedToast', 'true');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      if (retries > 0) {
        setTimeout(() => fetchNotes(retries - 1), 2000);
      } else {
        toast.error('Failed to fetch notes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setDeletingNoteId(noteId);
    
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await notesApi.deleteNote(noteId, token);
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
  };

  const handleNoteUpdated = () => {
    fetchNotes();
  };

  useEffect(() => {
    const initializeNotes = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      fetchNotes();
    };
    
    initializeNotes();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="text-center py-16 text-karbon-gray">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-karbon-blue"></div>
        <p className="mt-4 text-lg font-medium">Loading notes...</p>
      </div>
    );
  }

  // Filter and sort notes
  const filteredNotes = filterNotes(notes);
  const sortedNotes = sortNotes(filteredNotes);

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed p-12 text-center transition-colors" style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-primary)'
      }}>
        <div className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>No notes yet</p>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Create your first note to get started!</p>
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed p-12 text-center transition-colors" style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-primary)'
      }}>
        <div className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>No notes found</p>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search query</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <h3 className="text-2xl font-semibold tracking-tight transition-colors" style={{ color: 'var(--text-primary)' }}>
            Your Notes ({filteredNotes.length})
          </h3>
          
          {/* Sorting Controls */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'length')}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-karbon-blue dark:focus:ring-blue-400 focus:border-transparent transition-colors"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="length">Sort by Length</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border rounded-lg transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
            >
              <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid gap-6">
          {sortedNotes.map((note) => {
            const textContent = note.content.replace(/<[^>]*>/g, '');
            const shouldTruncate = textContent.length > MAX_PREVIEW_LENGTH;
            const displayContent = shouldTruncate 
              ? truncateContent(note.content, MAX_PREVIEW_LENGTH)
              : note.content;
            
            return (
              <div key={note.id} className="note-card-shadow p-7 rounded-2xl border hover:-translate-y-1 transition-all duration-300" style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-primary)'
              }}>
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h4 className="text-xl font-semibold flex-1 leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {note.title}
                  </h4>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="w-8 h-8 flex items-center justify-center text-karbon-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="gradient-delete w-8 h-8 rounded-lg text-white hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                      disabled={deletingNoteId === note.id}
                      title="Delete note"
                    >
                      {deletingNoteId === note.id ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
                  <div 
                    className="prose prose-sm max-w-none note-content"
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                  />
                  
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/note/${note.id}`)}
                      className="text-gray-600 dark:text-slate-400 hover:text-karbon-blue dark:hover:text-blue-400 text-sm font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>View Full Note</span>
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-3 flex justify-between items-center" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {textContent.length} characters
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingNote && (
        <EditNoteModal
          note={editingNote}
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          onNoteUpdated={handleNoteUpdated}
        />
      )}
    </>
  );
};
