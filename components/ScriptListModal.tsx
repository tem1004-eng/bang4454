import React, { useState, useEffect } from 'react';
import { ScriptManifestItem } from '../types';

const SCRIPT_MANIFEST_KEY = 'radioScript_manifest';

interface ScriptListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadScript: (date: string) => void;
  onDeleteScript: (date: string) => void;
}

const ScriptListModal: React.FC<ScriptListModalProps> = ({ isOpen, onClose, onLoadScript, onDeleteScript }) => {
  const [scripts, setScripts] = useState<ScriptManifestItem[]>([]);

  const fetchScripts = () => {
    const manifestStr = localStorage.getItem(SCRIPT_MANIFEST_KEY);
    const manifest: ScriptManifestItem[] = manifestStr ? JSON.parse(manifestStr) : [];
    setScripts(manifest);
  };

  useEffect(() => {
    if (isOpen) {
      fetchScripts();
    }
  }, [isOpen]);

  const handleDelete = (date: string) => {
    if (window.confirm(`${date} 날짜의 스크립트를 삭제하시겠습니까?`)) {
        onDeleteScript(date);
        fetchScripts(); // Refresh the list after deletion
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">저장된 스크립트 목록</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
        </header>
        <main className="p-4 overflow-y-auto">
          {scripts.length > 0 ? (
            <ul className="space-y-3">
              {scripts.map((script) => (
                <li key={script.date} className="p-4 bg-gray-50 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <p className="font-bold text-lg text-indigo-700">{script.date}</p>
                    <p className="text-gray-600">{script.topic || '주제 없음'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                        onClick={() => onLoadScript(script.date)}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >불러오기</button>
                    <button 
                        onClick={() => handleDelete(script.date)}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                    >삭제</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">저장된 스크립트가 없습니다.</p>
          )}
        </main>
        <footer className="p-4 border-t text-right">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
            >닫기</button>
        </footer>
      </div>
    </div>
  );
};

export default ScriptListModal;
