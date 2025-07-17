import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link, 
  Type,
  Eraser
} from 'lucide-react';

const TipTapEditor = ({ value, onChange, placeholder, className = '' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toolbarButtons = [
    {
      title: 'Heading 1',
      icon: <Type className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 })
    },
    {
      title: 'Heading 2', 
      icon: <Type className="w-3 h-3" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 })
    },
    {
      title: 'Heading 3',
      icon: <Type className="w-2 h-2" />,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 })
    },
    { type: 'separator' },
    {
      title: 'Bold',
      icon: <Bold className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold')
    },
    {
      title: 'Italic',
      icon: <Italic className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic')
    },
    {
      title: 'Strikethrough',
      icon: <Strikethrough className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike')
    },
    { type: 'separator' },
    {
      title: 'Bullet List',
      icon: <List className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList')
    },
    {
      title: 'Numbered List',
      icon: <ListOrdered className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList')
    },
    { type: 'separator' },
    {
      title: 'Clear Formatting',
      icon: <Eraser className="w-4 h-4" />,
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
      isActive: () => false
    }
  ];

  return (
    <div className={`tiptap-editor ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 border border-gray-300 rounded-t-lg border-b-0">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return (
              <div 
                key={index} 
                className="w-px h-6 bg-gray-300 mx-1"
              />
            );
          }
          
          const isActive = button.isActive && button.isActive();
          
          return (
            <button
              key={index}
              type="button"
              title={button.title}
              onClick={button.action}
              className={`p-2 rounded transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {button.icon}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div className="border border-gray-300 rounded-b-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <EditorContent 
          editor={editor} 
          className="min-h-[300px]"
          placeholder={placeholder}
        />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 300px;
          padding: 1rem;
          line-height: 1.6;
          font-size: 14px;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "${placeholder}";
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          line-height: 1.2;
        }
        
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
          line-height: 1.3;
        }
        
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
          line-height: 1.4;
        }
        
        .ProseMirror ul, .ProseMirror ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .ProseMirror li {
          margin: 0.5em 0;
        }
        
        .ProseMirror strong {
          font-weight: bold;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        .ProseMirror s {
          text-decoration: line-through;
        }
        
        .ProseMirror p {
          margin: 1em 0;
        }
        
        .ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default TipTapEditor;
