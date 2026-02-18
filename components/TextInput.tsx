import React, { useRef, useEffect, useState } from 'react';
import { Field } from '../types';

interface TextInputProps {
  field: Field;
  onChange: (fieldId: string, value: string) => void;
  onUpdate: (fieldId: string, newProps: Partial<Field>) => void;
  isEditMode: boolean;
  index: number;
  onAutoResize: (fieldId: string, pixelHeight: number) => void;
  isPrintMode?: boolean;
}

const LINE_HEIGHT_RATIO = 1.5;

const TextInput: React.FC<TextInputProps> = ({ field, onChange, onUpdate, isEditMode, index, onAutoResize, isPrintMode = false }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  
  const dragInfo = useRef<{
    type: 'top' | 'bottom';
    initialY: number;
    initialTop: number;
    initialHeight: number;
  } | null>(null);

  // Calculate number of lines based on height and font-size
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      const fontSize = field.fontSize || 18;
      const lineHeight = fontSize * LINE_HEIGHT_RATIO;
      // Estimate line count based on total content height
      const count = Math.max(1, Math.round(height / lineHeight));
      setLineCount(count);
    }
  }, [field.value, field.fontSize, field.height]);

  // Synchronize state to DOM without losing cursor position
  useEffect(() => {
    if (contentRef.current && field.value !== contentRef.current.innerHTML) {
      contentRef.current.innerHTML = field.value;
    }
  }, [field.value]);
  
  // Auto-resize logic
  useEffect(() => {
    if (isEditMode && contentRef.current && wrapperRef.current) {
        const requiredHeight = contentRef.current.scrollHeight + 10;
        const currentHeight = wrapperRef.current.offsetHeight;

        if (Math.abs(requiredHeight - currentHeight) > 2) {
             onAutoResize(field.id, requiredHeight);
        }
    }
  }, [field.value, isEditMode, onAutoResize, field.id, field.height]);


  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(field.id, e.currentTarget.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
  };

  const handleMouseDown = (type: 'top' | 'bottom') => (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || !wrapperRef.current) return;
    e.preventDefault();

    dragInfo.current = {
      type,
      initialY: e.clientY,
      initialTop: wrapperRef.current.offsetTop,
      initialHeight: wrapperRef.current.offsetHeight,
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current || !wrapperRef.current) return;

    const deltaY = e.clientY - dragInfo.current.initialY;
    let newTop = dragInfo.current.initialTop;
    let newHeight = dragInfo.current.initialHeight;

    if (dragInfo.current.type === 'top') {
      newTop += deltaY;
      newHeight -= deltaY;
    } else { // bottom
      newHeight += deltaY;
    }

    if (newHeight < 40) {
      if (dragInfo.current.type === 'top') {
        newTop = newTop + (newHeight - 40);
      }
      newHeight = 40;
    }

    wrapperRef.current.style.top = `${newTop}px`;
    wrapperRef.current.style.height = `${newHeight}px`;
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

    if (!dragInfo.current || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const parent = wrapper.parentElement?.parentElement;
    if (!parent) return;

    const newPixelTop = wrapper.offsetTop;
    const newPixelHeight = wrapper.offsetHeight;
    const parentPixelHeight = parent.clientHeight;

    const newPercentageHeight = (newPixelHeight / parentPixelHeight) * 100;

    const newProps: Partial<Field> = {
      height: `${newPercentageHeight.toFixed(2)}%`,
    };

    if (dragInfo.current.type === 'top') {
      const newPercentageTop = (newPixelTop / parentPixelHeight) * 100;
      newProps.top = `${newPercentageTop.toFixed(2)}%`;
    }

    onUpdate(field.id, newProps);
    dragInfo.current = null;
  };

  const toggleCheck = (lineIndex: number) => {
    const currentChecked = field.checkedLines || [];
    let newChecked;
    if (currentChecked.includes(lineIndex)) {
      newChecked = currentChecked.filter(i => i !== lineIndex);
    } else {
      newChecked = [...currentChecked, lineIndex];
    }
    onUpdate(field.id, { checkedLines: newChecked });
  };

  const editModeClasses = "bg-gray-100 border border-gray-300 shadow-sm rounded-md focus-within:bg-gray-200 focus-within:ring-2 focus-within:ring-blue-500";
  const navModeClasses = "bg-transparent border border-gray-400 shadow-none cursor-default"; 
  const handleClasses = "absolute left-0 w-full h-3 cursor-ns-resize z-10 flex items-center justify-center";
  const handleIconClasses = "w-8 h-1 bg-gray-400 rounded-full group-hover:bg-blue-500 transition-colors opacity-50 group-hover:opacity-100";

  const lineHeight = (field.fontSize || 18) * LINE_HEIGHT_RATIO;

  return (
    <div
      ref={wrapperRef}
      className={`absolute group print:bg-transparent print:p-0 print:shadow-none print:!h-auto print:!overflow-visible ${isPrintMode ? 'overflow-visible' : 'overflow-hidden'} ${isEditMode ? editModeClasses : navModeClasses}`}
      style={{
        top: field.top,
        left: field.left,
        width: field.width,
        height: isPrintMode ? 'auto' : field.height,
        minHeight: isPrintMode ? field.height : undefined,
        transition: dragInfo.current ? 'none' : 'all 0.2s ease-in-out',
        zIndex: isPrintMode ? 10 : 'auto'
      }}
    >
      {isEditMode && (
        <>
          <div className={`${handleClasses} -top-1.5`} onMouseDown={handleMouseDown('top')}>
            <div className={handleIconClasses} />
          </div>
          <div className={`${handleClasses} -bottom-1.5`} onMouseDown={handleMouseDown('bottom')}>
            <div className={handleIconClasses} />
          </div>
        </>
      )}

      {/* Checkbox Column */}
      <div 
        className="absolute right-1 top-2 bottom-2 w-8 flex flex-col items-center no-print"
        style={{ pointerEvents: 'auto' }}
      >
        {Array.from({ length: lineCount }).map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              toggleCheck(i);
            }}
            className="flex items-center justify-center border-2 border-gray-400 rounded bg-white hover:bg-gray-100 transition-colors mb-0.5"
            style={{ 
              width: '20px', 
              height: '20px', 
              marginTop: i === 0 ? '4px' : `${lineHeight - 20 - 2}px`, // Align with line height
              borderColor: (field.checkedLines || []).includes(i) ? '#3b82f6' : '#9ca3af'
            }}
          >
            {(field.checkedLines || []).includes(i) && (
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
      
      {/* Print Checkboxes (Visible only on print) */}
      <div className="hidden print:block absolute right-1 top-2 bottom-2 w-8 flex flex-col items-center">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center border border-black rounded bg-white mb-0.5"
            style={{ 
              width: '18px', 
              height: '18px', 
              marginTop: i === 0 ? '4px' : `${lineHeight - 18 - 2}px`,
            }}
          >
            {(field.checkedLines || []).includes(i) && (
              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <div
        ref={contentRef}
        contentEditable={isEditMode}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={field.placeholder}
        className="w-full p-2 pr-10 text-base outline-none"
        style={{
          fontFamily: field.fontFamily,
          fontSize: `${field.fontSize}px`,
          fontWeight: field.fontWeight,
          color: field.color,
          minHeight: '40px',
          lineHeight: LINE_HEIGHT_RATIO,
        }}
      />
      <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-[8px] rounded-sm px-1 py-0.5 pointer-events-none z-10 print:hidden opacity-30">
        {index}
      </div>
    </div>
  );
};

export default TextInput;