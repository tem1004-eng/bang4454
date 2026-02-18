import React, { useState } from 'react';
import { SaveIcon, ListIcon, PrintIcon, EditCompleteIcon, LoadIcon, NewFileIcon, MonitorIcon } from './icons';

interface ToolbarProps {
  onNewScript: () => void;
  onSave: () => void;
  onExport: () => void;
  onLoad: () => void;
  onOpenList: () => void;
  onPrint: (mode: 'current' | 'all') => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onFinalView: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onNewScript, onSave, onExport, onLoad, onOpenList, onPrint, isEditMode, onToggleEditMode, onFinalView
}) => {
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const commonButtonClasses = "p-2 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex flex-col items-center justify-center w-20 h-16";
  const buttonClasses = "bg-white text-gray-700 hover:bg-gray-200";
  const editModeButtonClasses = isEditMode ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white';
  const finalViewButtonClasses = "bg-red-600 hover:bg-red-700 text-white";

  return (
    <div className="w-full max-w-5xl p-2 mb-4 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center flex-wrap gap-2 md:gap-3 no-print">
      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={onNewScript} className={`${commonButtonClasses} ${buttonClasses}`} aria-label="New Script">
          <NewFileIcon />
          <span className="text-xs mt-1 font-semibold">새 작업</span>
        </button>
        <button onClick={onToggleEditMode} className={`${commonButtonClasses} ${editModeButtonClasses}`} aria-label={isEditMode ? 'Finish Editing' : 'Start Editing'}>
          <EditCompleteIcon />
          <span className="text-xs mt-1 font-semibold">{isEditMode ? '편집 완료' : '수정하기'}</span>
        </button>
        
        <div className="relative">
            <button onClick={() => setIsSaveMenuOpen(!isSaveMenuOpen)} className={`${commonButtonClasses} ${buttonClasses}`} aria-label="Save or Export">
                <SaveIcon />
                <span className="text-xs mt-1">저장/내보내기</span>
            </button>
            {isSaveMenuOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <button onClick={() => { onSave(); setIsSaveMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">목록에 저장</button>
                    <button onClick={() => { onExport(); setIsSaveMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">파일로 내보내기</button>
                </div>
            )}
        </div>
        
        <button onClick={onLoad} className={`${commonButtonClasses} ${buttonClasses}`} aria-label="Load Data">
            <LoadIcon />
            <span className="text-xs mt-1">불러오기</span>
        </button>
        <button onClick={onOpenList} className={`${commonButtonClasses} ${buttonClasses}`} aria-label="Open script list">
            <ListIcon />
            <span className="text-xs mt-1">목록</span>
        </button>

        <div className="relative">
            <button onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)} className={`${commonButtonClasses} ${buttonClasses}`} aria-label="Print">
                <PrintIcon />
                <span className="text-xs mt-1">인쇄</span>
            </button>
            {isPrintMenuOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <button onClick={() => { onPrint('current'); setIsPrintMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">현재 페이지 인쇄</button>
                    <button onClick={() => { onPrint('all'); setIsPrintMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">전체 페이지 인쇄</button>
                </div>
            )}
        </div>
        
         <button onClick={onFinalView} className={`${commonButtonClasses} ${finalViewButtonClasses}`} aria-label="Final View">
            <MonitorIcon />
            <span className="text-xs mt-1 font-semibold">최종보기</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;