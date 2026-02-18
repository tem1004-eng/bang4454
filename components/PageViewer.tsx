import React, { useRef, useEffect, useState } from 'react';
import { Page, Path, Tool, Point, Field } from '../types';
import TextInput from './TextInput';
import PageToolbar from './PageToolbar';

interface PageViewerProps {
  page: Page;
  onTextChange: (pageId: number, fieldId: string, value: string) => void;
  onFieldUpdate: (pageId: number, fieldId: string, newProps: Partial<Field>) => void;
  onLayoutUpdate: (pageId: number, fieldId: string, newHeightPercentage: number) => void;
  paths: Path[];
  onPathsChange: (newPaths: Path[]) => void;
  tool: Tool;
  setTool: (tool: Tool) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  penWidth: number;
  setPenWidth: (width: number) => void;
  isCurrentPage: boolean;
  isEditMode: boolean;
  onPrev: () => void;
  onNext: () => void;
  showToolbar?: boolean;
  isFullScreen?: boolean;
  isPrintMode?: boolean;
}

const PageViewer: React.FC<PageViewerProps> = ({ 
    page, onTextChange, onFieldUpdate, onLayoutUpdate, paths, onPathsChange, 
    tool, setTool, penColor, setPenColor, penWidth, setPenWidth, 
    isCurrentPage, isEditMode, onPrev, onNext, showToolbar = true,
    isFullScreen = false, isPrintMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const currentPath = useRef<Path | null>(null);

  // Zoom and Pan State
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const baseScaleRef = useRef(1); // The scale where the page fits perfectly (contained)
  
  // Gesture Refs
  const lastTouchRef = useRef<{
      x: number; 
      y: number; 
      dist: number; 
      mode: 'none' | 'pan' | 'zoom' | 'swipe';
      startX: number;
      startY: number;
  }>({ x: 0, y: 0, dist: 0, mode: 'none', startX: 0, startY: 0 });


  // Calculate Base Scale for Full Screen mode
  useEffect(() => {
    if (!isFullScreen) {
        setTransform({ scale: 1, x: 0, y: 0 });
        baseScaleRef.current = 1;
        return;
    }

    const calculateScale = () => {
        if (containerRef.current && containerRef.current.parentElement) {
            const parent = containerRef.current.parentElement;
            const availWidth = parent.clientWidth;
            const availHeight = parent.clientHeight;
            
            // Base reference size (matches max-w-5xl approx 1024px)
            const BASE_WIDTH = 1024;
            const BASE_HEIGHT = 1024 * 1.414; // A4 Ratio
            
            // Calculate scale to fit (contain)
            const margin = 0; 
            const scaleX = (availWidth - margin) / BASE_WIDTH;
            const scaleY = (availHeight - margin) / BASE_HEIGHT;
            
            const newBaseScale = Math.min(scaleX, scaleY);
            
            // Only update if significantly different to avoid loops/jitters
            if (Math.abs(newBaseScale - baseScaleRef.current) > 0.001) {
                baseScaleRef.current = newBaseScale;
                setTransform({ scale: newBaseScale, x: 0, y: 0 });
            }
        }
    };

    window.addEventListener('resize', calculateScale);
    const timer = setTimeout(calculateScale, 50);
    
    return () => {
        window.removeEventListener('resize', calculateScale);
        clearTimeout(timer);
    };
  }, [isFullScreen]);

  // --- Gesture Handling (Zoom, Pan, Swipe) ---
  const getDistance = (t1: React.Touch, t2: React.Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
  };
  
  const getMidpoint = (t1: React.Touch, t2: React.Touch) => ({
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2
  });

  const handleTouchStart = (e: React.TouchEvent) => {
      if (!isFullScreen) {
          // Fallback logic for normal mode (simple swipe)
          if (tool === 'select' && e.touches.length === 1) {
             lastTouchRef.current.startX = e.touches[0].clientX;
          }
          if (tool === 'pen' || tool === 'eraser') {
            handleDrawStart(e);
          }
          return;
      }

      // Full Screen Mode Logic
      if (e.touches.length === 2) {
          e.preventDefault();
          const dist = getDistance(e.touches[0], e.touches[1]);
          lastTouchRef.current = {
              ...lastTouchRef.current,
              mode: 'zoom',
              dist: dist,
              // Keep track of positions for potential pan-during-zoom (optional, keeping simple for now)
          };
      } else if (e.touches.length === 1) {
          // If zoomed in -> Pan
          // If zoomed out -> Swipe
          // Buffer: treat scale within 5% of base as "zoomed out"
          const isZoomedIn = transform.scale > baseScaleRef.current * 1.05;
          
          lastTouchRef.current = {
              ...lastTouchRef.current,
              mode: isZoomedIn ? 'pan' : 'swipe',
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
              startX: e.touches[0].clientX,
              startY: e.touches[0].clientY
          };
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!isFullScreen) {
          if (tool === 'pen' || tool === 'eraser') handleDrawMove(e);
          return;
      }
      e.preventDefault(); // Prevent browser scrolling

      if (e.touches.length === 2 && lastTouchRef.current.mode === 'zoom') {
          // Pinch Zoom
          const dist = getDistance(e.touches[0], e.touches[1]);
          const scaleFactor = dist / lastTouchRef.current.dist;
          
          let newScale = transform.scale * scaleFactor;
          
          // Limits
          // Min: Base Scale (Fit Screen)
          // Max: Arbitrary large number (e.g., 4x Base) or at least Fit Width
          const minScale = baseScaleRef.current;
          const maxScale = Math.max(minScale * 5, 2); // Allow generous zoom

          newScale = Math.min(Math.max(newScale, minScale), maxScale);

          setTransform(prev => ({ ...prev, scale: newScale }));
          lastTouchRef.current.dist = dist;

      } else if (e.touches.length === 1 && lastTouchRef.current.mode === 'pan') {
          // Pan
          const dx = e.touches[0].clientX - lastTouchRef.current.x;
          const dy = e.touches[0].clientY - lastTouchRef.current.y;

          // Calculate Boundaries
          // Current rendered dimensions
          const renderW = 1024 * transform.scale;
          const renderH = (1024 * 1.414) * transform.scale;
          
          // Viewport dimensions (parent container)
          const viewportW = containerRef.current?.parentElement?.clientWidth || 0;
          const viewportH = containerRef.current?.parentElement?.clientHeight || 0;

          // Max translation allowed
          // If content < viewport, translate should be 0 (center)
          // If content > viewport, translate is limited to (content - viewport) / 2
          const maxX = Math.max(0, (renderW - viewportW) / 2);
          const maxY = Math.max(0, (renderH - viewportH) / 2);

          setTransform(prev => {
              let newX = prev.x + dx;
              let newY = prev.y + dy;
              
              // Clamp
              newX = Math.min(Math.max(newX, -maxX), maxX);
              newY = Math.min(Math.max(newY, -maxY), maxY);

              return { ...prev, x: newX, y: newY };
          });
          
          lastTouchRef.current.x = e.touches[0].clientX;
          lastTouchRef.current.y = e.touches[0].clientY;
      }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!isFullScreen) {
          if (tool === 'pen' || tool === 'eraser') {
            handleDrawEnd();
          } else if (tool === 'select' && !isEditMode && lastTouchRef.current.startX !== 0) {
              const touchEndX = e.changedTouches[0].clientX;
              const deltaX = touchEndX - lastTouchRef.current.startX;
              if (Math.abs(deltaX) > 50) {
                  if (deltaX > 0) onPrev(); else onNext();
              }
              lastTouchRef.current.startX = 0;
          }
          return;
      }

      // Full Screen End Logic
      if (lastTouchRef.current.mode === 'swipe') {
          const touchEndX = e.changedTouches[0].clientX;
          const deltaX = touchEndX - lastTouchRef.current.startX;
          const SWIPE_THRESHOLD = 50;

          if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
             if (deltaX > 0) onPrev();
             else onNext();
          }
      }

      lastTouchRef.current.mode = 'none';
      if(tool === 'pen' || tool === 'eraser') handleDrawEnd();
  };

  // --- Drawing Logic (Standard) ---
  const drawPath = (ctx: CanvasRenderingContext2D, path: Path) => {
    ctx.beginPath();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.lineWidth;
    ctx.globalCompositeOperation = path.mode === 'eraser' ? 'destination-out' : 'source-over';
    
    if (path.points.length > 0) {
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
    }
    ctx.stroke();
  };
  
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas. Note: The canvas size is now fixed to high-res A4 ratio internally.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    paths.forEach(path => drawPath(ctx, path));
  }

  // --- VIRTUAL RESOLUTION SETUP ---
  // We use a fixed high-resolution internal coordinate system (e.g. A4 at decent DPI)
  // to ensure drawings are consistent across devices.
  // 1240 x 1754 is approx 150 DPI A4.
  const VIRTUAL_WIDTH = 1240;
  const VIRTUAL_HEIGHT = 1754;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set internal resolution once
    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;
    
    redrawCanvas();
  }, [paths, page.id]); // Redraw when paths or page changes

  // Map screen coordinates to virtual coordinates
  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const touch = 'touches' in e ? e.touches[0] : e;
    
    // Current display size
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    // Mouse position relative to element
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Scale to virtual resolution
    const virtualX = x * (VIRTUAL_WIDTH / displayWidth);
    const virtualY = y * (VIRTUAL_HEIGHT / displayHeight);
    
    return { x: virtualX, y: virtualY };
  };

  // Remove ResizeObserver loop for canvas size, as we now use CSS scaling with fixed internal size.
  // We just need to make sure canvas style width/height matches container (handled by className w-full h-full).

  const handleDrawStart = (e: React.MouseEvent | React.TouchEvent) => {
    if(isFullScreen) return;

    e.preventDefault();
    isDrawing.current = true;
    const point = getPoint(e);
    if (!point) return;

    currentPath.current = {
      points: [point],
      color: penColor,
      lineWidth: tool === 'eraser' ? 20 : penWidth, // This width is in virtual pixels now
      mode: tool === 'eraser' ? 'eraser' : 'pen',
    };
  };
  
  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !currentPath.current) return;
    e.preventDefault();

    const point = getPoint(e);
    if (!point) return;

    currentPath.current.points.push(point);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      // Optimally we'd just draw the new segment, but full redraw is simpler for eraser/layers
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      paths.forEach(path => drawPath(ctx, path));
      drawPath(ctx, currentPath.current);
    }
  };

  const handleDrawEnd = () => {
    if (isDrawing.current && currentPath.current && currentPath.current.points.length > 1) {
        onPathsChange([...paths, currentPath.current]);
    }
    isDrawing.current = false;
    currentPath.current = null;
    redrawCanvas();
  };

  const handleAutoResize = (fieldId: string, newPixelHeight: number) => {
    if (!containerRef.current || !isEditMode) return;
    const containerHeight = containerRef.current.offsetHeight;
    if (containerHeight > 0) {
        const newHeightPercentage = (newPixelHeight / containerHeight) * 100;
        onLayoutUpdate(page.id, fieldId, newHeightPercentage);
    }
  };

  const rootClasses = isFullScreen 
    ? "w-full h-full flex items-center justify-center overflow-hidden touch-none" 
    : "w-full max-w-5xl mx-auto h-full flex flex-col justify-center";

  const containerClasses = `relative shadow-2xl rounded-lg overflow-hidden print-page ${isFullScreen ? '' : 'w-full'} ${isCurrentPage ? 'current-page' : ''}`;

  const containerStyle: React.CSSProperties = isFullScreen
    ? { 
        width: '1024px', 
        height: `${1024 * 1.414}px`, 
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        transformOrigin: 'center center',
        maxWidth: 'none',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        touchAction: 'none'
      }
    : { aspectRatio: '1 / 1.414' };

  return (
    <div className={rootClasses}>
        {showToolbar && (
            <PageToolbar 
                tool={tool}
                setTool={setTool}
                penColor={penColor}
                setPenColor={setPenColor}
                penWidth={penWidth}
                setPenWidth={setPenWidth}
                isEditMode={isEditMode}
            />
        )}
        <div 
          ref={containerRef} 
          className={containerClasses} 
          style={containerStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
        <img src={page.imageUrl} alt={`Script Page ${page.id}`} className="w-full h-full object-cover pointer-events-none" />
        
        <div className="absolute inset-0">
            {page.fields.map((field, index) => (
            <TextInput
                key={field.id}
                field={field}
                onChange={(fieldId, value) => onTextChange(page.id, fieldId, value)}
                onUpdate={(fieldId, newProps) => onFieldUpdate(page.id, fieldId, newProps)}
                isEditMode={isEditMode}
                index={index + 1}
                onAutoResize={handleAutoResize}
                isPrintMode={isPrintMode}
            />
            ))}
        </div>

        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full touch-none ${!isFullScreen && (tool === 'pen' || tool === 'eraser') ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ zIndex: 50 }}
            onMouseDown={handleDrawStart}
            onMouseMove={handleDrawMove}
            onMouseUp={handleDrawEnd}
            onMouseLeave={handleDrawEnd}
            onTouchMove={!isFullScreen ? handleDrawMove : undefined}
        />
        </div>
    </div>
  );
};

export default PageViewer;