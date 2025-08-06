import { useState, useEffect, useRef } from 'react';
import { UserProfile } from './UserProfile';
import { NoteForm } from './NoteForm';
import { NotesList } from './NotesList';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const saved = localStorage.getItem('dashboardPanelWidth');
    return saved ? parseInt(saved, 10) : 440;
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
    setLeftPanelWidth(440);
    localStorage.setItem('dashboardPanelWidth', '400');
    toast.success('Layout reset to default', {
      icon: '↩️',
      duration: 3000,
    });
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme();
    
    if (newTheme === 'dark') {
      toast.success('Switched to dark mode', {
        icon: '🌙',
        duration: 3000,
      });
    } else {
      toast.success('Switched to light mode', {
        icon: '☀️',
        duration: 3000,
      });
    }
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
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-karbon-light'
    }`}>
      <div className="gradient-bg shadow-lg border-b border-karbon-slate">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h1 className="text-white text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Notes Dashboard
                </h1>
              </div>
              {isLargeScreen && (
                <button
                  onClick={resetPanelWidth}
                  className="text-white/90 hover:text-white text-sm bg-gradient-to-r from-emerald-500/30 to-teal-500/30 hover:from-emerald-400/40 hover:to-teal-400/40 border border-white/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 shadow-sm backdrop-blur-sm"
                  title="Reset panel size"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Layout
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">

              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-lg transition-all backdrop-blur-sm border border-white/20 ${
                  showSearch 
                    ? 'bg-gradient-to-r from-cyan-500/40 to-blue-500/40 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-gradient-to-r from-white/20 to-white/10 hover:from-cyan-400/30 hover:to-blue-400/30 text-white/90 hover:text-white'
                }`}
                title="Search notes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              


              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg bg-gradient-to-r from-orange-500/30 to-yellow-500/30 hover:from-orange-400/40 hover:to-yellow-400/40 border border-white/20 text-white/90 hover:text-white transition-all backdrop-blur-sm shadow-sm"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              
              <UserProfile />
            </div>
          </div>
          
          {showSearch && (
            <div className="relative mt-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-white/20 to-cyan-500/20 border border-cyan-300/30 rounded-xl text-white placeholder-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-300/50 focus:from-white/25 focus:to-cyan-400/25 transition-all shadow-lg backdrop-blur-sm"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-cyan-300 hover:text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className={`max-w-7xl mx-auto px-8 py-10 ${
          isLargeScreen ? 'flex items-start gap-0 relative' : 'space-y-10'
        }`}
      >
        <div 
          className={`${isLargeScreen ? 'lg:sticky lg:top-10 transition-all duration-200 max-h-[calc(100vh-80px)]' : ''}`}
          style={isLargeScreen ? { 
            width: `${leftPanelWidth}px`,
            minWidth: '300px'
          } : {}}
        >
          <NoteForm onNoteCreated={handleNoteCreated} />
        </div>
        
        {isLargeScreen && (
          <div className="relative">
            <div
              className={`w-2 h-full cursor-col-resize hover:bg-karbon-blue hover:bg-opacity-20 transition-colors relative group ${
                isResizing ? 'bg-karbon-blue bg-opacity-30' : ''
              }`}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-300 group-hover:bg-karbon-blue transition-colors rounded-full">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 group-hover:bg-karbon-blue transition-colors rounded-full"></div>
              </div>
              
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Drag to resize
              </div>
            </div>
          </div>
        )}
        
        <div 
          className={`flex-1 min-h-96 transition-all duration-200 ${
            isLargeScreen ? 'ml-4' : ''
          }`}
        >
          <NotesList refreshTrigger={refreshTrigger} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
};
