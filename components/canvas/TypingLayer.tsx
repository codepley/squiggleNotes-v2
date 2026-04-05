'use client';

/**
 * TypingLayer — floating absolutely-positioned text blocks.
 * Final version with white background and refined auto-resize.
 * Optimized for natural alignment and fluid resizing (grow/shrink).
 */

import { useCallback, useRef, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNoteStore } from '@/store/noteStore';
import { useCanvas } from '@/hooks/useCanvas';
import { cn } from '@/lib/utils';

export function TypingLayer() {
  const { activeTool, activeColor } = useNoteStore();
  const { canvasData, addTextBlock, updateTextBlock, removeTextBlock } = useCanvas();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; blockX: number; blockY: number } | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  const handleLayerClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'text' || editingId) return;

      if (e.target !== e.currentTarget) return;

      const rect = layerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Local coordinate calculation
      const x = e.clientX - rect.left - 13;
      const y = e.clientY - rect.top - 10;

      const newId = addTextBlock({
        x,
        y,
        content: '',
        fontSize: 18,
        color: activeColor,
      });

      if (newId) setEditingId(newId);
    },
    [activeTool, editingId, activeColor, addTextBlock],
  );

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

  const textBlocks = canvasData?.textBlocks ?? [];
  const pointerEvents = activeTool === 'text' ? 'auto' : 'none';

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 z-20 pointer-events-none"
      style={{ pointerEvents, top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={handleLayerClick}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
    >
      <AnimatePresence>
        {textBlocks.map((block) => (
          <TextBlockItem
            key={block.id}
            block={block}
            isEditing={editingId === block.id}
            isDragging={draggingId === block.id}
            onEdit={() => setEditingId(block.id)}
            onChange={(val) => updateTextBlock(block.id, val)}
            onBlur={(val) => {
              setEditingId(null);
              if (!val.trim()) removeTextBlock(block.id);
            }}
            onRemove={() => removeTextBlock(block.id)}
            onDragStart={(e) => handleDragStart(e, block.id, block.x, block.y)}
            activeTool={activeTool}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-component for individual text blocks ─────────────────────────────────

interface TextBlockItemProps {
  block: any;
  isEditing: boolean;
  isDragging: boolean;
  onEdit: () => void;
  onChange: (val: string) => void;
  onBlur: (val: string) => void;
  onRemove: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  activeTool: string;
}

function TextBlockItem({
  block,
  isEditing,
  isDragging,
  onEdit,
  onChange,
  onBlur,
  onRemove,
  onDragStart,
  activeTool,
}: TextBlockItemProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const commonStyles = {
    fontSize: block.fontSize + 'px',
    // Contrast check: if text is white/very light on white background, force it to 'ink' color
    color: (block.color === '#FFFFFF' || block.color === 'white') ? '#1C1C1E' : block.color,
    fontFamily: 'var(--font-dm-sans), sans-serif',
    lineHeight: '1.4',
    padding: '10px 14px',
    borderRadius: '12px',
    borderWidth: '1px',
  };

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto'; // Reset to auto to shrink
      el.style.height = `${el.scrollHeight}px`; // Then expand to content
    }
  }, []);

  useLayoutEffect(() => {
    if (isEditing) autoResize();
  }, [isEditing, block.content, autoResize]);

  return (
    <motion.div
      id={`text-block-${block.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "absolute group pointer-events-auto",
        isEditing && "z-30",
        isDragging && "opacity-50"
      )}
      style={{ left: block.x + 'px', top: block.y + 'px', transformOrigin: 'top left' }}
    >
      {/* Drag handle */}
      <div
        className="absolute -top-7 left-0 h-7 w-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
        onMouseDown={onDragStart}
      >
        <div className="flex gap-1 items-center bg-[#161618] px-2 py-0.5 rounded-full border border-white/[0.08] shadow-xl">
          <span className="block w-0.5 h-0.5 rounded-full bg-white/40" />
          <span className="block w-0.5 h-0.5 rounded-full bg-white/40" />
          <span className="block w-0.5 h-0.5 rounded-full bg-white/40" />
        </div>
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          autoFocus
          value={block.content}
          onInput={autoResize}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onBlur(block.content)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onBlur(block.content);
            if (e.key === 'Enter' && e.metaKey) onBlur(block.content);
          }}
          className="bg-white border-[#4F6EF7]/30 outline-none resize-none min-w-[160px] max-w-[500px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden text-left placeholder:text-black/10"
          placeholder="Start typing..."
          style={commonStyles}
        />
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (activeTool === 'text') onEdit();
          }}
          className="bg-white/95 backdrop-blur-sm cursor-text hover:bg-white transition-all min-w-[160px] min-h-[46px] whitespace-pre-wrap border-[#eee] shadow-sm"
          style={commonStyles}
        >
          {block.content || <span className="opacity-20 italic text-sm">Type something...</span>}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[#FF453A] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg border-2 border-white"
      >
        ×
      </button>
    </motion.div>
  );
}
