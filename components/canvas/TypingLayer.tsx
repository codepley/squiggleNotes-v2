'use client';

/**
 * TypingLayer — floating absolutely-positioned text blocks.
 * Supports click-to-create, drag-to-reposition, and inline editing.
 */

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNoteStore } from '@/store/noteStore';
import { useCanvas } from '@/hooks/useCanvas';

export function TypingLayer() {
  const { activeTool, activeColor } = useNoteStore();
  const { canvasData, addTextBlock, updateTextBlock, removeTextBlock, finalizeTextBlock } = useCanvas();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; blockX: number; blockY: number } | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // ─── Click on empty area → create new text block ─────────────────────────────
  const handleLayerClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'text') return;
      if (editingId) return; // don't create while editing

      const rect = layerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newId = addTextBlock({
        x,
        y,
        content: '',
        fontSize: 16,
        color: activeColor,
      });

      if (newId) setEditingId(newId);
    },
    [activeTool, editingId, activeColor, addTextBlock],
  );

  // ─── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback(
    (e: React.MouseEvent, blockId: string, blockX: number, blockY: number) => {
      if (activeTool !== 'text') return;
      e.stopPropagation();
      setDraggingId(blockId);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        blockX,
        blockY,
      };
    },
    [activeTool],
  );

  const handleDragMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingId || !dragStartRef.current) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      // Update position in real-time via DOM (for smoothness)
      const el = document.getElementById(`text-block-${draggingId}`);
      if (el) {
        el.style.left = `${dragStartRef.current.blockX + dx}px`;
        el.style.top = `${dragStartRef.current.blockY + dy}px`;
      }
    },
    [draggingId],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    dragStartRef.current = null;
  }, []);

  // ─── Text editing ───────────────────────────────────────────────────────────
  const handleTextChange = useCallback(
    (id: string, content: string) => {
      updateTextBlock(id, content);
    },
    [updateTextBlock],
  );

  const handleBlur = useCallback(
    (id: string, content: string) => {
      setEditingId(null);
      // Finalize text edit for undo/redo
      finalizeTextBlock(id);
      // Remove empty text blocks
      if (!content.trim()) {
        removeTextBlock(id);
      }
    },
    [removeTextBlock, finalizeTextBlock],
  );

  const textBlocks = canvasData?.textBlocks ?? [];

  // Only intercept clicks when text tool is active
  const pointerEvents = activeTool === 'text' ? 'auto' : 'none';

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 z-20"
      style={{ pointerEvents }}
      onClick={handleLayerClick}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
    >
      <AnimatePresence>
        {textBlocks.map((block) => (
          <motion.div
            key={block.id}
            id={`text-block-${block.id}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute group"
            style={{
              left: block.x,
              top: block.y,
              minWidth: 60,
            }}
          >
            {/* Drag handle */}
            <div
              className="absolute -top-5 left-0 h-5 w-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
              onMouseDown={(e) => handleDragStart(e, block.id, block.x, block.y)}
            >
              <div className="flex gap-0.5">
                <span className="block w-1 h-1 rounded-full bg-[#F0EDE6]/40" />
                <span className="block w-1 h-1 rounded-full bg-[#F0EDE6]/40" />
                <span className="block w-1 h-1 rounded-full bg-[#F0EDE6]/40" />
              </div>
            </div>

            {editingId === block.id ? (
              <textarea
                autoFocus
                value={block.content}
                onChange={(e) => handleTextChange(block.id, e.target.value)}
                onBlur={() => handleBlur(block.id, block.content)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleBlur(block.id, block.content);
                  }
                }}
                className="bg-transparent border border-[#4F6EF7]/40 rounded px-2 py-1 outline-none resize-both min-w-[120px] min-h-[32px]"
                style={{
                  fontSize: block.fontSize,
                  color: block.color,
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeTool === 'text') setEditingId(block.id);
                }}
                className="px-2 py-1 rounded cursor-text hover:bg-white/[0.03] transition-colors min-w-[60px] min-h-[24px] whitespace-pre-wrap"
                style={{
                  fontSize: block.fontSize,
                  color: block.color,
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                {block.content || '\u00A0'}
              </div>
            )}

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTextBlock(block.id);
              }}
              className="absolute -top-5 -right-2 w-4 h-4 rounded-full bg-[#FF453A] text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
