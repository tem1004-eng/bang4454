import React, { useState } from 'react';
import { Tool } from '../types';
import { PenIcon, EraserIcon, CursorIcon } from './icons';

interface PageToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  penWidth: number;
  setPenWidth: (width: number) => void;
  isEditMode: boolean;
}

const FONT_OPTIONS = [
  { label: "Arial", value: "Arial" },
  { label: "맑은 고딕", value: "Malgun Gothic" },
  { label: "돋움", value: "Dotum" },
  { label: "바탕", value: "Batang" },
  { label: "궁서", value: "Gungsuh" },
  { label: "견고딕", value: "HYGyeongGothic" },
  { label: "Courier New", value: "Courier New" },
  { label: "Times New Roman", value: "Times New Roman" },
];

const PEN_WIDTHS = [3, 5, 7, 10, 20, 50];

function getSelectionHtml() {
    let html = "";
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
        const container = document.createElement("div");
        for (let i = 0, len = sel.rangeCount; i < len; ++i) {
            container.appendChild(sel.getRangeAt(i).cloneContents());
        }
        html = container.innerHTML;
    }
    return html;
}

const handleStyleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
};

const handleFontSizeChange = (size: string) => {
    if (!size) return;
    const selectionHtml = getSelectionHtml();
    // Only proceed if there's actually a selection to prevent replacing the entire field
    if (selectionHtml) {
        const html = `<span style="font-size: ${size}px;">${selectionHtml}</span>`;
        handleStyleCommand('insertHTML', html);
    }
}

const ToolbarButton: React.FC<{onClick: () => void, isActive: boolean, 'aria-label': string, children: React.ReactNode}> = ({ onClick, isActive, 'aria-label': ariaLabel, children }) => {
    const commonClasses = "p-2 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex flex-col items-center justify-center w-16 h-16";
    const activeClasses = "bg-indigo-600 text-white scale-110";
    const inactiveClasses = "bg-white text-gray-700 hover:bg-gray-200";
    return (
        <button onClick={onClick} onMouseDown={e => e.preventDefault()} className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`} aria-label={ariaLabel}>
            {children}
        </button>
    );
};


const PageToolbar: React.FC<PageToolbarProps> = ({
  tool, setTool, penColor, setPenColor, penWidth, setPenWidth, isEditMode
}) => {
  const [isWidthMenuOpen, setIsWidthMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const handleIncrementFontSize = () => {
    const newSize = fontSize + 1;
    setFontSize(newSize);
    handleFontSizeChange(String(newSize));
  };

  const handleDecrementFontSize = () => {
    const newSize = Math.max(8, fontSize - 1); // Minimum font size 8
    setFontSize(newSize);
    handleFontSizeChange(String(newSize));
  };
  
  return (
    <div className="w-full max-w-5xl p-2 mb-2 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center flex-wrap gap-2 md:gap-3 no-print">
      {/* Drawing Tools */}
      <div className="flex items-center gap-2">
          <ToolbarButton onClick={() => setTool('select')} isActive={tool === 'select'} aria-label="Select Tool">
          <CursorIcon />
          <span className="text-xs mt-1">편집</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => setTool('pen')} isActive={tool === 'pen'} aria-label="Pen Tool">
          <PenIcon />
          <span className="text-xs mt-1">펜</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => setTool('eraser')} isActive={tool === 'eraser'} aria-label="Eraser Tool">
          <EraserIcon />
          <span className="text-xs mt-1">지우개</span>
          </ToolbarButton>

          <div className="relative h-16 w-16">
              <label htmlFor="penColor" className="p-2 rounded-lg shadow-md w-full h-full flex items-center justify-center cursor-pointer flex-col bg-white" aria-label="Choose pen color">
                  <div className="w-8 h-8 rounded-full border border-gray-400" style={{ backgroundColor: penColor }}></div>
                  <span className="text-xs mt-1 text-gray-700">펜 색상</span>
              </label>
              <input
                  id="penColor"
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="absolute opacity-0 top-0 left-0 w-full h-full cursor-pointer"
              />
          </div>
          <div className="relative">
              <button
                  onClick={() => setIsWidthMenuOpen(!isWidthMenuOpen)}
                  onMouseDown={e => e.preventDefault()}
                  className="p-2 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex flex-col items-center justify-center w-16 h-16 bg-white text-gray-700 hover:bg-gray-200"
                  aria-haspopup="true"
                  aria-expanded={isWidthMenuOpen}
              >
                  <span className="text-xs">굵기</span>
                  <span className="font-bold">{penWidth}px</span>
              </button>
              {isWidthMenuOpen && (
                  <div className="absolute top-full mt-2 w-28 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                          {PEN_WIDTHS.map(width => (
                              <button
                                  key={width}
                                  onClick={() => {
                                      setPenWidth(width);
                                      setIsWidthMenuOpen(false);
                                  }}
                                  className={`block w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${penWidth === width ? 'font-bold bg-indigo-100 text-indigo-700' : ''}`}
                              >
                                  {width}px
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
      
      <div className="h-12 w-px bg-gray-400 mx-1"></div>

      {/* Text Styling */}
      <fieldset disabled={!isEditMode} className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <select onChange={(e) => handleStyleCommand('fontName', e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 h-16">
          {FONT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
          ))}
          </select>
          <div className="w-20 h-16 p-2 border border-gray-300 rounded-md shadow-sm bg-white flex items-center justify-between text-center">
            <span className="text-lg font-semibold flex-grow">{fontSize}</span>
            <div className="flex flex-col h-full justify-between -my-1">
                <button 
                    onClick={handleIncrementFontSize} 
                    onMouseDown={e => e.preventDefault()} 
                    className="px-1 text-gray-600 hover:bg-gray-200 rounded"
                    aria-label="Increase font size"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                </button>
                <button 
                    onClick={handleDecrementFontSize} 
                    onMouseDown={e => e.preventDefault()}
                    className="px-1 text-gray-600 hover:bg-gray-200 rounded"
                    aria-label="Decrease font size"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
            </div>
          </div>
          <button onMouseDown={e => e.preventDefault()} onClick={() => handleStyleCommand('bold')} className="w-16 h-16 p-2 border rounded-md shadow-sm flex flex-col items-center justify-center bg-white border-gray-300 hover:bg-gray-200">
          <b className="text-xl">B</b>
          <span className="text-xs">굵게</span>
          </button>
          <div className="relative w-16 h-16">
          <label htmlFor="textColor" className="w-full h-full rounded-md shadow-sm border border-gray-300 flex flex-col justify-center items-center pb-1 cursor-pointer bg-white">
              <div className="w-8 h-8 rounded-full border border-gray-400" style={{ backgroundColor: 'black' }} id="textColorSwatch"></div>
              <span className="text-xs text-gray-700 mt-1">글자색</span>
          </label>
          <input id="textColor" type="color" defaultValue="#000000" onChange={(e) => {
              handleStyleCommand('foreColor', e.target.value);
              const swatch = document.getElementById('textColorSwatch');
              if(swatch) swatch.style.backgroundColor = e.target.value;
          }} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"/>
          </div>
      </fieldset>
    </div>
  );
};

export default PageToolbar;