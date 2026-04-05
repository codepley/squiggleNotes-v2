'use client';

/**
 * DrawingLayer — HTML5 Canvas with Pointer Events for freehand drawing.
 * Renders all strokes and handles pen/highlighter/eraser input.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useNoteStore, type Stroke, type StrokePoint } from '@/store/noteStore';
import { useCanvas } from '@/hooks/useCanvas';

export function DrawingLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<StrokePoint[]>([]);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  const { activeTool, activeColor, strokeWidth, viewportOffsetX, viewportOffsetY, viewportScale, panViewport, setViewportScale } = useNoteStore();
  const { canvasData, addStroke, eraseStrokesInArea, finalizeErase, undo, redo } = useCanvas();

  // ─── Re-render all strokes onto the canvas ──────────────────────────────────
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!canvasData) return;

    // Apply viewport transform (pan + zoom)
    ctx.save();
    ctx.translate(viewportOffsetX, viewportOffsetY);
    ctx.scale(viewportScale, viewportScale);

    for (const stroke of canvasData.strokes) {
      if (stroke.points.length < 2) continue;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width * 4;
      } else if (stroke.tool === 'eraser') {
        // Eraser strokes are invisible (they remove other strokes)
        continue;
      } else {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
      }

      const [first, ...rest] = stroke.points;
      ctx.moveTo(first.x, first.y);

      for (const point of rest) {
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [canvasData, viewportOffsetX, viewportOffsetY, viewportScale]);

  // Redraw whenever canvasData changes
  useEffect(() => {
    redrawAll();
  }, [redrawAll]);

  // ─── Canvas resize observer ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        redrawAll();
      }
    });

    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, [redrawAll]);

  // ─── Keyboard shortcuts for undo/redo and wheel zoom/scroll ─────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z (Windows/Linux) or Cmd+Shift+Z (Mac) for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Also support Ctrl+Y for redo (Windows convention)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Zoom with Ctrl+scroll (SLOW - 5% increments)
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY > 0 ? 1.05 : 0.95; // Scroll up = zoom in (slow)
        const newScale = viewportScale * delta;
        setViewportScale(newScale);
        return;
      }

      // Pan with scroll - SLOW (10px increments)
      e.preventDefault();
      
      if (e.shiftKey) {
        // Shift+scroll: horizontal pan (slow)
        const dx = e.deltaY > 0 ? 10 : -10;
        panViewport(dx, 0);
      } else {
        // Normal scroll: vertical pan (slow)
        const dy = e.deltaY > 0 ? 10 : -10;
        panViewport(0, dy);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvasRef.current?.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvasRef.current?.removeEventListener('wheel', handleWheel);
    };
  }, [undo, redo, viewportScale, setViewportScale, panViewport]);

  // ─── Drawing: live stroke preview ───────────────────────────────────────────
  const drawLiveStroke = useCallback(
    (points: StrokePoint[]) => {
      const canvas = canvasRef.current;
      if (!canvas || points.length < 2) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw all saved strokes first, then overlay the live one
      redrawAll();

      // Apply viewport transform for live stroke
      ctx.save();
      ctx.translate(viewportOffsetX, viewportOffsetY);
      ctx.scale(viewportScale, viewportScale);

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (activeTool === 'highlighter') {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = strokeWidth * 4;
      } else {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = strokeWidth;
      }

      const [first, ...rest] = points;
      ctx.moveTo(first.x, first.y);
      for (const p of rest) {
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    },
    [activeTool, activeColor, strokeWidth, redrawAll, viewportOffsetX, viewportOffsetY, viewportScale],
  );

  // ─── Pointer event handlers ─────────────────────────────────────────────────
  const getCanvasPoint = (e: React.PointerEvent): StrokePoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    
    // Screen space to canvas space conversion accounting for viewport transform
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    // Reverse the viewport transform
    const canvasX = (screenX - viewportOffsetX) / viewportScale;
    const canvasY = (screenY - viewportOffsetY) / viewportScale;
    
    return {
      x: canvasX,
      y: canvasY,
      pressure: e.pressure || 0.5,
    };
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Middle mouse button for panning
      if (e.button === 1) {
        e.preventDefault();
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (activeTool === 'text' || activeTool === 'review') return;

      isDrawingRef.current = true;
      currentPointsRef.current = [getCanvasPoint(e)];

      // Capture pointer for smooth drawing even when leaving the canvas
      canvasRef.current?.setPointerCapture(e.pointerId);
    },
    [activeTool, getCanvasPoint],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Handle panning
      if (isPanningRef.current && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        panViewport(dx, dy);
        panStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (!isDrawingRef.current) return;
      if (activeTool === 'text' || activeTool === 'review') return;

      const point = getCanvasPoint(e);

      if (activeTool === 'eraser') {
        eraseStrokesInArea(point.x, point.y, strokeWidth * 3);
        return;
      }

      currentPointsRef.current.push(point);
      drawLiveStroke(currentPointsRef.current);
    },
    [activeTool, strokeWidth, eraseStrokesInArea, drawLiveStroke],
  );

  const handlePointerUp = useCallback(
    (e?: React.PointerEvent) => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        panStartRef.current = null;
        return;
      }

      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (activeTool === 'eraser') {
        finalizeErase();
        return;
      }

      const points = currentPointsRef.current;
      if (points.length < 2) return;

      addStroke({
        points,
        color: activeColor,
        width: strokeWidth,
        tool: activeTool as 'pen' | 'highlighter',
      });

      currentPointsRef.current = [];
    },
    [activeTool, activeColor, strokeWidth, addStroke, finalizeErase],
  );

  // ─── Determine cursor based on tool ─────────────────────────────────────────
  const getCursorClass = () => {
    if (activeTool === 'text' || activeTool === 'review') return 'cursor-default';
    if (activeTool === 'eraser') return 'cursor-cell';
    return 'cursor-crosshair';
  };

  return (
    <canvas
      id="drawing-canvas"
      ref={canvasRef}
      className={`absolute inset-0 z-10 touch-none ${getCursorClass()}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: 'none' }}
    />
  );
}
