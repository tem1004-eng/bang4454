import React, { useState, useCallback, useRef, useEffect } from 'react';
import PageViewer from './components/PageViewer';
import Pagination from './components/Pagination';
import Toolbar from './components/Toolbar';
import { INITIAL_PAGES } from './constants';
import { Page, Path, Tool, SavedScriptData, ScriptManifestItem, Field } from './types';
import ScriptListModal from './components/ScriptListModal';
import { CloseIcon } from './components/icons';

const SCRIPT_MANIFEST_KEY = 'radioScript_manifest';
const getScriptKey = (date: string) => `radioScript_data_${date}`;
const AUTOSAVE_KEY = 'radioScript_autosave';

const normalizePageStyles = (pagesToUpdate: Page[]): Page[] => {
  return pagesToUpdate.map(page => ({
      ...page,
      fields: page.fields.map(field => ({
          ...field,
          fontFamily: "Arial",
          fontWeight: 'normal' as 'normal',
      }))
  }));
};

function App() {
  const [pages, setPages] = useState<Page[]>(INITIAL_PAGES);
  const [drawings, setDrawings] = useState<Record<number, Path[]>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [tool, setTool] = useState<Tool>('select');
  const [penColor, setPenColor] = useState('#ff0000');
  const [penWidth, setPenWidth] = useState(5);
  const [printMode, setPrintMode] = useState<'current' | 'all' | null>(null);
  
  const [broadcastDate, setBroadcastDate] = useState(new Date().toISOString().split('T')[0]);
  const [broadcastTopic, setBroadcastTopic] = useState('');
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);

  // Final View State
  const [isFinalViewMode, setIsFinalViewMode] = useState(false);
  const [preFinalViewEditMode, setPreFinalViewEditMode] = useState(true);


  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const autoSaveTimeoutRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  // Check for autosaved data on initial load and restore it automatically
  useEffect(() => {
    try {
      const savedDataStr = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataStr) {
        const savedData: SavedScriptData = JSON.parse(savedDataStr);
        if (savedData.pages && Array.isArray(savedData.pages)) {
          setBroadcastDate(savedData.broadcastDate || new Date().toISOString().split('T')[0]);
          setBroadcastTopic(savedData.broadcastTopic || '');
          setPages(normalizePageStyles(savedData.pages));
          setDrawings(savedData.drawings || {});
          setCurrentPageIndex(0);
        }
      }
    } catch (e) {
      console.error("Failed to load autosaved data", e);
      localStorage.removeItem(AUTOSAVE_KEY);
    }
    setIsInitialLoad(false);
  }, []);

  // Autosave changes
  useEffect(() => {
    if (isInitialLoad) return;

    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    
    autoSaveTimeoutRef.current = window.setTimeout(() => {
      const dataToSave: SavedScriptData = { broadcastDate, broadcastTopic, pages, drawings };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }, 1000);
  }, [broadcastDate, broadcastTopic, pages, drawings, isInitialLoad]);


  useEffect(() => {
    // This command helps ensure that execCommand generates <span> tags with style attributes
    // for styling, which is more modern than deprecated tags like <font>.
    document.execCommand('styleWithCSS', false, 'true');
  }, []);
  
  const goToNextPage = useCallback(() => {
    setCurrentPageIndex(prev => Math.min(prev + 1, pages.length - 1));
  }, [pages.length]);

  const goToPrevPage = useCallback(() => {
    setCurrentPageIndex(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode) {
        if (e.key === 'ArrowRight') {
          goToNextPage();
        } else if (e.key === 'ArrowLeft') {
          goToPrevPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditMode, goToNextPage, goToPrevPage]);


  const handleTextChange = useCallback((pageId: number, fieldId: string, value: string) => {
    setPages(prevPages =>
      prevPages.map(page => {
        if (page.id === pageId) {
          const updatedFields = page.fields.map(field =>
            field.id === fieldId ? { ...field, value } : field
          );
          return { ...page, fields: updatedFields };
        }
        return page;
      })
    );
  }, []);

  const handleFieldUpdate = useCallback((pageId: number, fieldId: string, newProps: Partial<Field>) => {
    setPages(prevPages =>
        prevPages.map(page => {
            if (page.id === pageId) {
                const updatedFields = page.fields.map(field =>
                    field.id === fieldId ? { ...field, ...newProps } : field
                );
                return { ...page, fields: updatedFields };
            }
            return page;
        })
    );
  }, []);

  const handleLayoutUpdate = useCallback((pageId: number, fieldId: string, newHeightPercentage: number) => {
    setPages(prevPages => {
        const pageIndex = prevPages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return prevPages;

        // Create a deep enough copy to modify
        const newPages = JSON.parse(JSON.stringify(prevPages));
        const pageToUpdate = newPages[pageIndex];
        const newFields = pageToUpdate.fields;

        const fieldIndex = newFields.findIndex((f: Field) => f.id === fieldId);
        if (fieldIndex === -1) return prevPages;
        
        const targetField = newFields[fieldIndex];
        const oldHeightPercentage = parseFloat(targetField.height);

        if (isNaN(oldHeightPercentage)) {
            console.warn(`Field ${fieldId} has invalid height: ${targetField.height}`);
            return prevPages;
        }

        const deltaHeight = newHeightPercentage - oldHeightPercentage;

        if (Math.abs(deltaHeight) < 0.1) {
            return prevPages;
        }

        // 1. Update the height of the current field
        targetField.height = `${newHeightPercentage.toFixed(2)}%`;

        // 2. Update the 'top' of all subsequent fields
        for (let i = fieldIndex + 1; i < newFields.length; i++) {
            const currentField = newFields[i];
            const oldTopPercentage = parseFloat(currentField.top);
            
            if (isNaN(oldTopPercentage)) {
                console.warn(`Field ${currentField.id} has invalid top: ${currentField.top}`);
                continue;
            }

            const newTopPercentage = oldTopPercentage + deltaHeight;
            currentField.top = `${newTopPercentage.toFixed(2)}%`;
        }

        return newPages;
    });
}, []);

  const handlePathsChange = useCallback((pageId: number, newPaths: Path[]) => {
    setDrawings(prev => ({...prev, [pageId]: newPaths}));
  }, []);

  const handleSave = () => {
    if (!broadcastDate) {
      alert('방송일을 선택해주세요.');
      return;
    }
    const scriptKey = getScriptKey(broadcastDate);
    const manifestStr = localStorage.getItem(SCRIPT_MANIFEST_KEY);
    let manifest: ScriptManifestItem[] = manifestStr ? JSON.parse(manifestStr) : [];
  
    if (manifest.some(item => item.date === broadcastDate)) {
      if (!window.confirm('같은 날짜에 저장된 스크립트가 있습니다. 덮어쓰시겠습니까?')) {
        return;
      }
      manifest = manifest.filter(item => item.date !== broadcastDate);
    }
  
    const dataToSave: SavedScriptData = { broadcastDate, broadcastTopic, pages, drawings };
    localStorage.setItem(scriptKey, JSON.stringify(dataToSave));
    
    const newManifest = [...manifest, { date: broadcastDate, topic: broadcastTopic }];
    newManifest.sort((a, b) => b.date.localeCompare(a.date));
    localStorage.setItem(SCRIPT_MANIFEST_KEY, JSON.stringify(newManifest));
    
    alert('데이터가 저장되었습니다.');
  };

  const handleExportData = () => {
    try {
        const dataToExport: SavedScriptData = { broadcastDate, broadcastTopic, pages, drawings };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `${broadcastDate || 'script'}_${broadcastTopic || 'broadcast'}.json`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export data:", error);
        alert("데이터를 내보내는 중 오류가 발생했습니다.");
    }
  };
  
  const handleLoadFromFile = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File content is not a string.');
        }
        const data: SavedScriptData = JSON.parse(text);

        // Basic validation
        if (data.broadcastDate && data.pages && Array.isArray(data.pages)) {
          setBroadcastDate(data.broadcastDate);
          setBroadcastTopic(data.broadcastTopic || '');
          setPages(normalizePageStyles(data.pages));
          setDrawings(data.drawings || {});
          setCurrentPageIndex(0);
          alert('데이터를 성공적으로 불러왔습니다.');
        } else {
          throw new Error('Invalid file format.');
        }
      } catch (error) {
        console.error('Failed to load script from file:', error);
        alert('파일을 불러오는데 실패했습니다. 파일 형식이 올바른지 확인해주세요.');
      } finally {
        // Reset file input value to allow loading the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
        alert('파일을 읽는 중 오류가 발생했습니다.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
    };
    reader.readAsText(file);
  };

  const handleLoadScript = (date: string) => {
    const scriptKey = getScriptKey(date);
    const dataStr = localStorage.getItem(scriptKey);
    if (dataStr) {
      const data: SavedScriptData = JSON.parse(dataStr);
      setBroadcastDate(data.broadcastDate);
      setBroadcastTopic(data.broadcastTopic);
      setPages(normalizePageStyles(data.pages));
      setDrawings(data.drawings || {});
      setIsListModalOpen(false);
      setCurrentPageIndex(0);
      alert(`${date} 스크립트를 불러왔습니다.`);
    } else {
      alert('데이터를 불러오는데 실패했습니다.');
    }
  };

  const handleDeleteScript = (date: string) => {
      const scriptKey = getScriptKey(date);
      localStorage.removeItem(scriptKey);

      const manifestStr = localStorage.getItem(SCRIPT_MANIFEST_KEY);
      let manifest: ScriptManifestItem[] = manifestStr ? JSON.parse(manifestStr) : [];
      const newManifest = manifest.filter(item => item.date !== date);
      localStorage.setItem(SCRIPT_MANIFEST_KEY, JSON.stringify(newManifest));
  };

  const handlePrint = (mode: 'current' | 'all') => {
    setPrintMode(mode);
  };

   const handleNewScript = () => {
    if (window.confirm('현재 텍스트 내용은 유지하고 날짜와 주제를 새로 작성하시겠습니까?\n(주의: 펜으로 기록한 내용은 초기화됩니다.)')) {
        setBroadcastDate(new Date().toISOString().split('T')[0]);
        setBroadcastTopic('');
        setDrawings({}); // Clear drawings for fresh start
        setCurrentPageIndex(0);
        localStorage.removeItem(AUTOSAVE_KEY);
        alert('새 작업 준비가 완료되었습니다. 새로운 날짜와 주제를 입력해주세요.');
    }
  };

  useEffect(() => {
    if (printMode) {
      window.print();
    }
  }, [printMode]);

  useEffect(() => {
    const afterPrint = () => {
        setPrintMode(null);
    }
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, []);

  const handleEnterFinalView = () => {
    setPreFinalViewEditMode(isEditMode);
    setIsEditMode(false); // Disable edit mode to allow swiping
    setTool('select');    // Ensure tool is select for swiping
    setIsFinalViewMode(true);
  };

  const handleExitFinalView = () => {
    setIsFinalViewMode(false);
    setIsEditMode(preFinalViewEditMode); // Restore previous edit mode state
  };

  const currentPageData = pages[currentPageIndex];
  const currentPageDrawings = drawings[currentPageData?.id] || [];

  return (
    <>
      {isFinalViewMode ? (
          <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen overflow-hidden no-print">
              <div className="absolute top-4 right-4 z-[100]">
                  <button
                      onClick={handleExitFinalView}
                      className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all shadow-lg"
                      aria-label="Exit Final View"
                  >
                      <CloseIcon />
                  </button>
              </div>
              <div className="flex-grow flex items-center justify-center w-full h-full overflow-hidden p-0 bg-white">
                 {currentPageData && (
                      <PageViewer 
                          page={currentPageData} 
                          onTextChange={handleTextChange} 
                          onFieldUpdate={handleFieldUpdate}
                          onLayoutUpdate={handleLayoutUpdate}
                          paths={currentPageDrawings}
                          onPathsChange={(newPaths) => handlePathsChange(currentPageData.id, newPaths)}
                          tool={tool}
                          setTool={setTool}
                          penColor={penColor}
                          setPenColor={setPenColor}
                          penWidth={penWidth}
                          setPenWidth={setPenWidth}
                          isCurrentPage={true}
                          isEditMode={false} // Forced read-only
                          onPrev={goToPrevPage}
                          onNext={goToNextPage}
                          showToolbar={false} // Hide internal toolbar
                          isFullScreen={true}
                      />
                  )}
              </div>
          </div>
      ) : (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="mb-4 text-center no-print">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                방송은 나의 기쁨
            </h1>
            </header>

            <Toolbar
            onNewScript={handleNewScript}
            onSave={handleSave}
            onExport={handleExportData}
            onLoad={handleLoadFromFile}
            onOpenList={() => setIsListModalOpen(true)}
            onPrint={handlePrint}
            isEditMode={isEditMode}
            onToggleEditMode={toggleEditMode}
            onFinalView={handleEnterFinalView}
            />
            
            <div className="w-full max-w-5xl p-4 mb-4 bg-white rounded-lg shadow-md no-print">
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-2">
                        <label htmlFor="broadcast-date" className="font-semibold text-gray-700 shrink-0">방송일:</label>
                        <input 
                            type="date" 
                            id="broadcast-date" 
                            value={broadcastDate} 
                            onChange={(e) => setBroadcastDate(e.target.value)} 
                            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-grow min-w-[200px]">
                        <label htmlFor="broadcast-topic" className="font-semibold text-gray-700 shrink-0">주제:</label>
                        <input 
                            type="text" 
                            id="broadcast-topic" 
                            value={broadcastTopic} 
                            onChange={(e) => setBroadcastTopic(e.target.value)} 
                            placeholder="방송 주제를 입력하세요..."
                            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
                        />
                    </div>
                </div>
            </div>


            <main className="w-full bg-gray-100">
            <Pagination
                currentPage={currentPageIndex + 1}
                totalPages={pages.length}
                onPrev={goToPrevPage}
                onNext={goToNextPage}
            />
            {currentPageData && (
                <div className={`${printMode === 'all' ? 'hidden' : 'block'}`}>
                <PageViewer 
                    page={currentPageData} 
                    onTextChange={handleTextChange} 
                    onFieldUpdate={handleFieldUpdate}
                    onLayoutUpdate={handleLayoutUpdate}
                    paths={currentPageDrawings}
                    onPathsChange={(newPaths) => handlePathsChange(currentPageData.id, newPaths)}
                    tool={tool}
                    setTool={setTool}
                    penColor={penColor}
                    setPenColor={setPenColor}
                    penWidth={penWidth}
                    setPenWidth={setPenWidth}
                    isCurrentPage={true}
                    isEditMode={isEditMode}
                    onPrev={goToPrevPage}
                    onNext={goToNextPage}
                />
                </div>
            )}
            <div className="mt-4">
                <Pagination
                    currentPage={currentPageIndex + 1}
                    totalPages={pages.length}
                    onPrev={goToPrevPage}
                    onNext={goToNextPage}
                />
            </div>
            </main>
            <footer className="mt-8 text-center text-gray-500 text-sm no-print">
            <p>A tool for simple radio script editing.</p>
            </footer>
        </div>
      )}

       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

       {/* Print-only view */}
       {/* Ensure this container has a fixed width of 1024px to match editor layout logic, then scaled down by CSS for print */}
      <div className="hidden print-container" style={{ width: '1024px' }}>
        {pages.map(page => (
            <div key={page.id} className="w-full mx-auto print-page-wrapper">
                <div className="relative w-full shadow-2xl rounded-lg overflow-hidden print-page" style={{ aspectRatio: '1 / 1.414' }}>
                    <PageViewer
                        page={page}
                        onTextChange={() => {}}
                        onFieldUpdate={() => {}}
                        onLayoutUpdate={() => {}}
                        paths={drawings[page.id] || []}
                        onPathsChange={() => {}}
                        tool={'select'}
                        setTool={() => {}}
                        penColor={penColor}
                        setPenColor={() => {}}
                        penWidth={penWidth}
                        setPenWidth={() => {}}
                        isCurrentPage={false}
                        isEditMode={false}
                        onPrev={() => {}}
                        onNext={() => {}}
                        isPrintMode={true}
                    />
                </div>
            </div>
        ))}
      </div>
      <ScriptListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onLoadScript={handleLoadScript}
        onDeleteScript={handleDeleteScript}
       />
    </>
  );
}

export default App;