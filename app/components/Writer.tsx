'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

export default function Writer() {
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const centerCursor = () => {
    if (!editorRef.current) return;
    
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    const targetY = window.scrollY + rect.top - (viewportHeight / 2) + 60;
    
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth'
    });
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    let value = e.currentTarget.innerText || '';
    
    // Strip punctuation and replace with line break effect
    value = value.replace(/[.,!?;:'"()\[\]{}]/g, '');
    
    setText(value);

    // Debounced auto-save
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      saveToDB(value);
    }, 1200);

    setTimeout(centerCursor, 20);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const punctuationKeys = ['.', ',', '!', '?', ';', ':', "'", '"'];
    
    if (e.key === 'Enter' || e.key === 'Tab' || punctuationKeys.includes(e.key)) {
      e.preventDefault();
      
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        
        const br = document.createElement('br');
        range.insertNode(br);
        
        // Move cursor after br
        range.setStartAfter(br);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      
      setTimeout(centerCursor, 10);
    }
  };

  const saveToDB = async (content: string) => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
    } catch (err) {
      console.error('Auto-save failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Load last writing on mount (optional future)
  useEffect(() => {
    // Placeholder for loading previous session
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      {/* Minimal floating status */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2 text-sm text-gray-400">
        {isSaving ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>saving</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>auto</span>
          </div>
        )}
      </div>

      {/* The editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="writer min-h-[300vh] focus:outline-none select-text"
        spellCheck="true"
        data-gramm="false"
        data-gramm_editor="false"
      />
    </div>
  );
}
