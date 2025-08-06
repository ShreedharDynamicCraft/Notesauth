import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({ content, onChange, placeholder, className }: RichTextEditorProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable underline from StarterKit to avoid conflicts
        underline: false,
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none`,
        'data-placeholder': placeholder || 'Start typing...',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const colors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F97316', 
    '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  const highlightColors = [
    '#FEF3C7', '#FECACA', '#FED7D7', '#E0E7FF', '#E0F2FE', 
    '#D1FAE5', '#F3E8FF', '#FCE7F3', '#FFF7ED', '#F1F5F9'
  ];

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        editor?.chain().focus().setImage({ src }).run();
        toast.success('Image added successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      toast.success('Enlarged editor mode', {
        icon: '⛶',
        duration: 2000,
      });
    } else {
      toast.success('Normal editor mode', {
        icon: '🗗',
        duration: 2000,
      });
    }
  };

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        toast.success('Normal editor mode', {
          icon: '🗗',
          duration: 2000,
        });
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <div 
      className={`${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-white flex flex-col p-4' 
          : `border border-gray-200 rounded-lg overflow-hidden flex flex-col ${className}`
      }`}
    >
      {/* Toolbar */}
      <div className={`bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 flex-shrink-0 ${
        isFullscreen ? 'shadow-sm' : ''
      }`}>
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Bold"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a1 1 0 011-1h3a3 3 0 010 6H6v2h4a3 3 0 010 6H6a1 1 0 01-1-1V4zm2 1v4h2a1 1 0 000-2H7zm0 6v4h3a1 1 0 000-2H7z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Italic"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.5 3a1 1 0 00-1 1v1H6a1 1 0 000 2h1.5v6H6a1 1 0 100 2h1.5v1a1 1 0 002 0v-1H11a1 1 0 100-2H9.5V7H11a1 1 0 100-2H9.5V4a1 1 0 00-1-1H8.5z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Underline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 17h12v1H4v-1zM6 2v7c0 2.21 1.79 4 4 4s4-1.79 4-4V2h-2v7c0 1.1-.9 2-2 2s-2-.9-2-2V2H6z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Strikethrough"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10h8v1H6v-1zM4.5 7C4.5 5.067 6.067 3.5 8 3.5h4c1.933 0 3.5 1.567 3.5 3.5v1h-2V7c0-.827-.673-1.5-1.5-1.5H8c-.827 0-1.5.673-1.5 1.5v.5h-2V7zm0 6v.5c0 1.933 1.567 3.5 3.5 3.5h4c1.933 0 3.5-1.567 3.5-3.5V13h-2v.5c0 .827-.673 1.5-1.5 1.5H8c-.827 0-1.5-.673-1.5-1.5V13h-2z" />
            </svg>
          </button>
        </div>

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
            title="Text Color"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">A</span>
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-10">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            className="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Highlight"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-10">
              {highlightColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setHighlight({ color }).run();
                    setShowHighlightPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setShowHighlightPicker(false);
                }}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform bg-white flex items-center justify-center"
                title="Remove highlight"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded text-sm font-semibold hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Heading 1"
          >
            H1
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded text-sm font-semibold hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Heading 2"
          >
            H2
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors ${
              editor.isActive('paragraph') ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Paragraph"
          >
            P
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Clear Formatting */}
        <div className="border-l border-gray-300 pl-2 ml-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
            title="Clear Formatting"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Image Upload */}
        <div className="border-l border-gray-300 pl-2 ml-2">
          <button
            type="button"
            onClick={handleImageUpload}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
            title="Insert Image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Fullscreen Toggle */}
        <div className="border-l border-gray-300 pl-2 ml-2">
          <button
            type="button"
            onClick={handleFullscreenToggle}
            className={`p-2 rounded hover:bg-gray-200 transition-all duration-200 ${
              isFullscreen 
                ? 'bg-blue-100 text-blue-600 shadow-md ring-2 ring-blue-200' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (Press Esc)' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 010 2H5.414l2.293 2.293a1 1 0 11-1.414 1.414L4 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h3a1 1 0 011 1v4a1 1 0 01-2 0V5.414l-2.293 2.293a1 1 0 11-1.414-1.414L12.586 4H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 14H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L14.586 12H13a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 5.414V8a1 1 0 01-2 0V4zm11 0a1 1 0 10-2 0v4a1 1 0 002 0V6.414l2.293 2.293a1 1 0 001.414-1.414L13.414 5H16a1 1 0 100-2h-4zm-8 8a1 1 0 00-2 0v4a1 1 0 001 1h4a1 1 0 000-2H6.414l2.293-2.293a1 1 0 00-1.414-1.414L5 13.414V12zm10 0a1 1 0 00-1 1v1.586l-2.293-2.293a1 1 0 00-1.414 1.414L13.586 14H12a1 1 0 000 2h4a1 1 0 001-1v-4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`bg-white flex-1 overflow-hidden ${
        isFullscreen ? '' : ''
      }`}>
        <div className="rich-text-content h-full overflow-y-scroll border-0 p-0">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
