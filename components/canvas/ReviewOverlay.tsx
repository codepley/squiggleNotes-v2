'use client';

/**
 * ReviewOverlay — when Review mode is active, renders clickable hit zones
 * over strokes and text blocks. Tapping opens the ContextPanel.
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNoteStore } from '@/store/noteStore';
import { useCanvas } from '@/hooks/useCanvas';

interface ReviewOverlayProps {
  onElementTap: (info: {
    elementType: 'stroke' | 'text';
    elementId: string;
    content: string | null;
  }) => void;
}

export function ReviewOverlay({ onElementTap }: ReviewOverlayProps) {
  const { activeTool } = useNoteStore();
  const { canvasData } = useCanvas();

  if (activeTool !== 'review' || !canvasData) return null;

  // Calculate bounding box for each stroke
  const strokeBounds = canvasData.strokes.map((stroke) => {
    if (stroke.points.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of stroke.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    // Add some padding
    const pad = 8;
    return {
      id: stroke.id,
      x: minX - pad,
      y: minY - pad,
      width: Math.max(maxX - minX + pad * 2, 20),
      height: Math.max(maxY - minY + pad * 2, 20),
    };
  }).filter(Boolean);

  return (
    <div className="absolute inset-0 z-30" style={{ pointerEvents: 'auto' }}>
      {/* Review mode indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[#4F6EF7]/20 border border-[#4F6EF7]/30 rounded-full px-4 py-1.5"
      >
        <div className="w-2 h-2 rounded-full bg-[#4F6EF7] animate-pulse" />
        <span className="text-xs text-[#4F6EF7] font-medium">Review Mode</span>
        <span className="text-[10px] text-[#F0EDE6]/30">Tap any element</span>
      </motion.div>

      {/* Stroke hit zones */}
      {strokeBounds.map((bounds) => (
        bounds && (
          <motion.div
            key={bounds.id}
            className="absolute rounded-lg border border-[#4F6EF7]/0 hover:border-[#4F6EF7]/40 hover:bg-[#4F6EF7]/5 cursor-pointer transition-colors"
            style={{
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
              height: bounds.height,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              onElementTap({
                elementType: 'stroke',
                elementId: bounds.id,
                content: null,
              })
            }
          />
        )
      ))}

      {/* Text block hit zones */}
      {canvasData.textBlocks.map((block) => (
        <motion.div
          key={block.id}
          className="absolute rounded-lg border border-[#F5A623]/0 hover:border-[#F5A623]/40 hover:bg-[#F5A623]/5 cursor-pointer transition-colors"
          style={{
            left: block.x - 4,
            top: block.y - 4,
            minWidth: 60,
            minHeight: 24,
            padding: 4,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            onElementTap({
              elementType: 'text',
              elementId: block.id,
              content: block.content,
            })
          }
        >
          {/* Tap indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F5A623]/60 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  );
}
