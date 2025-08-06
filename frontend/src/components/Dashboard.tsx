import { useState, useEffect, useRef } from 'react';
import { UserProfile } from './UserProfile';
import { NoteForm } from './NoteForm';
import { NotesList } from './NotesList';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const saved = localStorage.getItem('dashboardPanelWidth');
    return saved ? parseInt(saved, 10) : 400;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNoteCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left - 32; // Account for padding
    
    // Set minimum and maximum widths
    const minWidth = 300;
    const maxWidth = containerRect.width * 0.6; // Max 60% of container width
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setLeftPanelWidth(newWidth);
      localStorage.setItem('dashboardPanelWidth', newWidth.toString());
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const resetPanelWidth = () => {
    setLeftPanelWidth(400);
    localStorage.setItem('dashboardPanelWidth', '400');
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  useEffect(() => {
    // Check if we've already shown the welcome toast in this session
    const hasShownWelcomeToast = sessionStorage.getItem('hasShownWelcomeToast');
    if (!hasShownWelcomeToast) {
      toast.success('Welcome to your notes dashboard!');
      sessionStorage.setItem('hasShownWelcomeToast', 'true');
    }

    // Handle screen size changes
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-karbon-light">
      <div className="gradient-bg shadow-lg border-b border-karbon-slate">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-white text-3xl font-bold tracking-tight">
              Notes Dashboard
            </h1>
            {isLargeScreen && (
              <button
                onClick={resetPanelWidth}
                className="text-white/80 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
                title="Reset panel size"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Layout
              </button>
            )}
          </div>
          <UserProfile />
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className={`max-w-7xl mx-auto px-8 py-10 ${
          isLargeScreen ? 'flex items-start gap-0 relative' : 'space-y-10'
        }`}
      >
        {/* Left Panel - Note Form */}
        <div 
          className={`${isLargeScreen ? 'lg:sticky lg:top-10 transition-all duration-200' : ''}`}
          style={isLargeScreen ? { 
            width: `${leftPanelWidth}px`,
            minWidth: '300px'
          } : {}}
        >
          <NoteForm onNoteCreated={handleNoteCreated} />
        </div>
        
        {/* Resize Handle - Only visible on large screens */}
        {isLargeScreen && (
          <div className="relative">
            <div
              className={`w-2 h-full cursor-col-resize hover:bg-karbon-blue hover:bg-opacity-20 transition-colors relative group ${
                isResizing ? 'bg-karbon-blue bg-opacity-30' : ''
              }`}
              onMouseDown={handleMouseDown}
            >
              {/* Visual indicator */}
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-300 group-hover:bg-karbon-blue transition-colors rounded-full">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 group-hover:bg-karbon-blue transition-colors rounded-full"></div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Drag to resize
              </div>
            </div>
          </div>
        )}
        
        {/* Right Panel - Notes List */}
        <div 
          className={`flex-1 min-h-96 transition-all duration-200 ${
            isLargeScreen ? 'ml-4' : ''
          }`}
        >
          <NotesList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};
