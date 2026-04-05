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

  const { activeTool, activeColor, strokeWidth } = useNoteStore();
  const { canvasData, addStroke, eraseStrokesInArea, undo, redo } = useCanvas();

  // ─── Re-render all strokes onto the canvas ──────────────────────────────────
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!canvasData) return;

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
  }, [canvasData]);

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

  // ─── Keyboard shortcuts for undo/redo ───────────────────────────────────────
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // ─── Drawing: live stroke preview ───────────────────────────────────────────
  const drawLiveStroke = useCallback(
    (points: StrokePoint[]) => {
      const canvas = canvasRef.current;
      if (!canvas || points.length < 2) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw all saved strokes first, then overlay the live one
      redrawAll();

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
    },
    [activeTool, activeColor, strokeWidth, redrawAll],
  );

  // ─── Pointer event handlers ─────────────────────────────────────────────────
  const getCanvasPoint = (e: React.PointerEvent): StrokePoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (activeTool === 'text' || activeTool === 'review') return;

      isDrawingRef.current = true;
      currentPointsRef.current = [getCanvasPoint(e)];

      // Capture pointer for smooth drawing even when leaving the canvas
      canvasRef.current?.setPointerCapture(e.pointerId);
    },
    [activeTool],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
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

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (activeTool === 'eraser') return;

    const points = currentPointsRef.current;
    if (points.length < 2) return;

    addStroke({
      points,
      color: activeColor,
      width: strokeWidth,
      tool: activeTool as 'pen' | 'highlighter',
    });

    currentPointsRef.current = [];
  }, [activeTool, activeColor, strokeWidth, addStroke]);

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
